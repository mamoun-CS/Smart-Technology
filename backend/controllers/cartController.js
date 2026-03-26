const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

const cartController = {
  // Get cart
  async getCart(req, res) {
    try {
      const { cart, items } = await cartModel.getCartWithItems(req.user.id);
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      res.json({
        success: true,
        cart,
        items,
        total
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching cart.' 
      });
    }
  },

  // Add item to cart
  async addItem(req, res) {
    try {
      const { product_id, quantity = 1 } = req.body;

      // Check if product exists
      const product = await productModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock.' 
        });
      }

      await cartModel.addItem(req.user.id, product_id, quantity);
      
      const { cart, items } = await cartModel.getCartWithItems(req.user.id);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      res.json({
        success: true,
        message: 'Item added to cart.',
        cart,
        items,
        total
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error adding to cart.' 
      });
    }
  },

  // Update item quantity
  async updateItem(req, res) {
    try {
      const { product_id } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Quantity must be at least 1.' 
        });
      }

      // Check stock
      const product = await productModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock.' 
        });
      }

      await cartModel.updateItemQuantity(req.user.id, product_id, quantity);
      
      const { cart, items } = await cartModel.getCartWithItems(req.user.id);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      res.json({
        success: true,
        message: 'Cart updated.',
        cart,
        items,
        total
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating cart.' 
      });
    }
  },

  // Remove item from cart
  async removeItem(req, res) {
    try {
      const { product_id } = req.params;

      await cartModel.removeItem(req.user.id, product_id);
      
      const { cart, items } = await cartModel.getCartWithItems(req.user.id);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      res.json({
        success: true,
        message: 'Item removed from cart.',
        cart,
        items,
        total
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error removing from cart.' 
      });
    }
  },

  // Clear cart
  async clearCart(req, res) {
    try {
      await cartModel.clearCart(req.user.id);
      
      res.json({
        success: true,
        message: 'Cart cleared.',
        cart: { id: req.user.id },
        items: [],
        total: 0
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error clearing cart.' 
      });
    }
  }
};

module.exports = cartController;
