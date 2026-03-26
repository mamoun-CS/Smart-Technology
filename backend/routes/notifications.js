const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Get user notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark as read
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

// Admin routes
router.post('/', authMiddleware, requireAdmin, notificationController.createNotification);
router.post('/broadcast', authMiddleware, requireAdmin, notificationController.broadcastNotification);
router.delete('/cleanup', authMiddleware, requireAdmin, notificationController.cleanupOldNotifications);

module.exports = router;