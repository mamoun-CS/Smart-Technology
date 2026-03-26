const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const jwtUtils = {
  // Generate access token
  generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        approved: user.approved 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  // Generate refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  },

  // Verify token
  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  },

  // Decode token (without verification)
  decodeToken(token) {
    return jwt.decode(token);
  }
};

module.exports = jwtUtils;
