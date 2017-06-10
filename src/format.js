//let StripAnsi = require("strip-ansi");
//let Wrap = require("word-wrap");
let Wrap = require("smartwrap");
let Wcwidth = require("wcwidth");
let Format = {};

Format.calculateLength = function(line) {
  //return StripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length;
  return Wcwidth(line);
}

Format.wrapCellContent = function(
  config,
  cellValue,
  columnIndex,
  cellOptions,
  rowType
){
  
  //coerce cell value to string
  let string = cellValue.toString(); 

  //ANSI chararacters that demarcate the start of a line
  let startAnsiRegexp = /^(\033\[[0-9;]*m)+/;

  //store matching ANSI characters
  let startMatches = string.match(startAnsiRegexp) || [''];

  //remove ANSI start-of-line chars 
  string = string.replace(startAnsiRegexp,'');

  //ANSI chararacters that demarcate the end of a line
  let endAnsiRegexp = /(\033\[[0-9;]*m)+$/;

  //store matching ANSI characters so can be later re-attached
  let endMatches = string.match(endAnsiRegexp) || [''];

  //remove ANSI end-of-line chars 
  string = string.replace(endAnsiRegexp,'');

  let alignTgt;

  switch(rowType){
    case('header'):
      alignTgt = "headerAlign"
      break;
    case('body'):
      alignTgt = "align"
      break;
    default:
      alignTgt = "footerAlign"
      break;
  }

  //equalize padding for centered lines 
  if(cellOptions[alignTgt] === 'center'){  
    cellOptions.paddingLeft = cellOptions.paddingRight =
      Math.max(cellOptions.paddingRight,cellOptions.paddingLeft,0);
  }

  let columnWidth = config.table.columnWidths[columnIndex];
  
  //innerWidth is the width available for text within the cell
  let innerWidth = columnWidth -
   cellOptions.paddingLeft -
   cellOptions.paddingRight -
   config.GUTTER; 
  
  switch(true){
    //no wrap, truncate
    case(typeof config.truncate === 'string' && config.truncate.length > 0):
      string = Format.handleTruncatedValue(
        string,
        cellOptions,
        innerWidth
      );
      break;
    //asian characters
    case(string.length < Format.calculateLength(string)):
      string = Format.handleAsianChars(
        string,
        cellOptions,
        innerWidth
      );
      break;
    //latin characters
    default:
      string = Format.handleLatinChars(string,cellOptions,innerWidth);
  }

  //break string into array of lines
  let strArr = string.split('\n');

  //format each line
  strArr = strArr.map(function(line){

    line = line.trim();  
  
    let lineLength = Format.calculateLength(line);

    //alignment 
    if(lineLength < columnWidth){
      let emptySpace = columnWidth - lineLength; 
      switch(true){
        case(cellOptions[alignTgt] === 'center'):
          emptySpace --;
          let padBoth = Math.floor(emptySpace / 2), 
              padRemainder = emptySpace % 2;
          line = Array(padBoth + 1).join(' ') + 
            line +
            Array(padBoth + 1 + padRemainder).join(' ');
          break;
        case(cellOptions[alignTgt] === 'right'):
          line = Array(emptySpace - cellOptions.paddingRight).join(' ') + 
                 line + 
                 Array(cellOptions.paddingRight + 1).join(' ');
          break;
        default:
          line = Array(cellOptions.paddingLeft + 1).join(' ') +
                 line + Array(emptySpace - cellOptions.paddingLeft).join(' ');
      }
    }
    
    //put ANSI color codes BACK on the beginning and end of string
    line = startMatches[0] + line;
    line = line + endMatches[0];

    return line;
  });

  return {
    output : strArr,
    width : innerWidth
  };
}

Format.handleTruncatedValue = function(string,cellOptions,innerWidth){
  let outstring = string;
  if(innerWidth < outstring.length){
    outstring = outstring.substring(0,innerWidth - cellOptions.truncate.length);
    outstring = outstring + cellOptions.truncate;
  }
  return outstring;
}

Format.handleAsianChars = function(string,cellOptions,innerWidth){
  let count = 0;
  let start = 0;
  let characters = string.split('');

  let outstring = characters.reduce(function (prev, cellValue, i) {
    count += Format.calculateLength(cellValue);
    if (count > innerWidth) {
      prev.push(string.slice(start, i));
      start = i;
      count = 0;
    } else if (characters.length === i + 1) {
      prev.push(string.slice(start));
    }
    return prev;
  }, []).join('\n');

  return outstring;
}

Format.handleLatinChars = function(string,cellOptions,innerWidth){
  let calculatedWidth = innerWidth - 
                        cellOptions.paddingLeft -
                        cellOptions.paddingRight;
  let outstring = Wrap(string,{
    width : calculatedWidth,
    trim : true//,
    //indent : '',
    //cut : true
  });

  return outstring;
}

Format.getColumnWidths = function(config,rows){
  
  let widths = [];
  let source; //source of columns  
  
  //check widths on header settings if exists
  if(config.table.header[0] && config.table.header[0].length > 0){
    source = config.table.header[0];
  }
  else if(rows.length > 0){
    source = rows[0];
  }
  else {
    return [];
  }
  
  widths = source.map(function(cell){
    if(typeof cell === 'object' && typeof cell.width !=='undefined'){
      return cell.width;
    }
    else{
      return config.width;
    }
  });

  //check to make sure widths will fit the current display, or resize.
  let totalWidth = widths.reduce(function(prev,curr){
    return prev + curr;
  });
  
  //add marginLeft to totalWidth
  totalWidth += config.marginLeft;

  //check process exists in case we are in browser
  if(process && process.stdout && totalWidth > process.stdout.columns){
    //recalculate proportionately to fit size
    let prop = process.stdout.columns / totalWidth;
  
    prop = prop.toFixed(2)-0.01;
  
    widths = widths.map(function(value){
      return Math.floor(prop*value);
    });
  }

  return widths;
}

module.exports = Format;
