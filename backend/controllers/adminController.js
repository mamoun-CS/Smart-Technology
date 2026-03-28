const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

const adminController = {
  // Get all users
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, approved } = req.query;
      
      const result = await userModel.getAllUsers(
        parseInt(page),
        parseInt(limit),
        role,
        approved !== undefined ? approved === 'true' : null
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching users.' 
      });
    }
  },

  // Get pending traders
  async getPendingTraders(req, res) {
    try {
      const traders = await userModel.getPendingTraders();
      
      res.json({
        success: true,
        traders
      });
    } catch (error) {
      console.error('Get pending traders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching traders.' 
      });
    }
  },

  // Approve trader
  async approveTrader(req, res) {
    try {
      const { id } = req.params;
      
      const trader = await userModel.approveTrader(id);
      
      if (!trader) {
        return res.status(404).json({ 
          success: false, 
          message: 'Trader not found.' 
        });
      }

      res.json({
        success: true,
        message: 'Trader approved successfully.',
        trader
      });
    } catch (error) {
      console.error('Approve trader error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error approving trader.' 
      });
    }
  },

  // Reject trader
  async rejectTrader(req, res) {
    try {
      const { id } = req.params;
      
      const trader = await userModel.rejectTrader(id);
      
      if (!trader) {
        return res.status(404).json({ 
          success: false, 
          message: 'Trader not found.' 
        });
      }

      res.json({
        success: true,
        message: 'Trader rejected.',
        trader
      });
    } catch (error) {
      console.error('Reject trader error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error rejecting trader.' 
      });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot delete your own account.' 
        });
      }

      const user = await userModel.delete(id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found.' 
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully.'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error deleting user.' 
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, role } = req.body;

      // Prevent self-modification of role
      if (id === req.user.id && role && role !== req.user.role) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot change your own role.' 
        });
      }

      const db = require('../models/db');
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(phone);
      }
      if (role !== undefined) {
        updates.push(`role = $${paramIndex++}`);
        values.push(role);
      }

      if (updates.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No fields to update.' 
        });
      }

      values.push(id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, phone, role, created_at`;
      
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found.' 
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully.',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating user.' 
      });
    }
  },

  // Get all products (admin view)
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 12, category_id, search } = req.query;
      
      const result = await productModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        category_id,
        search
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching products.' 
      });
    }
  },

  // Get all users (admin - no pagination)
  async getAllUsers(req, res) {
    try {
      const result = await userModel.getAllUsers(1, 1000, null, null);
      
      res.json({
        success: true,
        users: result.users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching users.' 
      });
    }
  },

  // Get all addresses (admin)
  async getAllAddresses(req, res) {
    try {
      const db = require('../models/db');
      
      const result = await db.query(`
        SELECT 
          sa.id, sa.user_id, sa.address, sa.city, 
          sa.phone, sa.is_default, sa.created_at,
          u.name as user_name, u.email as user_email
        FROM shipping_addresses sa
        JOIN users u ON sa.user_id = u.id
        ORDER BY sa.created_at DESC
      `);

      res.json({
        success: true,
        addresses: result.rows.map(addr => ({
          ...addr,
          label: addr.is_default ? 'Default Address' : 'Address',
          postal_code: ''
        }))
      });
    } catch (error) {
      console.error('Get all addresses error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching addresses.' 
      });
    }
  },

  // Get active offers (admin)
  async getActiveOffers(req, res) {
    try {
      const db = require('../models/db');
      
      const result = await db.query(`
        SELECT 
          o.id, o.code, o.discount_type, o.discount_value,
          o.usage_limit, o.used_count, o.valid_from, o.valid_until,
          o.created_at
        FROM offers o
        WHERE o.valid_until > NOW()
        ORDER BY o.created_at DESC
      `);

      res.json({
        success: true,
        offers: result.rows.map(offer => ({
          id: offer.id,
          code: offer.code,
          discount_type: offer.discount_type,
          discount_value: offer.discount_value,
          usage_limit: offer.usage_limit,
          used_count: offer.used_count,
          is_active: true,
          starts_at: offer.valid_from,
          expires_at: offer.valid_until,
          min_order_amount: null,
          description: ''
        }))
      });
    } catch (error) {
      console.error('Get active offers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching offers.' 
      });
    }
  }
};

module.exports = adminController;
