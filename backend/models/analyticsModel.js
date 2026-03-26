const pool = require('./db');

const analyticsModel = {
  // Get dashboard overview stats
  async getDashboardStats() {
    // Total users
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'trader' THEN 1 END) as traders,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN approved = false AND role = 'trader' THEN 1 END) as pending_traders
      FROM users
    `;
    const usersResult = await pool.query(usersQuery);

    // Total products
    const productsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(stock) as total_stock
      FROM products
    `;
    const productsResult = await pool.query(productsQuery);

    // Orders stats
    const ordersQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(total_price) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM orders
    `;
    const ordersResult = await pool.query(ordersQuery);

    // Today's orders
    const todayOrdersQuery = `
      SELECT COUNT(*) as count, SUM(total_price) as revenue
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const todayOrdersResult = await pool.query(todayOrdersQuery);

    // This month's orders
    const monthOrdersQuery = `
      SELECT COUNT(*) as count, SUM(total_price) as revenue
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const monthOrdersResult = await pool.query(monthOrdersQuery);

    // Support tickets stats
    const ticketsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open
      FROM support_tickets
    `;
    const ticketsResult = await pool.query(ticketsQuery);

    return {
      users: usersResult.rows[0],
      products: productsResult.rows[0],
      orders: ordersResult.rows[0],
      today_orders: todayOrdersResult.rows[0],
      month_orders: monthOrdersResult.rows[0],
      tickets: ticketsResult.rows[0]
    };
  },

  // Get sales by date range
  async getSalesByDate(startDate, endDate) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_price) as revenue
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  },

  // Get top selling products
  async getTopProducts(limit = 10) {
    const query = `
      SELECT 
        p.id, p.name_en, p.name_ar, p.unit_price, p.images,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name_en, p.name_ar, p.unit_price, p.images
      ORDER BY total_sold DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  // Get top categories by sales
  async getTopCategories(limit = 10) {
    const query = `
      SELECT 
        c.id, c.name_en, c.name_ar,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as products_sold,
        SUM(oi.price * oi.quantity) as revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.id, c.name_en, c.name_ar
      ORDER BY revenue DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  // Get user registrations by month
  async getUserRegistrations(months = 12) {
    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as registrations,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'trader' THEN 1 END) as traders
      FROM users
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Get merchant activity
  async getMerchantActivity(traderId = null) {
    let query = `
      SELECT 
        u.id, u.name, u.email, u.created_at,
        COUNT(DISTINCT p.id) as products_count,
        COUNT(DISTINCT o.id) as orders_count,
        COALESCE(SUM(o.total_price), 0) as total_sales
      FROM users u
      LEFT JOIN products p ON u.id = p.created_by
      LEFT JOIN orders o ON p.id = ANY(
        SELECT product_id FROM order_items WHERE order_id = o.id
      )
      WHERE u.role = 'trader'
    `;
    
    if (traderId) {
      query += ` AND u.id = $1`;
    }
    
    query += ` GROUP BY u.id, u.name, u.email, u.created_at ORDER BY total_sales DESC`;
    
    const result = traderId ? await pool.query(query, [traderId]) : await pool.query(query);
    return result.rows;
  },

  // Get product analytics
  async getProductAnalytics(productId) {
    // Views
    const viewsQuery = `
      SELECT view_count, last_viewed FROM product_analytics WHERE product_id = $1
    `;
    const viewsResult = await pool.query(viewsQuery, [productId]);

    // Sales
    const salesQuery = `
      SELECT 
        COUNT(*) as orders,
        SUM(quantity) as units_sold,
        SUM(price * quantity) as revenue
      FROM order_items
      WHERE product_id = $1
    `;
    const salesResult = await pool.query(salesQuery, [productId]);

    // Reviews
    const reviewsQuery = `
      SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE product_id = $1
    `;
    const reviewsResult = await pool.query(reviewsQuery, [productId]);

    return {
      views: viewsResult.rows[0] || { view_count: 0, last_viewed: null },
      sales: salesResult.rows[0],
      reviews: reviewsResult.rows[0]
    };
  },

  // Get low stock products for alerts
  async getLowStockAlerts(threshold = 10) {
    const query = `
      SELECT p.*, c.name_en as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= $1
      ORDER BY p.stock ASC
    `;
    const result = await pool.query(query, [threshold]);
    return result.rows;
  },

  // Get order status distribution
  async getOrderStatusDistribution() {
    const query = `
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Get revenue by period
  async getRevenueByPeriod(period = 'day', limit = 30) {
    let dateFormat;
    switch (period) {
      case 'year':
        dateFormat = 'YYYY';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      case 'day':
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const query = `
      SELECT 
        TO_CHAR(created_at, '${dateFormat}') as period,
        COUNT(*) as orders,
        SUM(total_price) as revenue
      FROM orders
      WHERE status != 'cancelled'
        AND created_at >= CURRENT_DATE - INTERVAL '${limit} ${period}s'
      GROUP BY TO_CHAR(created_at, '${dateFormat}')
      ORDER BY period ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

module.exports = analyticsModel;