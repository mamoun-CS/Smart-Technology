const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// All profile routes require authentication
router.use(authMiddleware);

// Validation rules
const updateProfileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().matches(/^[0-9+\-\s]{5,20}$/).withMessage('Invalid phone number format')
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Get user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', updateProfileValidation, profileController.updateProfile);

// Update password
router.put('/password', updatePasswordValidation, profileController.updatePassword);

module.exports = router;