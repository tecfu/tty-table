var Merge = require("merge");
var Format = require('./format.js');
var Render = require('./render.js');

//table body inherits from Array
var Cls = Object.create(Array.prototype);

//make sure config is unique for each export
var Config; 

/**
* @class Table
* @param {array} header													- [See example](#example-usage)
* @param {object} header.column									- Column options
* @param {function} header.column.formatter			- Runs a callback on each cell value in the parent column
* @param {number} header.column.marginLeft				- default: 0
* @param {number} header.column.marginTop				- default: 0			
* @param {number} header.column.maxWidth					- default: 20 
* @param {number} header.column.paddingBottom		- default: 0
* @param {number} header.column.paddingLeft			- default: 0
* @param {number} header.column.paddingRight			- default: 0
* @param {number} header.column.paddingTop				- default: 0	
* @param {string} header.column.alias						- Alernate header column name
* @param {string} header.column.align						- default: "center"
* @param {string} header.column.color						- default: terminal default color
* @param {string} header.column.headerAlign			- default: "center" 
* @param {string} header.column.headerColor			- default: terminal default color
* @param {string} header.column.footerAlign			- default: "center" 
* @param {string} header.column.footerColor			- default: terminal default color
*
* @param {array} rows											- [See example](#example-usage)
*
* @param {object} options									- Table options 
* @param {number} options.borderStyle			- default: 1 (0 = no border) 
* Refers to the index of the desired character set. 
* @param {array} options.borderCharacters	- [See @note](#note) 
* @returns {Table}
* @note
* <a name="note"/>
* Default border character sets:
* ```
*	[
*		[
*			{v: " ", l: " ", j: " ", h: " ", r: " "},
*			{v: " ", l: " ", j: " ", h: " ", r: " "},
*			{v: " ", l: " ", j: " ", h: " ", r: " "}
*		],
*		[
*			{v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
*			{v: "│", l: "├", j: "┼", h: "─", r: "┤"},
*			{v: "│", l: "└", j: "┴", h: "─", r: "┘"}
*		],
*		[
*			{v: "|", l: "+", j: "+", h: "-", r: "+"},
*			{v: "|", l: "+", j: "+", h: "-", r: "+"},
*			{v: "|", l: "+", j: "+", h: "-", r: "+"}
*		]
*	]
* ```
* @example
* ```
* var Table = require('tty-table');
* var t1 = Table(header,rows,options);
* console.log(t1.render()); 
* ```
*
*/
Cls.setup = function(){
	
	//check if adapter required
	if(typeof arguments[0] === 'string'){
		switch(true){
			case(arguments[0] === 'cli-table'):
				return require('./cli-table-adapter.js');
			default:
				console.error("Adapter: "+arguments[0]+" not recognized.");
		}
	}

	Config = require('./config.js');
	
	var	options = (typeof arguments[3] === 'object') ? arguments[3] : 
			(typeof arguments[2] === 'object') ? arguments[2] : {};
	Config = Merge(true,Config,options);

	Config.table.header = arguments[0] || []; 
	
	Config.table.body = arguments[1] || [];	
	
	Config.table.footer = (arguments[2] instanceof Array) ? arguments[2] : [];

	//backfixes for shortened option names
	Config.align = Config.alignment || Config.align;
	Config.headerAlign = Config.headerAlignment || Config.headerAlign;
	
	//make sure Config.table.header is an array of empty objects if does not exist	
	if(typeof Config.table.header === 'undefined' 
		 || !(Config.table.header instanceof Array)
		 || Config.table.header.length === 0){

		//note that header was not passed with values
		Config.headerEmpty = true;

		//create an array with same length as first row in body
		//& populate array with default maxWidth
		Config.table.header = Array
			.apply(null, Array(Cls[0].length))
			.map(Boolean)
			.map(function(){
				return {
					//default the width
					width : Config.maxWidth
				}
			});
	}
	
	Config.table.columnWidths = Format.getColumnWidths(Config,Config.table.header);

	//save a copy for merging columnOptions into cell options
	Config.columnOptions = Config.table.header.slice(0); 
	
	//match header geometry of with body array	
	Config.table.header = [Config.table.header];

	return Cls;
}


/**
 * Renders a table to a string
 * @returns {String}
 * @memberof Table 
 * @example 
 * ```
 * var str = t1.render(); 
 * console.log(str); //outputs table
 * ```
*/
Cls.render = function(){
	
	var str = '',
			part = ['header','body','footer'],
			marginLeft = Array(Config.marginLeft + 1).join('\ '),
			bS = Config.borderCharacters[Config.borderStyle],
			borders = [];

	//stringify header 
	if(Config.headerEmpty === false){
		Config.table.header = Config.table.header.map(function(row){
			return Render.buildRow(Config,row,'header');
		});
	}
	
	//combine body rows added by constructor & instance.push	
	Config.table.body = [].concat(Config.table.body,this.slice(0));
	
	//stringify body
	Config.table.body = Config.table.body.map(function(row){
		return Render.buildRow(Config,row,'body');
	});

	//stringify footer
	Config.table.footer = (Config.table.footer instanceof Array && Config.table.footer.length > 0) ? [Config.table.footer] : [];
	Config.table.footer = Config.table.footer.map(function(row){
		return Render.buildRow(Config,row,'footer');
	});

	//add borders
	for(var a=0;a<3;a++){
		borders.push('');
		Config.table.columnWidths.forEach(function(w,i,arr){
			borders[a] += Array(w).join(bS[a].h) +
				((i+1 !== arr.length) ? bS[a].j : bS[a].r);
		});
		borders[a] = bS[a].l + borders[a];
		borders[a] = borders[a].split('');
		borders[a][borders[a].length1] = bS[a].r;
		borders[a] = borders[a].join('');
		borders[a] = marginLeft + borders[a] + '\n';
	}
	
	//Top horizontal border
	str += borders[0];

	//Rows
	var row;
	part.forEach(function(p,i){
		while(Config.table[p].length){
			
			row = Config.table[p].shift();
		
			if(row.length === 0) {break}

			row.forEach(function(line){
				str = str 
					+ marginLeft 
					+ bS[1].v
					+	line.join(bS[1].v) 
					+ bS[1].v
					+ '\n';
			});
		
			//Adds bottom horizontal row border
			switch(true){
				//If end of body and no footer, skip
				case(Config.table[p].length === 0 
						 && i === 1 
						 && Config.table.footer.length === 0):
					break;
				//if end of footer, skip
				case(Config.table[p].length === 0 
						 && i === 2):
					break;
				default:
					str += borders[1];
			}	
		}
	});
	
	//Bottom horizontal border
	str += borders[2];

	return Array(Config.marginTop + 1).join('\n') + str;
}	

module.exports = Cls;
