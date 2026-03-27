const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// All order routes require authentication
router.use(authMiddleware);

// Customer routes
router.post('/', [
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('payment_method').trim().notEmpty().withMessage('Payment method is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('delivery_method').isIn(['shipping', 'pickup']).withMessage('Delivery method must be "shipping" or "pickup"')
], orderController.createOrder);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

// Calculate shipping cost (for frontend preview)
router.get('/calculate/shipping', [
  query('city').trim().notEmpty().withMessage('City is required'),
  query('delivery_method').isIn(['shipping', 'pickup']).withMessage('Delivery method must be "shipping" or "pickup"')
], orderController.calculateShipping);

// Check if order is large (for frontend preview)
router.get('/check/large-order', [
  query('total_quantity').isInt({ min: 1 }).withMessage('Total quantity must be at least 1')
], orderController.checkLargeOrder);

// Admin routes
router.get('/admin/all', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'contacted', 'processing', 'shipped', 'delivered', 'cancelled', 'under_review']).withMessage('Invalid status')
], orderController.updateOrderStatus);
router.get('/admin/stats', requireAdmin, orderController.getStats);

// Trader routes
router.get('/trader/orders', orderController.getTraderOrders);
router.get('/trader/stats', orderController.getTraderStats);

module.exports = router;
