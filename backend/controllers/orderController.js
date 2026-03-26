const orderModel = require('../models/orderModel');
const emailUtils = require('../utils/email');
const userModel = require('../models/userModel');

const orderController = {
  // Create order
  async createOrder(req, res) {
    try {
      const { shipping_address, payment_method } = req.body;

      const order = await orderModel.createOrder(req.user.id, {
        shipping_address,
        payment_method
      });

      // Send confirmation email
      const user = await userModel.findById(req.user.id);
      await emailUtils.sendOrderConfirmationEmail(user.email, user.name, order);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Server error creating order.' 
      });
    }
  },

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await orderModel.getUserOrders(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching orders.' 
      });
    }
  },

  // Get single order
  async getOrder(req, res) {
    try {
      const { id } = req.params;
      
      const order = await orderModel.findById(id, req.user.id);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found.' 
        });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching order.' 
      });
    }
  },

  // Get all orders (admin)
  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      const result = await orderModel.getAllOrders(
        parseInt(page),
        parseInt(limit),
        status
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching orders.' 
      });
    }
  },

  // Update order status (admin)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status.' 
        });
      }

      const order = await orderModel.updateStatus(id, status);

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found.' 
        });
      }

      res.json({
        success: true,
        message: 'Order status updated.',
        order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating order.' 
      });
    }
  },

  // Get trader orders
  async getTraderOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await orderModel.getTraderOrders(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get trader orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching orders.' 
      });
    }
  },

  // Get dashboard stats (admin)
  async getStats(req, res) {
    try {
      const stats = await orderModel.getStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching stats.' 
      });
    }
  },

  // Get trader stats
  async getTraderStats(req, res) {
    try {
      const stats = await orderModel.getTraderStats(req.user.id);
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get trader stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching stats.' 
      });
    }
  }
};

module.exports = orderController;
