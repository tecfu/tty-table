let cp = require('child_process');
let pwd = __dirname;
let output = cp.execSync('cat '+pwd+'/data/data.csv | node '+pwd+'/../src/terminal-adapter.js',{
  encoding:'utf8'
});
console.log(output);
