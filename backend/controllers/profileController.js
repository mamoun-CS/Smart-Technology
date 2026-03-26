const userModel = require('../models/userModel');

const profileController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userModel.getProfile(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          approved: user.approved,
          is_verified: user.is_verified,
          avatar: user.avatar || null,
          phone_verified: user.phone_verified,
          last_login: user.last_login,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching profile'
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, phone } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters'
        });
      }

      if (phone && !/^[0-9+\-\s]{5,20}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Sanitize inputs
      const sanitizedName = name.trim().substring(0, 255);
      const sanitizedPhone = phone ? phone.trim().substring(0, 50) : null;

      const updatedUser = await userModel.updateProfile(userId, {
        name: sanitizedName,
        phone: sanitizedPhone
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          role: updatedUser.role,
          approved: updatedUser.approved,
          is_verified: updatedUser.is_verified,
          avatar: updatedUser.avatar || null,
          created_at: updatedUser.created_at
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating profile'
      });
    }
  },

  // Update password
  async updatePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }

      // Get current user with password
      const user = await userModel.getByIdWithPassword(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await userModel.comparePassword(user, currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password (model handles hashing)
      await userModel.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating password'
      });
    }
  }
};

module.exports = profileController;