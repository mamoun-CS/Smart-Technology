-- Migration: Add shipping and location fields to orders table
-- Date: 2026-03-27

-- Add new columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) CHECK (delivery_method IN ('shipping', 'pickup')),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_large_order BOOLEAN DEFAULT FALSE;

-- Update status constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'contacted', 'processing', 'shipped', 'delivered', 'cancelled', 'under_review'));

-- Add index for city and delivery method
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_orders_is_large_order ON orders(is_large_order);

-- Add configuration table for large order threshold
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default large order threshold (e.g., 50 items)
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('large_order_threshold', '50', 'Minimum total quantity for large orders requiring manual review')
ON CONFLICT (config_key) DO NOTHING;

-- Add comment to explain the new fields
COMMENT ON COLUMN orders.city IS 'City selected by the user for delivery or pickup';
COMMENT ON COLUMN orders.delivery_method IS 'Delivery method: shipping or in-store pickup';
COMMENT ON COLUMN orders.shipping_cost IS 'Calculated shipping cost based on city and delivery method';
COMMENT ON COLUMN orders.is_large_order IS 'Flag indicating if order exceeds large order threshold';
