const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

const tokenModel = {
  // Create email token
  async createEmailToken(userId, type = 'verification') {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const query = `
      INSERT INTO email_tokens (user_id, token, type, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, token, type, expiresAt]);
    return { ...result.rows[0], token };
  },

  // Verify email token
  async verifyEmailToken(token, type = 'verification') {
    const query = `
      SELECT * FROM email_tokens 
      WHERE token = $1 AND type = $2 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [token, type]);
    return result.rows[0];
  },

  // Delete email token
  async deleteEmailToken(token) {
    const query = 'DELETE FROM email_tokens WHERE token = $1 RETURNING *';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },

  // Delete expired tokens
  async deleteExpiredTokens() {
    const query = 'DELETE FROM email_tokens WHERE expires_at < CURRENT_TIMESTAMP';
    await pool.query(query);
  },

  // Create refresh token
  async createRefreshToken(userId) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, token, expiresAt]);
    return { ...result.rows[0], token };
  },

  // Verify refresh token
  async verifyRefreshToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },

  // Delete refresh token
  async deleteRefreshToken(token) {
    const query = 'DELETE FROM refresh_tokens WHERE token = $1 RETURNING *';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },

  // Delete all user refresh tokens
  async deleteUserRefreshTokens(userId) {
    const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
};

module.exports = tokenModel;
