const shippingModel = require('../models/shippingModel');

const shippingController = {
  // Create shipping area (admin)
  async createArea(req, res) {
    try {
      const { name_en, name_ar, price, estimated_days } = req.body;

      if (!name_en || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name and price are required' 
        });
      }

      const area = await shippingModel.createArea({
        name_en,
        name_ar: name_ar || name_en,
        price: parseFloat(price),
        estimated_days
      });

      res.status(201).json({
        success: true,
        message: 'Shipping area created',
        area
      });
    } catch (error) {
      console.error('Create shipping area error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get all shipping areas
  async getAreas(req, res) {
    try {
      const { active } = req.query;

      const areas = await shippingModel.getAllAreas(active === 'true');

      res.json({
        success: true,
        areas
      });
    } catch (error) {
      console.error('Get shipping areas error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update shipping area (admin)
  async updateArea(req, res) {
    try {
      const { areaId } = req.params;
      const updateData = req.body;

      const area = await shippingModel.updateArea(areaId, updateData);

      if (!area) {
        return res.status(404).json({ 
          success: false, 
          message: 'Shipping area not found' 
        });
      }

      res.json({
        success: true,
        message: 'Shipping area updated',
        area
      });
    } catch (error) {
      console.error('Update shipping area error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete shipping area (admin)
  async deleteArea(req, res) {
    try {
      const { areaId } = req.params;

      const area = await shippingModel.deleteArea(areaId);

      if (!area) {
        return res.status(404).json({ 
          success: false, 
          message: 'Shipping area not found' 
        });
      }

      res.json({
        success: true,
        message: 'Shipping area deleted'
      });
    } catch (error) {
      console.error('Delete shipping area error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Save shipping address
  async saveAddress(req, res) {
    try {
      const userId = req.user.id;
      const { address, city, phone, is_default } = req.body;

      if (!address || !city || !phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Address, city, and phone are required' 
        });
      }

      const savedAddress = await shippingModel.saveAddress({
        user_id: userId,
        address,
        city,
        phone,
        is_default
      });

      res.status(201).json({
        success: true,
        message: 'Address saved',
        address: savedAddress
      });
    } catch (error) {
      console.error('Save address error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get user addresses
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;

      const addresses = await shippingModel.getUserAddresses(userId);

      res.json({
        success: true,
        addresses
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update address
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const updateData = req.body;

      const address = await shippingModel.updateAddress(addressId, userId, updateData);

      if (!address) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }

      res.json({
        success: true,
        message: 'Address updated',
        address
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Delete address
  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;

      const address = await shippingModel.deleteAddress(addressId, userId);

      if (!address) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }

      res.json({
        success: true,
        message: 'Address deleted'
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Send phone verification code
  async sendPhoneVerification(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required' 
        });
      }

      const result = await shippingModel.sendVerificationCode(phone);

      res.json({
        success: true,
        message: 'Verification code sent',
        expiresIn: result.expiresIn
      });
    } catch (error) {
      console.error('Send phone verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Verify phone number
  async verifyPhone(req, res) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone and verification code are required' 
        });
      }

      const isValid = await shippingModel.verifyPhone(phone, code);

      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      res.json({
        success: true,
        message: 'Phone verified successfully'
      });
    } catch (error) {
      console.error('Verify phone error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Calculate shipping cost
  async calculateShipping(req, res) {
    try {
      const { area_id } = req.body;

      if (!area_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Shipping area is required' 
        });
      }

      const cost = await shippingModel.getShippingCost(area_id);

      if (cost === null) {
        return res.status(404).json({ 
          success: false, 
          message: 'Shipping area not found' 
        });
      }

      res.json({
        success: true,
        shipping_cost: cost
      });
    } catch (error) {
      console.error('Calculate shipping error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = shippingController;