const favoriteModel = require('../models/favoriteModel');

const favoriteController = {
  // Get user's favorite products
  async getFavorites(req, res) {
    try {
      const userId = req.user.id;
      const favorites = await favoriteModel.getUserFavorites(userId);

      res.json({
        success: true,
        favorites
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Add product to favorites
  async addFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const favorite = await favoriteModel.addFavorite(userId, product_id);

      res.status(201).json({
        success: true,
        message: 'Product added to favorites',
        favorite
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Remove product from favorites
  async removeFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const favorite = await favoriteModel.removeFavorite(userId, productId);

      if (!favorite) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.json({
        success: true,
        message: 'Product removed from favorites'
      });
    } catch (error) {
      console.error('Remove favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Toggle favorite status
  async toggleFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const result = await favoriteModel.toggleFavorite(userId, product_id);

      res.json({
        success: true,
        message: result.action === 'added' 
          ? 'Product added to favorites' 
          : 'Product removed from favorites',
        is_favorite: result.is_favorite
      });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Check if product is favorite
  async checkFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const isFavorite = await favoriteModel.isFavorite(userId, productId);

      res.json({
        success: true,
        is_favorite: isFavorite
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get favorite count
  async getFavoriteCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await favoriteModel.getFavoriteCount(userId);

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Get favorite count error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get most favorited products (admin only)
  async getMostFavorited(req, res) {
    try {
      const { limit = 10 } = req.query;
      const pool = require('../models/db');
      
      const query = `
        SELECT 
          p.id,
          p.name_en,
          p.name_ar,
          p.unit_price,
          p.wholesale_price,
          p.images,
          p.stock,
          c.name_en as category_name_en,
          c.name_ar as category_name_ar,
          COUNT(f.id) as favorite_count
        FROM products p
        LEFT JOIN favorites f ON p.id = f.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        GROUP BY p.id, c.name_en, c.name_ar
        ORDER BY favorite_count DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [parseInt(limit)]);
      
      res.json({
        success: true,
        products: result.rows
      });
    } catch (error) {
      console.error('Get most favorited error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = favoriteController;
