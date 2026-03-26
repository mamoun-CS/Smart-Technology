const pool = require('./db');

const ticketModel = {
  // Create a new support ticket
  async create(ticketData) {
    const { user_id, subject, description, priority } = ticketData;
    
    const query = `
      INSERT INTO support_tickets (user_id, subject, description, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, subject, description, priority || 'medium'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get tickets for a user
  async getByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM support_tickets 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM support_tickets WHERE user_id = $1';
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].count);
    
    return {
      tickets: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get all tickets (admin)
  async getAll(filters = {}) {
    const { page = 1, limit = 20, status, priority } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      values.push(priority);
      paramIndex++;
    }

    query += ` ORDER BY 
      CASE t.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        ELSE 3 
      END,
      t.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    return {
      tickets: result.rows,
      page,
      limit
    };
  },

  // Get ticket by ID
  async findById(id) {
    const query = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update ticket status
  async updateStatus(id, status) {
    const query = `
      UPDATE support_tickets 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  },

  // Add message to ticket
  async addMessage(ticketId, userId, message, isAdminReply = false) {
    const query = `
      INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [ticketId, userId, message, isAdminReply];
    
    const result = await pool.query(query, values);
    
    // If admin reply, update ticket status to in_progress
    if (isAdminReply) {
      await this.updateStatus(ticketId, 'in_progress');
    }
    
    return result.rows[0];
  },

  // Get ticket messages
  async getMessages(ticketId) {
    const query = `
      SELECT m.*, u.name as user_name, u.role as user_role
      FROM ticket_messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.ticket_id = $1
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [ticketId]);
    return result.rows;
  },

  // Delete ticket (admin)
  async delete(id) {
    // First delete all messages
    await pool.query('DELETE FROM ticket_messages WHERE ticket_id = $1', [id]);
    
    // Then delete the ticket
    const query = 'DELETE FROM support_tickets WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get ticket statistics (admin)
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
      FROM support_tickets
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Close ticket (user can close resolved tickets)
  async closeTicket(id, userId) {
    const query = `
      UPDATE support_tickets 
      SET status = 'resolved', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND status != 'closed'
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }
};

module.exports = ticketModel;