const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authenticate = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's favorites
router.get('/', favoriteController.getFavorites);

// Get favorite count
router.get('/count', favoriteController.getFavoriteCount);

// Get most favorited products (admin only)
router.get('/admin/most-favorited', favoriteController.getMostFavorited);

// Check if product is favorite
router.get('/check/:productId', favoriteController.checkFavorite);

// Add to favorites
router.post('/', favoriteController.addFavorite);

// Toggle favorite status
router.post('/toggle', favoriteController.toggleFavorite);

// Remove from favorites
router.delete('/:productId', favoriteController.removeFavorite);

module.exports = router;
