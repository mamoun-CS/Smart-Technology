const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
const jwtUtils = require('../utils/jwt');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

const authController = {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, email, password, role = 'customer' } = req.body;

      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered.' 
        });
      }

      // Create user
      const user = await userModel.create({ name, email, password, role });

      // Send verification email (optional - won't fail registration if email fails)
      try {
        const tokenData = await tokenModel.createEmailToken(user.id, 'verification');
        await emailService.sendVerificationEmail(user.email, user.name, tokenData.token);
      } catch (emailError) {
        console.error('Email sending failed during registration:', emailError.message);
        console.error('Email error stack:', emailError.stack);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during registration.' 
      });
    }
  },

  // Login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password.' 
        });
      }

      // Check if user has password (Google users don't have password)
      if (!user.password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Please login with Google.' 
        });
      }

      // Verify password
      const isMatch = await userModel.comparePassword(user, password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password.' 
        });
      }

      // Check if email is verified
      if (!user.is_verified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before logging in.' 
        });
      }

      // Check if trader is approved
      if (user.role === 'trader' && !user.approved) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your trader account is pending approval.' 
        });
      }

      // Generate tokens
      const accessToken = jwtUtils.generateAccessToken(user);
      const refreshToken = jwtUtils.generateRefreshToken(user);
      
      // Save refresh token (optional - won't fail login if it fails)
      try {
        await tokenModel.createRefreshToken(user.id);
      } catch (tokenError) {
        console.warn('Token creation failed:', tokenError.message);
      }

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        accessToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during login.' 
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await tokenModel.deleteRefreshToken(refreshToken);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during logout.' 
      });
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          success: false, 
          message: 'Refresh token required.' 
        });
      }

      // Verify refresh token
      const tokenData = await tokenModel.verifyRefreshToken(refreshToken);
      if (!tokenData) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired refresh token.' 
        });
      }

      // Get user
      const user = await userModel.findById(tokenData.user_id);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found.' 
        });
      }

      // Delete old refresh token
      await tokenModel.deleteRefreshToken(refreshToken);

      // Generate new tokens
      const newAccessToken = jwtUtils.generateAccessToken(user);
      const newRefreshToken = jwtUtils.generateRefreshToken(user);
      
      // Save new refresh token
      await tokenModel.createRefreshToken(user.id);

      // Set cookies
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during token refresh.' 
      });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      console.log('Verifying email with token:', token);

      const tokenData = await tokenModel.verifyEmailToken(token, 'verification');
      if (!tokenData) {
        console.log('Token verification failed - token not found or expired');
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired verification token.' 
        });
      }

      console.log('Token verified successfully for user:', tokenData.user_id);

      await userModel.verifyUser(tokenData.user_id);
      await tokenModel.deleteEmailToken(token);

      res.json({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during email verification.' 
      });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link will be sent.'
        });
      }

      const tokenData = await tokenModel.createEmailToken(user.id, 'password_reset');
      try {
        await emailService.sendPasswordResetEmail(user.email, user.name, tokenData.token);
      } catch (emailError) {
        console.error('Password reset email sending failed:', emailError.message);
        console.error('Password reset email error stack:', emailError.stack);
      }

      res.json({
        success: true,
        message: 'If the email exists, a password reset link will be sent.'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during password reset request.' 
      });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const tokenData = await tokenModel.verifyEmailToken(token, 'password_reset');
      if (!tokenData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired reset token.' 
        });
      }

      await userModel.updatePassword(tokenData.user_id, password);
      await tokenModel.deleteEmailToken(token);

      res.json({
        success: true,
        message: 'Password reset successful. You can now login.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during password reset.' 
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error.' 
      });
    }
  },

  // Google OAuth callback
  async googleCallback(req, res) {
    try {
      const user = req.user;

      // Generate tokens
      const accessToken = jwtUtils.generateAccessToken(user);
      const refreshToken = jwtUtils.generateRefreshToken(user);
      
      // Save refresh token
      await tokenModel.createRefreshToken(user.id);

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Redirect to frontend
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
};

module.exports = authController;
