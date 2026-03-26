const pool = require('./db');

const offerModel = {
  // Create a new offer/coupon
  async create(offerData) {
    const { 
      code, discount_type, discount_value, target_role,
      valid_from, valid_until, usage_limit, created_by
    } = offerData;
    
    const query = `
      INSERT INTO offers (code, discount_type, discount_value, target_role,
        valid_from, valid_until, usage_limit, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [code.toUpperCase(), discount_type, discount_value, target_role,
      valid_from, valid_until, usage_limit, created_by];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all offers
  async getAll(filters = {}) {
    const { page = 1, limit = 20, active, target_role } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.*, u.name as created_by_name
      FROM offers o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (active === true) {
      query += ` AND o.valid_from <= CURRENT_TIMESTAMP AND o.valid_until >= CURRENT_TIMESTAMP AND (o.usage_limit IS NULL OR o.used_count < o.usage_limit)`;
    }

    if (target_role) {
      query += ` AND (o.target_role = $${paramIndex} OR o.target_role = 'all')`;
      values.push(target_role);
      paramIndex++;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get offer by code
  async findByCode(code, userRole = 'customer') {
    const query = `
      SELECT * FROM offers 
      WHERE code = $1 
        AND valid_from <= CURRENT_TIMESTAMP 
        AND valid_until >= CURRENT_TIMESTAMP
        AND (usage_limit IS NULL OR used_count < usage_limit)
        AND (target_role = $2 OR target_role = 'all')
    `;
    const result = await pool.query(query, [code.toUpperCase(), userRole]);
    return result.rows[0];
  },

  // Validate and apply offer
  async validateOffer(code, userRole, orderTotal) {
    const offer = await this.findByCode(code, userRole);
    if (!offer) {
      return { valid: false, message: 'Invalid or expired coupon' };
    }

    let discount = 0;
    if (offer.discount_type === 'percentage') {
      discount = (orderTotal * offer.discount_value) / 100;
    } else {
      discount = offer.discount_value;
    }

    return {
      valid: true,
      offer,
      discount,
      final_total: orderTotal - discount
    };
  },

  // Apply offer (increment usage count)
  async applyOffer(code) {
    const query = `
      UPDATE offers 
      SET used_count = used_count + 1
      WHERE code = $1
      RETURNING *
    `;
    const result = await pool.query(query, [code.toUpperCase()]);
    return result.rows[0];
  },

  // Update offer
  async update(id, offerData) {
    const { 
      code, discount_type, discount_value, target_role,
      valid_from, valid_until, usage_limit, active
    } = offerData;
    
    const query = `
      UPDATE offers 
      SET code = COALESCE($1, code),
          discount_type = COALESCE($2, discount_type),
          discount_value = COALESCE($3, discount_value),
          target_role = COALESCE($4, target_role),
          valid_from = COALESCE($5, valid_from),
          valid_until = COALESCE($6, valid_until),
          usage_limit = COALESCE($7, usage_limit),
          active = COALESCE($8, active)
      WHERE id = $9
      RETURNING *
    `;
    const values = [code?.toUpperCase(), discount_type, discount_value, target_role,
      valid_from, valid_until, usage_limit, active, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete offer
  async delete(id) {
    const query = 'DELETE FROM offers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get active offers for email campaign
  async getActiveOffers() {
    const query = `
      SELECT * FROM offers 
      WHERE valid_from <= CURRENT_TIMESTAMP 
        AND valid_until >= CURRENT_TIMESTAMP
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY discount_value DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

module.exports = offerModel;