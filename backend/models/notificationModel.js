const pool = require('./db');

const notificationModel = {
  // Create a notification
  async create(notificationData) {
    const { user_id, type, title, message, data } = notificationData;
    
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, type, title, message, JSON.stringify(data || {})];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get notifications for a user
  async getByUser(userId, page = 1, limit = 20, unreadOnly = false) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;
    const values = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get unread count
    const countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false';
    const countResult = await pool.query(countQuery, [userId]);
    
    return {
      notifications: result.rows,
      unreadCount: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  // Mark notification as read
  async markAsRead(id, userId) {
    const query = `
      UPDATE notifications 
      SET read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  },

  // Mark all as read
  async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET read = true
      WHERE user_id = $1 AND read = false
    `;
    const result = await pool.query(query, [userId]);
    return { updated: result.rowCount };
  },

  // Delete notification
  async delete(id, userId) {
    const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  },

  // Delete old notifications (cleanup)
  async deleteOld(days = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND read = true
    `;
    const result = await pool.query(query);
    return { deleted: result.rowCount };
  },

  // Create order notification
  async createOrderNotification(userId, orderData, type = 'new_order') {
    const title = type === 'new_order' ? 'New Order Created' : 'Order Status Updated';
    const message = type === 'new_order' 
      ? `Your order #${orderData.order_id} has been placed successfully.`
      : `Your order #${orderData.order_id} status has been updated to ${orderData.status}.`;
    
    return this.create({
      user_id: userId,
      type: 'order',
      title,
      message,
      data: orderData
    });
  },

  // Create offer notification
  async createOfferNotification(userId, offerData) {
    const title = 'New Offer Available!';
    const message = `Use code ${offerData.code} to get ${offerData.discount_type === 'percentage' ? `${offerData.discount_value}% off` : `$${offerData.discount_value} off`}`;
    
    return this.create({
      user_id: userId,
      type: 'offer',
      title,
      message,
      data: offerData
    });
  },

  // Broadcast notification to all users (admin)
  async broadcast(type, title, message, data = {}) {
    // Get all user IDs
    const query = 'SELECT id FROM users WHERE approved = true';
    const result = await pool.query(query);
    
    const notifications = [];
    for (const user of result.rows) {
      const notification = await this.create({
        user_id: user.id,
        type,
        title,
        message,
        data
      });
      notifications.push(notification);
    }
    
    return notifications;
  }
};

module.exports = notificationModel;