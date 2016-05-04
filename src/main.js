var Merge = require("merge"),
		Chalk = require("chalk"),
		StripAnsi = require("strip-ansi"),
		Wrap = require("word-wrap");


var cls = function(){


	var _public = this._public = {},
			_private = this._private = {};


	/** 
	 * Private Variables
	 *
	 */


	_private.defaults = {
		defaultValue : (function(){
			return (typeof Chalk !== 'undefined') ? Chalk.red("#ERR") : "#ERR";
		}()),
		marginTop : 1,
		marginLeft : 2,
		maxWidth : 20,
		formatter : null,
		headerAlign : "center",
		footerAlign : "center",
		align : "center",
		paddingRight : 0,
		paddingLeft : 0,
		paddingBottom : 0,
		paddingTop : 0,
		color : false,
		headerColor : false,
		footerColor : false,
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

	_private.GUTTER = 1;
	
	_private.header = []; //saved so cell options can be merged into 
												//column options
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


	_private.buildRow = function(row,rowType){
		var minRowHeight = 0;
		
		//support both rows passed as an array 
		//and rows passed as an object
		if(typeof row === 'object' && !(row instanceof Array)){
			row =	_private.table.columns.map(function(object){
				return row[object.value] || null;		
			});
		}
		else{
			//equalize array lengths
			var difL = _private.table.columnWidths.length - row.length;
			if(difL > 0){
				//add empty element to array
				row = row.concat(Array.apply(null, new Array(difL))
															.map(function(){return null})); 
			}
			else if(difL < 0){
				//truncate array
				row.length = _private.table.columnWidths.length;
			}
		}

		//get row as array of cell arrays
		var cArrs = row.map(function(cell,index){
			var c = _private.buildCell(cell,index,rowType);
			var cellArr = c.cellArr;
			if(rowType === 'header'){
				_private.table.columnInnerWidths.push(c.width);
			}
			minRowHeight = (minRowHeight < cellArr.length) ? 
				cellArr.length : minRowHeight;
			return cellArr;
		});

		//Adjust minRowHeight to reflect vertical row padding
		minRowHeight = (rowType === 'header') ? minRowHeight :
			minRowHeight + 
			(_public.options.paddingBottom + 
			 _public.options.paddingTop);

		//convert array of cell arrays to array of lines
		var lines = Array.apply(null,{length:minRowHeight})
			.map(Function.call,function(){return []});

		cArrs.forEach(function(cellArr,a){
			var whiteline = Array(_private.table.columnWidths[a]).join('\ ');
			if(rowType ==='body'){
				//Add whitespace for top padding
				for(var i=0; i<_public.options.paddingTop; i++){
					cellArr.unshift(whiteline);
				}
				
				//Add whitespace for bottom padding
				for(i=0; i<_public.options.paddingBottom; i++){
					cellArr.push(whiteline);
				}
			}	
			for(var b=0; b<minRowHeight; b++){	
				lines[b].push((typeof cellArr[b] !== 'undefined') ? 
											cellArr[b] : whiteline);
			}
		});

		return lines;
	};

	_private.buildCell = function(cell,columnIndex,rowType){

		var cellValue, 
				cellOptions = Merge(true,
														_public.options,
														(rowType === 'body') ? 
															_private.header[columnIndex] : {}, //ignore columnOptions for footer
														cell);		
		
		if(rowType === 'header'){
			cell = Merge(true,_public.options,cell);
			_private.table.columns.push(cell);
			cellValue = cell.alias || cell.value;
		}	
		else{
			if(typeof cell === 'object' && cell !== null){	
				cellValue = cell.value;
			}	
			else{
				cellValue = cell;
			}

			//Replace undefined/null cell values with placeholder
			cellValue = (typeof cellValue === 'undefined' || cellValue === null) ? 
				_public.options.defaultValue : cellValue;
						
			//Run formatter
			if(typeof cellOptions.formatter === 'function'){
				cellValue = cellOptions.formatter(cellValue);
			}
		}
		
		//colorize cellValue
		cellValue = _private.colorizeCell(cellValue,cellOptions,rowType);	

		//textwrap cellValue
		var WrapObj  = _private.wrapCellContent(cellValue,
																						columnIndex,
																						cellOptions,
																						rowType);
		cellValue = WrapObj.output;

		//return as array of lines
		return {
			cellArr : cellValue.split('\n'),
			width : WrapObj.width
		};
	};

/*
	_private.colorizeAllWords = function(color,str){
		//Color each word in the cell so that line breaks don't break color 
		var arr = str.replace(/(\S+)/gi,function(match){
			return Chalk[color](match)+'\ ';
		});
		return arr;
	};
*/

	_private.colorizeCell = function(str,cellOptions,rowType){
		
		var color = false; //false will keep terminal default
		
		switch(true){
			case(rowType === 'body'):
				color = cellOptions.color || color;
				break;
			case(rowType === 'header'):
				color = cellOptions.headerColor || color;	
				break;
			default:
				color = cellOptions.footerColor || color;
		}
		
		if (color){
			str = Chalk[color](str);
		}

		return str;
	};

	_private.calculateLength = function (line) {
		return StripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length;
	};

	_private.wrapCellContent = function(cellValue,
																			columnIndex,
																			cellOptions,
																			rowType){
																				 
		//remove ANSI color codes from the beginning and end of string
		var string = cellValue.toString(), 
				startAnsiRegexp = /^(\033\[[0-9;]*m)+/,
				endAnsiRegexp = /(\033\[[0-9;]*m)+$/,
				startMatches = string.match(startAnsiRegexp),
				endMatches = string.match(endAnsiRegexp),
				startFound = false,
				endFound = false;
		
		if(startMatches instanceof Array && startMatches.length > 0){
			startFound = true;
			string = string.replace(startAnsiRegexp,'');
		}

		if(endMatches instanceof Array && endMatches.length > 0){
			endFound = true;	
			string = string.replace(endAnsiRegexp,'');
		}


		var alignTgt;
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

		//Equalize padding for centered lines 
		if(cellOptions[alignTgt] === 'center'){	
			cellOptions.paddingLeft = cellOptions.paddingRight =
				Math.max(cellOptions.paddingRight,cellOptions.paddingLeft,0);
		}

		var width = _private.table.columnWidths[columnIndex],
				innerWidth = width - cellOptions.paddingLeft -
										cellOptions.paddingRight -
										_private.GUTTER; //border/gutter
		
				if (string.length < _private.calculateLength(string)) {
			//Wrap Asian characters
			var count = 0;
			var start = 0;
			var characters = string.split('');

			string = characters.reduce(function (prev, cellValue, i) {
				count += _private.calculateLength(cellValue);
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
			string = Wrap(string,{
				width : innerWidth - 
								cellOptions.paddingLeft -
								cellOptions.paddingRight,
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

			//alignment 
			if(lineLength < width){
				var emptySpace = width - lineLength; 
				switch(true){
					case(cellOptions[alignTgt] === 'center'):
						emptySpace --;
						var padBoth = Math.floor(emptySpace / 2), 
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
			if(startFound){
				line = startMatches[0] + line;
			}
			if(endFound){
				line = line + endMatches[0];
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


	_private.setup = function(header,body,footer,options){
		
		_public.options = Merge(true,_private.defaults,options);
		
		//backfixes for shortened option names
		_public.options.align = _public.options.alignment || _public.options.align;
		_public.options.headerAlign = _public.options.headerAlignment || _public.options.headerAlign;
		
		_private.table.columnWidths = _private.getColumnWidths(header);

		//Build header
		_private.header = header; //save for merging columnOptions into cell options
		header = [header];
		_private.table.header = header.map(function(row){
			return _private.buildRow(row,'header');
		});

		//Build body
		_private.table.body = body.map(function(row){
			return _private.buildRow(row,'body');
		});

		//Build footer
		footer = (footer.length > 0) ? [footer] : [];
		_private.table.footer = footer.map(function(row){
			return _private.buildRow(row,'footer');
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
				part = ['header','body','footer'],
				marginLeft = Array(_public.options.marginLeft + 1).join('\ '),
				bS = _public.options.borderCharacters[_public.options.borderStyle],
				borders = [];

		//Borders
		for(var a=0;a<3;a++){
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
		
		//Top horizontal border
		str += borders[0];

		//Rows
		var row;
		part.forEach(function(p,i){
			while(_private.table[p].length){
				
				row = _private.table[p].shift();
			
				if(row.length === 0) break;

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
					case(_private.table[p].length === 0 
							 && i === 1 
							 && _private.table.footer.length === 0):
						break;
					//if end of footer, skip
					case(_private.table[p].length === 0 
							 && i === 2):
						break;
					default:
						str += borders[1];
				}	
			}
		});
		
		//Bottom horizontal border
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
 * Table(header,rows,options);
 * ```
 *
 */
module.exports = function(){
	var o = new cls(),
			header = arguments[0], 
			body = arguments[1], 
			footer = (arguments[2] instanceof Array) ? arguments[2] : [], 
			options = (typeof arguments[3] === 'object') ? arguments[3] : 
				(typeof arguments[2] === 'object') ? arguments[2] : {};
	
	return o._private.setup(header,body,footer,options);
};
