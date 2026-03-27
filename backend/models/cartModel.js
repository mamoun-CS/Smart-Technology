const pool = require('./db');

const cartModel = {
  // Get or create cart for user
  async getOrCreateCart(userId) {
    let query = 'SELECT * FROM cart WHERE user_id = $1';
    let result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      query = 'INSERT INTO cart (user_id) VALUES ($1) RETURNING *';
      result = await pool.query(query, [userId]);
    }

    return result.rows[0];
  },

  // Get cart with items
  async getCartWithItems(userId) {
    const cart = await this.getOrCreateCart(userId);
    
    const query = `
      SELECT ci.*, p.name_en, p.name_ar, p.unit_price, p.wholesale_price, p.min_order_quantity, p.images, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const result = await pool.query(query, [cart.id]);
    
    // Calculate prices based on quantity and include wholesale info
    const items = await Promise.all(result.rows.map(async (item) => {
      const price = await this.getPriceWithQuantity(item.product_id, item.quantity);
      const isWholesaleApplied = await this.isWholesalePriceApplied(item.product_id, item.quantity);
      
      return { 
        ...item, 
        price,
        is_wholesale_applied: isWholesaleApplied,
        retail_price: item.unit_price,
        wholesale_price: item.wholesale_price,
        min_order_quantity: item.min_order_quantity
      };
    }));

    return { cart, items };
  },

  // Get price with quantity-based pricing (wholesale pricing logic)
  async getPriceWithQuantity(productId, quantity) {
    // First check if product has wholesale pricing
    const productQuery = `
      SELECT unit_price, wholesale_price, min_order_quantity 
      FROM products 
      WHERE id = $1
    `;
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return 0;
    }
    
    const product = productResult.rows[0];
    const unitPrice = product.unit_price || 0;
    const wholesalePrice = product.wholesale_price;
    const minOrderQuantity = product.min_order_quantity || 1;
    
    // Apply wholesale price if quantity meets minimum
    if (wholesalePrice && quantity >= minOrderQuantity) {
      return wholesalePrice;
    }
    
    // Otherwise, check for quantity-based pricing tiers
    const pricingQuery = `
      SELECT price FROM product_pricing 
      WHERE product_id = $1 AND min_quantity <= $2
      ORDER BY min_quantity DESC
      LIMIT 1
    `;
    const pricingResult = await pool.query(pricingQuery, [productId, quantity]);
    
    if (pricingResult.rows.length > 0) {
      return pricingResult.rows[0].price;
    }
    
    // Return retail price if no wholesale or tiered pricing applies
    return unitPrice;
  },
  
  // Check if wholesale price is applied for a product
  async isWholesalePriceApplied(productId, quantity) {
    const productQuery = `
      SELECT wholesale_price, min_order_quantity 
      FROM products 
      WHERE id = $1
    `;
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return false;
    }
    
    const product = productResult.rows[0];
    return product.wholesale_price && quantity >= product.min_order_quantity;
  },

  // Add item to cart
  async addItem(userId, productId, quantity = 1) {
    const cart = await this.getOrCreateCart(userId);
    
    // Check if item already exists
    const checkQuery = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
    const checkResult = await pool.query(checkQuery, [cart.id, productId]);
    
    if (checkResult.rows.length > 0) {
      // Update quantity
      const updateQuery = `
        UPDATE cart_items 
        SET quantity = quantity + $1
        WHERE cart_id = $2 AND product_id = $3
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [quantity, cart.id, productId]);
      return updateResult.rows[0];
    }
    
    // Insert new item
    const insertQuery = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [cart.id, productId, quantity]);
    return insertResult.rows[0];
  },

  // Update item quantity
  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }
    
    const query = `
      UPDATE cart_items 
      SET quantity = $1
      WHERE cart_id = $2 AND product_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, cart.id, productId]);
    return result.rows[0];
  },

  // Remove item from cart
  async removeItem(userId, productId) {
    const cart = await this.getOrCreateCart(userId);
    
    const query = `
      DELETE FROM cart_items 
      WHERE cart_id = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [cart.id, productId]);
    return result.rows[0];
  },

  // Clear cart
  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    
    const query = 'DELETE FROM cart_items WHERE cart_id = $1';
    await pool.query(query, [cart.id]);
    return true;
  },

  // Get cart total
  async getCartTotal(userId) {
    const { items } = await this.getCartWithItems(userId);
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};

module.exports = cartModel;
