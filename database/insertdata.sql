-- ============================================
-- FIXED TEST DATA FOR SMART TECHNOLOGY E-COMMERCE PLATFORM
-- ============================================

-- ============================================
-- 1. USERS (Various roles)
-- ============================================

-- Admin user (already exists from schema)
-- Additional admin users
INSERT INTO users (name, email, password, role, approved, is_verified, phone, last_login) VALUES
('Super Admin', 'superadmin@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'admin', TRUE, TRUE, '+970599000000', CURRENT_TIMESTAMP),
('Tech Admin', 'techadmin@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'admin', TRUE, TRUE, '+970599000001', CURRENT_TIMESTAMP);

-- Merchant users
INSERT INTO users (name, email, password, role, approved, is_verified, phone, last_login, created_at) VALUES
('Samsung Store', 'samsung@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'merchant', TRUE, TRUE, '+970599111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Apple Center', 'apple@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'merchant', TRUE, TRUE, '+970599111112', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dell Store', 'dell@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'merchant', FALSE, TRUE, '+970599111113', NULL, CURRENT_TIMESTAMP),
('Xiaomi Official', 'xiaomi@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'merchant', TRUE, TRUE, '+970599111114', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lenovo Store', 'lenovo@smarttech.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'merchant', TRUE, TRUE, '+970599111115', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Customer users
INSERT INTO users (name, email, password, role, approved, is_verified, phone, phone_verified, last_login, google_id, avatar) VALUES
('Ahmed Mansour', 'ahmed@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222111', TRUE, CURRENT_TIMESTAMP, 'google_ahmed123', 'https://ui-avatars.com/api/?name=Ahmed+Mansour'),
('Layla Hassan', 'layla@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222112', TRUE, CURRENT_TIMESTAMP, NULL, 'https://ui-avatars.com/api/?name=Layla+Hassan'),
('Omar Khalil', 'omar@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222113', FALSE, CURRENT_TIMESTAMP, NULL, 'https://ui-avatars.com/api/?name=Omar+Khalil'),
('Sara Nasser', 'sara@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222114', TRUE, CURRENT_TIMESTAMP, NULL, 'https://ui-avatars.com/api/?name=Sara+Nasser'),
('Mohammed Abu Ali', 'mohammed@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, FALSE, '+970599222115', FALSE, NULL, NULL, 'https://ui-avatars.com/api/?name=Mohammed+Ali'),
('Nadia Khalil', 'nadia@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222116', TRUE, CURRENT_TIMESTAMP, NULL, 'https://ui-avatars.com/api/?name=Nadia+Khalil'),
('Youssef Ramadan', 'youssef@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', TRUE, TRUE, '+970599222117', TRUE, CURRENT_TIMESTAMP, NULL, 'https://ui-avatars.com/api/?name=Youssef+Ramadan'),
('Dina Hassan', 'dina@example.com', '$2a$10$rQEY7xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8xQvKQ8x', 'customer', FALSE, TRUE, '+970599222118', FALSE, NULL, NULL, 'https://ui-avatars.com/api/?name=Dina+Hassan');

-- ============================================
-- 2. CATEGORIES (More categories)
-- ============================================

INSERT INTO categories (name_en, name_ar, description_en, description_ar, image) VALUES
('Smartphones', 'هواتف ذكية', 'Latest smartphones and mobile devices', 'أحدث الهواتف الذكية والأجهزة المحمولة', '/images/categories/smartphones.jpg'),
('Laptops', 'أجهزة كمبيوتر محمولة', 'High-performance laptops for work and gaming', 'أجهزة كمبيوتر محمولة عالية الأداء للعمل والألعاب', '/images/categories/laptops.jpg'),
('Tablets', 'أجهزة لوحية', 'Versatile tablets for entertainment and productivity', 'أجهزة لوحية متعددة الاستخدامات للترفيه والإنتاجية', '/images/categories/tablets.jpg'),
('Smart Watches', 'ساعات ذكية', 'Wearable technology for health and connectivity', 'تقنية يمكن ارتداؤها للصحة والاتصال', '/images/categories/smartwatches.jpg'),
('Headphones', 'سماعات رأس', 'Premium audio devices', 'أجهزة صوتية فاخرة', '/images/categories/headphones.jpg'),
('Accessories', 'إكسسوارات', 'Cases, chargers, and other accessories', 'حوافظ، شواحن، وإكسسوارات أخرى', '/images/categories/accessories.jpg'),
('Gaming', 'ألعاب إلكترونية', 'Gaming consoles and accessories', 'أجهزة ألعاب وإكسسوارات', '/images/categories/gaming.jpg'),
('Smart Home', 'منزل ذكي', 'Smart home devices and automation', 'أجهزة منزلية ذكية وأتمتة', '/images/categories/smarthome.jpg');

-- ============================================
-- 3. PRODUCTS (Comprehensive products with unique names)
-- ============================================

-- Smartphones (unique names)
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, unit_price, wholesale_price, min_order_quantity, barcode, warehouse_location, category_id, created_by, images) VALUES
('iPhone 15 Pro Max', 'آيفون 15 برو ماكس', 'Apple''s latest flagship with titanium design', 'أحدث هاتف من أبل بتصميم التيتانيوم', 1299.99, 100, 1299.99, 1150.00, 1, 'ABC123456789', 'A-1-01', (SELECT id FROM categories WHERE name_en = 'Smartphones' LIMIT 1), (SELECT id FROM users WHERE email = 'apple@smarttech.com' LIMIT 1), ARRAY['/images/iphone15_1.jpg', '/images/iphone15_2.jpg']),
('Samsung Galaxy S24 Ultra', 'سامسونج جالكسي إس 24 ألترا', 'Premium Android experience with AI features', 'تجربة أندرويد فاخرة مع ميزات الذكاء الاصطناعي', 1199.99, 150, 1199.99, 1050.00, 1, 'DEF987654321', 'B-1-02', (SELECT id FROM categories WHERE name_en = 'Smartphones' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/s24ultra_1.jpg', '/images/s24ultra_2.jpg']),
('Google Pixel 8 Pro', 'جوجل بيكسل 8 برو', 'Best camera smartphone with AI capabilities', 'أفضل هاتف من حيث الكاميرا مع قدرات الذكاء الاصطناعي', 899.99, 80, 899.99, 780.00, 1, 'GHI456123789', 'C-1-03', (SELECT id FROM categories WHERE name_en = 'Smartphones' LIMIT 1), (SELECT id FROM users WHERE email = 'xiaomi@smarttech.com' LIMIT 1), ARRAY['/images/pixel8_1.jpg']),
('Xiaomi 14 Ultra', 'شاومي 14 ألترا', 'Flagship killer with Leica camera', 'قاتل العلامات الفاخرة بكاميرا لايكا', 899.99, 200, 899.99, 800.00, 1, 'JKL789456123', 'D-1-04', (SELECT id FROM categories WHERE name_en = 'Smartphones' LIMIT 1), (SELECT id FROM users WHERE email = 'xiaomi@smarttech.com' LIMIT 1), ARRAY['/images/xiaomi14_1.jpg', '/images/xiaomi14_2.jpg']),
('OnePlus 12', 'ون بلس 12', 'Fast and smooth performance', 'أداء سريع وسلس', 799.99, 120, 799.99, 700.00, 1, 'MNO321654987', 'E-1-05', (SELECT id FROM categories WHERE name_en = 'Smartphones' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/oneplus12_1.jpg']);

-- Laptops (unique names)
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, unit_price, wholesale_price, min_order_quantity, barcode, warehouse_location, category_id, created_by, images) VALUES
('MacBook Pro 16 M3 Max', 'ماك بوك برو 16 M3 ماكس', 'Ultimate power for professionals', 'أقصى قوة للمحترفين', 3499.99, 50, 3499.99, 3200.00, 1, 'ABC111222333', 'A-2-01', (SELECT id FROM categories WHERE name_en = 'Laptops' LIMIT 1), (SELECT id FROM users WHERE email = 'apple@smarttech.com' LIMIT 1), ARRAY['/images/macbook16_1.jpg', '/images/macbook16_2.jpg']),
('Dell XPS 15', 'ديل إكس بي إس 15', 'Premium ultrabook with infinity display', 'كمبيوتر محمول فاخر بشاشة لانهائية', 1999.99, 75, 1999.99, 1750.00, 1, 'DEF222333444', 'B-2-02', (SELECT id FROM categories WHERE name_en = 'Laptops' LIMIT 1), (SELECT id FROM users WHERE email = 'dell@smarttech.com' LIMIT 1), ARRAY['/images/xps15_1.jpg']),
('Lenovo ThinkPad X1 Carbon', 'لينوفو ثينك باد إكس 1 كاربون', 'Business laptop with exceptional durability', 'كمبيوتر محمول للأعمال بمتانة استثنائية', 1799.99, 60, 1799.99, 1600.00, 1, 'GHI333444555', 'C-2-03', (SELECT id FROM categories WHERE name_en = 'Laptops' LIMIT 1), (SELECT id FROM users WHERE email = 'lenovo@smarttech.com' LIMIT 1), ARRAY['/images/thinkpad_1.jpg']),
('ASUS ROG Zephyrus G14', 'إيه إس يو إس آر أو جي زيفيروس جي 14', 'Gaming laptop with AMD Ryzen', 'كمبيوتر محمول للألعاب بمعالج AMD رايزن', 1499.99, 90, 1499.99, 1300.00, 1, 'JKL444555666', 'D-2-04', (SELECT id FROM categories WHERE name_en = 'Laptops' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/zephyrus_1.jpg']),
('Samsung Galaxy Book4 Ultra', 'سامسونج جالكسي بوك 4 ألترا', 'Powerful laptop with Galaxy ecosystem', 'كمبيوتر محمول قوي مع نظام جالكسي البيئي', 2199.99, 40, 2199.99, 1950.00, 1, 'MNO555666777', 'E-2-05', (SELECT id FROM categories WHERE name_en = 'Laptops' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/galaxybook_1.jpg']);

-- Smart Watches
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, unit_price, wholesale_price, min_order_quantity, barcode, warehouse_location, category_id, created_by, images) VALUES
('Apple Watch Ultra 2', 'أبل واتش ألترا 2', 'Rugged smartwatch for extreme sports', 'ساعة ذكية متينة للرياضات المتطرفة', 799.99, 85, 799.99, 700.00, 1, 'ABC777888999', 'A-3-01', (SELECT id FROM categories WHERE name_en = 'Smart Watches' LIMIT 1), (SELECT id FROM users WHERE email = 'apple@smarttech.com' LIMIT 1), ARRAY['/images/watchultra_1.jpg']),
('Samsung Galaxy Watch 6 Classic', 'سامسونج جالكسي ووتش 6 كلاسيك', 'Classic design with rotating bezel', 'تصميم كلاسيكي مع إطار دوار', 399.99, 120, 399.99, 350.00, 1, 'DEF888999000', 'B-3-02', (SELECT id FROM categories WHERE name_en = 'Smart Watches' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/galaxywatch_1.jpg']);

-- Headphones
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, unit_price, wholesale_price, min_order_quantity, barcode, warehouse_location, category_id, created_by, images) VALUES
('Sony WH-1000XM5', 'سوني WH-1000XM5', 'Industry-leading noise cancellation', 'إلغاء الضوضاء الرائد في الصناعة', 349.99, 200, 349.99, 300.00, 1, 'ABC111000222', 'A-4-01', (SELECT id FROM categories WHERE name_en = 'Headphones' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/sonyxm5_1.jpg']),
('AirPods Pro 2', 'آيربودز برو 2', 'Active noise cancellation with USB-C', 'إلغاء ضوضاء نشط مع USB-C', 249.99, 300, 249.99, 210.00, 1, 'DEF222111333', 'B-4-02', (SELECT id FROM categories WHERE name_en = 'Headphones' LIMIT 1), (SELECT id FROM users WHERE email = 'apple@smarttech.com' LIMIT 1), ARRAY['/images/airpodspro_1.jpg']);

-- Accessories
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, unit_price, wholesale_price, min_order_quantity, barcode, warehouse_location, category_id, created_by, images) VALUES
('MagSafe Charger', 'شاحن ماج سيف', 'Wireless charging for iPhone', 'شحن لاسلكي لآيفون', 49.99, 500, 49.99, 40.00, 5, 'ABC333444555', 'A-5-01', (SELECT id FROM categories WHERE name_en = 'Accessories' LIMIT 1), (SELECT id FROM users WHERE email = 'apple@smarttech.com' LIMIT 1), ARRAY['/images/magsafe_1.jpg']),
('Samsung 45W Charger', 'شاحن سامسونج 45 واط', 'Super fast charging', 'شحن فائق السرعة', 39.99, 400, 39.99, 32.00, 5, 'DEF444555666', 'B-5-02', (SELECT id FROM categories WHERE name_en = 'Accessories' LIMIT 1), (SELECT id FROM users WHERE email = 'samsung@smarttech.com' LIMIT 1), ARRAY['/images/samsungcharger_1.jpg']),
('Phone Case Clear', 'غطاء شفاف للهاتف', 'Protective transparent case', 'غطاء واقي شفاف', 19.99, 1000, 19.99, 15.00, 10, 'GHI555666777', 'C-5-03', (SELECT id FROM categories WHERE name_en = 'Accessories' LIMIT 1), (SELECT id FROM users WHERE email = 'xiaomi@smarttech.com' LIMIT 1), ARRAY['/images/phonecase_1.jpg']);

-- ============================================
-- 4. PRODUCT PRICING (Quantity-based)
-- ============================================

INSERT INTO product_pricing (product_id, min_quantity, price) VALUES
((SELECT id FROM products WHERE name_en = 'iPhone 15 Pro Max' LIMIT 1), 5, 1199.99),
((SELECT id FROM products WHERE name_en = 'iPhone 15 Pro Max' LIMIT 1), 10, 1150.00),
((SELECT id FROM products WHERE name_en = 'iPhone 15 Pro Max' LIMIT 1), 25, 1100.00),
((SELECT id FROM products WHERE name_en = 'Samsung Galaxy S24 Ultra' LIMIT 1), 5, 1099.99),
((SELECT id FROM products WHERE name_en = 'Samsung Galaxy S24 Ultra' LIMIT 1), 10, 1050.00),
((SELECT id FROM products WHERE name_en = 'MacBook Pro 16 M3 Max' LIMIT 1), 3, 3299.99),
((SELECT id FROM products WHERE name_en = 'MacBook Pro 16 M3 Max' LIMIT 1), 5, 3200.00),
((SELECT id FROM products WHERE name_en = 'Sony WH-1000XM5' LIMIT 1), 10, 320.00),
((SELECT id FROM products WHERE name_en = 'Sony WH-1000XM5' LIMIT 1), 25, 300.00);

-- ============================================
-- 5. ORDERS (With different statuses)
-- ============================================

-- Store order IDs in variables using WITH clause for better accuracy
WITH user_data AS (
  SELECT id, email FROM users
),
order1 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 1299.99, 'delivered', 'Ramallah, Al-Masyoun, Building 12, Apt 3', 'credit_card', '2024-01-15 10:30:00', '2024-01-18 14:20:00'
  FROM user_data WHERE email = 'ahmed@example.com'
  RETURNING id
),
order2 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 1199.99, 'shipped', 'Nablus, Rafidia, Main Street, Building 5', 'paypal', '2024-01-20 09:15:00', '2024-01-22 16:45:00'
  FROM user_data WHERE email = 'layla@example.com'
  RETURNING id
),
order3 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 349.99, 'pending', 'Hebron, City Center, Al-Shuhada Street', 'cod', '2024-01-25 14:20:00', '2024-01-25 14:20:00'
  FROM user_data WHERE email = 'omar@example.com'
  RETURNING id
),
order4 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 2799.98, 'processing', 'Jerusalem, Beit Hanina, Al-Quds Street', 'credit_card', '2024-01-28 11:45:00', '2024-01-29 09:30:00'
  FROM user_data WHERE email = 'sara@example.com'
  RETURNING id
),
order5 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 899.99, 'delivered', 'Gaza, Al-Rimal, Omar Al-Mukhtar Street', 'paypal', '2024-02-01 16:00:00', '2024-02-05 11:20:00'
  FROM user_data WHERE email = 'nadia@example.com'
  RETURNING id
),
order6 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 399.99, 'cancelled', 'Ramallah, Al-Tireh, Main Road', 'credit_card', '2024-02-05 13:30:00', '2024-02-06 10:15:00'
  FROM user_data WHERE email = 'youssef@example.com'
  RETURNING id
),
order7 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 1499.99, 'delivered', 'Ramallah, Al-Masyoun, Building 12, Apt 3', 'credit_card', '2024-02-10 08:45:00', '2024-02-13 12:00:00'
  FROM user_data WHERE email = 'ahmed@example.com'
  RETURNING id
),
order8 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 2199.99, 'shipped', 'Nablus, Rafidia, Main Street, Building 5', 'paypal', '2024-02-12 10:20:00', '2024-02-14 15:30:00'
  FROM user_data WHERE email = 'layla@example.com'
  RETURNING id
),
order9 AS (
  INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method, created_at, updated_at)
  SELECT id, 249.99, 'pending', 'Jerusalem, Beit Hanina, Al-Quds Street', 'credit_card', '2024-02-15 09:00:00', '2024-02-15 09:00:00'
  FROM user_data WHERE email = 'sara@example.com'
  RETURNING id
)
SELECT 1;

-- ============================================
-- 6. ORDER ITEMS
-- ============================================

-- Order 1 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 1299.99
FROM orders o, products p
WHERE o.shipping_address = 'Ramallah, Al-Masyoun, Building 12, Apt 3' 
  AND o.total_price = 1299.99
  AND p.name_en = 'iPhone 15 Pro Max'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 2, 19.99
FROM orders o, products p
WHERE o.shipping_address = 'Ramallah, Al-Masyoun, Building 12, Apt 3' 
  AND o.total_price = 1299.99
  AND p.name_en = 'Phone Case Clear'
LIMIT 1;

-- Order 2 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 1199.99
FROM orders o, products p
WHERE o.shipping_address = 'Nablus, Rafidia, Main Street, Building 5'
  AND o.total_price = 1199.99
  AND p.name_en = 'Samsung Galaxy S24 Ultra'
LIMIT 1;

-- Order 3 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 349.99
FROM orders o, products p
WHERE o.shipping_address = 'Hebron, City Center, Al-Shuhada Street'
  AND o.total_price = 349.99
  AND p.name_en = 'Sony WH-1000XM5'
LIMIT 1;

-- Order 4 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 2799.98
FROM orders o, products p
WHERE o.shipping_address = 'Jerusalem, Beit Hanina, Al-Quds Street'
  AND o.total_price = 2799.98
  AND p.name_en = 'MacBook Pro 16 M3 Max'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 49.99
FROM orders o, products p
WHERE o.shipping_address = 'Jerusalem, Beit Hanina, Al-Quds Street'
  AND o.total_price = 2799.98
  AND p.name_en = 'MagSafe Charger'
LIMIT 1;

-- Order 5 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 899.99
FROM orders o, products p
WHERE o.shipping_address = 'Gaza, Al-Rimal, Omar Al-Mukhtar Street'
  AND o.total_price = 899.99
  AND p.name_en = 'Xiaomi 14 Ultra'
LIMIT 1;

-- Order 6 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 399.99
FROM orders o, products p
WHERE o.shipping_address = 'Ramallah, Al-Tireh, Main Road'
  AND o.total_price = 399.99
  AND p.name_en = 'Samsung Galaxy Watch 6 Classic'
LIMIT 1;

-- Order 7 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 1499.99
FROM orders o, products p
WHERE o.shipping_address = 'Ramallah, Al-Masyoun, Building 12, Apt 3'
  AND o.total_price = 1499.99
  AND p.name_en = 'ASUS ROG Zephyrus G14'
LIMIT 1;

-- Order 8 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 2199.99
FROM orders o, products p
WHERE o.shipping_address = 'Nablus, Rafidia, Main Street, Building 5'
  AND o.total_price = 2199.99
  AND p.name_en = 'Samsung Galaxy Book4 Ultra'
LIMIT 1;

-- Order 9 items
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT o.id, p.id, 1, 249.99
FROM orders o, products p
WHERE o.shipping_address = 'Jerusalem, Beit Hanina, Al-Quds Street'
  AND o.total_price = 249.99
  AND p.name_en = 'AirPods Pro 2'
LIMIT 1;

-- ============================================
-- 7. CART & CART ITEMS
-- ============================================

INSERT INTO cart (user_id)
SELECT id FROM users WHERE email IN ('ahmed@example.com', 'layla@example.com', 'omar@example.com', 'sara@example.com', 'nadia@example.com', 'youssef@example.com')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 2
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'ahmed@example.com')
  AND p.name_en = 'OnePlus 12'
LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 3
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'ahmed@example.com')
  AND p.name_en = 'Samsung 45W Charger'
LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 1
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'layla@example.com')
  AND p.name_en = 'Samsung Galaxy Watch 6 Classic'
LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 1
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'omar@example.com')
  AND p.name_en = 'Google Pixel 8 Pro'
LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 1
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'sara@example.com')
  AND p.name_en = 'Apple Watch Ultra 2'
LIMIT 1;

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 4
FROM cart c, products p
WHERE c.user_id = (SELECT id FROM users WHERE email = 'sara@example.com')
  AND p.name_en = 'Phone Case Clear'
LIMIT 1;

-- ============================================
-- 8. REVIEWS
-- ============================================

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 5, 'Amazing phone! The camera quality is outstanding and battery life is incredible.', '2024-01-20 10:00:00'
FROM products p, users u
WHERE p.name_en = 'iPhone 15 Pro Max' AND u.email = 'ahmed@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 4, 'Great phone with awesome AI features. The S Pen is very useful.', '2024-01-25 14:30:00'
FROM products p, users u
WHERE p.name_en = 'Samsung Galaxy S24 Ultra' AND u.email = 'layla@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 5, 'Absolute beast of a laptop. Handles everything I throw at it with ease.', '2024-02-01 09:15:00'
FROM products p, users u
WHERE p.name_en = 'MacBook Pro 16 M3 Max' AND u.email = 'sara@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 5, 'Best noise-cancelling headphones I have ever owned. Worth every penny!', '2024-01-28 16:45:00'
FROM products p, users u
WHERE p.name_en = 'Sony WH-1000XM5' AND u.email = 'omar@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 4, 'Great camera phone. The Leica lenses are fantastic.', '2024-02-10 11:20:00'
FROM products p, users u
WHERE p.name_en = 'Xiaomi 14 Ultra' AND u.email = 'nadia@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 5, 'Perfect laptop for developers. Great build quality and display.', '2024-02-05 13:00:00'
FROM products p, users u
WHERE p.name_en = 'Dell XPS 15' AND u.email = 'youssef@example.com'
LIMIT 1;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, 4, 'Great sound quality and noise cancellation works well.', '2024-02-12 08:30:00'
FROM products p, users u
WHERE p.name_en = 'AirPods Pro 2' AND u.email = 'dina@example.com'
LIMIT 1;

