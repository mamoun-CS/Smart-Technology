const analyticsModel = require('../models/analyticsModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');

const analyticsController = {
  // Get dashboard overview
  async getDashboardStats(req, res) {
    try {
      const stats = await analyticsModel.getDashboardStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get sales by date range
  async getSalesByDate(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Start date and end date are required' 
        });
      }

      const sales = await analyticsModel.getSalesByDate(start_date, end_date);

      res.json({
        success: true,
        sales
      });
    } catch (error) {
      console.error('Get sales by date error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get top selling products
  async getTopProducts(req, res) {
    try {
      const { limit = 10 } = req.query;

      const products = await analyticsModel.getTopProducts(parseInt(limit));

      res.json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Get top products error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get top categories
  async getTopCategories(req, res) {
    try {
      const { limit = 10 } = req.query;

      const categories = await analyticsModel.getTopCategories(parseInt(limit));

      res.json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('Get top categories error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get user registrations
  async getUserRegistrations(req, res) {
    try {
      const { months = 12 } = req.query;

      const registrations = await analyticsModel.getUserRegistrations(parseInt(months));

      res.json({
        success: true,
        registrations
      });
    } catch (error) {
      console.error('Get user registrations error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get merchant activity
  async getMerchantActivity(req, res) {
    try {
      const { trader_id } = req.query;

      const merchants = await analyticsModel.getMerchantActivity(trader_id);

      res.json({
        success: true,
        merchants
      });
    } catch (error) {
      console.error('Get merchant activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get product analytics
  async getProductAnalytics(req, res) {
    try {
      const { productId } = req.params;

      const analytics = await analyticsModel.getProductAnalytics(productId);

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Get product analytics error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get low stock alerts
  async getLowStockAlerts(req, res) {
    try {
      const { threshold = 10 } = req.query;

      const products = await analyticsModel.getLowStockAlerts(parseInt(threshold));

      res.json({
        success: true,
        products,
        count: products.length
      });
    } catch (error) {
      console.error('Get low stock alerts error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get order status distribution
  async getOrderStatusDistribution(req, res) {
    try {
      const distribution = await analyticsModel.getOrderStatusDistribution();

      res.json({
        success: true,
        distribution
      });
    } catch (error) {
      console.error('Get order status distribution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get revenue by period
  async getRevenueByPeriod(req, res) {
    try {
      const { period = 'day', limit = 30 } = req.query;

      const revenue = await analyticsModel.getRevenueByPeriod(period, parseInt(limit));

      res.json({
        success: true,
        revenue
      });
    } catch (error) {
      console.error('Get revenue by period error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get user behavior insights
  async getUserBehaviorInsights(req, res) {
    try {
      // Get recent registrations
      const registrations = await analyticsModel.getUserRegistrations(3);
      
      // Get order distribution
      const orderDistribution = await analyticsModel.getOrderStatusDistribution();
      
      // Get top products
      const topProducts = await analyticsModel.getTopProducts(5);
      
      // Get active merchants
      const merchants = await analyticsModel.getMerchantActivity();

      res.json({
        success: true,
        insights: {
          recent_registrations: registrations,
          order_distribution: orderDistribution,
          top_products: topProducts,
          active_merchants: merchants.length
        }
      });
    } catch (error) {
      console.error('Get user behavior insights error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = analyticsController;