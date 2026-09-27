const fs = require('fs');

// Create mock browser environment
const localStorageData = {};
const sessionStorageData = {};

global.window = {
  location: { hash: '#landing' },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  print: () => {}
};

const elements = {};

function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      getAttribute: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      appendChild: () => {},
      remove: () => {},
      focus: () => {}
    };
  }
  return elements[id];
}

global.document = {
  title: '',
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => ({
    tagName: tag,
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    getAttribute: () => null
  }),
  body: getOrCreateElement('body'),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'light'
  }
};

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = String(v); },
  removeItem: (k) => { delete sessionStorageData[k]; },
  clear: () => { Object.keys(sessionStorageData).forEach(k => delete sessionStorageData[k]); }
};

global.lucide = {
  createIcons: () => {}
};

// Mock fetch
global.fetch = async (url, opts) => {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null)
    },
    json: async () => ({ success: true, user: { id: 1, name: 'Test User', role: 'student', email: 'test@student.edu' }, token: 'mock-jwt-token' }),
    text: async () => JSON.stringify({ success: true })
  };
};

// Load scripts in order: api.js -> store.js -> mockData.js -> app.js
const api = require('../FRONTEND/api.js');
const store = require('../FRONTEND/store.js');
require('../FRONTEND/mockData.js');
const app = require('../FRONTEND/app.js') || global.window.CampusLinkApp || global.CampusLinkApp;

global.CampusLinkStore = store;
global.CampusLinkAPI = api;
global.CampusLinkApp = app;