-- ============================================
-- 9. OFFERS (Discount codes)
-- ============================================

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'WELCOME10', 'percentage', 10.00, 'all', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 1000, 0, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'SAVE20', 'percentage', 20.00, 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', 500, 0, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'MERCHANT15', 'percentage', 15.00, 'merchant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 200, 0, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'BLACKFRIDAY', 'percentage', 25.00, 'all', '2024-11-25 00:00:00', '2024-11-30 23:59:59', 5000, 0, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'FLAT50', 'fixed', 50.00, 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 100, 0, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

INSERT INTO offers (code, discount_type, discount_value, target_role, valid_from, valid_until, usage_limit, used_count, created_by)
SELECT 'NEWYEAR2024', 'percentage', 15.00, 'all', '2024-01-01 00:00:00', '2024-01-31 23:59:59', 1000, 850, id
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

-- ============================================
-- 10. SHIPPING ADDRESSES
-- ============================================

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'Al-Masyoun, Building 12, Apt 3', 'Ramallah', '+970599222111', TRUE, CURRENT_TIMESTAMP
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'Al-Bireh, Main Street, Building 7', 'Al-Bireh', '+970599222111', FALSE, CURRENT_TIMESTAMP
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'Rafidia, Main Street, Building 5', 'Nablus', '+970599222112', TRUE, CURRENT_TIMESTAMP
FROM users WHERE email = 'layla@example.com' LIMIT 1;

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'City Center, Al-Shuhada Street', 'Hebron', '+970599222113', TRUE, CURRENT_TIMESTAMP
FROM users WHERE email = 'omar@example.com' LIMIT 1;

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'Beit Hanina, Al-Quds Street, Building 3', 'Jerusalem', '+970599222114', TRUE, CURRENT_TIMESTAMP
FROM users WHERE email = 'sara@example.com' LIMIT 1;

