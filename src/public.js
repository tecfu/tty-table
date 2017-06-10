let Merge = require("merge");
let Render = require('./render.js');

//table body inherits from Array
let Cls = Object.create(Array.prototype);

//make sure config is unique for each export
let Config; 

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
* @param {number} header.column.marginLeft      - default: 0
* @param {number} header.column.marginTop        - default: 0      
* @param {number} header.column.maxWidth        - default: 20 
* @param {number} header.column.paddingBottom    - default: 0
* @param {number} header.column.paddingLeft      - default: 0
* @param {number} header.column.paddingRight    - default: 0
* @param {number} header.column.paddingTop      - default: 0  
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
* [
*  {v: " ", l: " ", j: " ", h: " ", r: " "},
*  {v: " ", l: " ", j: " ", h: " ", r: " "},
*  {v: " ", l: " ", j: " ", h: " ", r: " "}
* ],
* [
*  {v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
*  {v: "│", l: "├", j: "┼", h: "─", r: "┤"},
*  {v: "│", l: "└", j: "┴", h: "─", r: "┘"}
* ],
* [
*  {v: "|", l: "+", j: "+", h: "-", r: "+"},
*  {v: "|", l: "+", j: "+", h: "-", r: "+"},
*  {v: "|", l: "+", j: "+", h: "-", r: "+"}
* ]
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
Cls.setup = function(){

  //check if syntax adapter called, i.e. github.com/Automattic/cli-table
  if(Object.keys(arguments).length === 1 &&
     typeof arguments[0] === 'string'){
    return require('../'+arguments[0]);
  }

  Config = require('./config.js');

  let  options = (typeof arguments[3] === 'object') ? arguments[3] : 
      (typeof arguments[2] === 'object') ? arguments[2] : {};

  Config = Merge(true,Config,options);

  //backfixes for shortened option names
  Config.align = Config.alignment || Config.align;
  
  Config.headerAlign = Config.headerAlignment || Config.headerAlign;

  if(arguments[0] && arguments[0] instanceof Array && arguments[0].length){
    Config.table.header = arguments[0]; 
  }
  else{
    Config.table.header = []; 
    Config.headerEmpty = true;
  }

  //save a copy for merging columnSettings into cell options
  Config.columnSettings = Config.table.header.slice(0); 

  //if borderColor is called, lets do it now
  if(Config.borderColor !== null){
    let Chalk = require('chalk')
    
    Config.borderCharacters[Config.borderStyle] = 
      Config.borderCharacters[Config.borderStyle].map(function(obj){
        Object.keys(obj).forEach(function(key){
           obj[key] = Chalk[Config.borderColor](obj[key]);
        })
        return obj;
      });
  }

  //match header geometry with body array  
  Config.table.header = [Config.table.header];
  
  //pushed body data into instance prototype
  if(arguments[1] && arguments[1] instanceof Array){
    arguments[1].forEach(function(val){
      Cls.push(val);
    });
  }  

  Config.table.footer = (arguments[2] instanceof Array) ? arguments[2] : [];
  
  return Cls;
}


/**
 * Renders a table to a string
 * @returns {String}
 * @memberof Table 
 * @example 
 * ```js
 * let str = t1.render(); 
 * console.log(str); //outputs table
 * ```
*/
Cls.render = function(){
  
  //get sring output
  let output = Render.stringifyData.call(this,Config,this);

  return output;
}  

module.exports = Cls;
