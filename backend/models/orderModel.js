const pool = require('./db');

const orderModel = {
  // Create order from cart
  async createOrder(userId, orderData) {
    const { shipping_address, payment_method } = orderData;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get cart items
      const cartQuery = `
        SELECT ci.*, p.price as base_price, p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN cart c ON ci.cart_id = c.id
        WHERE c.user_id = $1
      `;
      const cartResult = await client.query(cartQuery, [userId]);
      
      if (cartResult.rows.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Calculate total price with quantity-based pricing
      let totalPrice = 0;
      const orderItems = [];
      
      for (const item of cartResult.rows) {
        // Get price based on quantity
        const priceQuery = `
          SELECT price FROM product_pricing 
          WHERE product_id = $1 AND min_quantity <= $2
          ORDER BY min_quantity DESC
          LIMIT 1
        `;
        const priceResult = await client.query(priceQuery, [item.product_id, item.quantity]);
        
        let price = item.base_price;
        if (priceResult.rows.length > 0) {
          price = priceResult.rows[0].price;
        }
        
        totalPrice += price * item.quantity;
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: price
        });
        
        // Update product stock
        const updateStockQuery = `
          UPDATE products 
          SET stock = stock - $1
          WHERE id = $2 AND stock >= $1
        `;
        await client.query(updateStockQuery, [item.quantity, item.product_id]);
      }
      
      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method)
        VALUES ($1, $2, 'pending', $3, $4)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [userId, totalPrice, shipping_address, payment_method]);
      const order = orderResult.rows[0];
      
      // Create order items
      for (const item of orderItems) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(itemQuery, [order.id, item.product_id, item.quantity, item.price]);
      }
      
      // Clear cart
      const clearCartQuery = `
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM cart WHERE user_id = $1)
      `;
      await client.query(clearCartQuery, [userId]);
      
      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get user's orders
  async getUserOrders(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'name_en', p.name_en,
               'name_ar', p.name_ar,
               'images', p.images
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM orders WHERE user_id = $1';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);
    
    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  },

  // Get order by ID
  async findById(orderId, userId = null) {
    let query = `
      SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'name_en', p.name_en,
               'name_ar', p.name_ar,
               'images', p.images
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
    `;
    const values = [orderId];
    
    if (userId) {
      query += ' AND o.user_id = $2';
      values.push(userId);
    }
    
    query += ' GROUP BY o.id';
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all orders (admin)
  async getAllOrders(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.id, o.user_id, o.total_price, o.status, o.shipping_address, o.payment_method, 
             o.created_at, o.updated_at,
             CAST(o.total_price AS VARCHAR) as total_amount, 
             u.name as customer_name, u.email as customer_email,
             json_agg(json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price
             )) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const values = [];
    
    if (status) {
      query += ' WHERE o.status = $1';
      values.push(status);
    }
    
    query += ' GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, offset);
    
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM orders WHERE status = $1'
      : 'SELECT COUNT(*) FROM orders';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, status ? [status] : [])
    ]);
    
    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  },

  // Update order status
  async updateStatus(orderId, status) {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  },

  // Get trader orders (orders containing products created by trader)
  async getTraderOrders(traderId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT DISTINCT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE p.created_by = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(DISTINCT o.id)
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.created_by = $1
    `;
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [traderId, limit, offset]),
      pool.query(countQuery, [traderId])
    ]);
    
    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  },

  // Get dashboard stats
  async getStats() {
    const stats = {};
    
    // Total users
    const usersQuery = 'SELECT COUNT(*) FROM users';
    const usersResult = await pool.query(usersQuery);
    stats.totalUsers = parseInt(usersResult.rows[0].count);
    
    // Total orders
    const ordersQuery = 'SELECT COUNT(*) FROM orders';
    const ordersResult = await pool.query(ordersQuery);
    stats.totalOrders = parseInt(ordersResult.rows[0].count);
    
    // Total sales
    const salesQuery = 'SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status != $1';
    const salesResult = await pool.query(salesQuery, ['cancelled']);
    stats.totalSales = parseFloat(salesResult.rows[0].sum);
    
    // Pending orders
    const pendingQuery = "SELECT COUNT(*) FROM orders WHERE status = 'pending'";
    const pendingResult = await pool.query(pendingQuery);
    stats.pendingOrders = parseInt(pendingResult.rows[0].count);
    
    // Recent orders
    const recentQuery = `
      SELECT o.*, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;
    const recentResult = await pool.query(recentQuery);
    stats.recentOrders = recentResult.rows;
    
    return stats;
  },

  // Get trader stats
  async getTraderStats(traderId) {
    const stats = {};
    
    // Total products
    const productsQuery = 'SELECT COUNT(*) FROM products WHERE created_by = $1';
    const productsResult = await pool.query(productsQuery, [traderId]);
    stats.totalProducts = parseInt(productsResult.rows[0].count);
    
    // Total orders for trader products
    const ordersQuery = `
      SELECT COUNT(DISTINCT o.id)
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.created_by = $1
    `;
    const ordersResult = await pool.query(ordersQuery, [traderId]);
    stats.totalOrders = parseInt(ordersResult.rows[0].count);
    
    // Total sales for trader products
    const salesQuery = `
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.created_by = $1 AND o.status != 'cancelled'
    `;
    const salesResult = await pool.query(salesQuery, [traderId]);
    stats.totalSales = parseFloat(salesResult.rows[0].sum);
    
    return stats;
  }
};

module.exports = orderModel;
