const chalk = require("chalk")


module.exports.colorizeCell = (str, cellOptions, rowType) => {

  let color = false // false will keep terminal default

  switch(true) {
    case(rowType === "body"):
      color = cellOptions.color || color
      break

    case(rowType === "header"):
      color = cellOptions.headerColor || color
      break

    default:
      color = cellOptions.footerColor || color
  }

  if (color) {
    str = chalk[color](str)
  }

  return str
}


/*
module.exports.colorizeAllWords = function(color,str){
  //color each word in the cell so that line breaks don't break color
  let arr = str.replace(/(\S+)/gi,function(match){
    return chalk[color](match)+'\ ';
  });
  return arr;
}
*/
