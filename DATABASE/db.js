/**
 * CAMPUSLINK - Master MySQL Database Connector & Auto-Migrator
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      database: process.env.DB_NAME || 'campuslink_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

/**
 * Initializes the MySQL database, tables, and seeds initial users if not present.
 */
async function initDatabase() {
  let connection;
  try {
    // 1. Initial connection without database to ensure DB creation
    connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'campuslink_db';

    console.log(`[MySQL] Connected to MySQL Server at ${dbConfig.host}:${dbConfig.port}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 2. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'recruiter', 'officer') NOT NULL DEFAULT 'student',
        title VARCHAR(150) DEFAULT NULL,
        avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_user_role (role)
      ) ENGINE=InnoDB;
    `);

    // 3. Create Student Profiles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        usn VARCHAR(64) DEFAULT NULL,
        branch VARCHAR(150) DEFAULT 'Computer Science & Engineering',
        batch VARCHAR(64) DEFAULT '2022-2026',
        cgpa DECIMAL(4,2) DEFAULT 8.50,
        phone VARCHAR(32) DEFAULT NULL,
        location VARCHAR(150) DEFAULT 'Bangalore, India',
        readiness_score INT DEFAULT 85,
        target_role VARCHAR(150) DEFAULT 'Full Stack Engineer',
        profile_completion INT DEFAULT 90,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 4. Create Recruiter Profiles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recruiter_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        company_name VARCHAR(150) NOT NULL,
        designation VARCHAR(150) DEFAULT 'Talent Acquisition Lead',
        location VARCHAR(150) DEFAULT 'Bangalore, India',
        website VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 5. Create Officer Profiles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS officer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        institution_name VARCHAR(200) NOT NULL,
        designation VARCHAR(150) DEFAULT 'Dean of Placements',
        staff_id VARCHAR(64) DEFAULT NULL,
        department VARCHAR(150) DEFAULT 'Training & Placement Cell',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 6. Create Audit Logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        user_email VARCHAR(191) DEFAULT NULL,
        role VARCHAR(32) DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT DEFAULT NULL,
        ip_address VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user (user_id),
        INDEX idx_audit_action (action)
      ) ENGINE=InnoDB;
    `);

    // 7. Seed Initial Demo Accounts if users table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('[MySQL] Seeding default demo accounts with bcrypt password hashes...');
      const defaultPasswordHash = await bcrypt.hash('password123', 10);

      // Student: Aarav Sharma
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, title, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['std_001', 'Aarav Sharma', 'student@campuslink.edu', defaultPasswordHash, 'student', "B.Tech CSE '26", 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80']
      );
      await connection.query(
        `INSERT INTO student_profiles (user_id, usn, branch, batch, cgpa, phone, location, readiness_score, target_role, profile_completion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['std_001', '1CL22CS042', 'Computer Science & Engineering', '2022-2026', 8.92, '+91 98765 43210', 'Bangalore, India', 88, 'Full Stack Engineer', 92]
      );

      // Recruiter: Rohit Deshmukh (Google)
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, title, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['rec_001', 'Rohit Deshmukh', 'rohit@google.com', defaultPasswordHash, 'recruiter', 'University Talent Lead', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80']
      );
      await connection.query(
        `INSERT INTO recruiter_profiles (user_id, company_name, designation, location) VALUES (?, ?, ?, ?)`,
        ['rec_001', 'Google India Pvt Ltd', 'University Talent Lead', 'Bangalore, India']
      );

      // Officer: Dr. Sunita Ramanathan
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, title, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['off_001', 'Dr. Sunita Ramanathan', 'officer@campuslink.edu', defaultPasswordHash, 'officer', 'Dean of Placements', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80']
      );
      await connection.query(
        `INSERT INTO officer_profiles (user_id, institution_name, designation, staff_id, department) VALUES (?, ?, ?, ?, ?)`,
        ['off_001', 'National Institute of Technology', 'Dean of Placements', 'TPO-NIT-01', 'Training & Placement Cell']
      );

      console.log('[MySQL] Seed accounts successfully generated.');
    }

    console.log('[MySQL] Database & schema verification complete.');
    await connection.end();
    return true;
  } catch (error) {
    if (connection) await connection.end().catch(() => {});
    console.error('[MySQL Error] Could not initialize database:', error.message);
    return false;
  }
}

module.exports = {
  getPool,
  initDatabase
};
