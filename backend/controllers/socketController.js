const socketController = {
  // Get online users count (for admin dashboard)
  async getOnlineUsers(req, res) {
    try {
      // This would need access to the socket.io instance
      // For now, return mock data
      res.json({
        success: true,
        online_count: 0,
        active_chats: 0
      });
    } catch (error) {
      console.error('Get online users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Notify user of new message (via socket)
  async notifyNewMessage(req, res) {
    try {
      const { userId, message, from } = req.body;
      
      // Import the sendToUser helper
      const { sendToUser } = require('../utils/socket');
      
      sendToUser(userId, 'new_message', {
        message,
        from,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Notification sent'
      });
    } catch (error) {
      console.error('Notify new message error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Broadcast to all connected users
  async broadcastMessage(req, res) {
    try {
      const { message, type } = req.body;
      
      const { notifyAdmins } = require('../utils/socket');
      
      notifyAdmins('broadcast', {
        message,
        type,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Broadcast sent'
      });
    } catch (error) {
      console.error('Broadcast message error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = socketController;