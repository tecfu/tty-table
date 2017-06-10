let Merge = require("merge");
let Style = require("./style.js");
let Format = require("./format.js");
let Render = {};

/**
 * Converts arrays of data into arrays of cell strings
 */
Render.stringifyData = function(Config,data){
  
  let sections = {
        header : [],
        body : [],
        footer : []
      },
      output = '',
      marginLeft = Array(Config.marginLeft + 1).join('\ '),
      borderStyle = Config.borderCharacters[Config.borderStyle],
      borders = [];

  //because automattic/cli-table syntax infers table type based on 
  //how rows are passed (array of arrays, objects, etc)
  Config.rowFormat = Render.getRowFormat(data[0] || []);
  
  //now translate them
  data = Render.transformRows(Config,data);
    
  Config.table.columnWidths = Format.getColumnWidths(Config,data);
  
  //stringify header cells
  if(!Config.headerEmpty){
    sections.header = Config.table.header.map(function(row){
      return Render.buildRow(Config,row,'header');
    });
  }
  else{
    sections.header = [];
  }

  //stringify body cells
  sections.body = data.map(function(row){
    return Render.buildRow(Config,row,'body');
  });

  //stringify footer cells
  sections.footer = (Config.table.footer instanceof Array && Config.table.footer.length > 0) ? [Config.table.footer] : [];
  
  sections.footer = sections.footer.map(function(row){
    return Render.buildRow(Config,row,'footer');
  });

  //add borders
  //0=header, 1=body, 2=footer
  for(let a=0; a<3; a++){
    borders.push('');
    Config.table.columnWidths.forEach(function(w,i,arr){
      borders[a] += Array(w).join(borderStyle[a].h) +
        ((i+1 !== arr.length) ? borderStyle[a].j : borderStyle[a].r);
    });
    borders[a] = borderStyle[a].l + borders[a];
    borders[a] = borders[a].split('');
    borders[a][borders[a].length1] = borderStyle[a].r;
    borders[a] = borders[a].join('');
    //no trailing space on footer
    borders[a] = (a<2) ? marginLeft + borders[a] + '\n' : marginLeft + borders[a];
  }
  
  //top horizontal border
  output += borders[0];

  //rows
  let row;

  //for each section (header,body,footer)
  Object.keys(sections).forEach(function(p,i){
    
    //for each row in the section
    while(sections[p].length){
      
      row = sections[p].shift();
      
      //if(row.length === 0) {break}

      row.forEach(function(line){
        //vertical row borders
        output = output 
          + marginLeft 
          //left vertical border
          + borderStyle[1].v 
          //join cells on vertical border
          +  line.join(borderStyle[1].v) 
          //right vertical border
          + borderStyle[1].v
          //end of line
          + '\n';
      });
    
      //bottom horizontal row border
      switch(true){
        //skip if end of body and no footer
        case(sections[p].length === 0 
             && i === 1 
             && sections.footer.length === 0):
          break;
        //skip if end of footer
        case(sections[p].length === 0 
             && i === 2):
          break;
        //skip if compact
        case(Config.compact && p === 'body' && !row.empty):
          break;
        default:
          output += borders[1];
      }  
    }
  });
  
  //bottom horizontal border
  output += borders[2];
  
  //remove all rows in prototype array
  this.splice(0,this.length);
  
  let finalOutput = Array(Config.marginTop + 1).join('\n') + output;

  //record the height of the output
  this.height = finalOutput.split(/\r\n|\r|\n/).length;
  
  return finalOutput;
};

