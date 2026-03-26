const pool = require('./db');

const productModel = {
  // Create a new product (updated with new pricing fields)
  async create(productData) {
    const { 
      name_en, name_ar, description_en, description_ar, 
      unit_price, wholesale_price, min_order_quantity,
      stock, category_id, created_by, images,
      barcode, qr_code, warehouse_location
    } = productData;
    
    const query = `
      INSERT INTO products (name_en, name_ar, description_en, description_ar, 
        unit_price, wholesale_price, min_order_quantity, stock, category_id, 
        created_by, images, barcode, qr_code, warehouse_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [name_en, name_ar, description_en, description_ar, 
      unit_price, wholesale_price, min_order_quantity || 1, stock, category_id, 
      created_by, images, barcode, qr_code, warehouse_location];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all products with advanced filters
  async getAll(filters = {}) {
    const { 
      page = 1, limit = 12, 
      category_id, min_price, max_price, 
      search, created_by, in_stock, rating,
      sort_by = 'created_at', sort_order = 'DESC'
    } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar,
             u.name as created_by_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      values.push(category_id);
      paramIndex++;
    }

    if (min_price) {
      query += ` AND COALESCE(p.unit_price, p.price) >= $${paramIndex}`;
      values.push(min_price);
      paramIndex++;
    }

    if (max_price) {
      query += ` AND COALESCE(p.unit_price, p.price) <= $${paramIndex}`;
      values.push(max_price);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name_en ILIKE $${paramIndex} OR p.name_ar ILIKE $${paramIndex} OR p.description_en ILIKE $${paramIndex} OR p.description_ar ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (created_by) {
      query += ` AND p.created_by = $${paramIndex}`;
      values.push(created_by);
      paramIndex++;
    }

    if (in_stock === true) {
      query += ` AND p.stock > 0`;
    }

    if (rating) {
      query += ` AND COALESCE(AVG(r.rating), 0) >= $${paramIndex}`;
      values.push(rating);
      paramIndex++;
    }

    // Group by for aggregate functions
    query += ` GROUP BY p.id, c.name_en, c.name_ar, u.name`;

    // Handle sorting
    const validSortFields = ['created_at', 'unit_price', 'price', 'name_en', 'avg_rating', 'stock'];
    let sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    
    // If sorting by price, use COALESCE
    if (sortField === 'unit_price' || sortField === 'price') {
      sortField = 'COALESCE(p.unit_price, p.price)';
    }
    
    const sortDirection = sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY p.${sortField} ${sortDirection}`;

    // Get total count - build a separate count query
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE 1=1
    `;
    let countValues = [];
    let countIndex = 1;

    // Add same filters to count query
    if (category_id) {
      countQuery += ` AND p.category_id = $${countIndex}`;
      countValues.push(category_id);
      countIndex++;
    }
    if (min_price) {
      countQuery += ` AND COALESCE(p.unit_price, p.price) >= $${countIndex}`;
      countValues.push(min_price);
      countIndex++;
    }
    if (max_price) {
      countQuery += ` AND COALESCE(p.unit_price, p.price) <= $${countIndex}`;
      countValues.push(max_price);
      countIndex++;
    }
    if (search) {
      countQuery += ` AND (p.name_en ILIKE $${countIndex} OR p.name_ar ILIKE $${countIndex} OR p.description_en ILIKE $${countIndex} OR p.description_ar ILIKE $${countIndex})`;
      countValues.push(`%${search}%`);
      countIndex++;
    }
    if (created_by) {
      countQuery += ` AND p.created_by = $${countIndex}`;
      countValues.push(created_by);
      countIndex++;
    }
    if (in_stock === true) {
      countQuery += ` AND p.stock > 0`;
    }
    if (rating) {
      countQuery += ` AND COALESCE(AVG(r.rating), 0) >= $${countIndex}`;
      countValues.push(rating);
      countIndex++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    return {
      products: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get product by ID with reviews and analytics
  async findById(id) {
    const query = `
      SELECT p.*, 
             c.name_en as category_name_en, c.name_ar as category_name_ar,
             u.name as created_by_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name_en, c.name_ar, u.name
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update product
  async update(id, productData) {
    const {
      name_en, name_ar, description_en, description_ar,
      unit_price, wholesale_price, min_order_quantity,
      stock, category_id, images, barcode, qr_code, warehouse_location
    } = productData;

    const query = `
      UPDATE products SET
        name_en = COALESCE($1, name_en),
        name_ar = COALESCE($2, name_ar),
        description_en = COALESCE($3, description_en),
        description_ar = COALESCE($4, description_ar),
        unit_price = COALESCE($5, unit_price),
        wholesale_price = COALESCE($6, wholesale_price),
        min_order_quantity = COALESCE($7, min_order_quantity),
        stock = COALESCE($8, stock),
        category_id = COALESCE($9, category_id),
        images = COALESCE($10, images),
        barcode = COALESCE($11, barcode),
        qr_code = COALESCE($12, qr_code),
        warehouse_location = COALESCE($13, warehouse_location),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;
    const values = [
      name_en, name_ar, description_en, description_ar,
      unit_price, wholesale_price, min_order_quantity,
      stock, category_id, images, barcode, qr_code, warehouse_location, id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete product
  async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get pricing tiers for a product
  async getPricing(productId) {
    const query = `
      SELECT * FROM product_pricing 
      WHERE product_id = $1 
      ORDER BY min_quantity ASC
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  },

  // Add pricing tier
  async addPricing(productId, minQuantity, price) {
    const query = `
      INSERT INTO product_pricing (product_id, min_quantity, price)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id, min_quantity) 
      DO UPDATE SET price = $3
      RETURNING *
    `;
    const result = await pool.query(query, [productId, minQuantity, price]);
    return result.rows[0];
  },

  // Get categories
  async getCategories() {
    const query = `
      SELECT c.*, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name_en ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create category
  async createCategory(name_en, name_ar, description_en, description_ar, image) {
    const query = `
      INSERT INTO categories (name_en, name_ar, description_en, description_ar, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [name_en, name_ar, description_en, description_ar, image]);
    return result.rows[0];
  },

  // Update category
  async updateCategory(id, data) {
    const { name_en, name_ar, description_en, description_ar, image } = data;
    const query = `
      UPDATE categories SET
        name_en = COALESCE($1, name_en),
        name_ar = COALESCE($2, name_ar),
        description_en = COALESCE($3, description_en),
        description_ar = COALESCE($4, description_ar),
        image = COALESCE($5, image)
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [name_en, name_ar, description_en, description_ar, image, id]);
    return result.rows[0];
  },

  // Delete category
  async deleteCategory(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get products by trader
  async getByTrader(traderId) {
    const query = `
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [traderId]);
    return result.rows;
  },

  // Get low stock products
  async getLowStock(threshold = 10) {
    const query = `
      SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar,
             u.name as created_by_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.stock <= $1
      ORDER BY p.stock ASC
    `;
    const result = await pool.query(query, [threshold]);
    return result.rows;
  }
};

module.exports = productModel;
