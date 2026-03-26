const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// All analytics routes require admin authentication
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', analyticsController.getDashboardStats);

// Sales analytics
router.get('/sales', analyticsController.getSalesByDate);
router.get('/revenue', analyticsController.getRevenueByPeriod);

// Product analytics
router.get('/products/top', analyticsController.getTopProducts);
router.get('/products/low-stock', analyticsController.getLowStockAlerts);
router.get('/products/:productId/analytics', analyticsController.getProductAnalytics);

// Category analytics
router.get('/categories/top', analyticsController.getTopCategories);

// User analytics
router.get('/users/registrations', analyticsController.getUserRegistrations);
router.get('/users/behavior', analyticsController.getUserBehaviorInsights);

// Merchant analytics
router.get('/merchants/activity', analyticsController.getMerchantActivity);

// Order analytics
router.get('/orders/distribution', analyticsController.getOrderStatusDistribution);

module.exports = router;