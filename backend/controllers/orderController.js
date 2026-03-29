
const orderModel = require('../models/orderModel');
const emailUtils = require('../utils/email');
const userModel = require('../models/userModel');

const orderController = {
  // Create order
  async createOrder(req, res) {
    try {
      const { shipping_address, payment_method, city, delivery_method } = req.body;

      // Validate delivery method if provided
      if (delivery_method && !['shipping', 'pickup'].includes(delivery_method)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid delivery method. Must be "shipping" or "pickup".' 
        });
      }

      const order = await orderModel.createOrder(req.user.id, {
        shipping_address,
        payment_method,
        city: city || null,
        delivery_method: delivery_method || null
      });

      // Send confirmation email
      const user = await userModel.findById(req.user.id);
      
      // Customize email based on order status
      if (order.status === 'under_review') {
        await emailUtils.sendEmail({
          to: user.email,
          subject: 'Order Under Review - Smart Technology',
          html: `
            <h2>Thank you for your order, ${user.name}!</h2>
            <p>Your order #${order.id} has been received and is currently under review.</p>
            <p><strong>We will contact you after confirming your address.</strong></p>
            <p>Order Details:</p>
            <ul>
              <li>Total: ${order.total_price}</li>
              ${order.city ? `<li>City: ${order.city}</li>` : ''}
              ${order.delivery_method ? `<li>Delivery Method: ${order.delivery_method}</li>` : ''}
              <li>Shipping Cost: ${order.shipping_cost}</li>
            </ul>
            <p>Our team will review your order and contact you shortly.</p>
          `
        });
      } else {
        await emailUtils.sendOrderConfirmationEmail(user.email, user.name, order);
      }

      res.status(201).json({
        success: true,
        message: order.status === 'under_review' 
          ? 'Order placed successfully. We will contact you after confirming your address.'
          : 'Order placed successfully.',
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

      const validStatuses = ['pending', 'confirmed', 'contacted', 'processing', 'shipped', 'delivered', 'cancelled', 'under_review'];
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

      // Send notification email if status changed to confirmed or contacted
      if (status === 'confirmed' || status === 'contacted') {
        const user = await userModel.findById(order.user_id);
        if (user) {
          await emailUtils.sendEmail({
            to: user.email,
            subject: `Order Status Updated - Smart Technology`,
            html: `
              <h2>Hello ${user.name},</h2>
              <p>Your order #${order.id} status has been updated to: <strong>${status}</strong></p>
              ${status === 'contacted' ? '<p>Our team has contacted you regarding your order.</p>' : ''}
              <p>Thank you for shopping with Smart Technology!</p>
            `
          });
        }
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
  },

  // Calculate shipping cost (for frontend preview)
  async calculateShipping(req, res) {
    try {
      const { city, delivery_method } = req.query;

      const shippingCost = await orderModel.calculateShippingCost(city, delivery_method);

      res.json({
        success: true,
        shipping_cost: shippingCost,
        delivery_method: delivery_method || null,
        city: city || null
      });
    } catch (error) {
      console.error('Calculate shipping error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error calculating shipping.' 
      });
    }
  },

  // Check if order is large (for frontend preview)
  async checkLargeOrder(req, res) {
    try {
      const { total_quantity } = req.query;

      if (!total_quantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Total quantity is required.' 
        });
      }

      const isLarge = await orderModel.isLargeOrder(parseInt(total_quantity));

      res.json({
        success: true,
        is_large_order: isLarge,
        total_quantity: parseInt(total_quantity)
      });
    } catch (error) {
      console.error('Check large order error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error checking order size.' 
      });
    }
  }
};

module.exports = orderController;
