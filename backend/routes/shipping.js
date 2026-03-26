const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const shippingController = require('../controllers/shippingController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Public route - get shipping areas
router.get('/areas', shippingController.getAreas);

// Calculate shipping cost
router.post('/calculate', authMiddleware, shippingController.calculateShipping);

// User address routes
router.post('/addresses', authMiddleware, [
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
], shippingController.saveAddress);

router.get('/addresses', authMiddleware, shippingController.getAddresses);
router.put('/addresses/:addressId', authMiddleware, shippingController.updateAddress);
router.delete('/addresses/:addressId', authMiddleware, shippingController.deleteAddress);

// Phone verification
router.post('/verify-phone/send', authMiddleware, shippingController.sendPhoneVerification);
router.post('/verify-phone', authMiddleware, shippingController.verifyPhone);

// Admin routes
router.post('/areas', authMiddleware, requireAdmin, [
  body('name_en').trim().notEmpty().withMessage('English name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive')
], shippingController.createArea);

router.put('/areas/:areaId', authMiddleware, requireAdmin, shippingController.updateArea);
router.delete('/areas/:areaId', authMiddleware, requireAdmin, shippingController.deleteArea);

module.exports = router;