-- Add phone_otps table for WhatsApp phone verification
-- Migration for Smart Technology E-Commerce Platform

-- Phone OTP table for WhatsApp verification
CREATE TABLE IF NOT EXISTS phone_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT '+970',
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'phone_verification',
    verified BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP NOT NULL,
    resend_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for phone_otps
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_user ON phone_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON phone_otps(expires_at);

-- Add phone and country_code to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+970';
    END IF;
END $$;

-- Add WhatsApp notification preference
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'whatsapp_notifications'
    ) THEN
        ALTER TABLE users ADD COLUMN whatsapp_notifications BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