INSERT INTO shipping_addresses (user_id, address, city, phone, is_default, created_at)
SELECT id, 'Al-Rimal, Omar Al-Mukhtar Street', 'Gaza', '+970599222116', TRUE, CURRENT_TIMESTAMP
FROM users WHERE email = 'nadia@example.com' LIMIT 1;

-- ============================================
-- 11. NOTIFICATIONS
-- ============================================

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'order', 'Order Delivered', 'Your order has been delivered successfully', TRUE, '2024-01-18 14:30:00'
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'offer', 'Special Offer', 'Get 20% off on your next purchase! Use code SAVE20', FALSE, CURRENT_TIMESTAMP
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'order', 'Order Shipped', 'Your order is on the way!', FALSE, '2024-01-22 17:00:00'
FROM users WHERE email = 'layla@example.com' LIMIT 1;

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'order', 'Order Processing', 'Your order is being processed', TRUE, '2024-01-29 10:00:00'
FROM users WHERE email = 'sara@example.com' LIMIT 1;

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'order', 'Order Delivered', 'Your order has been delivered', FALSE, '2024-02-05 12:00:00'
FROM users WHERE email = 'nadia@example.com' LIMIT 1;

INSERT INTO notifications (user_id, type, title, message, read, created_at)
SELECT id, 'order', 'Order Cancelled', 'Your order has been cancelled', TRUE, '2024-02-06 10:30:00'
FROM users WHERE email = 'youssef@example.com' LIMIT 1;

