const pool = require('./db');
const bcrypt = require('bcrypt');

const userModel = {
  // Create a new user
  async create(userData) {
    const { name, email, password, role = 'customer' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, approved, is_verified, created_at
    `;
    const values = [name, email, hashedPassword, role];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Find user by ID
  async findById(id) {
    const query = 'SELECT id, name, email, role, approved, is_verified, avatar, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find user by ID with password (for password verification)
  async getByIdWithPassword(id) {
    const query = 'SELECT id, name, email, password FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find user by Google ID
  async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  },

  // Create or update Google user
  async createGoogleUser(userData) {
    const { googleId, name, email, avatar } = userData;
    
    const query = `
      INSERT INTO users (name, email, google_id, avatar, role, approved, is_verified)
      VALUES ($1, $2, $3, $4, 'customer', true, true)
      ON CONFLICT (email) 
      DO UPDATE SET google_id = $3, avatar = $4
      RETURNING id, name, email, role, approved, is_verified, created_at
    `;
    const values = [name, email, googleId, avatar];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update user verification status
  async verifyUser(id) {
    const query = 'UPDATE users SET is_verified = true WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update user password
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  },

  // Get all users (admin)
  async getAllUsers(page = 1, limit = 10, role = null, approved = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, email, role, approved, is_verified, created_at FROM users';
    let countQuery = 'SELECT COUNT(*) FROM users';
    const values = [];
    const conditions = [];

    if (role) {
      conditions.push(`role = $${values.length + 1}`);
      values.push(role);
    }
    if (approved !== null) {
      conditions.push(`approved = $${values.length + 1}`);
      values.push(approved);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  },

  // Approve trader
  async approveTrader(id) {
    const query = 'UPDATE users SET approved = true WHERE id = $1 AND role = $2 RETURNING *';
    const result = await pool.query(query, [id, 'trader']);
    return result.rows[0];
  },

  // Reject trader
  async rejectTrader(id) {
    const query = 'UPDATE users SET approved = false WHERE id = $1 AND role = $2 RETURNING *';
    const result = await pool.query(query, [id, 'trader']);
    return result.rows[0];
  },

  // Delete user
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get pending traders
  async getPendingTraders() {
    const query = `
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE role = 'trader' AND approved = false
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Compare password
  async comparePassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  // Get full user profile
  async getProfile(id) {
    const query = `
      SELECT id, name, email, phone, role, approved, is_verified, avatar, 
             phone_verified, last_login, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update user profile
  async updateProfile(id, userData) {
    const { name, phone } = userData;
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING id, name, email, phone, role, approved, is_verified, avatar, created_at
    `;
    const result = await pool.query(query, [name, phone || null, id]);
    return result.rows[0];
  }
};

module.exports = userModel;
