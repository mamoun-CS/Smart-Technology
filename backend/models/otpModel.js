const pool = require('../models/db');
const crypto = require('crypto');

const OTP_EXPIRY_MINUTES = 5;
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

const otpModel = {
  async generateOTP(phone, countryCode, userId = null, purpose = 'phone_verification') {
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const existingQuery = `
      SELECT * FROM phone_otps 
      WHERE phone = $1 AND country_code = $2 AND verified = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    const existingResult = await pool.query(existingQuery, [phone, countryCode]);

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      const timeSinceCreation = (Date.now() - new Date(existing.created_at).getTime()) / 1000;
      
      if (timeSinceCreation < RESEND_COOLDOWN_SECONDS) {
        const remainingTime = Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceCreation);
        throw new Error(`Please wait ${remainingTime} seconds before requesting a new code`);
      }

      if (existing.resend_count >= MAX_RESEND_ATTEMPTS) {
        throw new Error('Maximum resend attempts reached. Please try again later.');
      }

      const updateQuery = `
        UPDATE phone_otps 
        SET otp_code = $1, expires_at = $2, resend_count = resend_count + 1, created_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [otpCode, expiresAt, existing.id]);
      return updateResult.rows[0];
    }

    const insertQuery = `
      INSERT INTO phone_otps (phone, country_code, otp_code, user_id, purpose, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [phone, countryCode, otpCode, userId, purpose, expiresAt]);
    return insertResult.rows[0];
  },

  async verifyOTP(phone, countryCode, otpCode) {
    const query = `
      SELECT * FROM phone_otps 
      WHERE phone = $1 AND country_code = $2 AND otp_code = $3 
        AND verified = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await pool.query(query, [phone, countryCode, otpCode]);

    if (result.rows.length === 0) {
      return { valid: false, error: 'Invalid or expired verification code' };
    }

    const otpRecord = result.rows[0];

    await pool.query(
      'UPDATE phone_otps SET verified = TRUE WHERE id = $1',
      [otpRecord.id]
    );

    return { 
      valid: true, 
      userId: otpRecord.user_id,
      phone: otpRecord.phone,
      countryCode: otpRecord.country_code
    };
  },

  async getUnverifiedOTP(phone, countryCode) {
    const query = `
      SELECT * FROM phone_otps 
      WHERE phone = $1 AND country_code = $2 AND verified = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await pool.query(query, [phone, countryCode]);
    return result.rows[0];
  },

  async cleanupExpiredOTPs() {
    const query = 'DELETE FROM phone_otps WHERE expires_at < NOW() AND verified = FALSE';
    await pool.query(query);
  },

  async getResendCount(phone, countryCode) {
    const query = `
      SELECT COUNT(*) as count FROM phone_otps 
      WHERE phone = $1 AND country_code = $2 
        AND verified = FALSE AND expires_at > NOW()
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    const result = await pool.query(query, [phone, countryCode]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = otpModel;
