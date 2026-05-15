'use strict';

const express = require('express');
const router = express.Router();
const { sendEmailHandler, sendEmailValidations } = require('../controllers/contactController');
const rateLimit = require('express-rate-limit');

// ── Contact-form rate limiter (stricter than the global limit) ──────────
// Prevents brute-force spam when the global limiter is generous.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                   // max 5 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact-form submissions. Please try again later.',
  },
});

// POST /send-email  – accepts JSON body { name, email, subject, message }
router.post(
  '/send-email',
  contactLimiter,
  ...sendEmailValidations,
  sendEmailHandler,
);

module.exports = router;
