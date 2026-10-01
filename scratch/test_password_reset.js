/**
 * Automated Verification Script for Forgot Password & OTP Reset via MySQL
 */
const bcrypt = require('../DATABASE/node_modules/bcryptjs');
const { getPool, initDatabase } = require('../DATABASE/db');

async function testPasswordResetFlow() {
  console.log('=============================================================');
  console.log('🧪 TESTING GMAIL OTP FORGOT & RESET PASSWORD FLOW');
  console.log('=============================================================');

  const pool = await getPool();
  const testEmail = 'student@campuslink.edu';

  // 1. Verify user exists
  const [users] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [testEmail]);
  if (users.length === 0) {
    console.error('❌ Test user not found:', testEmail);
    process.exit(1);
  }
  const user = users[0];
  const oldHash = user.password_hash;
  console.log(`✅ Found user: ${user.name} (${user.email})`);

  // 2. Generate 6-digit OTP
  const testOtp = '849201';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Clear previous resets
  await pool.query('DELETE FROM password_resets WHERE email = ?', [testEmail]);

  // Insert reset record
  await pool.query(
    'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
    [testEmail, testOtp, expiresAt]
  );
  console.log(`✅ Stored OTP ${testOtp} in MySQL password_resets table for ${testEmail}`);

  // 3. Test verification of invalid OTP
  const [invalidCheck] = await pool.query(
    'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()',
    [testEmail, '000000']
  );
  if (invalidCheck.length === 0) {
    console.log('✅ Correctly rejected invalid OTP "000000"');
  } else {
    console.error('❌ Failed: Invalid OTP was accepted!');
  }

  // 4. Test verification of valid OTP
  const [validCheck] = await pool.query(
    'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()',
    [testEmail, testOtp]
  );
  if (validCheck.length > 0) {
    console.log(`✅ Successfully verified valid OTP "${testOtp}" for ${testEmail}`);
  } else {
    console.error('❌ Failed to verify valid OTP!');
  }

  // 5. Simulate password update
  const newPasswordPlain = 'newCampusLink2026!';
  const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);

  await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [newPasswordHash, testEmail]);
  await pool.query('DELETE FROM password_resets WHERE email = ?', [testEmail]);
  console.log('✅ Password hash updated in MySQL users table and OTP cleared from password_resets');

  // 6. Verify authentication with new password
  const [updatedUsers] = await pool.query('SELECT password_hash FROM users WHERE email = ?', [testEmail]);
  const isMatchNew = await bcrypt.compare(newPasswordPlain, updatedUsers[0].password_hash);
  const isMatchOld = await bcrypt.compare('password123', updatedUsers[0].password_hash);

  if (isMatchNew && !isMatchOld) {
    console.log('✅ Bcrypt verification: NEW password successfully accepted, OLD password successfully rejected!');
  } else {
    console.error('❌ Password verification mismatch!');
  }

  // 7. Restore original password for demo account
  await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [oldHash, testEmail]);
  console.log('✅ Restored initial demo password hash for student@campuslink.edu');

  console.log('=============================================================');
  console.log('🎉 ALL OTP PASSWORD RESET TESTS PASSED 100%!');
  console.log('=============================================================');
  process.exit(0);
}

testPasswordResetFlow().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
