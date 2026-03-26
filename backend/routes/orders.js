const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// All order routes require authentication
router.use(authMiddleware);

// Customer routes
router.post('/', [
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('payment_method').trim().notEmpty().withMessage('Payment method is required')
], orderController.createOrder);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

// Admin routes
router.get('/admin/all', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], orderController.updateOrderStatus);
router.get('/admin/stats', requireAdmin, orderController.getStats);

// Trader routes
router.get('/trader/orders', orderController.getTraderOrders);
router.get('/trader/stats', orderController.getTraderStats);

module.exports = router;