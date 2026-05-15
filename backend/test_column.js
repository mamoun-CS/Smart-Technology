const pool = require('./models/db');

async function checkColumn() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'is_large_order'
    `);
    console.log('is_large_order column exists:', result.rows.length > 0);
    if (result.rows.length > 0) {
      console.log('Column details:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error checking column:', err.message);
  } finally {
    pool.end();
  }
}

checkColumn();