-- ============================================
-- 12. INVENTORY ALERTS
-- ============================================

INSERT INTO inventory_alerts (product_id, threshold, alert_sent)
SELECT id, 20, FALSE FROM products WHERE name_en = 'MacBook Pro 16 M3 Max' LIMIT 1;

INSERT INTO inventory_alerts (product_id, threshold, alert_sent)
SELECT id, 15, FALSE FROM products WHERE name_en = 'Samsung Galaxy Book4 Ultra' LIMIT 1;

INSERT INTO inventory_alerts (product_id, threshold, alert_sent)
SELECT id, 30, TRUE FROM products WHERE name_en = 'OnePlus 12' LIMIT 1;

INSERT INTO inventory_alerts (product_id, threshold, alert_sent)
SELECT id, 25, FALSE FROM products WHERE name_en = 'Dell XPS 15' LIMIT 1;

-- ============================================
-- 13. SUPPORT TICKETS
-- ============================================

-- Insert tickets with RETURNING to get IDs for messages
WITH ticket1 AS (
  INSERT INTO support_tickets (user_id, subject, description, status, priority, created_at, updated_at)
  SELECT id, 'Damaged product received', 'I received my iPhone with a scratch on the screen', 'in_progress', 'high', '2024-01-19 09:00:00', '2024-01-19 14:30:00'
  FROM users WHERE email = 'ahmed@example.com'
  RETURNING id
),
ticket2 AS (
  INSERT INTO support_tickets (user_id, subject, description, status, priority, created_at, updated_at)
  SELECT id, 'Shipping delay', 'My order is taking longer than expected', 'open', 'medium', '2024-01-23 11:20:00', '2024-01-23 11:20:00'
  FROM users WHERE email = 'layla@example.com'
  RETURNING id
),
ticket3 AS (
  INSERT INTO support_tickets (user_id, subject, description, status, priority, created_at, updated_at)
  SELECT id, 'Wrong item shipped', 'Received wrong color for my laptop', 'resolved', 'urgent', '2024-02-03 15:45:00', '2024-02-04 10:00:00'
  FROM users WHERE email = 'sara@example.com'
  RETURNING id
),
ticket4 AS (
  INSERT INTO support_tickets (user_id, subject, description, status, priority, created_at, updated_at)
  SELECT id, 'Payment issue', 'Unable to complete payment with credit card', 'open', 'low', '2024-02-08 13:15:00', '2024-02-08 13:15:00'
  FROM users WHERE email = 'omar@example.com'
  RETURNING id
),
ticket5 AS (
  INSERT INTO support_tickets (user_id, subject, description, status, priority, created_at, updated_at)
  SELECT id, 'Return request', 'I want to return my Xiaomi phone', 'in_progress', 'medium', '2024-02-12 10:30:00', '2024-02-12 12:00:00'
  FROM users WHERE email = 'nadia@example.com'
  RETURNING id
)
SELECT 1;

