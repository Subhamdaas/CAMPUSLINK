const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('FRONTEND/app.js', 'utf8');

try {
  new vm.Script(code, { filename: 'FRONTEND/app.js', lineOffset: 0 });
} catch (e) {
  console.log(e);
}
