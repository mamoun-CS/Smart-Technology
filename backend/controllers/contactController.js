'use strict';

/**
 * contactController – handles POST /send-email
 *
 * Responsibilities
 * ────────────────
 * 1. Parse & validate all request fields (express-validator-style checks).
 * 2. Guard against spam / obvious abuse (rate limits via express-rate-limit
 *    are handled globally; this adds content-level spam checks).
 * 3. Forward the parsed payload to the SMTP email service.
 */

const { body, validationResult } = require('express-validator');
const emailService = require('../services/smtpEmailService');

// ── Spam-protection block-pattern list ─────────────────────────────────
// Words/phrases commonly found in spam that should be outright rejected.
const SPAM_BLOCKLIST = [
  /buy\s+followers/gi,
  /make\s+money\s+fast/gi,
  /get\s+rich\s+quick/gi,
  /casino/gi,
  /viagra/gi,
  /crypto\s+investment/gi,
  /loose\s+weight/gi,
  /free\s+gift\s+card/gi,
  /nigerian/gi,
  /lottery/gi,
  /\bhttp[s]?:\/\/[^\s]{30,}/gi, // very long URLs without spaces → likely spam
];

const SANITIZE_MAP = {
  '<script': '&lt;script',
  '</script': '&lt;/script',
  'javascript:': '&#039;javascript:',
  'onerror=': 'data-x=',
};

/** Strip obvious XSS/script-injection fragments from a string. */
function sanitize(value) {
  if (typeof value !== 'string') return value;
  let out = value;
  for (const [pattern, replacement] of Object.entries(SANITIZE_MAP)) {
    out = out.split(pattern).join(replacement);
  }
  return out;
}

/** Return true and the first matched spam pattern, or false. */
function isSpam(text) {
  for (const pattern of SPAM_BLOCKLIST) {
    if (pattern.test(text)) {
      pattern.lastIndex = 0; // reset global regex state
      return true;
    }
    pattern.lastIndex = 0;
  }
  return false;
}

// ── Validation chain (reusable) ─────────────────────────────────────────
const sendEmailValidations = [
  // name – required, 2-100 chars
  body('name')
    .exists({ checkFalsy: true }).withMessage('Name is required.')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .matches(/^[\p{L}\p{M}' .-]+$/u).withMessage('Name contains invalid characters.')
    .customSanitizer(sanitize),

  // email – required, valid RFC 5322-ish format, length-capped
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required.')
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false })
    .isLength({ max: 254 }).withMessage('Email address is too long.'),

  // subject – required, 2-200 chars
  body('subject')
    .exists({ checkFalsy: true }).withMessage('Subject is required.')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Subject must be between 2 and 200 characters.')
    .customSanitizer(sanitize),

  // message – required, min length for meaningful contact, max length to prevent abuse
  body('message')
    .exists({ checkFalsy: true }).withMessage('Message is required.')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters.')
    .customSanitizer(sanitize)
    .custom((msg) => {
      if (isSpam(msg)) throw new Error('Your message appears to be spam and was blocked.');
      return true;
    }),
];

// ── Controller actions ──────────────────────────────────────────────────

/**
 * Validate request and dispatch both admin-notification and user auto-reply emails.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function sendEmailHandler(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array().map((e) => ({
          field: e.param,
          reason: e.msg,
        })),
      });
    }

    const { name, email, subject, message } = req.body;

    // Send contact-form notification to admin
    const adminResult = await emailService.sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    // Fire-and-forget the auto-reply so we don't make the user wait
    emailService.sendContactAutoReply({ name, email }).catch((err) => {
      console.warn('[ContactController] Auto-reply failed (non-fatal):', err.message);
    });

    if (!adminResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again later.',
        error: adminResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      messageId: adminResult.messageId,
    });
  } catch (error) {
    console.error('[ContactController] sendEmailHandler error:', error);
    next(error);
  }
}

module.exports = {
  sendEmailHandler,
  sendEmailValidations,
};
