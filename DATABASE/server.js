/**
 * CAMPUSLINK - Master Express & MySQL Backend API Server
 * Provides secure JWT Authentication, Bcrypt Password Hashing,
 * and Strict Role-Based Access Control (RBAC).
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
const { getPool, initDatabase } = require('./db');


dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Enforce JWT_SECRET in production, display warning in development
const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is strictly required in production.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev_campuslink_secret_key_change_in_production_2026';
if (!process.env.JWT_SECRET) {
  console.warn('[Security Warning]: Running with development fallback JWT secret. Configure JWT_SECRET in DATABASE/.env for production.');
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Assets
app.use(express.static(path.join(__dirname, '../FRONTEND')));
app.use('/assets', express.static(path.join(__dirname, '../FRONTEND/assets')));

// -------------------------------------------------------------
// JWT AUTHENTICATION & RBAC MIDDLEWARES
// -------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No session token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
    }
    req.user = decodedUser;
    next();
  });
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Your role (${req.user ? req.user.role : 'unauthorized'}) does not have permission to access this resource. Allowed: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -------------------------------------------------------------

// 1. REGISTER NEW USER IN MYSQL
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, title, usn, branch, companyName, institutionName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const assignedRole = ['student', 'recruiter', 'officer'].includes(role) ? role : 'student';

    // Role-specific validation
    if (assignedRole === 'student') {
      if (!usn || !usn.trim()) {
        return res.status(400).json({ success: false, message: 'Student USN / Roll Number is required for registration.' });
      }
    } else if (assignedRole === 'recruiter') {
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({ success: false, message: 'Company / Organization Name is required for recruiter registration.' });
      }
    } else if (assignedRole === 'officer') {
      if (!institutionName || !institutionName.trim()) {
        return res.status(400).json({ success: false, message: 'Institution Name / Department is required for officer registration.' });
      }
    }

    const pool = await getPool();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please sign in instead.' });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `${assignedRole.substring(0, 3)}_${Date.now()}`;
    const userTitle = title || (assignedRole === 'student' ? (branch ? `B.Tech ${branch.split(' ')[0]}` : "B.Tech Student '26") : assignedRole === 'recruiter' ? `${companyName || 'Corporate'} Recruiter` : 'Placement Officer');
    const userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    // Insert into users table
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, title, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), passwordHash, assignedRole, userTitle, userAvatar]
    );

    // Insert Role Specific Profile
    if (assignedRole === 'student') {
      await pool.query(
        `INSERT INTO student_profiles (user_id, usn, branch) VALUES (?, ?, ?)`,
        [userId, usn.trim(), branch ? branch.trim() : 'Computer Science & Engineering']
      );
    } else if (assignedRole === 'recruiter') {
      await pool.query(
        `INSERT INTO recruiter_profiles (user_id, company_name) VALUES (?, ?)`,
        [userId, companyName.trim()]
      );
    } else if (assignedRole === 'officer') {
      await pool.query(
        `INSERT INTO officer_profiles (user_id, institution_name) VALUES (?, ?)`,
        [userId, institutionName.trim()]
      );
    }

    // Log to Audit Trail
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, role, action, details) VALUES (?, ?, ?, ?, ?)`,
      [userId, email.toLowerCase().trim(), assignedRole, 'REGISTER_SUCCESS', `Registered new ${assignedRole} account`]
    );

    // Generate JWT Token
    const userPayload = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: assignedRole,
      title: userTitle,
      avatar: userAvatar
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account successfully registered and saved in MySQL.',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during registration. Please try again later.' });
  }
});

// 2. LOGIN USER FROM MYSQL
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const pool = await getPool();

    // Query user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found in MySQL database.' });
    }

    const user = users[0];

    // Verify Password Hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Role Match Verification
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Role mismatch: This account is registered as ${user.role.toUpperCase()}, but you selected ${role.toUpperCase()}. Please select the correct role tab.`
      });
    }

    // Log to Audit Trail
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, role, action, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.email, user.role, 'LOGIN_SUCCESS', 'User authenticated via password hash']
    );

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: `Authentication successful as ${user.role.toUpperCase()}.`,
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again later.' });
  }
});

// 3. GET CURRENT AUTHENTICATED USER FROM MYSQL
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query('SELECT id, name, email, role, title, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User record no longer exists in MySQL.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('[/api/auth/me Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user session.' });
  }
});

// 4. LOGOUT USER (RECORDS AUDIT LOG & CONFIRMS CLIENT TOKEN INVALIDATION)
// Architectural Limitation Note: JWT access tokens are stateless. The client terminates its session
// by clearing the token from browser storage. This endpoint records the logout in the MySQL
// audit trail. For strict immediate token revocation before expiration, a token blocklist (e.g. Redis)
// or token version counter in MySQL would be required.
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        // Token already expired or invalid; logout still succeeds
      }
    }
    if (user) {
      const pool = await getPool();
      await pool.query(
        `INSERT INTO audit_logs (user_id, user_email, role, action, details) VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.email, user.role, 'LOGOUT', 'User logged out. Client-side session cleared.']
      );
    }
    res.json({
      success: true,
      message: 'Session logged out successfully. Note: JWT tokens are stateless; client storage has been cleared.'
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    res.json({ success: true, message: 'Logged out locally.' });
  }
});

// -------------------------------------------------------------
// GMAIL OTP PASSWORD RESET SERVICE & ROUTES
// -------------------------------------------------------------
async function sendResetOtpEmail(toEmail, otp, userName = 'CampusLink User') {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM || '"CampusLink Verification" <no-reply@campuslink.edu>';

  if (!emailUser || !emailPass) {
    console.log('\n=============================================================');
    console.log('🔑 [CAMPUSLINK PASSWORD RESET OTP]');
    console.log(`Recipient: ${toEmail}`);
    console.log(`User: ${userName}`);
    console.log(`Verification Code (OTP): ${otp}`);
    console.log('Valid for: 10 minutes');
    console.log('NOTE: To send actual emails to Gmail inbox, configure EMAIL_USER and EMAIL_PASS in DATABASE/.env');
    console.log('=============================================================\n');
    return { sent: false, mode: 'console', devOtp: otp };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: `CampusLink - Password Reset Verification Code: ${otp}`,
    html: `
      <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; max-width:540px; margin:0 auto; padding:28px 24px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; color:#1e293b;">
        <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #f1f5f9;">
          <h2 style="margin:0; color:#0f172a; font-size:22px; font-weight:800; letter-spacing:-0.5px;">CAMPUSLINK</h2>
          <p style="margin:4px 0 0; color:#64748b; font-size:13px;">Career & Placement Management Portal</p>
        </div>
        <div style="padding:24px 0 16px;">
          <h3 style="margin:0 0 12px; color:#0f172a; font-size:18px;">Password Reset Request</h3>
          <p style="margin:0 0 16px; color:#475569; font-size:14px; line-height:1.6;">
            Hello <strong>${userName}</strong>,<br>
            We received a request to reset your password for your registered CampusLink account (<strong>${toEmail}</strong>).
          </p>
          <p style="margin:0 0 12px; color:#475569; font-size:14px;">
            Your 6-digit one-time password (OTP) verification code is:
          </p>
          <div style="text-align:center; margin:24px 0;">
            <div style="display:inline-block; padding:14px 32px; background:#f8fafc; border:2px dashed #0284c7; border-radius:10px; font-size:32px; font-weight:800; letter-spacing:8px; color:#0369a1; font-family:monospace;">
              ${otp}
            </div>
          </div>
          <p style="margin:0 0 8px; color:#ef4444; font-size:13px; font-weight:600; text-align:center;">
            ⏳ This code is valid for 10 minutes only.
          </p>
          <p style="margin:16px 0 0; color:#64748b; font-size:13px; line-height:1.5;">
            If you did not request this password reset, please ignore this email or contact your placement administrator immediately. Your password will remain unchanged.
          </p>
        </div>
        <div style="padding-top:20px; border-top:1px solid #f1f5f9; text-align:center; font-size:12px; color:#94a3b8;">
          © ${new Date().getFullYear()} CampusLink Enterprise. Automated security notification.
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return { sent: true, mode: 'smtp' };
}

// 5. REQUEST PASSWORD RESET OTP (SENT TO REGISTERED GMAIL)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Registered email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const pool = await getPool();

    // Check if user exists in MySQL
    const [users] = await pool.query('SELECT id, name, email FROM users WHERE email = ? AND is_active = 1', [cleanEmail]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address. Please verify your email or sign up.'
      });
    }

    const user = users[0];

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 10 minutes expiry from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any previous pending OTPs for this email
    await pool.query('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);

    // Insert new OTP in MySQL
    await pool.query(
      'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
      [cleanEmail, otp, expiresAt]
    );

    // Record in Audit Trail
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, role, action, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, cleanEmail, null, 'FORGOT_PASSWORD_OTP_REQUESTED', '6-digit OTP generated for password reset']
    );

    // Send email via Gmail SMTP or console fallback
    let emailResult = { sent: false, mode: 'console' };
    try {
      emailResult = await sendResetOtpEmail(cleanEmail, otp, user.name);
    } catch (mailErr) {
      console.error('[Nodemailer Error]:', mailErr.message);
      emailResult = { sent: false, mode: 'console_fallback', error: mailErr.message, devOtp: otp };
    }

    const responsePayload = {
      success: true,
      message: emailResult.sent 
        ? `A 6-digit verification code has been sent to your Gmail (${cleanEmail}). Please check your inbox and spam folder.`
        : `Verification code generated for ${cleanEmail}. (Check server console or enter code).`
    };

    if (emailResult.devOtp) {
      responsePayload.devOtp = emailResult.devOtp;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ success: false, message: 'Server error processing password reset request.' });
  }
});

// 6. VERIFY OTP AND RESET NEW PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: '6-digit verification code is required.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const pool = await getPool();

    // Verify OTP in MySQL
    const [resets] = await pool.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [cleanEmail, cleanOtp]
    );

    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new OTP.'
      });
    }

    // Check that user exists
    const [users] = await pool.query('SELECT id, name, role FROM users WHERE email = ? AND is_active = 1', [cleanEmail]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in users table
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, cleanEmail]);

    // Clean up used OTP from password_resets
    await pool.query('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);

    // Record in Audit Trail
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, role, action, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, cleanEmail, user.role, 'PASSWORD_RESET_SUCCESS', 'Password updated successfully via OTP verification']
    );

    console.log(`[MySQL Auth] Password reset successfully for ${cleanEmail} (${user.role})`);

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ success: false, message: 'Server error updating password. Please try again later.' });
  }
});


// 5. DATABASE & HEALTH CHECK
app.get('/api/auth/status', async (req, res) => {
  try {
    const pool = await getPool();
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [auditCount] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    
    res.json({
      success: true,
      database: 'MySQL 8.0 (campuslink_db)',
      status: 'Connected & Healthy',
      stats: {
        totalUsers: userCount[0].count,
        totalAuditLogs: auditCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: 'MySQL Connection Error',
      error: error.message
    });
  }
});

// -------------------------------------------------------------
// STRICT RBAC PROTECTED DEMONSTRATION ROUTES
// -------------------------------------------------------------
app.get('/api/protected/student', authenticateToken, requireRole(['student']), (req, res) => {
  res.json({ success: true, message: 'Welcome to the protected Student Portal API.', user: req.user });
});

app.get('/api/protected/recruiter', authenticateToken, requireRole(['recruiter']), (req, res) => {
  res.json({ success: true, message: 'Welcome to the protected Recruiter Suite API.', user: req.user });
});

app.get('/api/protected/officer', authenticateToken, requireRole(['officer']), (req, res) => {
  res.json({ success: true, message: 'Welcome to the protected Placement Officer Command API.', user: req.user });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CAMPUSLINK API Server',
    academicSession: '2025–2026',
    timestamp: new Date().toISOString()
  });
});

// Default Fallback Route to Frontend index.html
app.get('*', (req, res) => {
  const frontendPath = path.join(__dirname, '../FRONTEND/index.html');
  res.sendFile(frontendPath);
});

// -------------------------------------------------------------
// BOOTSTRAP SERVER & INITIALIZE MYSQL
// -------------------------------------------------------------
async function startServer() {
  console.log('[Server] Connecting and initializing MySQL database...');
  const dbReady = await initDatabase();
  
  if (!dbReady) {
    console.warn('\n=============================================================');
    console.warn('⚠️ WARNING: MySQL database connection failed.');
    console.warn('Please check your .env file with the correct DB_PASSWORD for your MySQL root user.');
    console.warn('The frontend will gracefully support both real MySQL and offline fallback.');
    console.warn('=============================================================\n');
  }

  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 CAMPUSLINK Server running on http://localhost:${PORT}`);
    console.log(`📊 MySQL Database: ${process.env.DB_NAME || 'campuslink_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    console.log(`🔐 RBAC API Endpoints: /api/auth/login, /api/auth/register, /api/auth/me`);
    console.log(`=============================================================\n`);
  });
}

startServer();