-- ============================================
-- 14. TICKET MESSAGES
-- ============================================

-- Ticket 1 messages
INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply, created_at)
SELECT t.id, u.id, 'Hello, I just opened my package and noticed a scratch on the screen. Please help!', FALSE, '2024-01-19 09:05:00'
FROM support_tickets t, users u
WHERE t.subject = 'Damaged product received' AND u.email = 'ahmed@example.com'
LIMIT 1;

INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply, created_at)
SELECT t.id, u.id, 'We apologize for the inconvenience. Please send us photos of the damage and we will arrange a replacement.', TRUE, '2024-01-19 10:30:00'
FROM support_tickets t, users u
WHERE t.subject = 'Damaged product received' AND u.email = 'admin@smarttech.com'
LIMIT 1;

INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply, created_at)
SELECT t.id, u.id, 'Thank you for the quick response. I have attached photos.', FALSE, '2024-01-19 11:15:00'
FROM support_tickets t, users u
WHERE t.subject = 'Damaged product received' AND u.email = 'ahmed@example.com'
LIMIT 1;

-- Ticket 3 messages
INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply, created_at)
SELECT t.id, u.id, 'I ordered a silver laptop but received a space gray one.', FALSE, '2024-02-03 16:00:00'
FROM support_tickets t, users u
WHERE t.subject = 'Wrong item shipped' AND u.email = 'sara@example.com'
LIMIT 1;

INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin_reply, created_at)
SELECT t.id, u.id, 'We apologize for this error. A return label has been sent to your email.', TRUE, '2024-02-04 09:30:00'
FROM support_tickets t, users u
WHERE t.subject = 'Wrong item shipped' AND u.email = 'admin@smarttech.com'
LIMIT 1;

-- ============================================
-- 15. PRODUCT ANALYTICS
-- ============================================

INSERT INTO product_analytics (product_id, view_count, last_viewed) VALUES
((SELECT id FROM products WHERE name_en = 'iPhone 15 Pro Max' LIMIT 1), 1250, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'Samsung Galaxy S24 Ultra' LIMIT 1), 980, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'MacBook Pro 16 M3 Max' LIMIT 1), 750, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'Sony WH-1000XM5' LIMIT 1), 520, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'Apple Watch Ultra 2' LIMIT 1), 430, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'AirPods Pro 2' LIMIT 1), 890, CURRENT_TIMESTAMP),
((SELECT id FROM products WHERE name_en = 'Dell XPS 15' LIMIT 1), 340, CURRENT_TIMESTAMP)
ON CONFLICT (product_id) DO NOTHING;

-- ============================================
-- 16. EMAIL TOKENS
-- ============================================

INSERT INTO email_tokens (user_id, token, type, expires_at, created_at)
SELECT id, 'abc123def456ver', 'verification', CURRENT_TIMESTAMP + INTERVAL '24 hours', CURRENT_TIMESTAMP
FROM users WHERE email = 'mohammed@example.com' LIMIT 1;

