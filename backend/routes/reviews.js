const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public route - get product reviews
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/rating', reviewController.getProductRating);

// Protected routes - add/update/delete reviews
router.post('/reviews', authMiddleware, reviewController.addReview);
router.put('/reviews/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/reviews/:reviewId', authMiddleware, reviewController.deleteReview);

// Admin route - get all reviews
router.get('/reviews', authMiddleware, reviewController.getAllReviews);

module.exports = router;