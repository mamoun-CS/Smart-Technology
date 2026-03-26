const ticketModel = require('../models/ticketModel');

const ticketController = {
  // Create a new support ticket
  async createTicket(req, res) {
    try {
      const userId = req.user.id;
      const { subject, description, priority } = req.body;

      if (!subject || !description) {
        return res.status(400).json({ 
          success: false, 
          message: 'Subject and description are required' 
        });
      }

      const ticket = await ticketModel.create({
        user_id: userId,
        subject,
        description,
        priority
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get user's tickets
  async getMyTickets(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await ticketModel.getByUser(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get ticket by ID
  async getTicketById(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { ticketId } = req.params;

      const ticket = await ticketModel.findById(ticketId);

      if (!ticket) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ticket not found' 
        });
      }

      // Check access
      if (ticket.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to view this ticket' 
        });
      }

      // Get messages
      const messages = await ticketModel.getMessages(ticketId);

      res.json({
        success: true,
        ticket,
        messages
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Add message to ticket
  async addMessage(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { ticketId } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Message is required' 
        });
      }

      // Check ticket exists and access
      const ticket = await ticketModel.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ticket not found' 
        });
      }

      if (ticket.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized' 
        });
      }

      const isAdminReply = userRole === 'admin';
      const ticketMessage = await ticketModel.addMessage(ticketId, userId, message, isAdminReply);

      res.status(201).json({
        success: true,
        message: 'Message added',
        ticket_message: ticketMessage
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Close ticket
  async closeTicket(req, res) {
    try {
      const userId = req.user.id;
      const { ticketId } = req.params;

      const ticket = await ticketModel.closeTicket(ticketId, userId);

      if (!ticket) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ticket not found or cannot be closed' 
        });
      }

      res.json({
        success: true,
        message: 'Ticket closed',
        ticket
      });
    } catch (error) {
      console.error('Close ticket error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get all tickets (admin)
  async getAllTickets(req, res) {
    try {
      const { page = 1, limit = 20, status, priority } = req.query;

      const result = await ticketModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        priority
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update ticket status (admin)
  async updateTicketStatus(req, res) {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;

      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status' 
        });
      }

      const ticket = await ticketModel.updateStatus(ticketId, status);

      res.json({
        success: true,
        message: 'Ticket status updated',
        ticket
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete ticket (admin)
  async deleteTicket(req, res) {
    try {
      const { ticketId } = req.params;

      const ticket = await ticketModel.delete(ticketId);

      if (!ticket) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ticket not found' 
        });
      }

      res.json({
        success: true,
        message: 'Ticket deleted'
      });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get ticket statistics (admin)
  async getTicketStats(req, res) {
    try {
      const stats = await ticketModel.getStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get ticket stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = ticketController;