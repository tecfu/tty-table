(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TtyTable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/src/main.js":[function(require,module,exports){
(function (process){
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

}).call(this,require('_process'))

},{"_process":1,"chalk":2,"merge":8,"strip-ansi":9,"word-wrap":11}],2:[function(require,module,exports){
(function (process){
'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var ansiStyles = require('ansi-styles');
var stripAnsi = require('strip-ansi');
var hasAnsi = require('has-ansi');
var supportsColor = require('supports-color');
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

module.exports = new Chalk();
module.exports.styles = ansiStyles;
module.exports.hasColor = hasAnsi;
module.exports.stripColor = stripAnsi;
module.exports.supportsColor = supportsColor;

}).call(this,require('_process'))

},{"_process":1,"ansi-styles":3,"escape-string-regexp":4,"has-ansi":5,"strip-ansi":9,"supports-color":7}],3:[function(require,module,exports){
'use strict';

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{}],4:[function(require,module,exports){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe,  '\\$&');
};

},{}],5:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex');
var re = new RegExp(ansiRegex().source); // remove the `g` flag
module.exports = re.test.bind(re);

},{"ansi-regex":6}],6:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
};

},{}],7:[function(require,module,exports){
(function (process){
'use strict';
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

module.exports = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))

},{"_process":1}],8:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.2.0
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	/**
	 * Merge one or more objects 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	var Public = function(clone) {

		return merge(clone === true, false, arguments);

	}, publicName = 'merge';

	/**
	 * Merge two or more objects recursively 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	Public.recursive = function(clone) {

		return merge(clone === true, true, arguments);

	};

	/**
	 * Clone the input removing any reference
	 * @param mixed input
	 * @return mixed
	 */

	Public.clone = function(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = Public.clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = Public.clone(input[index]);

		}

		return output;

	};

	/**
	 * Merge two objects recursively
	 * @param mixed input
	 * @param mixed extend
	 * @return mixed
	 */

	function merge_recursive(base, extend) {

		if (typeOf(base) !== 'object')

			return extend;

		for (var key in extend) {

			if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

				base[key] = merge_recursive(base[key], extend[key]);

			} else {

				base[key] = extend[key];

			}

		}

		return base;

	}

	/**
	 * Merge two or more objects
	 * @param bool clone
	 * @param bool recursive
	 * @param array argv
	 * @return object
	 */

	function merge(clone, recursive, argv) {

		var result = argv[0],
			size = argv.length;

		if (clone || typeOf(result) !== 'object')

			result = {};

		for (var index=0;index<size;++index) {

			var item = argv[index],

				type = typeOf(item);

			if (type !== 'object') continue;

			for (var key in item) {

				var sitem = clone ? Public.clone(item[key]) : item[key];

				if (recursive) {

					result[key] = merge_recursive(result[key], sitem);

				} else {

					result[key] = sitem;

				}

			}

		}

		return result;

	}

	/**
	 * Get type of variable
	 * @param mixed input
	 * @return string
	 *
	 * @see http://jsperf.com/typeofvar
	 */

	function typeOf(input) {

		return ({}).toString.call(input).slice(8, -1).toLowerCase();

	}

	if (isNode) {

		module.exports = Public;

	} else {

		window[publicName] = Public;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],9:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":10}],10:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],11:[function(require,module,exports){
/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 *
 * Adapted from http://james.padolsey.com/javascript/wordwrap-for-javascript/
 * @attribution
 */

