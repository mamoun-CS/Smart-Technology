const pool = require('./models/db');

const sql = `
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
`;

async function runMigration() {
  try {
    await pool.query(sql);
    console.log('Migration completed successfully');
    
    // Add columns if not exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'country_code'
        ) THEN
          ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+970';
        END IF;
      END $$;
    `);
    console.log('Added country_code column');
    
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'phone_verified'
        ) THEN
          ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);
    console.log('Added phone_verified column');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
