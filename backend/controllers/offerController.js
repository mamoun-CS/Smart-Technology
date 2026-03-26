const offerModel = require('../models/offerModel');

const offerController = {
  // Create a new offer (admin)
  async createOffer(req, res) {
    try {
      const { 
        code, discount_type, discount_value, target_role,
        valid_from, valid_until, usage_limit 
      } = req.body;

      if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      // Validate discount type
      if (!['percentage', 'fixed'].includes(discount_type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid discount type' 
        });
      }

      // Validate discount value
      if (discount_type === 'percentage' && (discount_value < 1 || discount_value > 100)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Percentage must be between 1 and 100' 
        });
      }

      const offer = await offerModel.create({
        code,
        discount_type,
        discount_value,
        target_role: target_role || 'all',
        valid_from,
        valid_until,
        usage_limit,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Offer created successfully',
        offer
      });
    } catch (error) {
      console.error('Create offer error:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ 
          success: false, 
          message: 'Offer code already exists' 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get all offers (admin)
  async getAllOffers(req, res) {
    try {
      const { page = 1, limit = 20, active, target_role } = req.query;

      const offers = await offerModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        active: active === 'true',
        target_role
      });

      res.json({
        success: true,
        offers
      });
    } catch (error) {
      console.error('Get offers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get active offers for customers/merchants
  async getActiveOffers(req, res) {
    try {
      const userRole = req.user?.role || 'customer';
      
      const offers = await offerModel.getAll({ active: true, target_role: userRole });

      res.json({
        success: true,
        offers
      });
    } catch (error) {
      console.error('Get active offers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Validate offer code
  async validateOffer(req, res) {
    try {
      const { code, order_total } = req.body;
      const userRole = req.user?.role || 'customer';

      if (!code || !order_total) {
        return res.status(400).json({ 
          success: false, 
          message: 'Code and order total are required' 
        });
      }

      const result = await offerModel.validateOffer(code, userRole, parseFloat(order_total));

      if (!result.valid) {
        return res.status(400).json({ 
          success: false, 
          message: result.message 
        });
      }

      res.json({
        success: true,
        offer: result.offer,
        discount: result.discount,
        final_total: result.final_total
      });
    } catch (error) {
      console.error('Validate offer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Apply offer to order
  async applyOffer(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Code is required' 
        });
      }

      await offerModel.applyOffer(code);

      res.json({
        success: true,
        message: 'Offer applied successfully'
      });
    } catch (error) {
      console.error('Apply offer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update offer (admin)
  async updateOffer(req, res) {
    try {
      const { offerId } = req.params;
      const updateData = req.body;

      const offer = await offerModel.update(offerId, updateData);

      if (!offer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Offer not found' 
        });
      }

      res.json({
        success: true,
        message: 'Offer updated',
        offer
      });
    } catch (error) {
      console.error('Update offer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete offer (admin)
  async deleteOffer(req, res) {
    try {
      const { offerId } = req.params;

      const offer = await offerModel.delete(offerId);

      if (!offer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Offer not found' 
        });
      }

      res.json({
        success: true,
        message: 'Offer deleted'
      });
    } catch (error) {
      console.error('Delete offer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Send offers via email (admin)
  async sendOffersByEmail(req, res) {
    try {
      const { user_ids, offer_ids } = req.body;

      if (!user_ids || !offer_ids) {
        return res.status(400).json({ 
          success: false, 
          message: 'User IDs and offer IDs are required' 
        });
      }

      // Get offers
      const offers = await offerModel.getActiveOffers();
      const selectedOffers = offers.filter(o => offer_ids.includes(o.id));

      if (selectedOffers.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No valid offers found' 
        });
      }

      // In production, integrate with email service
      // For now, just return success
      res.json({
        success: true,
        message: `Offers will be sent to ${user_ids.length} users`,
        offers: selectedOffers
      });
    } catch (error) {
      console.error('Send offers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = offerController;