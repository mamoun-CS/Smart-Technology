const notificationModel = require('../models/notificationModel');

const notificationController = {
  // Get user notifications
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unread } = req.query;

      const result = await notificationModel.getByUser(
        userId,
        parseInt(page),
        parseInt(limit),
        unread === 'true'
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationModel.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await notificationModel.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
        updated: result.updated
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationModel.delete(notificationId, userId);

      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Create notification (for internal use or admin)
  async createNotification(req, res) {
    try {
      const { user_id, type, title, message, data } = req.body;

      if (!user_id || !type || !title || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      const notification = await notificationModel.create({
        user_id,
        type,
        title,
        message,
        data
      });

      res.status(201).json({
        success: true,
        message: 'Notification created',
        notification
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Broadcast notification to all users (admin)
  async broadcastNotification(req, res) {
    try {
      const { type, title, message, data } = req.body;

      if (!type || !title || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      const notifications = await notificationModel.broadcast(type, title, message, data);

      res.json({
        success: true,
        message: `Broadcast to ${notifications.length} users`,
        count: notifications.length
      });
    } catch (error) {
      console.error('Broadcast notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Clean up old notifications (admin)
  async cleanupOldNotifications(req, res) {
    try {
      const { days = 30 } = req.query;

      const result = await notificationModel.deleteOld(parseInt(days));

      res.json({
        success: true,
        message: `Deleted ${result.deleted} old notifications`,
        deleted: result.deleted
      });
    } catch (error) {
      console.error('Cleanup notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = notificationController;