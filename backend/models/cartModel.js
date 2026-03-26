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
      SELECT ci.*, p.name_en, p.name_ar, p.price as base_price, p.images, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const result = await pool.query(query, [cart.id]);
    
    // Calculate prices based on quantity
    const items = await Promise.all(result.rows.map(async (item) => {
      const price = await this.getPriceWithQuantity(item.product_id, item.quantity);
      return { ...item, price };
    }));

    return { cart, items };
  },

  // Get price with quantity-based pricing
  async getPriceWithQuantity(productId, quantity) {
    const query = `
      SELECT price FROM product_pricing 
      WHERE product_id = $1 AND min_quantity <= $2
      ORDER BY min_quantity DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [productId, quantity]);
    
    if (result.rows.length > 0) {
      return result.rows[0].price;
    }
    
    // If no quantity-based pricing, get base price
    const productQuery = 'SELECT price FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    return productResult.rows[0]?.price || 0;
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
