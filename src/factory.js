let Merge = require('merge');
let Defaults = require('./config.js');
let Counter = 0;

/**
* @class Table
* @param {array} header                          - [See example](#example-usage)
* @param {object} header.column                  - Column options
* @param {string} header.column.alias            - Alernate header column name
* @param {string} header.column.align            - default: "center"
* @param {string} header.column.color            - default: terminal default color
* @param {string} header.column.footerAlign      - default: "center" 
* @param {string} header.column.footerColor      - default: terminal default color
* @param {function} header.column.formatter      - Runs a callback on each cell value in the parent column
* @param {string} header.column.headerAlign      - default: "center" 
* @param {string} header.column.headerColor      - default: terminal's default color
* @param {number} header.column.marginLeft       - default: 0
* @param {number} header.column.marginTop        - default: 0      
* @param {string|number} header.column.width     - default: "auto"
* @param {number} header.column.paddingBottom    - default: 0
* @param {number} header.column.paddingLeft      - default: 1
* @param {number} header.column.paddingRight     - default: 1
* @param {number} header.column.paddingTop       - default: 0  
*
* @param {array} rows                      - [See example](#example-usage)
*
* @param {object} options                  - Table options 
* @param {number} options.borderStyle      - default: 1 (0 = no border) 
* Refers to the index of the desired character set. 
* @param {array} options.borderCharacters  - [See @note](#note) 
* @param {string} options.borderColor      - default: terminal's default color
* @param {boolean} options.compact      - default: false
* Removes horizontal lines when true.
* @param {mixed} options.defaultErrorValue - default: 'ERROR!'
* @param {mixed} options.defaultValue - default: '?'
* @param {boolean} options.errorOnNull    - default: false
* @param {mixed} options.truncate - default: false 
* <br/>
* When this property is set to a string, cell contents will be truncated by that string instead of wrapped when they extend beyond of the width of the cell. 
* <br/>
* For example if: 
* <br/>
* <code>"truncate":"..."</code>
* <br/>
* the cell will be truncated with "..."

* @returns {Table}
* @note
* <a name="note"/>
* Default border character sets:
* ```js
*[
*  [
*    {v: " ", l: " ", j: " ", h: " ", r: " "},
*    {v: " ", l: " ", j: " ", h: " ", r: " "},
*    {v: " ", l: " ", j: " ", h: " ", r: " "}
*  ],
*  [
*    {v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
*    {v: "│", l: "├", j: "┼", h: "─", r: "┤"},
*    {v: "│", l: "└", j: "┴", h: "─", r: "┘"}
*  ],
*  [
*    {v: "|", l: "+", j: "+", h: "-", r: "+"},
*    {v: "|", l: "+", j: "+", h: "-", r: "+"},
*    {v: "|", l: "+", j: "+", h: "-", r: "+"}
*  ]
*]
* ```
* @example
* ```js
* let Table = require('tty-table');
* let t1 = Table(header,rows,options);
* console.log(t1.render()); 
* ```
*
*/
let Factory = function(paramsArr){

  let _configKey = Symbol['config'];
  let header = [];
  let body = [];
  let footer = [];
  let options = {};
  
  //handle different parameter scenarios
  switch(true){
    
    //header, rows, footer, and options
    case(paramsArr.length === 4): 
      header = paramsArr[0];
      body.push(...paramsArr[1]); //creates new array to store our rows (body)
      footer = paramsArr[2];
      options = paramsArr[3];
      break;
    
    //header, rows, footer
    case(paramsArr.length === 3 && paramsArr[2] instanceof Array): 
      header = paramsArr[0];
      body.push(...paramsArr[1]); //creates new array to store our rows
      footer = paramsArr[2];
      break;
   
    //header, rows, options
    case(paramsArr.length === 3 && typeof paramsArr[2] === 'object'): 
      header = paramsArr[0];
      body.push(...paramsArr[1]); //creates new array to store our rows
      options = paramsArr[2];
      break;

    //header, rows            (rows, footer is not an option)
    case(paramsArr.length === 2 && paramsArr[1] instanceof Array): 
      header = paramsArr[0];
      body.push(...paramsArr[1]); //creates new array to store our rows
      break;

    //rows, options
    case(paramsArr.length === 2 && typeof paramsArr[1] === 'object'): 
      body.push(...paramsArr[0]); //creates new array to store our rows
      options = paramsArr[1];
      break;

    //rows
    case(paramsArr.length === 1 && paramsArr[0] instanceof Array):
      body.push(...paramsArr[0]);
      break;
         
    //adapter called          i.e. require('tty-table')('automattic-cli')
    case(paramsArr.length === 1 && typeof paramsArr[0] === 'string'):
      return require('../adapters/' + paramsArr[0]);
    
    default:
      console.log("Error: Bad params. \nSee docs at github.com/tecfu/tty-table");
      process.exit();
  }
  
  let config = Merge(true,Defaults,options);
  
  //backfixes for shortened option names
  config.align = config.alignment || config.align;
  config.headerAlign = config.headerAlignment || config.headerAlign;

  //if borderColor is called, lets do it now
  if(!!config.borderColor){
    let Chalk = require('chalk')
    
    config.borderCharacters[config.borderStyle] = 
      config.borderCharacters[config.borderStyle].map(function(obj){
        Object.keys(obj).forEach(function(key){
           obj[key] = Chalk[config.borderColor](obj[key]);
        })
        return obj;
      });
  }
 
  //save a copy for merging columnSettings into cell options
  config.columnSettings = header.slice(0); 

  //header
  config.table.header = header;
  config.headerEmpty = (header.length === 0) ? true : false;
  
  //match header geometry with body array  
  config.table.header = [config.table.header];
  
  //footer
  config.table.footer = footer;
 
  //counting table enables fixed column widths for streams, 
  //variable widths for multiple tables simulateously 
  if(config.terminalAdapter !== true){
    Counter++; //fix columnwidths for streams
  }
  config.tableId = Counter;
  
  //create a new object with an Array prototype
  let tableObject = Object.create(body);
  
  //save configuration to new object
  tableObject[_configKey] = config; 
  
  /**
   * Add method to render table to a string
   * @returns {String}
   * @memberof Table 
   * @example 
   * ```js
   * let str = t1.render(); 
   * console.log(str); //outputs table
   * ```
  */
  tableObject.render = function(){
    let Render = require('./render.js');
    //let configCopy = JSON.parse(JSON.stringify(this[_configKey]));
    //return Render.stringifyData(configCopy,this.slice(0));  //get string output
    let output = Render.stringifyData(this[_configKey],this.slice(0));  //get string output
    tableObject.height = this[_configKey].height;
    return output;
  }

  return tableObject;
}

module.exports = function(){
  return new Factory(arguments);
}