Render.buildRow = function(config,row,rowType){

  let minRowHeight = 0;
  
  //tag row as empty if empty
  //(used) for compact tables
  if(row.length === 0 && config.compact){
    row.empty = true;
    return row;
  }

  //check for diffeerences in line length
  let difL = config.table.columnWidths.length - row.length;

  if(difL > 0){
    //add empty element to array
    row = row.concat(Array.apply(null, new Array(difL))
                          .map(function(){return null})); 
                          //.map(function(){return ''})); 
  }
  else if(difL < 0){
    //truncate array
    row.length = config.table.columnWidths.length;
  }
  
  //get row as array of cell arrays
  //can't use es5 row functions (map, forEach because of 
  //potential ellision; by which [1,,3] will only iterate 1,3
  let cArrs = [];
  let rowLength = row.length;
  
  for(let index=0; index<rowLength; index++){
    
    let c = Render.buildCell(config,row[index],index,rowType);
    let cellArr = c.cellArr;
    
    if(rowType === 'header'){
      config.table.columnInnerWidths.push(c.width);
    }
  
    minRowHeight = (minRowHeight < cellArr.length) ? 
      cellArr.length : minRowHeight;
  
    cArrs.push(cellArr);
  }
  
  //adjust minRowHeight to reflect vertical row padding
  minRowHeight = (rowType === 'header') ? minRowHeight :
    minRowHeight + (config.paddingBottom + config.paddingTop);

  //convert array of cell arrays to array of lines
  let lines = Array.apply(null,{length:minRowHeight})
                   .map(Function.call,function(){return []});
  cArrs.forEach(function(cellArr,a){
    let whiteline = Array(config.table.columnWidths[a]).join('\ ');
    
    if(rowType ==='body'){
      //add whitespace for top padding
      for(let i=0; i<config.paddingTop; i++){
        cellArr.unshift(whiteline);
      }
      
      //add whitespace for bottom padding
      for(let i=0; i<config.paddingBottom; i++){
        cellArr.push(whiteline);
      }
    }  
    for(let b=0; b<minRowHeight; b++){  
      lines[b].push((typeof cellArr[b] !== 'undefined') ? 
                    cellArr[b] : whiteline);
    }
  });

  return lines;
}

Render.buildCell = function(config,cell,columnIndex,rowType){
  let cellValue, 
      cellOptions = Merge(true,config,
                          (rowType === 'body') ? 
                          config.columnSettings[columnIndex] : {}, //ignore columnSettings for footer
                          cell);    
  
  if(rowType === 'header'){
    config.table.columns.push(cellOptions);
    cellValue = cellOptions.alias || cellOptions.value || '';
  }  
  else{
    //set cellValue
    switch(true){  
      case(typeof cell === 'undefined' || cell === null):
        //replace undefined/null cell values with placeholder
        cellValue = (config.errorOnNull) ? config.defaultErrorValue : config.defaultValue;
        break;
      case(typeof cell === 'object' && typeof cell.value !== 'undefined'):  
        cellValue = cell.value;
        break;
      default:
        //cell is assumed to be a scalar
        cellValue = cell;
    }
    
    //run formatter
    if(typeof cellOptions.formatter === 'function'){
      cellValue = cellOptions.formatter(cellValue);
    }
  }
  
  //colorize cellValue
  cellValue = Style.colorizeCell(cellValue,cellOptions,rowType);  

  //textwrap cellValue
  let WrapObj  = Format.wrapCellContent(config, cellValue, columnIndex, cellOptions, rowType);
  //cellValue = WrapObj.output.join('\n');

  //return as array of lines
  return {
    cellArr : WrapObj.output,
    width : WrapObj.width
  };
};

Render.getRowFormat = function(row){
  let type;
  
  //rows passed as an object
  if(typeof row === 'object' && !(row instanceof Array)){
    let keys = Object.keys(row);
    if(keys.length === 1){
      //detected cross table
      let key = keys[0];
      if(row[key] instanceof Array){
        type = 'automattic-cross';
      }
      //detected vertical table
      else{
        type = 'automattic-vertical';  
      }
    }
    else {
      //detected horizontal table
      type = 'o-horizontal';
    }
  }
  //rows passed as an array
  else{
    type = 'a-horizontal';  
  }

  return type;
};

//@todo For rotating horizontal data into a vertical table
//assumes all rows are same length
Render.verticalizeMatrix = function(config,inputArray){

  //grow to # arrays equal to number of columns in input array
  let outputArray = [];
  let headers = config.table.columns;

  //create a row for each heading, and prepend the row
  //with the heading name
  headers.forEach(function(name){
    outputArray.push([name]);
  });

  inputArray.forEach(function(row){
    row.forEach(function(element,index){
      outputArray[index].push(element);  
    });
  });

  return outputArray;
} 

/**
 * Transforms input data arrays to base rendering structure.
 */
Render.transformRows = function(config,rows){

  let output = [];
  switch(config.rowFormat){
    case('automattic-cross'):
      //assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;
      
      output = rows.map(function(obj){
        let arr = [];
        let key = Object.keys(obj)[0];
        arr.push(key);
        return arr.concat(obj[key]);
      });
      break;
    case('automattic-vertical'):  
      //assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;
    
      output = rows.map(function(value){
        let key = Object.keys(value)[0];
        return [key,value[key]];
      }); 
      break;
    case('o-horizontal'):
      output = rows.map(function(row){  
        //requires that column names are specified in header
        return config.table.header[0].map(function(object){
          return row[object.value] || null;    
        });
      });
      break;
    case('a-horizontal'):
      output = rows;
      break;
    default:
  }

  return output;
}

module.exports = Render;
