require('use-strict');

if(require.main === module){
  //called directly in terminal
  require('./terminal-adapter.js');
}
else{
  //called as a module
  module.exports = require('./default-adapter.js');
}
