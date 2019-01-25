let chalk = require("chalk")
module.exports = [
  {
    "value": "ticker",
    "color": "cyan"
  },
  {
    "value": "last",
    "color": "red",
    width : 10,
    formatter : function(value){
      var str = "$" + value.toFixed(2);
      if(value > 138){
        str = chalk.bold.green(str);
      }
      return str;
    }
  }
]


