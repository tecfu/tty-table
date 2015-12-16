var merge = require("merge"),
		chalk = require("chalk"),
		stripAnsi = require("strip-ansi"),
		wrap = require("word-wrap");


var cls = function(){


	var _public = this._public = {},
			_private = this._private = {};


	/** 
	 * Private Variables
	 *
	 */


	_private.defaults = {
		defaultValue : function(){
			return (typeof chalk !== 'undefined') ? chalk.red("#ERR") : "#ERR";
			//return 'null';
		}(),
		marginTop : 1,
		marginLeft : 2,
		maxWidth : 20,
		formatter : null,
		headerAlign : "center",
		align : "center",
		paddingRight : 0,
		paddingLeft : 0,
		paddingBottom : 0,
		paddingTop : 0,
		color : false,
		headerColor : false,
		borderStyle : 1,
		borderCharacters : [
			[
				{v: " ", l: " ", j: " ", h: " ", r: " "},
				{v: " ", l: " ", j: " ", h: " ", r: " "},
				{v: " ", l: " ", j: " ", h: " ", r: " "}
			],
			[
				{v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
				{v: "│", l: "├", j: "┼", h: "─", r: "┤"},
				{v: "│", l: "└", j: "┴", h: "─", r: "┘"}
			],
			[
				{v: "|", l: "+", j: "+", h: "-", r: "+"},
				{v: "|", l: "+", j: "+", h: "-", r: "+"},
				{v: "|", l: "+", j: "+", h: "-", r: "+"}
			]
		]
	};


	//Constants
	_private.GUTTER = 1;


	_private.table = {
		columns : [],
		columnWidths : [],
		columnInnerWidths : [],
		header : [],
		body : []
	};


	/**
	 * Private Methods
	 *
	 */


	_private.buildRow = function(row,options){
		options = options || {};
		var minRowHeight = 0;
		
		//support both rows passed as an array 
		//and rows passed as an object
		if(typeof row === 'object' && !(row instanceof Array)){
			row =	_private.table.columns.map(function(object){
				return row[object.value] || null;		
			});
		}
		else{
			//Enforce row size
			var difL = _private.table.columnWidths.length - row.length;
			if(difL > 0){
				//Add null element to array
				row = row.concat(Array.apply(null, new Array(difL))
															.map(function(){return null})); 
			}
			else if(difL < 0){
				//Truncate array
				row.length = _private.table.columnWidths.length;
			}
		}

		//get row as array of cell arrays
		var cArrs = row.map(function(cell,index){
			var c = _private.buildCell(cell,index,options);
			var cellArr = c.cellArr;
			if(options.header){
				_private.table.columnInnerWidths.push(c.width);
			}
			minRowHeight = (minRowHeight < cellArr.length) ? cellArr.length : minRowHeight;
			return cellArr;
		});

		//Adjust minRowHeight to reflect vertical row padding
		minRowHeight = (options.header) ? minRowHeight : minRowHeight + 
			(_public.options.paddingBottom + _public.options.paddingTop);

		//convert array of cell arrays to array of lines
		var lines = Array.apply(null,{length:minRowHeight})
			.map(Function.call,function(){return []});

		cArrs.forEach(function(cellArr,a){
			var whiteline = Array(_private.table.columnWidths[a]).join('\ ');
			if(!options.header){
				//Add whitespace for top padding
				for(i=0; i<_public.options.paddingTop; i++){
					cellArr.unshift(whiteline);
				}
				
				//Add whitespace for bottom padding
				for(i=0; i<_public.options.paddingBottom; i++){
					cellArr.push(whiteline);
				}
			}	
			for(var b=0; b<minRowHeight; b++){	
				lines[b].push((typeof cellArr[b] != 'undefined') ? cellArr[b] : whiteline);
			}
		});

		return lines;
	};

	_private.buildCell = function(cell,columnIndex,options){

		//Pull column options	
		var output;
		options = options || {};
		
		if(options && options.header){
			cell = merge(true,_public.options,cell);
			_private.table.columns.push(cell);
			output = cell.alias || cell.value;
			columnOptions = cell;
		}	
		else{
			columnOptions = _private.table.columns[columnIndex];
			if(typeof cell === 'object' && cell !== null){	
				columnOptions = merge(true,columnOptions,cell);		
				output = cell.value;
			}	
			else{
				output = cell;
			}

			//Replace undefined/null cell values with placeholder
			output = (typeof output === 'undefined' || output === null) ? 
				_public.options.defaultValue : output;
						
			//Run formatter
			if(typeof columnOptions.formatter === 'function'){
				output = columnOptions.formatter(output);
			}
		}
		
		//Automatic text wrap
		var wrapObj  = _private.wrapCellContent(output,columnIndex,columnOptions,
										(options && options.header) ? "header" : "body");
		output = wrapObj.output;
		
		//return as array of lines
		return {
			cellArr : output.split('\n'),
			width : wrapObj.width
		};
	};

	_private.colorizeAllWords = function(color,str){
		//Color each word in the cell so that line breaks don't break color 
		var arr = str.replace(/(\S+)/gi,function(match){
			return chalk[color](match)+'\ ';
		});
		return arr;
	};

	_private.colorizeLine = function(color,str){
		return chalk[color](str);
	};

	_private.calculateLength = function (line) {
		return stripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length;
	};

	_private.wrapCellContent = function(value,columnIndex,columnOptions,rowType){
	
		//Equalize padding for centered lines 
		if(columnOptions[alignTgt] === 'center'){	
			columnOptions.paddingLeft = columnOptions.paddingRight =
				Math.max(columnOptions.paddingRight,columnOptions.paddingLeft,0);
		}

		var string = value.toString(),
				width = _private.table.columnWidths[columnIndex],
				innerWidth = width - columnOptions.paddingLeft -
										columnOptions.paddingRight -
										_private.GUTTER; //border/gutter
		
		var alignTgt = (rowType === 'header') ? "headerAlign" : "align";

		if (string.length < _private.calculateLength(string)) {
			//Wrap Asian characters
			var count = 0;
			var start = 0;
			var characters = string.split('');

			string = characters.reduce(function (prev, value, i) {
				count += _private.calculateLength(value);
				if (count > innerWidth) {
					prev.push(string.slice(start, i));
					start = i;
					count = 0;
				} else if (characters.length === i + 1) {
					prev.push(string.slice(start));
				}

				return prev;
			}, []).join('\n');
		} else {
			
			string = wrap(string,{
				width : innerWidth - 
								columnOptions.paddingLeft -
								columnOptions.paddingRight,
				trim : true,
				indent : ''
			});
		}

		//Break string into array of lines
		var strArr = string.split('\n');

		//Format each line
		strArr = strArr.map(function(line){

			line = line.trim();	
			var lineLength = _private.calculateLength(line);

			//align 
			if(lineLength < width){
				var emptySpace = width - lineLength; 
				switch(true){
					case(columnOptions[alignTgt] === 'center'):
						emptySpace --;
						var padBoth = Math.floor(emptySpace / 2), 
								padRemainder = emptySpace % 2;
						line = Array(padBoth + 1).join(' ') + 
							line +
							Array(padBoth + 1 + padRemainder).join(' ');
						break;
					case(columnOptions[alignTgt] === 'right'):
						line = Array(emptySpace - columnOptions.paddingRight).join(' ') + 
									 line + 
									 Array(columnOptions.paddingRight + 1).join(' ');
						break;
					default:
						line = Array(columnOptions.paddingLeft + 1).join(' ') +
									 line + Array(emptySpace - columnOptions.paddingLeft).join(' ');
				}
			}
			
			//Apply colors
			switch(true){
				case(rowType === 'header'):
					line = (columnOptions.color || _public.options.color) ? 
						_private.colorizeLine(columnOptions.headerColor || _public.options.color,line) : 
						line;
					break;
				case(typeof columnOptions.color === 'string'):
					line = _private.colorizeLine(columnOptions.color,line);
					break;
				case(typeof _public.options.color === 'string'):
					line = _private.colorizeLine(_public.options.color,line);
					break;
				default:
			}
			
			return line;
		});

		string = strArr.join('\n');
		
		return {
			output : string,
			width : innerWidth
		};
	};

	_private.getColumnWidths = function(row){
		//Widths as prescribed
		var widths = row.map(function(cell){
			if(typeof cell === 'object' && typeof cell.width !=='undefined'){
				return cell.width;
			}
			else{
				return _public.options.maxWidth;
			}
		});

		//Check to make sure widths will fit the current display, or resize.
		var totalWidth = widths.reduce(function(prev,curr){
			return prev+curr;
		});
		//Add marginLeft to totalWidth
		totalWidth += _public.options.marginLeft;

		//Check process exists in case we are in browser
		if(process && process.stdout && totalWidth > process.stdout.columns){
			//recalculate proportionately to fit size
			var prop = process.stdout.columns / totalWidth;
			prop = prop.toFixed(2)-0.01;
			widths = widths.map(function(value){
				return Math.floor(prop*value);
			});
		}

		return widths;
	};


	/** 
	 * Public Variables
	 *
	 */


	_public.options = {};


	/**
	 * Public Methods
	 *
	 */


	_private.setup = function(header,body,options){
		
		_public.options = merge(true,_private.defaults,options);

		//backfixes for shortened option names
		_public.options.align = _public.options.alignment || _public.options.align;
		_public.options.headerAlign = _public.options.headerAlignment || _public.options.headerAlign;
		
		_private.table.columnWidths = _private.getColumnWidths(header);

		header = [header];
		_private.table.header = header.map(function(row){
			return _private.buildRow(row,{
				header:true
			});
		});

		_private.table.body = body.map(function(row){
			return _private.buildRow(row);
		});

		return _public;
	};


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
	_public.render = function(){
		var str = '',
				part = ['header','body'],
				bArr = [],
				marginLeft = Array(_public.options.marginLeft + 1).join('\ '),
				bS = _public.options.borderCharacters[_public.options.borderStyle],
				borders = [];

		//Borders
		for(a=0;a<3;a++){
			borders.push('');
			_private.table.columnWidths.forEach(function(w,i,arr){
				borders[a] += Array(w).join(bS[a].h) +
					((i+1 !== arr.length) ? bS[a].j : bS[a].r);
			});
			borders[a] = bS[a].l + borders[a];
			borders[a] = borders[a].split('');
			borders[a][borders[a].length1] = bS[a].r;
			borders[a] = borders[a].join('');
			borders[a] = marginLeft + borders[a] + '\n';
		}
		
		str += borders[0];

		//Rows
		part.forEach(function(p,i){
			while(_private.table[p].length){
				row = _private.table[p].shift();
			
				row.forEach(function(line){
					str = str 
						+ marginLeft 
						+ bS[1].v
						+	line.join(bS[1].v) 
						+ bS[1].v
						+ '\n';
				});
				
				//Joining border
				if(!(i==1 && _private.table[p].length===0)){
					str += borders[1];
				}
			}	
		});
		
		//Bottom border
		str += borders[2];

		return Array(_public.options.marginTop + 1).join('\n') + str;
	}	

};


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
 * Table(header,rows,options);
 * ```
 *
 */
module.exports = function(header,rows,options){
	var o = new cls();
	return o._private.setup(header,rows,options);
};
