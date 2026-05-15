const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const otpController = require('../controllers/otpController');

const sendOTPValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('countryCode').optional().isString()
];

const verifyOTPValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('otpCode').trim().notEmpty().withMessage('OTP code is required'),
  body('countryCode').optional().isString()
];

router.post('/send', sendOTPValidation, otpController.sendOTP);
router.post('/verify', verifyOTPValidation, otpController.verifyOTP);
router.post('/resend', sendOTPValidation, otpController.resendOTP);

module.exports = router;
