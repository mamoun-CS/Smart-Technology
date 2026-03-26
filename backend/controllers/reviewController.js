const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel');

const reviewController = {
  // Add a review to a product
  async addReview(req, res) {
    try {
      const userId = req.user.id;
      const { product_id, rating, comment } = req.body;

      if (!product_id || !rating) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID and rating are required' 
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }

      // Check if product exists
      const product = await productModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      // Check if user already reviewed
      const hasReview = await reviewModel.hasReviewed(userId, product_id);
      if (hasReview) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already reviewed this product' 
        });
      }

      const review = await reviewModel.create({
        product_id,
        user_id: userId,
        rating,
        comment
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await reviewModel.getByProduct(productId, parseInt(page), parseInt(limit));

      // Get average rating
      const avgRating = await reviewModel.getAverageRating(productId);

      res.json({
        success: true,
        ...result,
        avg_rating: avgRating
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get average rating for a product
  async getProductRating(req, res) {
    try {
      const { productId } = req.params;

      const avgRating = await reviewModel.getAverageRating(productId);

      res.json({
        success: true,
        rating: avgRating
      });
    } catch (error) {
      console.error('Get rating error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update a review
  async updateReview(req, res) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      // Get existing review to check ownership
      const reviews = await reviewModel.getAll({ review_id: reviewId });
      const review = reviews.reviews?.find(r => r.id === reviewId);

      if (!review || review.user_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this review' 
        });
      }

      const updated = await reviewModel.update(reviewId, { rating, comment });

      res.json({
        success: true,
        message: 'Review updated',
        review: updated
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete a review (user or admin)
  async deleteReview(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { reviewId } = req.params;

      // Check if user owns the review or is admin
      const reviews = await reviewModel.getAll();
      const review = reviews.reviews?.find(r => r.id === reviewId);

      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: 'Review not found' 
        });
      }

      if (review.user_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to delete this review' 
        });
      }

      await reviewModel.delete(reviewId);

      res.json({
        success: true,
        message: 'Review deleted'
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get all reviews (admin)
  async getAllReviews(req, res) {
    try {
      const { page = 1, limit = 20, product_id, user_id } = req.query;

      const result = await reviewModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        product_id,
        user_id
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = reviewController;