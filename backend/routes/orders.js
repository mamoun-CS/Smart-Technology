const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireRole } = require('../middleware/rbac');

// All order routes require authentication
router.use(authMiddleware);

// Customer/Merchant routes - only customers and merchants can create orders
router.post('/', requireRole('customer', 'merchant'), [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('phone').matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/).withMessage('Invalid phone number format'),
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('payment_method').trim().notEmpty().withMessage('Payment method is required'),
  body('city').optional().trim().notEmpty().withMessage('City is required'),
  body('delivery_method').optional().isIn(['shipping', 'pickup']).withMessage('Delivery method must be "shipping" or "pickup"')
], orderController.createOrder);

// Customer/Merchant-only routes
router.get('/', requireRole('customer', 'merchant'), orderController.getUserOrders);
router.get('/:id', requireRole('customer', 'merchant'), orderController.getOrder);

// Calculate shipping cost (for frontend preview) - customers and merchants
router.get('/calculate/shipping', requireRole('customer', 'merchant'), [
  query('city').optional().trim().notEmpty().withMessage('City is required'),
  query('delivery_method').optional().isIn(['shipping', 'pickup']).withMessage('Delivery method must be "shipping" or "pickup"')
], orderController.calculateShipping);

// Check if order is large (for frontend preview) - customers and merchants
router.get('/check/large-order', requireRole('customer', 'merchant'), [
  query('total_quantity').isInt({ min: 1 }).withMessage('Total quantity must be at least 1')
], orderController.checkLargeOrder);

// Admin routes
router.get('/admin/all', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'contacted', 'processing', 'shipped', 'delivered', 'cancelled', 'under_review']).withMessage('Invalid status')
], orderController.updateOrderStatus);
router.get('/admin/stats', requireAdmin, orderController.getStats);

// Trader routes
const { requireTrader } = require('../middleware/rbac');
router.get('/trader/orders', requireTrader, orderController.getTraderOrders);
router.get('/trader/stats', requireTrader, orderController.getTraderStats);

module.exports = router;
