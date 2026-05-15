require('dotenv').config();
const nodemailer = require('nodemailer');

// ── Environment variables ──────────────────────────────────────────────
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,       // "true" / "false"  (default: false for STARTTLS on port 587)
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

// ── Cached transporter instance (singleton) ────────────────────────────
let transporter = null;

function createTransporter() {
  if (transporter) return transporter;

  const port = parseInt(SMTP_PORT, 10) || 587;
  const secure = String(SMTP_SECURE).toLowerCase() === 'true';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Missing SMTP env vars. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Send a raw email via SMTP.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendEmail({ to, subject, html }) {
  try {
    const transporter_ = createTransporter();

    const info = await transporter_.sendMail({
      from: `"${SMTP_FROM_NAME || 'Smart Technology'}" <${SMTP_FROM_EMAIL || SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[SMTP] Email sent – MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP] sendEmail error:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to send email via SMTP.',
    };
  }
}

/**
 * Send a contact-form notification to the admin inbox.
 * @param {{ name: string, email: string, subject: string, message: string }} body
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendContactFormEmail({ name, email, subject, message }) {
  const adminEmail = process.env.ADMIN_EMAIL || SMTP_USER || 'admin@smarttech.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>New Contact Form Submission</h2>
        <p style="margin: 6px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 6px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin: 6px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p style="margin: 6px 0;"><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; white-space: pre-line;">
          ${escapeHtml(message)}
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Contact Form] ${subject}`,
    html,
  });
}

/**
 * Send an auto-reply back to the user who submitted the contact form.
 * @param {{ name: string, email: string }} body
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendContactAutoReply({ name, email }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>We Received Your Message</h2>
        <p>Dear ${escapeHtml(name)},</p>
        <p>Thank you for reaching out to Smart Technology. We have received your message and one of our team members will get back to you within 24–48 hours.</p>
        <p>If your inquiry is urgent, please feel free to reply directly to this email.</p>
        <p>Best regards,<br><strong>Smart Technology Support Team</strong></p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "We've received your message – Smart Technology",
    html,
  });
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Escape raw HTML to prevent injection inside email templates. */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Verify SMTP configuration is present (throws if missing).
 * Call at startup to fail-fast on misconfiguration.
 */
function verifyConnection() {
  const missing = [];
  if (!SMTP_HOST)  missing.push('SMTP_HOST');
  if (!SMTP_PORT)  missing.push('SMTP_PORT');
  if (!SMTP_USER)  missing.push('SMTP_USER');
  if (!SMTP_PASS)  missing.push('SMTP_PASS');
  if (missing.length > 0) {
    throw new Error(`SMTP configuration incomplete. Missing: ${missing.join(', ')}`);
  }
}

module.exports = {
  createTransporter,
  sendEmail,
  sendContactFormEmail,
  sendContactAutoReply,
  verifyConnection,
};