INSERT INTO email_tokens (user_id, token, type, expires_at, created_at)
SELECT id, 'def456ghi789ver', 'verification', CURRENT_TIMESTAMP + INTERVAL '24 hours', CURRENT_TIMESTAMP
FROM users WHERE email = 'dina@example.com' LIMIT 1;

INSERT INTO email_tokens (user_id, token, type, expires_at, created_at)
SELECT id, 'ghi789jkl012reset', 'password_reset', CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP
FROM users WHERE email = 'youssef@example.com' LIMIT 1;

INSERT INTO email_tokens (user_id, token, type, expires_at, created_at)
SELECT id, 'jkl012mno345ver', 'verification', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

-- ============================================
-- 17. REFRESH TOKENS
-- ============================================

INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
SELECT id, 'refresh_token_ahmed_123456', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP
FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
SELECT id, 'refresh_token_layla_789012', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP
FROM users WHERE email = 'layla@example.com' LIMIT 1;

INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
SELECT id, 'refresh_token_admin_345678', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP
FROM users WHERE email = 'admin@smarttech.com' LIMIT 1;

-- ============================================
-- 18. ADDITIONAL SHIPPING AREAS
-- ============================================

INSERT INTO shipping_areas (name_en, name_ar, price, estimated_days, active) VALUES
('Tulkarm', 'طولكرم', 15.00, 2, TRUE),
('Jenin', 'جنين', 15.00, 2, TRUE),
('Qalqilya', 'قلقيلية', 15.00, 2, TRUE),
('Salfit', 'سلفيت', 15.00, 2, TRUE),
('Bethlehem', 'بيت لحم', 12.00, 1, TRUE),
('Jericho', 'أريحا', 12.00, 1, TRUE);

-- ============================================
-- 19. UPDATE ANALYTICS WITH HISTORICAL DATA
-- ============================================

UPDATE product_analytics 
SET view_count = view_count + 500, last_viewed = CURRENT_TIMESTAMP - INTERVAL '5 days'
WHERE product_id = (SELECT id FROM products WHERE name_en = 'iPhone 15 Pro Max' LIMIT 1);

UPDATE product_analytics 
SET view_count = view_count + 300, last_viewed = CURRENT_TIMESTAMP - INTERVAL '3 days'
WHERE product_id = (SELECT id FROM products WHERE name_en = 'Samsung Galaxy S24 Ultra' LIMIT 1);

-- ============================================
-- 20. VERIFICATION QUERIES
-- ============================================

-- Check data counts
SELECT 'Total Users: ' || COUNT(*) as Info FROM users
UNION ALL
SELECT 'Total Products: ' || COUNT(*) FROM products
UNION ALL
SELECT 'Total Orders: ' || COUNT(*) FROM orders
UNION ALL
SELECT 'Total Reviews: ' || COUNT(*) FROM reviews
UNION ALL
SELECT 'Total Sales Value: ' || COALESCE(SUM(total_price)::text, '0') FROM orders WHERE status = 'delivered';