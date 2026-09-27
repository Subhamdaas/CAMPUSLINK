const fs = require('fs');
const path = require('path');

// Mock browser globals for testing
global.window = global;
global.document = {
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Load api.js and store.js
eval(fs.readFileSync(path.join(__dirname, '../FRONTEND/api.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../FRONTEND/store.js'), 'utf8'));

console.log("api.js and store.js loaded successfully.");
console.log("Store auth state:", CampusLinkStore.auth);
console.log("Store get() collections check:", {
  jobs: CampusLinkStore.get().jobs.length,
  applications: CampusLinkStore.get().applications.length,
  offers: CampusLinkStore.get().offers.length,
  drives: CampusLinkStore.get().drives.length
});
