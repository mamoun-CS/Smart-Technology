const pool = require('./db');

const shippingModel = {
  // Create shipping area
  async createArea(areaData) {
    const { name_en, name_ar, price, estimated_days } = areaData;
    
    const query = `
      INSERT INTO shipping_areas (name_en, name_ar, price, estimated_days)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name_en, name_ar, price, estimated_days];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all shipping areas
  async getAllAreas(activeOnly = false) {
    let query = 'SELECT * FROM shipping_areas';
    
    if (activeOnly) {
      query += ' WHERE active = true';
    }
    
    query += ' ORDER BY name_en ASC';
    
    const result = await pool.query(query);
    return result.rows;
  },

  // Get shipping area by ID
  async findAreaById(id) {
    const query = 'SELECT * FROM shipping_areas WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get shipping cost by city name
  async getShippingCostByCity(cityName) {
    const query = `
      SELECT price FROM shipping_areas 
      WHERE LOWER(name_en) = LOWER($1) AND active = true
      LIMIT 1
    `;
    const result = await pool.query(query, [cityName]);
    
    if (result.rows.length > 0) {
      return parseFloat(result.rows[0].price);
    }
    
    return null;
  },

  // Update shipping area
  async updateArea(id, areaData) {
    const { name_en, name_ar, price, estimated_days, active } = areaData;
    
    const query = `
      UPDATE shipping_areas 
      SET name_en = COALESCE($1, name_en),
          name_ar = COALESCE($2, name_ar),
          price = COALESCE($3, price),
          estimated_days = COALESCE($4, estimated_days),
          active = COALESCE($5, active)
      WHERE id = $6
      RETURNING *
    `;
    const values = [name_en, name_ar, price, estimated_days, active, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete shipping area
  async deleteArea(id) {
    const query = 'DELETE FROM shipping_areas WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get shipping cost for an area
  async getShippingCost(areaId) {
    const area = await this.findAreaById(areaId);
    return area ? area.price : null;
  },

  // Save shipping address for user
  async saveAddress(addressData) {
    const { user_id, address, city, phone, is_default } = addressData;
    
    // If this is default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE shipping_addresses SET is_default = false WHERE user_id = $1', [user_id]);
    }
    
    const query = `
      INSERT INTO shipping_addresses (user_id, address, city, phone, is_default)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, address, city, phone, is_default || false];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get user addresses
  async getUserAddresses(userId) {
    const query = `
      SELECT * FROM shipping_addresses 
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Update address
  async updateAddress(id, userId, addressData) {
    const { address, city, phone, is_default } = addressData;
    
    // If this is default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE shipping_addresses SET is_default = false WHERE user_id = $1', [userId]);
    }
    
    const query = `
      UPDATE shipping_addresses 
      SET address = COALESCE($1, address),
          city = COALESCE($2, city),
          phone = COALESCE($3, phone),
          is_default = COALESCE($4, is_default)
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const values = [address, city, phone, is_default, id, userId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete address
  async deleteAddress(id, userId) {
    const query = 'DELETE FROM shipping_addresses WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  },

  // Verify phone number (stub - would integrate with SMS service)
  async verifyPhone(phone, verificationCode) {
    // In production, this would verify against SMS service
    // For now, accept any 6-digit code
    return verificationCode && verificationCode.length === 6;
  },

  // Send verification code (stub - would integrate with SMS service)
  async sendVerificationCode(phone) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // In production, send via SMS service
    console.log(`SMS Verification code for ${phone}: ${code}`);
    return { code, expiresIn: 300 }; // 5 minutes
  }
};

module.exports = shippingModel;
