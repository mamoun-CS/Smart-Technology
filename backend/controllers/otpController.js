const otpModel = require('../models/otpModel');
const whatsappService = require('../services/whatsappService');
const userModel = require('../models/userModel');

const otpController = {
  async sendOTP(req, res) {
    try {
      const { phone, countryCode = '+970' } = req.body;

      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      const validCountryCodes = ['+970', '+972'];
      const normalizedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
      
      if (!validCountryCodes.includes(normalizedCountryCode)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid country code. Use +970 (Palestine) or +972 (Israel/Palestine)' 
        });
      }

      const phoneRegex = /^5[0-9]{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid phone format. Must start with 59 and be 9 digits (e.g., 59 ********)' 
        });
      }

      const otpRecord = await otpModel.generateOTP(phone, normalizedCountryCode);

      const result = await whatsappService.sendOTP(phone, normalizedCountryCode, otpRecord.otp_code);

      res.json({
        success: true,
        message: 'Verification code sent via WhatsApp',
        phone: whatsappService.maskPhoneNumber(`${normalizedCountryCode}${phone}`),
        expiresIn: 300,
        resendAvailableIn: 30
      });
    } catch (error) {
      console.error('Send OTP Error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to send verification code' 
      });
    }
  },

  async verifyOTP(req, res) {
    try {
      const { phone, countryCode = '+970', otpCode } = req.body;

      if (!phone || !otpCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number and OTP code are required' 
        });
      }

      const normalizedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
      
      const result = await otpModel.verifyOTP(phone, normalizedCountryCode, otpCode);

      if (!result.valid) {
        return res.status(400).json({ 
          success: false, 
          message: result.error 
        });
      }

      res.json({
        success: true,
        message: 'Phone number verified successfully',
        phone: `${normalizedCountryCode}${phone}`
      });
    } catch (error) {
      console.error('Verify OTP Error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Verification failed' 
      });
    }
  },

  async resendOTP(req, res) {
    try {
      const { phone, countryCode = '+970' } = req.body;

      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      const normalizedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;

      const existingOTP = await otpModel.getUnverifiedOTP(phone, normalizedCountryCode);
      
      if (!existingOTP) {
        return res.status(400).json({ 
          success: false, 
          message: 'No pending verification found. Please request a new code.' 
        });
      }

      const timeSinceCreation = (Date.now() - new Date(existingOTP.created_at).getTime()) / 1000;
      
      if (timeSinceCreation < 30) {
        const remainingTime = Math.ceil(30 - timeSinceCreation);
        return res.status(400).json({ 
          success: false, 
          message: `Please wait ${remainingTime} seconds before resending`,
          retryAfter: remainingTime
        });
      }

      if (existingOTP.resend_count >= 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'Maximum resend attempts reached. Please request a new code after the current one expires.' 
        });
      }

      const otpRecord = await otpModel.generateOTP(phone, normalizedCountryCode);
      
      await whatsappService.sendOTP(phone, normalizedCountryCode, otpRecord.otp_code);

      res.json({
        success: true,
        message: 'New verification code sent via WhatsApp',
        phone: whatsappService.maskPhoneNumber(`${normalizedCountryCode}${phone}`),
        expiresIn: 300,
        resendAvailableIn: 30
      });
    } catch (error) {
      console.error('Resend OTP Error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to resend verification code' 
      });
    }
  }
};

module.exports = otpController;
