// Test syntax of all frontend JS files
const fs = require('fs');
const vm = require('vm');

const files = [
  'FRONTEND/api.js',
  'FRONTEND/store.js',
  'FRONTEND/mockData.js',
  'FRONTEND/app.js'
];

let hasError = false;

for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new vm.Script(code, { filename: f });
    console.log(`[PASS] ${f} syntax is valid.`);
  } catch (err) {
    hasError = true;
    console.error(`[FAIL] ${f} has syntax error:`, err.message);
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('All frontend JavaScript files passed syntax verification!');
}
