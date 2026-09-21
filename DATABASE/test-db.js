/**
 * CAMPUSLINK - MySQL Database Connection & Health Verification Script
 * Run with: node test-db.js
 */

const { getPool, initDatabase } = require('./db');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  console.log('=============================================================');
  console.log('🔍 Testing MySQL Connection to:', process.env.DB_HOST || 'localhost', 'on port', process.env.DB_PORT || '3306');
  console.log('👤 MySQL User:', process.env.DB_USER || 'root');
  console.log('=============================================================\n');

  try {
    const initialized = await initDatabase();
    if (!initialized) {
      console.error('\n❌ Could not connect to MySQL.');
      console.error('👉 Please check the DB_PASSWORD in your .env file.');
      process.exit(1);
    }

    const pool = await getPool();
    const [users] = await pool.query('SELECT id, name, email, role, title, created_at FROM users');
    
    console.log('\n✅ MySQL Database Connection Successful!');
    console.log(`📊 Found ${users.length} registered users in MySQL [campuslink_db]:\n`);
    
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. [${u.role.toUpperCase()}] ${u.name} - ${u.email} (ID: ${u.id})`);
    });

    console.log('\n=============================================================');
    console.log('🚀 MySQL Backend is 100% Ready for CampusLink Authentication & RBAC!');
    console.log('=============================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
