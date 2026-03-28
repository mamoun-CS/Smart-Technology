const pool = require('./db');

const favoriteModel = {
  // Add product to favorites
  async addFavorite(userId, productId) {
    const query = `
      INSERT INTO favorites (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  },

  // Remove product from favorites
  async removeFavorite(userId, productId) {
    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  },

  // Get all favorites for a user
  async getUserFavorites(userId) {
    const query = `
      SELECT 
        p.*,
        c.name_en as category_name_en,
        c.name_ar as category_name_ar,
        f.created_at as favorited_at
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Check if product is in user's favorites
  async isFavorite(userId, productId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM favorites 
        WHERE user_id = $1 AND product_id = $2
      ) as is_favorite
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0]?.is_favorite || false;
  },

  // Get favorite count for a user
  async getFavoriteCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM favorites
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0]?.count || 0);
  },

  // Toggle favorite (add if not exists, remove if exists)
  async toggleFavorite(userId, productId) {
    const isFav = await this.isFavorite(userId, productId);
    
    if (isFav) {
      await this.removeFavorite(userId, productId);
      return { is_favorite: false, action: 'removed' };
    } else {
      await this.addFavorite(userId, productId);
      return { is_favorite: true, action: 'added' };
    }
  }
};

module.exports = favoriteModel;