console.log('--- STARTING COMPREHENSIVE FRONTEND VERIFICATION ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

(async () => {
  // 1. Initial State Audit
  assert(!store.auth.isAuthenticated, 'Initial auth state is not authenticated');
  assert(store.auth.user === null, 'Initial user is null');
  assert(store.auth.role === null, 'Initial role is null');
  assert(store.auth.token === null, 'Initial token is null');
  assert(Array.isArray(store.data.jobs) && store.data.jobs.length === 0, 'No mock jobs in operational store');
  assert(Array.isArray(store.data.applications) && store.data.applications.length === 0, 'No mock applications in operational store');
  assert(Array.isArray(store.data.interviews) && store.data.interviews.length === 0, 'No mock interviews in operational store');
  assert(Array.isArray(store.data.offers) && store.data.offers.length === 0, 'No mock offers in operational store');
  assert(Array.isArray(store.data.studentsDirectory) && store.data.studentsDirectory.length === 0, 'No mock students in operational store');
  assert(Array.isArray(store.data.recruitersDirectory) && store.data.recruitersDirectory.length === 0, 'No mock recruiters in operational store');

  const contentEl = document.getElementById('app-content');

  // 2. Landing Page UI Verification
  app.renderLandingPage();
  const landingHTML = contentEl.innerHTML;
  assert(landingHTML.includes('Sign In'), 'Landing page contains [ Sign In ] button');
  assert(!landingHTML.includes('Login as Student'), 'Landing page has no role-specific login buttons');
  assert(!landingHTML.includes('1,250+ recruiters'), 'Landing page has no fabricated recruiter stats');
  assert(!landingHTML.includes('94.8% placement success'), 'Landing page has no fabricated placement percentages');
  assert(landingHTML.includes('Placement Operations') && landingHTML.includes('Recruiter Management'), 'Landing page uses clean institutional pillars');
  assert(landingHTML.includes('Search notices...'), 'Notices search input uses clean placeholder');

  // 3. Portals Page Verification
  app.renderPortalsDashboard();
  const portalsHTML = contentEl.innerHTML;
  assert(portalsHTML.includes('STUDENT PORTAL'), 'Portals page has Student Portal');
  assert(portalsHTML.includes('RECRUITER PORTAL'), 'Portals page has Recruiter Portal');
  assert(portalsHTML.includes('PLACEMENT OFFICE'), 'Portals page has Placement Office');
  assert(portalsHTML.includes('openPortal(\'student\')'), 'Portal card routes via openPortal');
  assert(!portalsHTML.includes('Login as'), 'Portal cards do not have login forms or Login as buttons');

  // 4. Platform Capabilities Verification
  app.renderCapabilitiesDashboard();
  const capHTML = contentEl.innerHTML;
  assert(capHTML.includes('Student Readiness'), 'Capabilities includes Student Readiness');
  assert(capHTML.includes('Risk Prediction'), 'Capabilities includes Risk Prediction');
  assert(capHTML.includes('openCapability'), 'Capabilities action calls openCapability');

  // 5. Compliance NIRF/NAAC Verification
  app.renderComplianceDashboard();
  const compHTML = contentEl.innerHTML;
  assert(compHTML.includes('Institutional Reporting') || compHTML.includes('Compliance'), 'Compliance page has clean institutional heading');
  assert(compHTML.includes('switchComplianceTab(\'nirf\')'), 'Compliance page has NIRF tab');
  assert(compHTML.includes('switchComplianceTab(\'naac\')'), 'Compliance page has NAAC tab');
  assert(compHTML.includes('No institutional data available') || compHTML.includes('Institutional records will appear here'), 'Compliance page has clean empty state');

  // 6. Route Guard & Intended Destination
  window.location.hash = '#student/dashboard';
  app.handleRouteChange();
  assert(window.location.hash === '#login', 'Unauthenticated access to #student/dashboard redirects to #login');
  assert(store.getIntendedDestination() === '#student/dashboard', 'Intended destination #student/dashboard is preserved');

  // 7. Central Login Page Verification
  app.renderAuthView();
  const authHTML = contentEl.innerHTML;
  assert(authHTML.includes('Email address'), 'Central login page has Email address placeholder');
  assert(authHTML.includes('Password'), 'Central login page has Password placeholder');
  assert(!authHTML.includes('student@campuslink.edu'), 'Login page does not prefill student email');
  assert(!authHTML.includes('password123'), 'Login page does not prefill password');
  assert(!authHTML.includes('Sign in with Google'), 'Login page has no fake social login');

  // 8. Role Detection & Dashboard Routing
  assert(app.getDashboardRoute('student') === '#student/dashboard', 'getDashboardRoute(student) -> #student/dashboard');
  assert(app.getDashboardRoute('recruiter') === '#recruiter/dashboard', 'getDashboardRoute(recruiter) -> #recruiter/dashboard');
  assert(app.getDashboardRoute('officer') === '#officer/dashboard', 'getDashboardRoute(officer) -> #officer/dashboard');

  // 9. Session Set & Authenticated Shell Verification
  store.setSession({
    id: 101,
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campuslink.edu',
    role: 'student',
    branch: 'Computer Science & Engineering',
    usn: '1MS22CS001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  }, 'test-valid-jwt-token');

  assert(store.auth.isAuthenticated === true, 'Auth state isAuthenticated is true after setSession');
  assert(store.auth.role === 'student', 'Auth state role is student');
  assert(store.auth.token === 'test-valid-jwt-token', 'Auth state token is saved');

  app.renderShellLayout();
  const headerUserName = document.getElementById('header-user-name');
  const headerUserRole = document.getElementById('header-user-role');
  assert(headerUserName.textContent === 'Aarav Sharma', 'User menu displays user name: Aarav Sharma');
  assert(headerUserRole.textContent.includes('Student'), 'User menu displays user role: Student Portal');

  // 10. Every View Empty-State Rendering Verification (0 Exceptions)
  console.log('Testing all subviews render without runtime exceptions when data collections are empty:');
  const viewKeys = Object.keys(app.views);
  let viewsPassed = 0;
  for (const key of viewKeys) {
    try {
      const html = app.views[key]();
      if (typeof html === 'string' && html.length > 0) {
        viewsPassed++;
      } else {
        console.error(`View ${key} returned non-string or empty HTML`);
      }
    } catch (err) {
      console.error(`View ${key} crashed with error:`, err.message);
    }
  }
  assert(viewsPassed === viewKeys.length, `All ${viewKeys.length} subviews rendered safely with empty data (${viewsPassed}/${viewKeys.length})`);

  // 11. Central Logout Verification
  await app.logout();
  assert(store.auth.isAuthenticated === false, 'store.auth.isAuthenticated is false after logout');
  assert(store.auth.user === null, 'store.auth.user is null after logout');
  assert(store.auth.token === null, 'store.auth.token is null after logout');
  assert(window.location.hash === '#landing', 'Logout navigates to #landing');

  // 12. Protected Routes Blocked After Logout
  window.location.hash = '#recruiter/dashboard';
  app.handleRouteChange();
  assert(window.location.hash === '#login', '#recruiter/dashboard is blocked after logout and redirects to #login');

  window.location.hash = '#officer/dashboard';
  app.handleRouteChange();
  assert(window.location.hash === '#login', '#officer/dashboard is blocked after logout and redirects to #login');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log(`========================================`);
  if (passedTests === totalTests) {
    console.log('ALL VERIFICATION CRITERIA PERFECTLY SATISFIED!');
  }
})();
