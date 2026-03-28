const productModel = require('../models/productModel');
const { validationResult } = require('express-validator');

const productController = {
  // Get all products
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 12, category_id, min_price, max_price, search } = req.query;
      
      const result = await productModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        category_id,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null,
        search
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching products.' 
      });
    }
  },

  // Get single product
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      
      const product = await productModel.findById(id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      // Get pricing tiers
      const pricing = await productModel.getPricing(id);

      res.json({
        success: true,
        product: { ...product, pricing }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching product.' 
      });
    }
  },

  // Create product (trader only)
  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name_en, name_ar, description_en, description_ar, unit_price, wholesale_price, min_order_quantity, stock, category_id, images, barcode, qr_code, warehouse_location } = req.body;
      
      // Validate wholesale pricing
      if (wholesale_price && unit_price && wholesale_price >= unit_price) {
        return res.status(400).json({
          success: false,
          message: 'Wholesale price must be less than retail price.'
        });
      }
      
      if (min_order_quantity && min_order_quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Minimum order quantity must be at least 1.'
        });
      }
      
      const product = await productModel.create({
        name_en,
        name_ar,
        description_en,
        description_ar,
        unit_price,
        wholesale_price,
        min_order_quantity: min_order_quantity || 1,
        stock,
        category_id,
        created_by: req.user.id,
        images,
        barcode,
        qr_code,
        warehouse_location
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error creating product.' 
      });
    }
  },

  // Update product
  async updateProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { name_en, name_ar, description_en, description_ar, unit_price, wholesale_price, min_order_quantity, stock, category_id, images, barcode, qr_code, warehouse_location } = req.body;

      // Check if product exists
      const existingProduct = await productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      // Check ownership (admin can edit any, trader can only edit their products)
      if (req.user.role !== 'admin' && existingProduct.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only edit your own products.' 
        });
      }

      // Validate wholesale pricing
      const finalUnitPrice = unit_price || existingProduct.unit_price;
      const finalWholesalePrice = wholesale_price !== undefined ? wholesale_price : existingProduct.wholesale_price;
      const finalMinOrderQuantity = min_order_quantity !== undefined ? min_order_quantity : existingProduct.min_order_quantity;
      
      if (finalWholesalePrice && finalUnitPrice && finalWholesalePrice >= finalUnitPrice) {
        return res.status(400).json({
          success: false,
          message: 'Wholesale price must be less than retail price.'
        });
      }
      
      if (finalMinOrderQuantity && finalMinOrderQuantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Minimum order quantity must be at least 1.'
        });
      }

      const product = await productModel.update(id, {
        name_en,
        name_ar,
        description_en,
        description_ar,
        unit_price,
        wholesale_price,
        min_order_quantity,
        stock,
        category_id,
        images,
        barcode,
        qr_code,
        warehouse_location
      });

      res.json({
        success: true,
        message: 'Product updated successfully.',
        product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating product.' 
      });
    }
  },

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Check if product exists
      const existingProduct = await productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingProduct.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own products.' 
        });
      }

      await productModel.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error deleting product.' 
      });
    }
  },

  // Add product pricing
  async addPricing(req, res) {
    try {
      const { id } = req.params;
      const { min_quantity, price } = req.body;

      // Check if product exists
      const existingProduct = await productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found.' 
        });
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingProduct.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only manage your own product pricing.' 
        });
      }

      const pricing = await productModel.addPricing(id, { min_quantity, price });

      res.json({
        success: true,
        message: 'Pricing tier added successfully.',
        pricing
      });
    } catch (error) {
      console.error('Add pricing error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error adding pricing.' 
      });
    }
  },

  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await productModel.getCategories();
      
      res.json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching categories.' 
      });
    }
  },

  // Create category (admin only)
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name_en, name_ar, description_en, description_ar, image_url } = req.body;
      
      const category = await productModel.createCategory({
        name_en,
        name_ar,
        description_en,
        description_ar,
        image_url
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error creating category.' 
      });
    }
  },

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name_en, name_ar, description_en, description_ar, image_url } = req.body;

      const category = await productModel.updateCategory(id, {
        name_en,
        name_ar,
        description_en,
        description_ar,
        image_url
      });

      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: 'Category not found.' 
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully.',
        category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating category.' 
      });
    }
  },

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await productModel.deleteCategory(id);

      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: 'Category not found.' 
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error deleting category.' 
      });
    }
  }
};

module.exports = productController;
