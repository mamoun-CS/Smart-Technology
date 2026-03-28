const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireTrader, requireAdminOrTrader, requireApprovedTrader } = require('../middleware/rbac');

// Public routes - Note: /categories must be BEFORE /:id to avoid conflicts
router.get('/categories', productController.getCategories);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected routes - require trader role
router.post('/', authMiddleware, requireTrader, requireApprovedTrader, [
  body('name_en').trim().notEmpty().withMessage('English name is required'),
  body('name_ar').trim().notEmpty().withMessage('Arabic name is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('wholesale_price').optional().isFloat({ min: 0 }).withMessage('Wholesale price must be positive'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('min_order_quantity').optional().isInt({ min: 1 }).withMessage('Min order quantity must be at least 1')
], productController.createProduct);

router.put('/:id', authMiddleware, requireAdminOrTrader, requireApprovedTrader, productController.updateProduct);
router.delete('/:id', authMiddleware, requireTrader, requireAdmin, productController.deleteProduct);

router.post('/:id/pricing', authMiddleware, requireTrader, requireApprovedTrader, [
  body('min_quantity').isInt({ min: 1 }).withMessage('Minimum quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], productController.addPricing);

// Admin only routes - categories management
router.post('/categories', authMiddleware, requireAdmin, [
  body('name_en').trim().notEmpty().withMessage('English name is required'),
  body('name_ar').trim().notEmpty().withMessage('Arabic name is required')
], productController.createCategory);

router.put('/categories/:id', authMiddleware, requireAdmin, productController.updateCategory);
router.delete('/categories/:id', authMiddleware, requireAdmin, productController.deleteCategory);

module.exports = router;