const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All cart routes require authentication and customer/merchant role only (block admin and trader)
router.use(authMiddleware);
router.use(requireRole('customer', 'merchant'));

// Get cart
router.get('/', cartController.getCart);

// Get cart summary with shipping calculation
router.get('/summary', [
  query('city').optional().trim().notEmpty().withMessage('City is required'),
  query('delivery_method').optional().isIn(['shipping', 'pickup']).withMessage('Delivery method must be "shipping" or "pickup"')
], cartController.getCartSummary);

// Add item to cart
router.post('/items', [
  body('product_id').isUUID().withMessage('Valid product ID required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController.addItem);

// Update item quantity
router.put('/items/:product_id', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController.updateItem);

// Remove item
router.delete('/items/:product_id', cartController.removeItem);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;
