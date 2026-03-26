const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/all', adminController.getAllUsers);
router.get('/traders/pending', adminController.getPendingTraders);
router.put('/traders/:id/approve', adminController.approveTrader);
router.put('/traders/:id/reject', adminController.rejectTrader);
router.delete('/users/:id', adminController.deleteUser);

// Update user
router.put('/users/:id', adminController.updateUser);

// Product management (admin view)
router.get('/products', adminController.getAllProducts);

// Address management
router.get('/addresses', adminController.getAllAddresses);

// Offer management
router.get('/offers/active', adminController.getActiveOffers);

// Analytics routes
router.get('/analytics/dashboard', analyticsController.getDashboardStats);
router.get('/analytics/sales', analyticsController.getSalesByDate);
router.get('/analytics/revenue', analyticsController.getRevenueByPeriod);
router.get('/analytics/products/top', analyticsController.getTopProducts);
router.get('/analytics/products/low-stock', analyticsController.getLowStockAlerts);
router.get('/analytics/categories/top', analyticsController.getTopCategories);
router.get('/analytics/users/registrations', analyticsController.getUserRegistrations);
router.get('/analytics/users/behavior', analyticsController.getUserBehaviorInsights);
router.get('/analytics/merchants/activity', analyticsController.getMerchantActivity);
router.get('/analytics/orders/distribution', analyticsController.getOrderStatusDistribution);

module.exports = router;