const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('CAMPUSLINK FINAL FRONTEND CLEANUP VERIFICATION SUITE');
console.log('====================================================');

const indexHtml = fs.readFileSync('FRONTEND/index.html', 'utf8');
const appJs = fs.readFileSync('FRONTEND/app.js', 'utf8');
const storeJs = fs.readFileSync('FRONTEND/store.js', 'utf8');
const authCss = fs.readFileSync('FRONTEND/auth.css', 'utf8');
const stylesCss = fs.readFileSync('FRONTEND/styles.css', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}:`, err.message);
    failCount++;
  }
}

// 1. ONE LOGIN ENTRY POINT IN PUBLIC HEADER
test('Public header has ONE Sign In action and is unified', () => {
  assert(appJs.includes('renderPublicHeader'), 'renderPublicHeader component should exist');
  assert(appJs.includes("CampusLinkApp.renderPublicHeader('home')"), 'Landing page uses unified public header');
  assert(appJs.includes("CampusLinkApp.renderPublicHeader('capabilities')"), 'Capabilities uses unified public header');
  assert(appJs.includes("CampusLinkApp.renderPublicHeader('portals')"), 'Portals uses unified public header');
  assert(appJs.includes("CampusLinkApp.renderPublicHeader('compliance')"), 'Compliance uses unified public header');
});

// 2. NO CONTENT-LEVEL DUPLICATE SIGN IN BUTTONS IN HERO SLIDES
test('No secondary Sign In buttons in carousel hero slides', () => {
  const slideMatch1 = appJs.includes('btn-govt-secondary" onclick="CampusLinkApp.navigateTo(\'#login\')');
  assert(!slideMatch1, 'No btn-govt-secondary login button in hero slides');
});

// 3. PORTAL CARDS USE [ OPEN PORTAL ]
test('Portal cards use Open Portal and check role authorization', () => {
  assert(!appJs.includes('Login as Student'), 'No Login as Student');
  assert(!appJs.includes('Login as Recruiter'), 'No Login as Recruiter');
  assert(!appJs.includes('Login as Officer'), 'No Login as Officer');
  assert(appJs.includes("CampusLinkApp.openPortal('student')"), 'Uses openPortal(student)');
  assert(appJs.includes("CampusLinkApp.openPortal('recruiter')"), 'Uses openPortal(recruiter)');
  assert(appJs.includes("CampusLinkApp.openPortal('officer')"), 'Uses openPortal(officer)');
  assert(appJs.includes('Open Portal'), 'Button text is Open Portal');
});

// 4. ONE LOGOUT LOCATION (TOP-RIGHT USER MENU, SIDEBAR REMOVED)
test('Sidebar logout button removed, only header user menu logout exists', () => {
  assert(!indexHtml.includes('sidebar-logout-btn'), 'sidebar-logout-btn must be removed from HTML');
  assert(indexHtml.includes('CampusLinkApp.handleLogout()'), 'Logout exists in user menu');
  // Check indexHtml has exactly one logout button
  const logoutMatches = (indexHtml.match(/CampusLinkApp\.(handleLogout|logout)\(\)/g) || []).length;
  assert.strictEqual(logoutMatches, 1, `Expected exactly 1 logout control in index.html, found ${logoutMatches}`);
});

// 5. NO SAMPLE USER IN STATIC HTML (index.html)
test('index.html contains no hardcoded sample user identity', () => {
  assert(!indexHtml.includes('Aarav Sharma'), 'No Aarav Sharma in index.html');
  assert(!indexHtml.includes("B.Tech CSE '26"), 'No B.Tech CSE in static HTML');
  assert(indexHtml.includes('id="sidebar-user-name" class="user-name">User<'), 'sidebar-user-name defaults to User');
  assert(indexHtml.includes('id="sidebar-user-title" class="user-subtitle">Role<'), 'sidebar-user-title defaults to Role');
  assert(indexHtml.includes('id="header-user-name" class="user-menu-name">User<'), 'header-user-name defaults to User');
});

// 6. NO SAMPLE AVATARS / STOCK PHOTOS
test('No hardcoded stock-photo avatars in default state, uses initials initials-sm', () => {
  assert(!indexHtml.includes('photo-1534528741775-53994a69daeb'), 'Stock avatar removed from index.html');
  assert(!storeJs.includes('photo-1534528741775-53994a69daeb'), 'Stock avatar removed from store.js');
  assert(indexHtml.includes('user-avatar-initials'), 'Initial-based avatar div present in index.html');
  assert(appJs.includes('getUserInitials'), 'getUserInitials helper present');
});

// 7. NO CLIENT-SIDE ROLE SWITCHING MUTATING AUTH
test('switchRole is neutralized and does not mutate authenticated role', () => {
  assert(appJs.includes('Authenticated role cannot be modified from the client') || appJs.includes('Authenticated role is determined by backend session'), 'switchRole protects authRole');
  assert(storeJs.includes('setRole: (role) => {'), 'store.js has setRole');
  assert(!storeJs.includes('CampusLinkStore.auth.role = role'), 'store.js setRole does not mutate auth.role');
});

// 8. SESSION RESTORATION VALIDATES WITH BACKEND, NO CACHED USER BYPASS
test('validateSession does not silently authenticate when backend is unavailable', () => {
  assert(!storeJs.includes('Validating cached local session fallback'), 'No silent cached session validation fallback');
  assert(storeJs.includes('do NOT silently authenticate from cached JSON'), 'Explicitly prevents silent cached JSON authentication');
  assert(storeJs.includes("reason: 'unreachable'"), 'Returns unreachable if server offline');
});

// 9. NO DEMO CREDENTIALS OR AUTO-LOGIN
test('No demo login credentials or demo sandbox remaining', () => {
  assert(!readme.includes('password123'), 'README has no password123');
  assert(!readme.includes('student@campuslink.edu'), 'README has no student@campuslink.edu');
  assert(!authCss.includes('.auth-demo-sandbox'), 'auth.css has no .auth-demo-sandbox');
  assert(!stylesCss.includes('.auth-demo-sandbox'), 'styles.css has no .auth-demo-sandbox');
});

// 10. NO HARD-CODED OPERATIONAL RECORDS (AARAV SHARMA, ROHIT DESHMUKH, GOOGLE INDIA)
test('No hard-coded operational records in table rows or default profile values', () => {
  assert(!appJs.includes('<td>Aarav Sharma</td>'), 'No hard-coded Aarav Sharma in officerOffers table');
  assert(!appJs.includes('value="Rohit Deshmukh"'), 'No hard-coded Rohit Deshmukh in recruiter profile form');
  assert(!appJs.includes('value="Google India Private Limited"'), 'No hard-coded Google India in job create form');
  assert(!appJs.includes('value="₹34.50 LPA"'), 'No hard-coded ₹34.50 LPA in job create form');
  assert(!appJs.includes('Google India — Software Development Engineer - I'), 'No hard-coded Google India in officerStudentDetails');
});

// 11. SIDEBAR BADGES ARE DYNAMIC (NO HARDCODED 48, 6, 3, 2, 1)
test('Sidebar badges are rendered dynamically and omitted when count is 0', () => {
  assert(!appJs.includes('<span class="nav-badge danger">48</span>'), 'No hardcoded 48 badge in officer sidebar');
  assert(appJs.includes('jobsCount > 0 ?'), 'jobsCount is dynamic');
  assert(appJs.includes('appsCount > 0 ?'), 'appsCount is dynamic');
  assert(appJs.includes('unreadCount > 0 ?'), 'unreadCount is dynamic');
});

// 12. EMPTY STATES FOR READINESS, SKILL GAP, RECRUITER MATCHING, SCHEDULER, ANALYTICS
test('Readiness, Skill Gap, Recruiter Matching, Scheduler and Analytics have proper empty states', () => {
  assert(appJs.includes('Readiness Score: Not available'), 'Readiness Score: Not available');
  assert(appJs.includes('No target-role analysis available.'), 'No target-role analysis available.');
  assert(appJs.includes('No matching results available.'), 'No matching results available.');
  assert(appJs.includes('No placement drives scheduled.'), 'No placement drives scheduled.');
  assert(appJs.includes('No placement data available to generate analytics.'), 'No placement data available to generate analytics.');
});

// 13. NIRF/NAAC COMPLIANCE EXPORT ROWS ARE DYNAMIC
test('NIRF/NAAC export does not use hard-coded rows', () => {
  assert(!appJs.includes('Computer Science & Engineering,240,236,98.3%,15.5 LPA,18.4 LPA,44.5 LPA'), 'No hard-coded CSV rows in exportComplianceData');
  assert(appJs.includes('No institutional data available for export.'), 'Shows warning when no compliance data exists');
});

// 14. CAMPUS NOTICES DATASET IS EMPTY BY DEFAULT
test('campusNotices is initialized as empty array', () => {
  assert(appJs.includes('campusNotices: [],'), 'campusNotices is empty array');
});

// 15. JAVASCRIPT SYNTAX VALIDATION
test('All modified files are syntactically valid', () => {
  const vm = require('vm');
  new vm.Script(appJs);
  new vm.Script(storeJs);
});

console.log('----------------------------------------------------');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
