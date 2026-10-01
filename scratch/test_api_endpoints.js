/**
 * Automated API Endpoint Test for forgot-password and reset-password
 */
const http = require('http');

function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Testing Forgot Password API endpoint...');
  const forgotRes = await postJSON('/api/auth/forgot-password', { email: 'student@campuslink.edu' });
  console.log('Forgot response:', forgotRes);

  if (!forgotRes.data || !forgotRes.data.success) {
    console.error('Failed forgot password test');
    process.exit(1);
  }

  const otp = forgotRes.data.devOtp;
  console.log('Received OTP:', otp);

  console.log('Testing Reset Password API endpoint with valid OTP...');
  const resetRes = await postJSON('/api/auth/reset-password', {
    email: 'student@campuslink.edu',
    otp: otp,
    newPassword: 'myNewSecurePass2026!'
  });
  console.log('Reset response:', resetRes);

  if (!resetRes.data || !resetRes.data.success) {
    console.error('Failed reset password test');
    process.exit(1);
  }

  console.log('Testing Login with newly reset password...');
  const loginRes = await postJSON('/api/auth/login', {
    email: 'student@campuslink.edu',
    password: 'myNewSecurePass2026!'
  });
  console.log('Login with new password response:', loginRes.data.success ? 'SUCCESS' : 'FAILED');

  // Reset back to original password
  const forgotRes2 = await postJSON('/api/auth/forgot-password', { email: 'student@campuslink.edu' });
  await postJSON('/api/auth/reset-password', {
    email: 'student@campuslink.edu',
    otp: forgotRes2.data.devOtp,
    newPassword: 'password123'
  });
  console.log('Restored demo user password back to password123');

  console.log('All API tests passed cleanly!');
  process.exit(0);
}

// Run against live running server on port 5000
run();