module.exports = function(str, options) {
  options = options || {};
  if (str == null) {
    return str;
  }

  var width = options.width || 50;
  var indent = (typeof options.indent === 'string')
    ? options.indent
    : '  ';

  var newline = options.newline || '\n' + indent;

  var re = new RegExp('.{1,' + width + '}(\\s+|$)|\\S+?(\\s+|$)', 'g');

  if (options.cut) {
    re = new RegExp('.{1,' + width + '}', 'g');
  }

  var lines = str.match(re) || [];
  var res = indent + lines.join(newline);

  if (options.trim === true) {
    res = res.replace(/[ \t]*$/gm, '');
  }
  return res;
};

},{}]},{},[])("/src/main.js")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjQuMy4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92NC4zLjEvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvYW5zaS1zdHlsZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvaGFzLWFuc2kvbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmdlL21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd29yZC13cmFwL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNya0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIE1lcmdlID0gcmVxdWlyZShcIm1lcmdlXCIpLFxuXHRcdENoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpLFxuXHRcdFN0cmlwQW5zaSA9IHJlcXVpcmUoXCJzdHJpcC1hbnNpXCIpLFxuXHRcdFdyYXAgPSByZXF1aXJlKFwid29yZC13cmFwXCIpO1xuXG5cbnZhciBjbHMgPSBmdW5jdGlvbigpe1xuXG5cblx0dmFyIF9wdWJsaWMgPSB0aGlzLl9wdWJsaWMgPSB7fSxcblx0XHRcdF9wcml2YXRlID0gdGhpcy5fcHJpdmF0ZSA9IHt9O1xuXG5cblx0LyoqIFxuXHQgKiBQcml2YXRlIFZhcmlhYmxlc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmRlZmF1bHRzID0ge1xuXHRcdGRlZmF1bHRWYWx1ZSA6IChmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICh0eXBlb2YgQ2hhbGsgIT09ICd1bmRlZmluZWQnKSA/IENoYWxrLnJlZChcIiNFUlJcIikgOiBcIiNFUlJcIjtcblx0XHR9KCkpLFxuXHRcdG1hcmdpblRvcCA6IDEsXG5cdFx0bWFyZ2luTGVmdCA6IDIsXG5cdFx0bWF4V2lkdGggOiAyMCxcblx0XHRmb3JtYXR0ZXIgOiBudWxsLFxuXHRcdGhlYWRlckFsaWduIDogXCJjZW50ZXJcIixcblx0XHRmb290ZXJBbGlnbiA6IFwiY2VudGVyXCIsXG5cdFx0YWxpZ24gOiBcImNlbnRlclwiLFxuXHRcdHBhZGRpbmdSaWdodCA6IDAsXG5cdFx0cGFkZGluZ0xlZnQgOiAwLFxuXHRcdHBhZGRpbmdCb3R0b20gOiAwLFxuXHRcdHBhZGRpbmdUb3AgOiAwLFxuXHRcdGNvbG9yIDogZmFsc2UsXG5cdFx0aGVhZGVyQ29sb3IgOiBmYWxzZSxcblx0XHRmb290ZXJDb2xvciA6IGZhbHNlLFxuXHRcdGJvcmRlclN0eWxlIDogMSxcblx0XHRib3JkZXJDaGFyYWN0ZXJzIDogW1xuXHRcdFx0W1xuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSUXCIsIGo6IFwi4pS0XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSYXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9XG5cdFx0XHRdXG5cdFx0XVxuXHR9O1xuXG5cdF9wcml2YXRlLkdVVFRFUiA9IDE7XG5cdFxuXHRfcHJpdmF0ZS5oZWFkZXIgPSBbXTsgLy9zYXZlZCBzbyBjZWxsIG9wdGlvbnMgY2FuIGJlIG1lcmdlZCBpbnRvIFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb2x1bW4gb3B0aW9uc1xuXHRfcHJpdmF0ZS50YWJsZSA9IHtcblx0XHRjb2x1bW5zIDogW10sXG5cdFx0Y29sdW1uV2lkdGhzIDogW10sXG5cdFx0Y29sdW1uSW5uZXJXaWR0aHMgOiBbXSxcblx0XHRoZWFkZXIgOiBbXSxcblx0XHRib2R5IDogW11cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBQcml2YXRlIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5idWlsZFJvdyA9IGZ1bmN0aW9uKHJvdyxyb3dUeXBlKXtcblx0XHR2YXIgbWluUm93SGVpZ2h0ID0gMDtcblx0XHRcblx0XHQvL3N1cHBvcnQgYm90aCByb3dzIHBhc3NlZCBhcyBhbiBhcnJheSBcblx0XHQvL2FuZCByb3dzIHBhc3NlZCBhcyBhbiBvYmplY3Rcblx0XHRpZih0eXBlb2Ygcm93ID09PSAnb2JqZWN0JyAmJiAhKHJvdyBpbnN0YW5jZW9mIEFycmF5KSl7XG5cdFx0XHRyb3cgPVx0X3ByaXZhdGUudGFibGUuY29sdW1ucy5tYXAoZnVuY3Rpb24ob2JqZWN0KXtcblx0XHRcdFx0cmV0dXJuIHJvd1tvYmplY3QudmFsdWVdIHx8IG51bGw7XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQvL2VxdWFsaXplIGFycmF5IGxlbmd0aHNcblx0XHRcdHZhciBkaWZMID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aCAtIHJvdy5sZW5ndGg7XG5cdFx0XHRpZihkaWZMID4gMCl7XG5cdFx0XHRcdC8vYWRkIGVtcHR5IGVsZW1lbnQgdG8gYXJyYXlcblx0XHRcdFx0cm93ID0gcm93LmNvbmNhdChBcnJheS5hcHBseShudWxsLCBuZXcgQXJyYXkoZGlmTCkpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9KSk7IFxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkaWZMIDwgMCl7XG5cdFx0XHRcdC8vdHJ1bmNhdGUgYXJyYXlcblx0XHRcdFx0cm93Lmxlbmd0aCA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRocy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9nZXQgcm93IGFzIGFycmF5IG9mIGNlbGwgYXJyYXlzXG5cdFx0dmFyIGNBcnJzID0gcm93Lm1hcChmdW5jdGlvbihjZWxsLGluZGV4KXtcblx0XHRcdHZhciBjID0gX3ByaXZhdGUuYnVpbGRDZWxsKGNlbGwsaW5kZXgscm93VHlwZSk7XG5cdFx0XHR2YXIgY2VsbEFyciA9IGMuY2VsbEFycjtcblx0XHRcdGlmKHJvd1R5cGUgPT09ICdoZWFkZXInKXtcblx0XHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1uSW5uZXJXaWR0aHMucHVzaChjLndpZHRoKTtcblx0XHRcdH1cblx0XHRcdG1pblJvd0hlaWdodCA9IChtaW5Sb3dIZWlnaHQgPCBjZWxsQXJyLmxlbmd0aCkgPyBcblx0XHRcdFx0Y2VsbEFyci5sZW5ndGggOiBtaW5Sb3dIZWlnaHQ7XG5cdFx0XHRyZXR1cm4gY2VsbEFycjtcblx0XHR9KTtcblxuXHRcdC8vQWRqdXN0IG1pblJvd0hlaWdodCB0byByZWZsZWN0IHZlcnRpY2FsIHJvdyBwYWRkaW5nXG5cdFx0bWluUm93SGVpZ2h0ID0gKHJvd1R5cGUgPT09ICdoZWFkZXInKSA/IG1pblJvd0hlaWdodCA6XG5cdFx0XHRtaW5Sb3dIZWlnaHQgKyBcblx0XHRcdChfcHVibGljLm9wdGlvbnMucGFkZGluZ0JvdHRvbSArIFxuXHRcdFx0IF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nVG9wKTtcblxuXHRcdC8vY29udmVydCBhcnJheSBvZiBjZWxsIGFycmF5cyB0byBhcnJheSBvZiBsaW5lc1xuXHRcdHZhciBsaW5lcyA9IEFycmF5LmFwcGx5KG51bGwse2xlbmd0aDptaW5Sb3dIZWlnaHR9KVxuXHRcdFx0Lm1hcChGdW5jdGlvbi5jYWxsLGZ1bmN0aW9uKCl7cmV0dXJuIFtdfSk7XG5cblx0XHRjQXJycy5mb3JFYWNoKGZ1bmN0aW9uKGNlbGxBcnIsYSl7XG5cdFx0XHR2YXIgd2hpdGVsaW5lID0gQXJyYXkoX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzW2FdKS5qb2luKCdcXCAnKTtcblx0XHRcdGlmKHJvd1R5cGUgPT09J2JvZHknKXtcblx0XHRcdFx0Ly9BZGQgd2hpdGVzcGFjZSBmb3IgdG9wIHBhZGRpbmdcblx0XHRcdFx0Zm9yKHZhciBpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdUb3A7IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci51bnNoaWZ0KHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vQWRkIHdoaXRlc3BhY2UgZm9yIGJvdHRvbSBwYWRkaW5nXG5cdFx0XHRcdGZvcihpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdCb3R0b207IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci5wdXNoKHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdFx0Zm9yKHZhciBiPTA7IGI8bWluUm93SGVpZ2h0OyBiKyspe1x0XG5cdFx0XHRcdGxpbmVzW2JdLnB1c2goKHR5cGVvZiBjZWxsQXJyW2JdICE9PSAndW5kZWZpbmVkJykgPyBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjZWxsQXJyW2JdIDogd2hpdGVsaW5lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fTtcblxuXHRfcHJpdmF0ZS5idWlsZENlbGwgPSBmdW5jdGlvbihjZWxsLGNvbHVtbkluZGV4LHJvd1R5cGUpe1xuXG5cdFx0dmFyIGNlbGxWYWx1ZSwgXG5cdFx0XHRcdGNlbGxPcHRpb25zID0gTWVyZ2UodHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfcHVibGljLm9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KHJvd1R5cGUgPT09ICdib2R5JykgPyBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wcml2YXRlLmhlYWRlcltjb2x1bW5JbmRleF0gOiB7fSwgLy9pZ25vcmUgY29sdW1uT3B0aW9ucyBmb3IgZm9vdGVyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2VsbCk7XHRcdFxuXHRcdFxuXHRcdGlmKHJvd1R5cGUgPT09ICdoZWFkZXInKXtcblx0XHRcdGNlbGwgPSBNZXJnZSh0cnVlLF9wdWJsaWMub3B0aW9ucyxjZWxsKTtcblx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbnMucHVzaChjZWxsKTtcblx0XHRcdGNlbGxWYWx1ZSA9IGNlbGwuYWxpYXMgfHwgY2VsbC52YWx1ZTtcblx0XHR9XHRcblx0XHRlbHNle1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIGNlbGwgIT09IG51bGwpe1x0XG5cdFx0XHRcdGNlbGxWYWx1ZSA9IGNlbGwudmFsdWU7XG5cdFx0XHR9XHRcblx0XHRcdGVsc2V7XG5cdFx0XHRcdGNlbGxWYWx1ZSA9IGNlbGw7XG5cdFx0XHR9XG5cblx0XHRcdC8vUmVwbGFjZSB1bmRlZmluZWQvbnVsbCBjZWxsIHZhbHVlcyB3aXRoIHBsYWNlaG9sZGVyXG5cdFx0XHRjZWxsVmFsdWUgPSAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgY2VsbFZhbHVlID09PSBudWxsKSA/IFxuXHRcdFx0XHRfcHVibGljLm9wdGlvbnMuZGVmYXVsdFZhbHVlIDogY2VsbFZhbHVlO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHQvL1J1biBmb3JtYXR0ZXJcblx0XHRcdGlmKHR5cGVvZiBjZWxsT3B0aW9ucy5mb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0XHRjZWxsVmFsdWUgPSBjZWxsT3B0aW9ucy5mb3JtYXR0ZXIoY2VsbFZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly9jb2xvcml6ZSBjZWxsVmFsdWVcblx0XHRjZWxsVmFsdWUgPSBfcHJpdmF0ZS5jb2xvcml6ZUNlbGwoY2VsbFZhbHVlLGNlbGxPcHRpb25zLHJvd1R5cGUpO1x0XG5cblx0XHQvL3RleHR3cmFwIGNlbGxWYWx1ZVxuXHRcdHZhciBXcmFwT2JqICA9IF9wcml2YXRlLndyYXBDZWxsQ29udGVudChjZWxsVmFsdWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtbkluZGV4LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjZWxsT3B0aW9ucyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm93VHlwZSk7XG5cdFx0Y2VsbFZhbHVlID0gV3JhcE9iai5vdXRwdXQ7XG5cblx0XHQvL3JldHVybiBhcyBhcnJheSBvZiBsaW5lc1xuXHRcdHJldHVybiB7XG5cdFx0XHRjZWxsQXJyIDogY2VsbFZhbHVlLnNwbGl0KCdcXG4nKSxcblx0XHRcdHdpZHRoIDogV3JhcE9iai53aWR0aFxuXHRcdH07XG5cdH07XG5cbi8qXG5cdF9wcml2YXRlLmNvbG9yaXplQWxsV29yZHMgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdC8vQ29sb3IgZWFjaCB3b3JkIGluIHRoZSBjZWxsIHNvIHRoYXQgbGluZSBicmVha3MgZG9uJ3QgYnJlYWsgY29sb3IgXG5cdFx0dmFyIGFyciA9IHN0ci5yZXBsYWNlKC8oXFxTKykvZ2ksZnVuY3Rpb24obWF0Y2gpe1xuXHRcdFx0cmV0dXJuIENoYWxrW2NvbG9yXShtYXRjaCkrJ1xcICc7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFycjtcblx0fTtcbiovXG5cblx0X3ByaXZhdGUuY29sb3JpemVDZWxsID0gZnVuY3Rpb24oc3RyLGNlbGxPcHRpb25zLHJvd1R5cGUpe1xuXHRcdFxuXHRcdHZhciBjb2xvciA9IGZhbHNlOyAvL2ZhbHNlIHdpbGwga2VlcCB0ZXJtaW5hbCBkZWZhdWx0XG5cdFx0XG5cdFx0c3dpdGNoKHRydWUpe1xuXHRcdFx0Y2FzZShyb3dUeXBlID09PSAnYm9keScpOlxuXHRcdFx0XHRjb2xvciA9IGNlbGxPcHRpb25zLmNvbG9yIHx8IGNvbG9yO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2Uocm93VHlwZSA9PT0gJ2hlYWRlcicpOlxuXHRcdFx0XHRjb2xvciA9IGNlbGxPcHRpb25zLmhlYWRlckNvbG9yIHx8IGNvbG9yO1x0XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29sb3IgPSBjZWxsT3B0aW9ucy5mb290ZXJDb2xvciB8fCBjb2xvcjtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGNvbG9yKXtcblx0XHRcdHN0ciA9IENoYWxrW2NvbG9yXShzdHIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHI7XG5cdH07XG5cblx0X3ByaXZhdGUuY2FsY3VsYXRlTGVuZ3RoID0gZnVuY3Rpb24gKGxpbmUpIHtcblx0XHRyZXR1cm4gU3RyaXBBbnNpKGxpbmUucmVwbGFjZSgvW15cXHgwMC1cXHhmZl0vZywnWFgnKSkubGVuZ3RoO1xuXHR9O1xuXG5cdF9wcml2YXRlLndyYXBDZWxsQ29udGVudCA9IGZ1bmN0aW9uKGNlbGxWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sdW1uSW5kZXgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNlbGxPcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyb3dUeXBlKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgXG5cdFx0Ly9yZW1vdmUgQU5TSSBjb2xvciBjb2RlcyBmcm9tIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBzdHJpbmdcblx0XHR2YXIgc3RyaW5nID0gY2VsbFZhbHVlLnRvU3RyaW5nKCksIFxuXHRcdFx0XHRzdGFydEFuc2lSZWdleHAgPSAvXihcXDAzM1xcW1swLTk7XSptKSsvLFxuXHRcdFx0XHRlbmRBbnNpUmVnZXhwID0gLyhcXDAzM1xcW1swLTk7XSptKSskLyxcblx0XHRcdFx0c3RhcnRNYXRjaGVzID0gc3RyaW5nLm1hdGNoKHN0YXJ0QW5zaVJlZ2V4cCksXG5cdFx0XHRcdGVuZE1hdGNoZXMgPSBzdHJpbmcubWF0Y2goZW5kQW5zaVJlZ2V4cCksXG5cdFx0XHRcdHN0YXJ0Rm91bmQgPSBmYWxzZSxcblx0XHRcdFx0ZW5kRm91bmQgPSBmYWxzZTtcblx0XHRcblx0XHRpZihzdGFydE1hdGNoZXMgaW5zdGFuY2VvZiBBcnJheSAmJiBzdGFydE1hdGNoZXMubGVuZ3RoID4gMCl7XG5cdFx0XHRzdGFydEZvdW5kID0gdHJ1ZTtcblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHN0YXJ0QW5zaVJlZ2V4cCwnJyk7XG5cdFx0fVxuXG5cdFx0aWYoZW5kTWF0Y2hlcyBpbnN0YW5jZW9mIEFycmF5ICYmIGVuZE1hdGNoZXMubGVuZ3RoID4gMCl7XG5cdFx0XHRlbmRGb3VuZCA9IHRydWU7XHRcblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKGVuZEFuc2lSZWdleHAsJycpO1xuXHRcdH1cblxuXG5cdFx0dmFyIGFsaWduVGd0O1xuXHRcdHN3aXRjaChyb3dUeXBlKXtcblx0XHRcdGNhc2UoJ2hlYWRlcicpOlxuXHRcdFx0XHRhbGlnblRndCA9IFwiaGVhZGVyQWxpZ25cIlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UoJ2JvZHknKTpcblx0XHRcdFx0YWxpZ25UZ3QgPSBcImFsaWduXCJcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRhbGlnblRndCA9IFwiZm9vdGVyQWxpZ25cIlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHQvL0VxdWFsaXplIHBhZGRpbmcgZm9yIGNlbnRlcmVkIGxpbmVzIFxuXHRcdGlmKGNlbGxPcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpe1x0XG5cdFx0XHRjZWxsT3B0aW9ucy5wYWRkaW5nTGVmdCA9IGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCA9XG5cdFx0XHRcdE1hdGgubWF4KGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCxjZWxsT3B0aW9ucy5wYWRkaW5nTGVmdCwwKTtcblx0XHR9XG5cblx0XHR2YXIgd2lkdGggPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHNbY29sdW1uSW5kZXhdLFxuXHRcdFx0XHRpbm5lcldpZHRoID0gd2lkdGggLSBjZWxsT3B0aW9ucy5wYWRkaW5nTGVmdCAtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCAtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF9wcml2YXRlLkdVVFRFUjsgLy9ib3JkZXIvZ3V0dGVyXG5cdFx0XG5cdFx0XHRcdGlmIChzdHJpbmcubGVuZ3RoIDwgX3ByaXZhdGUuY2FsY3VsYXRlTGVuZ3RoKHN0cmluZykpIHtcblx0XHRcdC8vV3JhcCBBc2lhbiBjaGFyYWN0ZXJzXG5cdFx0XHR2YXIgY291bnQgPSAwO1xuXHRcdFx0dmFyIHN0YXJ0ID0gMDtcblx0XHRcdHZhciBjaGFyYWN0ZXJzID0gc3RyaW5nLnNwbGl0KCcnKTtcblxuXHRcdFx0c3RyaW5nID0gY2hhcmFjdGVycy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGNlbGxWYWx1ZSwgaSkge1xuXHRcdFx0XHRjb3VudCArPSBfcHJpdmF0ZS5jYWxjdWxhdGVMZW5ndGgoY2VsbFZhbHVlKTtcblx0XHRcdFx0aWYgKGNvdW50ID4gaW5uZXJXaWR0aCkge1xuXHRcdFx0XHRcdHByZXYucHVzaChzdHJpbmcuc2xpY2Uoc3RhcnQsIGkpKTtcblx0XHRcdFx0XHRzdGFydCA9IGk7XG5cdFx0XHRcdFx0Y291bnQgPSAwO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNoYXJhY3RlcnMubGVuZ3RoID09PSBpICsgMSkge1xuXHRcdFx0XHRcdHByZXYucHVzaChzdHJpbmcuc2xpY2Uoc3RhcnQpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwcmV2O1xuXHRcdFx0fSwgW10pLmpvaW4oJ1xcbicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHJpbmcgPSBXcmFwKHN0cmluZyx7XG5cdFx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aCAtIFxuXHRcdFx0XHRcdFx0XHRcdGNlbGxPcHRpb25zLnBhZGRpbmdMZWZ0IC1cblx0XHRcdFx0XHRcdFx0XHRjZWxsT3B0aW9ucy5wYWRkaW5nUmlnaHQsXG5cdFx0XHRcdHRyaW0gOiB0cnVlLFxuXHRcdFx0XHRpbmRlbnQgOiAnJ1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly9CcmVhayBzdHJpbmcgaW50byBhcnJheSBvZiBsaW5lc1xuXHRcdHZhciBzdHJBcnIgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Ly9Gb3JtYXQgZWFjaCBsaW5lXG5cdFx0c3RyQXJyID0gc3RyQXJyLm1hcChmdW5jdGlvbihsaW5lKXtcblxuXHRcdFx0bGluZSA9IGxpbmUudHJpbSgpO1x0XG5cdFx0XHR2YXIgbGluZUxlbmd0aCA9IF9wcml2YXRlLmNhbGN1bGF0ZUxlbmd0aChsaW5lKTtcblxuXHRcdFx0Ly9hbGlnbm1lbnQgXG5cdFx0XHRpZihsaW5lTGVuZ3RoIDwgd2lkdGgpe1xuXHRcdFx0XHR2YXIgZW1wdHlTcGFjZSA9IHdpZHRoIC0gbGluZUxlbmd0aDsgXG5cdFx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0XHRjYXNlKGNlbGxPcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpOlxuXHRcdFx0XHRcdFx0ZW1wdHlTcGFjZSAtLTtcblx0XHRcdFx0XHRcdHZhciBwYWRCb3RoID0gTWF0aC5mbG9vcihlbXB0eVNwYWNlIC8gMiksIFxuXHRcdFx0XHRcdFx0XHRcdHBhZFJlbWFpbmRlciA9IGVtcHR5U3BhY2UgJSAyO1xuXHRcdFx0XHRcdFx0bGluZSA9IEFycmF5KHBhZEJvdGggKyAxKS5qb2luKCcgJykgKyBcblx0XHRcdFx0XHRcdFx0bGluZSArXG5cdFx0XHRcdFx0XHRcdEFycmF5KHBhZEJvdGggKyAxICsgcGFkUmVtYWluZGVyKS5qb2luKCcgJyk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlKGNlbGxPcHRpb25zW2FsaWduVGd0XSA9PT0gJ3JpZ2h0Jyk6XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoZW1wdHlTcGFjZSAtIGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCkuam9pbignICcpICsgXG5cdFx0XHRcdFx0XHRcdFx0XHQgbGluZSArIFxuXHRcdFx0XHRcdFx0XHRcdFx0IEFycmF5KGNlbGxPcHRpb25zLnBhZGRpbmdSaWdodCArIDEpLmpvaW4oJyAnKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoY2VsbE9wdGlvbnMucGFkZGluZ0xlZnQgKyAxKS5qb2luKCcgJykgK1xuXHRcdFx0XHRcdFx0XHRcdFx0IGxpbmUgKyBBcnJheShlbXB0eVNwYWNlIC0gY2VsbE9wdGlvbnMucGFkZGluZ0xlZnQpLmpvaW4oJyAnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL3B1dCBBTlNJIGNvbG9yIGNvZGVzIEJBQ0sgb24gdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHN0cmluZ1xuXHRcdFx0aWYoc3RhcnRGb3VuZCl7XG5cdFx0XHRcdGxpbmUgPSBzdGFydE1hdGNoZXNbMF0gKyBsaW5lO1xuXHRcdFx0fVxuXHRcdFx0aWYoZW5kRm91bmQpe1xuXHRcdFx0XHRsaW5lID0gbGluZSArIGVuZE1hdGNoZXNbMF07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsaW5lO1xuXHRcdH0pO1xuXG5cdFx0c3RyaW5nID0gc3RyQXJyLmpvaW4oJ1xcbicpO1xuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHRvdXRwdXQgOiBzdHJpbmcsXG5cdFx0XHR3aWR0aCA6IGlubmVyV2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmdldENvbHVtbldpZHRocyA9IGZ1bmN0aW9uKHJvdyl7XG5cdFx0Ly9XaWR0aHMgYXMgcHJlc2NyaWJlZFxuXHRcdHZhciB3aWR0aHMgPSByb3cubWFwKGZ1bmN0aW9uKGNlbGwpe1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBjZWxsLndpZHRoICE9PSd1bmRlZmluZWQnKXtcblx0XHRcdFx0cmV0dXJuIGNlbGwud2lkdGg7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRyZXR1cm4gX3B1YmxpYy5vcHRpb25zLm1heFdpZHRoO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly9DaGVjayB0byBtYWtlIHN1cmUgd2lkdGhzIHdpbGwgZml0IHRoZSBjdXJyZW50IGRpc3BsYXksIG9yIHJlc2l6ZS5cblx0XHR2YXIgdG90YWxXaWR0aCA9IHdpZHRocy5yZWR1Y2UoZnVuY3Rpb24ocHJldixjdXJyKXtcblx0XHRcdHJldHVybiBwcmV2K2N1cnI7XG5cdFx0fSk7XG5cdFx0Ly9BZGQgbWFyZ2luTGVmdCB0byB0b3RhbFdpZHRoXG5cdFx0dG90YWxXaWR0aCArPSBfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdDtcblxuXHRcdC8vQ2hlY2sgcHJvY2VzcyBleGlzdHMgaW4gY2FzZSB3ZSBhcmUgaW4gYnJvd3NlclxuXHRcdGlmKHByb2Nlc3MgJiYgcHJvY2Vzcy5zdGRvdXQgJiYgdG90YWxXaWR0aCA+IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMpe1xuXHRcdFx0Ly9yZWNhbGN1bGF0ZSBwcm9wb3J0aW9uYXRlbHkgdG8gZml0IHNpemVcblx0XHRcdHZhciBwcm9wID0gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyAvIHRvdGFsV2lkdGg7XG5cdFx0XHRwcm9wID0gcHJvcC50b0ZpeGVkKDIpLTAuMDE7XG5cdFx0XHR3aWR0aHMgPSB3aWR0aHMubWFwKGZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IocHJvcCp2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGhzO1xuXHR9O1xuXG5cblx0LyoqIFxuXHQgKiBQdWJsaWMgVmFyaWFibGVzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3B1YmxpYy5vcHRpb25zID0ge307XG5cblxuXHQvKipcblx0ICogUHVibGljIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5zZXR1cCA9IGZ1bmN0aW9uKGhlYWRlcixib2R5LGZvb3RlcixvcHRpb25zKXtcblx0XHRcblx0XHRfcHVibGljLm9wdGlvbnMgPSBNZXJnZSh0cnVlLF9wcml2YXRlLmRlZmF1bHRzLG9wdGlvbnMpO1xuXHRcdFxuXHRcdC8vYmFja2ZpeGVzIGZvciBzaG9ydGVuZWQgb3B0aW9uIG5hbWVzXG5cdFx0X3B1YmxpYy5vcHRpb25zLmFsaWduID0gX3B1YmxpYy5vcHRpb25zLmFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuYWxpZ247XG5cdFx0X3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduID0gX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuaGVhZGVyQWxpZ247XG5cdFx0XG5cdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzID0gX3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzKGhlYWRlcik7XG5cblx0XHQvL0J1aWxkIGhlYWRlclxuXHRcdF9wcml2YXRlLmhlYWRlciA9IGhlYWRlcjsgLy9zYXZlIGZvciBtZXJnaW5nIGNvbHVtbk9wdGlvbnMgaW50byBjZWxsIG9wdGlvbnNcblx0XHRoZWFkZXIgPSBbaGVhZGVyXTtcblx0XHRfcHJpdmF0ZS50YWJsZS5oZWFkZXIgPSBoZWFkZXIubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93LCdoZWFkZXInKTtcblx0XHR9KTtcblxuXHRcdC8vQnVpbGQgYm9keVxuXHRcdF9wcml2YXRlLnRhYmxlLmJvZHkgPSBib2R5Lm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdywnYm9keScpO1xuXHRcdH0pO1xuXG5cdFx0Ly9CdWlsZCBmb290ZXJcblx0XHRmb290ZXIgPSAoZm9vdGVyLmxlbmd0aCA+IDApID8gW2Zvb3Rlcl0gOiBbXTtcblx0XHRfcHJpdmF0ZS50YWJsZS5mb290ZXIgPSBmb290ZXIubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93LCdmb290ZXInKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBfcHVibGljO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgYSB0YWJsZSB0byBhIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxuXHQgKiBAbWVtYmVyb2YgVGFibGUgXG5cdCAqIEBleGFtcGxlIFxuXHQgKiBgYGBcblx0ICogdmFyIHN0ciA9IHQxLnJlbmRlcigpOyBcblx0ICogY29uc29sZS5sb2coc3RyKTsgLy9vdXRwdXRzIHRhYmxlXG5cdCAqIGBgYFxuXHQqL1xuXHRfcHVibGljLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIHN0ciA9ICcnLFxuXHRcdFx0XHRwYXJ0ID0gWydoZWFkZXInLCdib2R5JywnZm9vdGVyJ10sXG5cdFx0XHRcdG1hcmdpbkxlZnQgPSBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdCArIDEpLmpvaW4oJ1xcICcpLFxuXHRcdFx0XHRiUyA9IF9wdWJsaWMub3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzW19wdWJsaWMub3B0aW9ucy5ib3JkZXJTdHlsZV0sXG5cdFx0XHRcdGJvcmRlcnMgPSBbXTtcblxuXHRcdC8vQm9yZGVyc1xuXHRcdGZvcih2YXIgYT0wO2E8MzthKyspe1xuXHRcdFx0Ym9yZGVycy5wdXNoKCcnKTtcblx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRocy5mb3JFYWNoKGZ1bmN0aW9uKHcsaSxhcnIpe1xuXHRcdFx0XHRib3JkZXJzW2FdICs9IEFycmF5KHcpLmpvaW4oYlNbYV0uaCkgK1xuXHRcdFx0XHRcdCgoaSsxICE9PSBhcnIubGVuZ3RoKSA/IGJTW2FdLmogOiBiU1thXS5yKTtcblx0XHRcdH0pO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJTW2FdLmwgKyBib3JkZXJzW2FdO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJvcmRlcnNbYV0uc3BsaXQoJycpO1xuXHRcdFx0Ym9yZGVyc1thXVtib3JkZXJzW2FdLmxlbmd0aDFdID0gYlNbYV0ucjtcblx0XHRcdGJvcmRlcnNbYV0gPSBib3JkZXJzW2FdLmpvaW4oJycpO1xuXHRcdFx0Ym9yZGVyc1thXSA9IG1hcmdpbkxlZnQgKyBib3JkZXJzW2FdICsgJ1xcbic7XG5cdFx0fVxuXHRcdFxuXHRcdC8vVG9wIGhvcml6b250YWwgYm9yZGVyXG5cdFx0c3RyICs9IGJvcmRlcnNbMF07XG5cblx0XHQvL1Jvd3Ncblx0XHR2YXIgcm93O1xuXHRcdHBhcnQuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuXHRcdFx0d2hpbGUoX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoKXtcblx0XHRcdFx0XG5cdFx0XHRcdHJvdyA9IF9wcml2YXRlLnRhYmxlW3BdLnNoaWZ0KCk7XG5cdFx0XHRcblx0XHRcdFx0aWYocm93Lmxlbmd0aCA9PT0gMCkgYnJlYWs7XG5cblx0XHRcdFx0cm93LmZvckVhY2goZnVuY3Rpb24obGluZSl7XG5cdFx0XHRcdFx0c3RyID0gc3RyIFxuXHRcdFx0XHRcdFx0KyBtYXJnaW5MZWZ0IFxuXHRcdFx0XHRcdFx0KyBiU1sxXS52XG5cdFx0XHRcdFx0XHQrXHRsaW5lLmpvaW4oYlNbMV0udikgXG5cdFx0XHRcdFx0XHQrIGJTWzFdLnZcblx0XHRcdFx0XHRcdCsgJ1xcbic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQgIC8vQWRkcyBib3R0b20gaG9yaXpvbnRhbCByb3cgYm9yZGVyXG5cdFx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0XHQvL0lmIGVuZCBvZiBib2R5IGFuZCBubyBmb290ZXIsIHNraXBcblx0XHRcdFx0XHRjYXNlKF9wcml2YXRlLnRhYmxlW3BdLmxlbmd0aCA9PT0gMCBcblx0XHRcdFx0XHRcdFx0ICYmIGkgPT09IDEgXG5cdFx0XHRcdFx0XHRcdCAmJiBfcHJpdmF0ZS50YWJsZS5mb290ZXIubGVuZ3RoID09PSAwKTpcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8vaWYgZW5kIG9mIGZvb3Rlciwgc2tpcFxuXHRcdFx0XHRcdGNhc2UoX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoID09PSAwIFxuXHRcdFx0XHRcdFx0XHQgJiYgaSA9PT0gMik6XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0c3RyICs9IGJvcmRlcnNbMV07XG5cdFx0XHRcdH1cdFxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdC8vQm90dG9tIGhvcml6b250YWwgYm9yZGVyXG5cdFx0c3RyICs9IGJvcmRlcnNbMl07XG5cblx0XHRyZXR1cm4gQXJyYXkoX3B1YmxpYy5vcHRpb25zLm1hcmdpblRvcCArIDEpLmpvaW4oJ1xcbicpICsgc3RyO1xuXHR9XHRcblxufTtcblxuXG4vKipcbiAqIEBjbGFzcyBUYWJsZVxuICogQHBhcmFtIHthcnJheX0gaGVhZGVyXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQtIFtTZWUgZXhhbXBsZV0oI2V4YW1wbGUtdXNhZ2UpXG4gKiBAcGFyYW0ge29iamVjdH0gaGVhZGVyLmNvbHVtblx0XHRcdFx0XHRcdFx0XHRcdC0gQ29sdW1uIG9wdGlvbnNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhlYWRlci5jb2x1bW4uZm9ybWF0dGVyXHRcdFx0LSBSdW5zIGEgY2FsbGJhY2sgb24gZWFjaCBjZWxsIHZhbHVlIGluIHRoZSBwYXJlbnQgY29sdW1uXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5MZWZ0XHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLm1hcmdpblRvcFx0XHRcdFx0LSBkZWZhdWx0OiAwXHRcdFx0XG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXhXaWR0aFx0XHRcdFx0XHQtIGRlZmF1bHQ6IDIwIFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0JvdHRvbVx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdMZWZ0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nUmlnaHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdUb3BcdFx0XHRcdC0gZGVmYXVsdDogMFx0XG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlhc1x0XHRcdFx0XHRcdC0gQWxlcm5hdGUgaGVhZGVyIGNvbHVtbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlnblx0XHRcdFx0XHRcdC0gZGVmYXVsdDogXCJjZW50ZXJcIlxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uY29sb3JcdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckFsaWduXHRcdFx0LSBkZWZhdWx0OiBcImNlbnRlclwiIFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uaGVhZGVyQ29sb3JcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmZvb3RlckFsaWduXHRcdFx0LSBkZWZhdWx0OiBcImNlbnRlclwiIFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uZm9vdGVyQ29sb3JcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSByb3dzXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC0gW1NlZSBleGFtcGxlXSgjZXhhbXBsZS11c2FnZSlcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1x0XHRcdFx0XHRcdFx0XHRcdC0gVGFibGUgb3B0aW9ucyBcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmJvcmRlclN0eWxlXHRcdFx0LSBkZWZhdWx0OiAxICgwID0gbm8gYm9yZGVyKSBcbiAqIFJlZmVycyB0byB0aGUgaW5kZXggb2YgdGhlIGRlc2lyZWQgY2hhcmFjdGVyIHNldC4gXG4gKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zLmJvcmRlckNoYXJhY3RlcnNcdC0gW1NlZSBAbm90ZV0oI25vdGUpIFxuICogQHJldHVybnMge1RhYmxlfVxuICogQG5vdGVcbiAqIDxhIG5hbWU9XCJub3RlXCIvPlxuICogRGVmYXVsdCBib3JkZXIgY2hhcmFjdGVyIHNldHM6XG4gKiBgYGBcbiAqXHRbXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuICpcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiAqXHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn1cbiAqXHRcdF0sXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUjFwiLCBqOiBcIuKUrFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUkFwifSxcbiAqXHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pScXCIsIGo6IFwi4pS8XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSkXCJ9LFxuICpcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJRcIiwgajogXCLilLRcIiwgaDogXCLilIBcIiwgcjogXCLilJhcIn1cbiAqXHRcdF0sXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuICpcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcbiAqXHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn1cbiAqXHRcdF1cbiAqXHRdXG4gKiBgYGBcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIHZhciBUYWJsZSA9IHJlcXVpcmUoJ3R0eS10YWJsZScpO1xuICogVGFibGUoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG4gKiBgYGBcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblx0dmFyIG8gPSBuZXcgY2xzKCksXG5cdFx0XHRoZWFkZXIgPSBhcmd1bWVudHNbMF0sIFxuXHRcdFx0Ym9keSA9IGFyZ3VtZW50c1sxXSwgXG5cdFx0XHRmb290ZXIgPSAoYXJndW1lbnRzWzJdIGluc3RhbmNlb2YgQXJyYXkpID8gYXJndW1lbnRzWzJdIDogW10sIFxuXHRcdFx0b3B0aW9ucyA9ICh0eXBlb2YgYXJndW1lbnRzWzNdID09PSAnb2JqZWN0JykgPyBhcmd1bWVudHNbM10gOiBcblx0XHRcdFx0KHR5cGVvZiBhcmd1bWVudHNbMl0gPT09ICdvYmplY3QnKSA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXHRcblx0cmV0dXJuIG8uX3ByaXZhdGUuc2V0dXAoaGVhZGVyLGJvZHksZm9vdGVyLG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xudmFyIGFuc2lTdHlsZXMgPSByZXF1aXJlKCdhbnNpLXN0eWxlcycpO1xudmFyIHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcbnZhciBoYXNBbnNpID0gcmVxdWlyZSgnaGFzLWFuc2knKTtcbnZhciBzdXBwb3J0c0NvbG9yID0gcmVxdWlyZSgnc3VwcG9ydHMtY29sb3InKTtcbnZhciBkZWZpbmVQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIGlzU2ltcGxlV2luZG93c1Rlcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmICEvXnh0ZXJtL2kudGVzdChwcm9jZXNzLmVudi5URVJNKTtcblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuXHQvLyBkZXRlY3QgbW9kZSBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdHRoaXMuZW5hYmxlZCA9ICFvcHRpb25zIHx8IG9wdGlvbnMuZW5hYmxlZCA9PT0gdW5kZWZpbmVkID8gc3VwcG9ydHNDb2xvciA6IG9wdGlvbnMuZW5hYmxlZDtcbn1cblxuLy8gdXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcblx0YW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxYls5NG0nO1xufVxuXG52YXIgc3R5bGVzID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKGFuc2lTdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFuc2lTdHlsZXNba2V5XS5jbG9zZVJlID0gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlc1trZXldLmNsb3NlKSwgJ2cnKTtcblxuXHRcdHJldFtrZXldID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIHRoaXMuX3N0eWxlcy5jb25jYXQoa2V5KSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn0pKCk7XG5cbnZhciBwcm90byA9IGRlZmluZVByb3BzKGZ1bmN0aW9uIGNoYWxrKCkge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMpIHtcblx0dmFyIGJ1aWxkZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGFwcGx5U3R5bGUuYXBwbHkoYnVpbGRlciwgYXJndW1lbnRzKTtcblx0fTtcblxuXHRidWlsZGVyLl9zdHlsZXMgPSBfc3R5bGVzO1xuXHRidWlsZGVyLmVuYWJsZWQgPSB0aGlzLmVuYWJsZWQ7XG5cdC8vIF9fcHJvdG9fXyBpcyB1c2VkIGJlY2F1c2Ugd2UgbXVzdCByZXR1cm4gYSBmdW5jdGlvbiwgYnV0IHRoZXJlIGlzXG5cdC8vIG5vIHdheSB0byBjcmVhdGUgYSBmdW5jdGlvbiB3aXRoIGEgZGlmZmVyZW50IHByb3RvdHlwZS5cblx0LyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblx0YnVpbGRlci5fX3Byb3RvX18gPSBwcm90bztcblxuXHRyZXR1cm4gYnVpbGRlcjtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZSgpIHtcblx0Ly8gc3VwcG9ydCB2YXJhZ3MsIGJ1dCBzaW1wbHkgY2FzdCB0byBzdHJpbmcgaW4gY2FzZSB0aGVyZSdzIG9ubHkgb25lIGFyZ1xuXHR2YXIgYXJncyA9IGFyZ3VtZW50cztcblx0dmFyIGFyZ3NMZW4gPSBhcmdzLmxlbmd0aDtcblx0dmFyIHN0ciA9IGFyZ3NMZW4gIT09IDAgJiYgU3RyaW5nKGFyZ3VtZW50c1swXSk7XG5cblx0aWYgKGFyZ3NMZW4gPiAxKSB7XG5cdFx0Ly8gZG9uJ3Qgc2xpY2UgYGFyZ3VtZW50c2AsIGl0IHByZXZlbnRzIHY4IG9wdGltaXphdGlvbnNcblx0XHRmb3IgKHZhciBhID0gMTsgYSA8IGFyZ3NMZW47IGErKykge1xuXHRcdFx0c3RyICs9ICcgJyArIGFyZ3NbYV07XG5cdFx0fVxuXHR9XG5cblx0aWYgKCF0aGlzLmVuYWJsZWQgfHwgIXN0cikge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHR2YXIgbmVzdGVkU3R5bGVzID0gdGhpcy5fc3R5bGVzO1xuXHR2YXIgaSA9IG5lc3RlZFN0eWxlcy5sZW5ndGg7XG5cblx0Ly8gVHVybnMgb3V0IHRoYXQgb24gV2luZG93cyBkaW1tZWQgZ3JheSB0ZXh0IGJlY29tZXMgaW52aXNpYmxlIGluIGNtZC5leGUsXG5cdC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvaXNzdWVzLzU4XG5cdC8vIElmIHdlJ3JlIG9uIFdpbmRvd3MgYW5kIHdlJ3JlIGRlYWxpbmcgd2l0aCBhIGdyYXkgY29sb3IsIHRlbXBvcmFyaWx5IG1ha2UgJ2RpbScgYSBub29wLlxuXHR2YXIgb3JpZ2luYWxEaW0gPSBhbnNpU3R5bGVzLmRpbS5vcGVuO1xuXHRpZiAoaXNTaW1wbGVXaW5kb3dzVGVybSAmJiAobmVzdGVkU3R5bGVzLmluZGV4T2YoJ2dyYXknKSAhPT0gLTEgfHwgbmVzdGVkU3R5bGVzLmluZGV4T2YoJ2dyZXknKSAhPT0gLTEpKSB7XG5cdFx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9ICcnO1xuXHR9XG5cblx0d2hpbGUgKGktLSkge1xuXHRcdHZhciBjb2RlID0gYW5zaVN0eWxlc1tuZXN0ZWRTdHlsZXNbaV1dO1xuXG5cdFx0Ly8gUmVwbGFjZSBhbnkgaW5zdGFuY2VzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgcmUtb3BlbmluZyBjb2RlXG5cdFx0Ly8gb3RoZXJ3aXNlIG9ubHkgdGhlIHBhcnQgb2YgdGhlIHN0cmluZyB1bnRpbCBzYWlkIGNsb3NpbmcgY29kZVxuXHRcdC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG5cdFx0c3RyID0gY29kZS5vcGVuICsgc3RyLnJlcGxhY2UoY29kZS5jbG9zZVJlLCBjb2RlLm9wZW4pICsgY29kZS5jbG9zZTtcblx0fVxuXG5cdC8vIFJlc2V0IHRoZSBvcmlnaW5hbCAnZGltJyBpZiB3ZSBjaGFuZ2VkIGl0IHRvIHdvcmsgYXJvdW5kIHRoZSBXaW5kb3dzIGRpbW1lZCBncmF5IGlzc3VlLlxuXHRhbnNpU3R5bGVzLmRpbS5vcGVuID0gb3JpZ2luYWxEaW07XG5cblx0cmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdHJldFtuYW1lXSA9IHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gYnVpbGQuY2FsbCh0aGlzLCBbbmFtZV0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59XG5cbmRlZmluZVByb3BzKENoYWxrLnByb3RvdHlwZSwgaW5pdCgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQ2hhbGsoKTtcbm1vZHVsZS5leHBvcnRzLnN0eWxlcyA9IGFuc2lTdHlsZXM7XG5tb2R1bGUuZXhwb3J0cy5oYXNDb2xvciA9IGhhc0Fuc2k7XG5tb2R1bGUuZXhwb3J0cy5zdHJpcENvbG9yID0gc3RyaXBBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3VwcG9ydHNDb2xvciA9IHN1cHBvcnRzQ29sb3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU3R5bGVzICgpIHtcblx0dmFyIHN0eWxlcyA9IHtcblx0XHRtb2RpZmllcnM6IHtcblx0XHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0XHRib2xkOiBbMSwgMjJdLCAvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0XHRkaW06IFsyLCAyMl0sXG5cdFx0XHRpdGFsaWM6IFszLCAyM10sXG5cdFx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0XHRpbnZlcnNlOiBbNywgMjddLFxuXHRcdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdFx0c3RyaWtldGhyb3VnaDogWzksIDI5XVxuXHRcdH0sXG5cdFx0Y29sb3JzOiB7XG5cdFx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHRcdHdoaXRlOiBbMzcsIDM5XSxcblx0XHRcdGdyYXk6IFs5MCwgMzldXG5cdFx0fSxcblx0XHRiZ0NvbG9yczoge1xuXHRcdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRcdGJnV2hpdGU6IFs0NywgNDldXG5cdFx0fVxuXHR9O1xuXG5cdC8vIGZpeCBodW1hbnNcblx0c3R5bGVzLmNvbG9ycy5ncmV5ID0gc3R5bGVzLmNvbG9ycy5ncmF5O1xuXG5cdE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXBOYW1lKSB7XG5cdFx0dmFyIGdyb3VwID0gc3R5bGVzW2dyb3VwTmFtZV07XG5cblx0XHRPYmplY3Qua2V5cyhncm91cCkuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGVOYW1lKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSBncm91cFtzdHlsZU5hbWVdO1xuXG5cdFx0XHRzdHlsZXNbc3R5bGVOYW1lXSA9IGdyb3VwW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46ICdcXHUwMDFiWycgKyBzdHlsZVswXSArICdtJyxcblx0XHRcdFx0Y2xvc2U6ICdcXHUwMDFiWycgKyBzdHlsZVsxXSArICdtJ1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsIGdyb3VwTmFtZSwge1xuXHRcdFx0dmFsdWU6IGdyb3VwLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdGVudW1lcmFibGU6IHRydWUsXG5cdGdldDogYXNzZW1ibGVTdHlsZXNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWF0Y2hPcGVyYXRvcnNSZSA9IC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nJyk7XG5cdH1cblxuXHRyZXR1cm4gc3RyLnJlcGxhY2UobWF0Y2hPcGVyYXRvcnNSZSwgICdcXFxcJCYnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYW5zaVJlZ2V4ID0gcmVxdWlyZSgnYW5zaS1yZWdleCcpO1xudmFyIHJlID0gbmV3IFJlZ0V4cChhbnNpUmVnZXgoKS5zb3VyY2UpOyAvLyByZW1vdmUgdGhlIGBnYCBmbGFnXG5tb2R1bGUuZXhwb3J0cyA9IHJlLnRlc3QuYmluZChyZSk7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIC9bXFx1MDAxYlxcdTAwOWJdW1soKSM7P10qKD86WzAtOV17MSw0fSg/OjtbMC05XXswLDR9KSopP1swLTlBLU9SWmNmLW5xcnk9PjxdL2c7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFyZ3YgPSBwcm9jZXNzLmFyZ3Y7XG5cbnZhciB0ZXJtaW5hdG9yID0gYXJndi5pbmRleE9mKCctLScpO1xudmFyIGhhc0ZsYWcgPSBmdW5jdGlvbiAoZmxhZykge1xuXHRmbGFnID0gJy0tJyArIGZsYWc7XG5cdHZhciBwb3MgPSBhcmd2LmluZGV4T2YoZmxhZyk7XG5cdHJldHVybiBwb3MgIT09IC0xICYmICh0ZXJtaW5hdG9yICE9PSAtMSA/IHBvcyA8IHRlcm1pbmF0b3IgOiB0cnVlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblx0aWYgKCdGT1JDRV9DT0xPUicgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCduby1jb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnbm8tY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1mYWxzZScpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKGhhc0ZsYWcoJ2NvbG9yJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcnMnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPXRydWUnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPWFsd2F5cycpKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5zdGRvdXQgJiYgIXByb2Nlc3Muc3Rkb3V0LmlzVFRZKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmICgnQ09MT1JURVJNJyBpbiBwcm9jZXNzLmVudikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MuZW52LlRFUk0gPT09ICdkdW1iJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmICgvXnNjcmVlbnxeeHRlcm18XnZ0MTAwfGNvbG9yfGFuc2l8Y3lnd2lufGxpbnV4L2kudGVzdChwcm9jZXNzLmVudi5URVJNKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufSkoKTtcbiIsIi8qIVxyXG4gKiBAbmFtZSBKYXZhU2NyaXB0L05vZGVKUyBNZXJnZSB2MS4yLjBcclxuICogQGF1dGhvciB5ZWlrb3NcclxuICogQHJlcG9zaXRvcnkgaHR0cHM6Ly9naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZVxyXG5cclxuICogQ29weXJpZ2h0IDIwMTQgeWVpa29zIC0gTUlUIGxpY2Vuc2VcclxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2UvbWFzdGVyL0xJQ0VOU0VcclxuICovXHJcblxyXG47KGZ1bmN0aW9uKGlzTm9kZSkge1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSBvbmUgb3IgbW9yZSBvYmplY3RzIFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0dmFyIFB1YmxpYyA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCBmYWxzZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fSwgcHVibGljTmFtZSA9ICdtZXJnZSc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHMgcmVjdXJzaXZlbHkgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMucmVjdXJzaXZlID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIHRydWUsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb25lIHRoZSBpbnB1dCByZW1vdmluZyBhbnkgcmVmZXJlbmNlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMuY2xvbmUgPSBmdW5jdGlvbihpbnB1dCkge1xyXG5cclxuXHRcdHZhciBvdXRwdXQgPSBpbnB1dCxcclxuXHRcdFx0dHlwZSA9IHR5cGVPZihpbnB1dCksXHJcblx0XHRcdGluZGV4LCBzaXplO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAnYXJyYXknKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSBbXTtcclxuXHRcdFx0c2l6ZSA9IGlucHV0Lmxlbmd0aDtcclxuXHJcblx0XHRcdGZvciAoaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSB7fTtcclxuXHJcblx0XHRcdGZvciAoaW5kZXggaW4gaW5wdXQpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9iamVjdHMgcmVjdXJzaXZlbHlcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcGFyYW0gbWl4ZWQgZXh0ZW5kXHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZV9yZWN1cnNpdmUoYmFzZSwgZXh0ZW5kKSB7XHJcblxyXG5cdFx0aWYgKHR5cGVPZihiYXNlKSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXR1cm4gZXh0ZW5kO1xyXG5cclxuXHRcdGZvciAodmFyIGtleSBpbiBleHRlbmQpIHtcclxuXHJcblx0XHRcdGlmICh0eXBlT2YoYmFzZVtrZXldKSA9PT0gJ29iamVjdCcgJiYgdHlwZU9mKGV4dGVuZFtrZXldKSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gZXh0ZW5kW2tleV07XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBiYXNlO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHNcclxuXHQgKiBAcGFyYW0gYm9vbCBjbG9uZVxyXG5cdCAqIEBwYXJhbSBib29sIHJlY3Vyc2l2ZVxyXG5cdCAqIEBwYXJhbSBhcnJheSBhcmd2XHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2UoY2xvbmUsIHJlY3Vyc2l2ZSwgYXJndikge1xyXG5cclxuXHRcdHZhciByZXN1bHQgPSBhcmd2WzBdLFxyXG5cdFx0XHRzaXplID0gYXJndi5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKGNsb25lIHx8IHR5cGVPZihyZXN1bHQpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJlc3VsdCA9IHt9O1xyXG5cclxuXHRcdGZvciAodmFyIGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KSB7XHJcblxyXG5cdFx0XHR2YXIgaXRlbSA9IGFyZ3ZbaW5kZXhdLFxyXG5cclxuXHRcdFx0XHR0eXBlID0gdHlwZU9mKGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgIT09ICdvYmplY3QnKSBjb250aW51ZTtcclxuXHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBpdGVtKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzaXRlbSA9IGNsb25lID8gUHVibGljLmNsb25lKGl0ZW1ba2V5XSkgOiBpdGVtW2tleV07XHJcblxyXG5cdFx0XHRcdGlmIChyZWN1cnNpdmUpIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShyZXN1bHRba2V5XSwgc2l0ZW0pO1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gc2l0ZW07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdHlwZSBvZiB2YXJpYWJsZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gc3RyaW5nXHJcblx0ICpcclxuXHQgKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL3R5cGVvZnZhclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0eXBlT2YoaW5wdXQpIHtcclxuXHJcblx0XHRyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKGlucHV0KS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcclxuXHJcblx0fVxyXG5cclxuXHRpZiAoaXNOb2RlKSB7XHJcblxyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBQdWJsaWM7XHJcblxyXG5cdH0gZWxzZSB7XHJcblxyXG5cdFx0d2luZG93W3B1YmxpY05hbWVdID0gUHVibGljO1xyXG5cclxuXHR9XHJcblxyXG59KSh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gc3RyLnJlcGxhY2UoYW5zaVJlZ2V4LCAnJykgOiBzdHI7XG59O1xuIiwiLyohXG4gKiB3b3JkLXdyYXAgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3dvcmQtd3JhcD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKlxuICogQWRhcHRlZCBmcm9tIGh0dHA6Ly9qYW1lcy5wYWRvbHNleS5jb20vamF2YXNjcmlwdC93b3Jkd3JhcC1mb3ItamF2YXNjcmlwdC9cbiAqIEBhdHRyaWJ1dGlvblxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoc3RyID09IG51bGwpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCA1MDtcbiAgdmFyIGluZGVudCA9ICh0eXBlb2Ygb3B0aW9ucy5pbmRlbnQgPT09ICdzdHJpbmcnKVxuICAgID8gb3B0aW9ucy5pbmRlbnRcbiAgICA6ICcgICc7XG5cbiAgdmFyIG5ld2xpbmUgPSBvcHRpb25zLm5ld2xpbmUgfHwgJ1xcbicgKyBpbmRlbnQ7XG5cbiAgdmFyIHJlID0gbmV3IFJlZ0V4cCgnLnsxLCcgKyB3aWR0aCArICd9KFxcXFxzK3wkKXxcXFxcUys/KFxcXFxzK3wkKScsICdnJyk7XG5cbiAgaWYgKG9wdGlvbnMuY3V0KSB7XG4gICAgcmUgPSBuZXcgUmVnRXhwKCcuezEsJyArIHdpZHRoICsgJ30nLCAnZycpO1xuICB9XG5cbiAgdmFyIGxpbmVzID0gc3RyLm1hdGNoKHJlKSB8fCBbXTtcbiAgdmFyIHJlcyA9IGluZGVudCArIGxpbmVzLmpvaW4obmV3bGluZSk7XG5cbiAgaWYgKG9wdGlvbnMudHJpbSA9PT0gdHJ1ZSkge1xuICAgIHJlcyA9IHJlcy5yZXBsYWNlKC9bIFxcdF0qJC9nbSwgJycpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIl19
