-- =============================================================
-- CAMPUSLINK ENTERPRISE - MASTER MYSQL DATABASE SCHEMA
-- Compatible with MySQL 8.0+
-- =============================================================

CREATE DATABASE IF NOT EXISTS campuslink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campuslink_db;

-- 1. USERS MASTER TABLE
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

-- 2. STUDENT PROFILES TABLE
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

-- 3. RECRUITER PROFILES TABLE
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

-- 4. PLACEMENT OFFICER PROFILES TABLE
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

-- 5. AUDIT & ACCESS LOGS TABLE (FOR STRICT RBAC AUDIT TRAIL)
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
