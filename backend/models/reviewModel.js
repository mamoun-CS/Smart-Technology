const pool = require('./db');

const reviewModel = {
  // Create a review
  async create(reviewData) {
    const { product_id, user_id, rating, comment } = reviewData;
    const query = `
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [product_id, user_id, rating, comment];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get reviews for a product
  async getByProduct(productId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [productId, limit, offset]);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM reviews WHERE product_id = $1';
    const countResult = await pool.query(countQuery, [productId]);
    const total = parseInt(countResult.rows[0].count);
    
    return {
      reviews: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get all reviews (admin)
  async getAll(filters = {}) {
    const { page = 1, limit = 20, product_id, user_id } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email,
             p.name_en as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (product_id) {
      query += ` AND r.product_id = $${paramIndex}`;
      values.push(product_id);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND r.user_id = $${paramIndex}`;
      values.push(user_id);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    return {
      reviews: result.rows,
      page,
      limit
    };
  },

  // Get average rating for a product
  async getAverageRating(productId) {
    const query = `
      SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as review_count,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE product_id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  },

  // Update review
  async update(id, reviewData) {
    const { rating, comment } = reviewData;
    const query = `
      UPDATE reviews 
      SET rating = COALESCE($1, rating),
          comment = COALESCE($2, comment)
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [rating, comment, id]);
    return result.rows[0];
  },

  // Delete review
  async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Check if user already reviewed product
  async hasReviewed(userId, productId) {
    const query = 'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2';
    const result = await pool.query(query, [userId, productId]);
    return result.rows.length > 0;
  }
};

module.exports = reviewModel;