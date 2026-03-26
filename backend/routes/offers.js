const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const offerController = require('../controllers/offerController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Public route - get active offers (for logged in users)
router.get('/active', authMiddleware, offerController.getActiveOffers);

// Validate offer code
router.post('/validate', authMiddleware, [
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('order_total').isFloat({ min: 0 }).withMessage('Order total is required')
], offerController.validateOffer);

// Admin routes
router.post('/', authMiddleware, requireAdmin, [
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('discount_type').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discount_value').isFloat({ min: 0 }).withMessage('Discount value is required'),
  body('valid_from').isISO8601().withMessage('Valid from date is required'),
  body('valid_until').isISO8601().withMessage('Valid until date is required')
], offerController.createOffer);

router.get('/', authMiddleware, requireAdmin, offerController.getAllOffers);
router.put('/:offerId', authMiddleware, requireAdmin, offerController.updateOffer);
router.delete('/:offerId', authMiddleware, requireAdmin, offerController.deleteOffer);

// Email campaign
router.post('/send-email', authMiddleware, requireAdmin, offerController.sendOffersByEmail);

module.exports = router;