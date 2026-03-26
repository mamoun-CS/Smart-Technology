const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// Get cart
router.get('/', cartController.getCart);

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