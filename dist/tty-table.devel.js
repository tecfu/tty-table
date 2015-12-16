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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjQuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92NC4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvYW5zaS1zdHlsZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvaGFzLWFuc2kvbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmdlL21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd29yZC13cmFwL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG1lcmdlID0gcmVxdWlyZShcIm1lcmdlXCIpLFxuXHRcdGNoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpLFxuXHRcdHN0cmlwQW5zaSA9IHJlcXVpcmUoXCJzdHJpcC1hbnNpXCIpLFxuXHRcdHdyYXAgPSByZXF1aXJlKFwid29yZC13cmFwXCIpO1xuXG5cbnZhciBjbHMgPSBmdW5jdGlvbigpe1xuXG5cblx0dmFyIF9wdWJsaWMgPSB0aGlzLl9wdWJsaWMgPSB7fSxcblx0XHRcdF9wcml2YXRlID0gdGhpcy5fcHJpdmF0ZSA9IHt9O1xuXG5cblx0LyoqIFxuXHQgKiBQcml2YXRlIFZhcmlhYmxlc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmRlZmF1bHRzID0ge1xuXHRcdGRlZmF1bHRWYWx1ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gKHR5cGVvZiBjaGFsayAhPT0gJ3VuZGVmaW5lZCcpID8gY2hhbGsucmVkKFwiI0VSUlwiKSA6IFwiI0VSUlwiO1xuXHRcdFx0Ly9yZXR1cm4gJ251bGwnO1xuXHRcdH0oKSxcblx0XHRtYXJnaW5Ub3AgOiAxLFxuXHRcdG1hcmdpbkxlZnQgOiAyLFxuXHRcdG1heFdpZHRoIDogMjAsXG5cdFx0Zm9ybWF0dGVyIDogbnVsbCxcblx0XHRoZWFkZXJBbGlnbiA6IFwiY2VudGVyXCIsXG5cdFx0YWxpZ24gOiBcImNlbnRlclwiLFxuXHRcdHBhZGRpbmdSaWdodCA6IDAsXG5cdFx0cGFkZGluZ0xlZnQgOiAwLFxuXHRcdHBhZGRpbmdCb3R0b20gOiAwLFxuXHRcdHBhZGRpbmdUb3AgOiAwLFxuXHRcdGNvbG9yIDogZmFsc2UsXG5cdFx0aGVhZGVyQ29sb3IgOiBmYWxzZSxcblx0XHRib3JkZXJTdHlsZSA6IDEsXG5cdFx0Ym9yZGVyQ2hhcmFjdGVycyA6IFtcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSMXCIsIGo6IFwi4pSsXCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSQXCJ9LFxuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJxcIiwgajogXCLilLxcIiwgaDogXCLilIBcIiwgcjogXCLilKRcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUlFwiLCBqOiBcIuKUtFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUmFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifVxuXHRcdFx0XVxuXHRcdF1cblx0fTtcblxuXG5cdC8vQ29uc3RhbnRzXG5cdF9wcml2YXRlLkdVVFRFUiA9IDE7XG5cblxuXHRfcHJpdmF0ZS50YWJsZSA9IHtcblx0XHRjb2x1bW5zIDogW10sXG5cdFx0Y29sdW1uV2lkdGhzIDogW10sXG5cdFx0Y29sdW1uSW5uZXJXaWR0aHMgOiBbXSxcblx0XHRoZWFkZXIgOiBbXSxcblx0XHRib2R5IDogW11cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBQcml2YXRlIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5idWlsZFJvdyA9IGZ1bmN0aW9uKHJvdyxvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgbWluUm93SGVpZ2h0ID0gMDtcblx0XHRcblx0XHQvL3N1cHBvcnQgYm90aCByb3dzIHBhc3NlZCBhcyBhbiBhcnJheSBcblx0XHQvL2FuZCByb3dzIHBhc3NlZCBhcyBhbiBvYmplY3Rcblx0XHRpZih0eXBlb2Ygcm93ID09PSAnb2JqZWN0JyAmJiAhKHJvdyBpbnN0YW5jZW9mIEFycmF5KSl7XG5cdFx0XHRyb3cgPVx0X3ByaXZhdGUudGFibGUuY29sdW1ucy5tYXAoZnVuY3Rpb24ob2JqZWN0KXtcblx0XHRcdFx0cmV0dXJuIHJvd1tvYmplY3QudmFsdWVdIHx8IG51bGw7XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQvL0VuZm9yY2Ugcm93IHNpemVcblx0XHRcdHZhciBkaWZMID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aCAtIHJvdy5sZW5ndGg7XG5cdFx0XHRpZihkaWZMID4gMCl7XG5cdFx0XHRcdC8vQWRkIG51bGwgZWxlbWVudCB0byBhcnJheVxuXHRcdFx0XHRyb3cgPSByb3cuY29uY2F0KEFycmF5LmFwcGx5KG51bGwsIG5ldyBBcnJheShkaWZMKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH0pKTsgXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRpZkwgPCAwKXtcblx0XHRcdFx0Ly9UcnVuY2F0ZSBhcnJheVxuXHRcdFx0XHRyb3cubGVuZ3RoID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL2dldCByb3cgYXMgYXJyYXkgb2YgY2VsbCBhcnJheXNcblx0XHR2YXIgY0FycnMgPSByb3cubWFwKGZ1bmN0aW9uKGNlbGwsaW5kZXgpe1xuXHRcdFx0dmFyIGMgPSBfcHJpdmF0ZS5idWlsZENlbGwoY2VsbCxpbmRleCxvcHRpb25zKTtcblx0XHRcdHZhciBjZWxsQXJyID0gYy5jZWxsQXJyO1xuXHRcdFx0aWYob3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5Jbm5lcldpZHRocy5wdXNoKGMud2lkdGgpO1xuXHRcdFx0fVxuXHRcdFx0bWluUm93SGVpZ2h0ID0gKG1pblJvd0hlaWdodCA8IGNlbGxBcnIubGVuZ3RoKSA/IGNlbGxBcnIubGVuZ3RoIDogbWluUm93SGVpZ2h0O1xuXHRcdFx0cmV0dXJuIGNlbGxBcnI7XG5cdFx0fSk7XG5cblx0XHQvL0FkanVzdCBtaW5Sb3dIZWlnaHQgdG8gcmVmbGVjdCB2ZXJ0aWNhbCByb3cgcGFkZGluZ1xuXHRcdG1pblJvd0hlaWdodCA9IChvcHRpb25zLmhlYWRlcikgPyBtaW5Sb3dIZWlnaHQgOiBtaW5Sb3dIZWlnaHQgKyBcblx0XHRcdChfcHVibGljLm9wdGlvbnMucGFkZGluZ0JvdHRvbSArIF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nVG9wKTtcblxuXHRcdC8vY29udmVydCBhcnJheSBvZiBjZWxsIGFycmF5cyB0byBhcnJheSBvZiBsaW5lc1xuXHRcdHZhciBsaW5lcyA9IEFycmF5LmFwcGx5KG51bGwse2xlbmd0aDptaW5Sb3dIZWlnaHR9KVxuXHRcdFx0Lm1hcChGdW5jdGlvbi5jYWxsLGZ1bmN0aW9uKCl7cmV0dXJuIFtdfSk7XG5cblx0XHRjQXJycy5mb3JFYWNoKGZ1bmN0aW9uKGNlbGxBcnIsYSl7XG5cdFx0XHR2YXIgd2hpdGVsaW5lID0gQXJyYXkoX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzW2FdKS5qb2luKCdcXCAnKTtcblx0XHRcdGlmKCFvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRcdC8vQWRkIHdoaXRlc3BhY2UgZm9yIHRvcCBwYWRkaW5nXG5cdFx0XHRcdGZvcihpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdUb3A7IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci51bnNoaWZ0KHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vQWRkIHdoaXRlc3BhY2UgZm9yIGJvdHRvbSBwYWRkaW5nXG5cdFx0XHRcdGZvcihpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdCb3R0b207IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci5wdXNoKHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdFx0Zm9yKHZhciBiPTA7IGI8bWluUm93SGVpZ2h0OyBiKyspe1x0XG5cdFx0XHRcdGxpbmVzW2JdLnB1c2goKHR5cGVvZiBjZWxsQXJyW2JdICE9ICd1bmRlZmluZWQnKSA/IGNlbGxBcnJbYl0gOiB3aGl0ZWxpbmUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9O1xuXG5cdF9wcml2YXRlLmJ1aWxkQ2VsbCA9IGZ1bmN0aW9uKGNlbGwsY29sdW1uSW5kZXgsb3B0aW9ucyl7XG5cblx0XHQvL1B1bGwgY29sdW1uIG9wdGlvbnNcdFxuXHRcdHZhciBvdXRwdXQ7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XG5cdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRjZWxsID0gbWVyZ2UodHJ1ZSxfcHVibGljLm9wdGlvbnMsY2VsbCk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5zLnB1c2goY2VsbCk7XG5cdFx0XHRvdXRwdXQgPSBjZWxsLmFsaWFzIHx8IGNlbGwudmFsdWU7XG5cdFx0XHRjb2x1bW5PcHRpb25zID0gY2VsbDtcblx0XHR9XHRcblx0XHRlbHNle1xuXHRcdFx0Y29sdW1uT3B0aW9ucyA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbnNbY29sdW1uSW5kZXhdO1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIGNlbGwgIT09IG51bGwpe1x0XG5cdFx0XHRcdGNvbHVtbk9wdGlvbnMgPSBtZXJnZSh0cnVlLGNvbHVtbk9wdGlvbnMsY2VsbCk7XHRcdFxuXHRcdFx0XHRvdXRwdXQgPSBjZWxsLnZhbHVlO1xuXHRcdFx0fVx0XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRvdXRwdXQgPSBjZWxsO1xuXHRcdFx0fVxuXG5cdFx0XHQvL1JlcGxhY2UgdW5kZWZpbmVkL251bGwgY2VsbCB2YWx1ZXMgd2l0aCBwbGFjZWhvbGRlclxuXHRcdFx0b3V0cHV0ID0gKHR5cGVvZiBvdXRwdXQgPT09ICd1bmRlZmluZWQnIHx8IG91dHB1dCA9PT0gbnVsbCkgPyBcblx0XHRcdFx0X3B1YmxpYy5vcHRpb25zLmRlZmF1bHRWYWx1ZSA6IG91dHB1dDtcblx0XHRcdFx0XHRcdFxuXHRcdFx0Ly9SdW4gZm9ybWF0dGVyXG5cdFx0XHRpZih0eXBlb2YgY29sdW1uT3B0aW9ucy5mb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0XHRvdXRwdXQgPSBjb2x1bW5PcHRpb25zLmZvcm1hdHRlcihvdXRwdXQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvL0F1dG9tYXRpYyB0ZXh0IHdyYXBcblx0XHR2YXIgd3JhcE9iaiAgPSBfcHJpdmF0ZS53cmFwQ2VsbENvbnRlbnQob3V0cHV0LGNvbHVtbkluZGV4LGNvbHVtbk9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVyKSA/IFwiaGVhZGVyXCIgOiBcImJvZHlcIik7XG5cdFx0b3V0cHV0ID0gd3JhcE9iai5vdXRwdXQ7XG5cdFx0XG5cdFx0Ly9yZXR1cm4gYXMgYXJyYXkgb2YgbGluZXNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2VsbEFyciA6IG91dHB1dC5zcGxpdCgnXFxuJyksXG5cdFx0XHR3aWR0aCA6IHdyYXBPYmoud2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmNvbG9yaXplQWxsV29yZHMgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdC8vQ29sb3IgZWFjaCB3b3JkIGluIHRoZSBjZWxsIHNvIHRoYXQgbGluZSBicmVha3MgZG9uJ3QgYnJlYWsgY29sb3IgXG5cdFx0dmFyIGFyciA9IHN0ci5yZXBsYWNlKC8oXFxTKykvZ2ksZnVuY3Rpb24obWF0Y2gpe1xuXHRcdFx0cmV0dXJuIGNoYWxrW2NvbG9yXShtYXRjaCkrJ1xcICc7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFycjtcblx0fTtcblxuXHRfcHJpdmF0ZS5jb2xvcml6ZUxpbmUgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdHJldHVybiBjaGFsa1tjb2xvcl0oc3RyKTtcblx0fTtcblxuXHRfcHJpdmF0ZS5jYWxjdWxhdGVMZW5ndGggPSBmdW5jdGlvbiAobGluZSkge1xuXHRcdHJldHVybiBzdHJpcEFuc2kobGluZS5yZXBsYWNlKC9bXlxceDAwLVxceGZmXS9nLCdYWCcpKS5sZW5ndGg7XG5cdH07XG5cblx0X3ByaXZhdGUud3JhcENlbGxDb250ZW50ID0gZnVuY3Rpb24odmFsdWUsY29sdW1uSW5kZXgsY29sdW1uT3B0aW9ucyxyb3dUeXBlKXtcblx0XG5cdFx0Ly9FcXVhbGl6ZSBwYWRkaW5nIGZvciBjZW50ZXJlZCBsaW5lcyBcblx0XHRpZihjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpe1x0XG5cdFx0XHRjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0ID0gY29sdW1uT3B0aW9ucy5wYWRkaW5nUmlnaHQgPVxuXHRcdFx0XHRNYXRoLm1heChjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCxjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0LDApO1xuXHRcdH1cblxuXHRcdHZhciBzdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpLFxuXHRcdFx0XHR3aWR0aCA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF0sXG5cdFx0XHRcdGlubmVyV2lkdGggPSB3aWR0aCAtIGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgLVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCAtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF9wcml2YXRlLkdVVFRFUjsgLy9ib3JkZXIvZ3V0dGVyXG5cdFx0XG5cdFx0dmFyIGFsaWduVGd0ID0gKHJvd1R5cGUgPT09ICdoZWFkZXInKSA/IFwiaGVhZGVyQWxpZ25cIiA6IFwiYWxpZ25cIjtcblxuXHRcdGlmIChzdHJpbmcubGVuZ3RoIDwgX3ByaXZhdGUuY2FsY3VsYXRlTGVuZ3RoKHN0cmluZykpIHtcblx0XHRcdC8vV3JhcCBBc2lhbiBjaGFyYWN0ZXJzXG5cdFx0XHR2YXIgY291bnQgPSAwO1xuXHRcdFx0dmFyIHN0YXJ0ID0gMDtcblx0XHRcdHZhciBjaGFyYWN0ZXJzID0gc3RyaW5nLnNwbGl0KCcnKTtcblxuXHRcdFx0c3RyaW5nID0gY2hhcmFjdGVycy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIHZhbHVlLCBpKSB7XG5cdFx0XHRcdGNvdW50ICs9IF9wcml2YXRlLmNhbGN1bGF0ZUxlbmd0aCh2YWx1ZSk7XG5cdFx0XHRcdGlmIChjb3VudCA+IGlubmVyV2lkdGgpIHtcblx0XHRcdFx0XHRwcmV2LnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0LCBpKSk7XG5cdFx0XHRcdFx0c3RhcnQgPSBpO1xuXHRcdFx0XHRcdGNvdW50ID0gMDtcblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyYWN0ZXJzLmxlbmd0aCA9PT0gaSArIDEpIHtcblx0XHRcdFx0XHRwcmV2LnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0KSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcHJldjtcblx0XHRcdH0sIFtdKS5qb2luKCdcXG4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0XG5cdFx0XHRzdHJpbmcgPSB3cmFwKHN0cmluZyx7XG5cdFx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aCAtIFxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgLVxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHR0cmltIDogdHJ1ZSxcblx0XHRcdFx0aW5kZW50IDogJydcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vQnJlYWsgc3RyaW5nIGludG8gYXJyYXkgb2YgbGluZXNcblx0XHR2YXIgc3RyQXJyID0gc3RyaW5nLnNwbGl0KCdcXG4nKTtcblxuXHRcdC8vRm9ybWF0IGVhY2ggbGluZVxuXHRcdHN0ckFyciA9IHN0ckFyci5tYXAoZnVuY3Rpb24obGluZSl7XG5cblx0XHRcdGxpbmUgPSBsaW5lLnRyaW0oKTtcdFxuXHRcdFx0dmFyIGxpbmVMZW5ndGggPSBfcHJpdmF0ZS5jYWxjdWxhdGVMZW5ndGgobGluZSk7XG5cblx0XHRcdC8vYWxpZ24gXG5cdFx0XHRpZihsaW5lTGVuZ3RoIDwgd2lkdGgpe1xuXHRcdFx0XHR2YXIgZW1wdHlTcGFjZSA9IHdpZHRoIC0gbGluZUxlbmd0aDsgXG5cdFx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0XHRjYXNlKGNvbHVtbk9wdGlvbnNbYWxpZ25UZ3RdID09PSAnY2VudGVyJyk6XG5cdFx0XHRcdFx0XHRlbXB0eVNwYWNlIC0tO1xuXHRcdFx0XHRcdFx0dmFyIHBhZEJvdGggPSBNYXRoLmZsb29yKGVtcHR5U3BhY2UgLyAyKSwgXG5cdFx0XHRcdFx0XHRcdFx0cGFkUmVtYWluZGVyID0gZW1wdHlTcGFjZSAlIDI7XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkocGFkQm90aCArIDEpLmpvaW4oJyAnKSArIFxuXHRcdFx0XHRcdFx0XHRsaW5lICtcblx0XHRcdFx0XHRcdFx0QXJyYXkocGFkQm90aCArIDEgKyBwYWRSZW1haW5kZXIpLmpvaW4oJyAnKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UoY29sdW1uT3B0aW9uc1thbGlnblRndF0gPT09ICdyaWdodCcpOlxuXHRcdFx0XHRcdFx0bGluZSA9IEFycmF5KGVtcHR5U3BhY2UgLSBjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCkuam9pbignICcpICsgXG5cdFx0XHRcdFx0XHRcdFx0XHQgbGluZSArIFxuXHRcdFx0XHRcdFx0XHRcdFx0IEFycmF5KGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0ICsgMSkuam9pbignICcpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGxpbmUgPSBBcnJheShjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0ICsgMSkuam9pbignICcpICtcblx0XHRcdFx0XHRcdFx0XHRcdCBsaW5lICsgQXJyYXkoZW1wdHlTcGFjZSAtIGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQpLmpvaW4oJyAnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL0FwcGx5IGNvbG9yc1xuXHRcdFx0c3dpdGNoKHRydWUpe1xuXHRcdFx0XHRjYXNlKHJvd1R5cGUgPT09ICdoZWFkZXInKTpcblx0XHRcdFx0XHRsaW5lID0gKGNvbHVtbk9wdGlvbnMuY29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yKSA/IFxuXHRcdFx0XHRcdFx0X3ByaXZhdGUuY29sb3JpemVMaW5lKGNvbHVtbk9wdGlvbnMuaGVhZGVyQ29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yLGxpbmUpIDogXG5cdFx0XHRcdFx0XHRsaW5lO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBjb2x1bW5PcHRpb25zLmNvbG9yID09PSAnc3RyaW5nJyk6XG5cdFx0XHRcdFx0bGluZSA9IF9wcml2YXRlLmNvbG9yaXplTGluZShjb2x1bW5PcHRpb25zLmNvbG9yLGxpbmUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBfcHVibGljLm9wdGlvbnMuY29sb3IgPT09ICdzdHJpbmcnKTpcblx0XHRcdFx0XHRsaW5lID0gX3ByaXZhdGUuY29sb3JpemVMaW5lKF9wdWJsaWMub3B0aW9ucy5jb2xvcixsaW5lKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0fSk7XG5cblx0XHRzdHJpbmcgPSBzdHJBcnIuam9pbignXFxuJyk7XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdG91dHB1dCA6IHN0cmluZyxcblx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aFxuXHRcdH07XG5cdH07XG5cblx0X3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzID0gZnVuY3Rpb24ocm93KXtcblx0XHQvL1dpZHRocyBhcyBwcmVzY3JpYmVkXG5cdFx0dmFyIHdpZHRocyA9IHJvdy5tYXAoZnVuY3Rpb24oY2VsbCl7XG5cdFx0XHRpZih0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNlbGwud2lkdGggIT09J3VuZGVmaW5lZCcpe1xuXHRcdFx0XHRyZXR1cm4gY2VsbC53aWR0aDtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHJldHVybiBfcHVibGljLm9wdGlvbnMubWF4V2lkdGg7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvL0NoZWNrIHRvIG1ha2Ugc3VyZSB3aWR0aHMgd2lsbCBmaXQgdGhlIGN1cnJlbnQgZGlzcGxheSwgb3IgcmVzaXplLlxuXHRcdHZhciB0b3RhbFdpZHRoID0gd2lkdGhzLnJlZHVjZShmdW5jdGlvbihwcmV2LGN1cnIpe1xuXHRcdFx0cmV0dXJuIHByZXYrY3Vycjtcblx0XHR9KTtcblx0XHQvL0FkZCBtYXJnaW5MZWZ0IHRvIHRvdGFsV2lkdGhcblx0XHR0b3RhbFdpZHRoICs9IF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0O1xuXG5cdFx0Ly9DaGVjayBwcm9jZXNzIGV4aXN0cyBpbiBjYXNlIHdlIGFyZSBpbiBicm93c2VyXG5cdFx0aWYocHJvY2VzcyAmJiBwcm9jZXNzLnN0ZG91dCAmJiB0b3RhbFdpZHRoID4gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyl7XG5cdFx0XHQvL3JlY2FsY3VsYXRlIHByb3BvcnRpb25hdGVseSB0byBmaXQgc2l6ZVxuXHRcdFx0dmFyIHByb3AgPSBwcm9jZXNzLnN0ZG91dC5jb2x1bW5zIC8gdG90YWxXaWR0aDtcblx0XHRcdHByb3AgPSBwcm9wLnRvRml4ZWQoMiktMC4wMTtcblx0XHRcdHdpZHRocyA9IHdpZHRocy5tYXAoZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihwcm9wKnZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aHM7XG5cdH07XG5cblxuXHQvKiogXG5cdCAqIFB1YmxpYyBWYXJpYWJsZXNcblx0ICpcblx0ICovXG5cblxuXHRfcHVibGljLm9wdGlvbnMgPSB7fTtcblxuXG5cdC8qKlxuXHQgKiBQdWJsaWMgTWV0aG9kc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLnNldHVwID0gZnVuY3Rpb24oaGVhZGVyLGJvZHksb3B0aW9ucyl7XG5cdFx0XG5cdFx0X3B1YmxpYy5vcHRpb25zID0gbWVyZ2UodHJ1ZSxfcHJpdmF0ZS5kZWZhdWx0cyxvcHRpb25zKTtcblxuXHRcdC8vYmFja2ZpeGVzIGZvciBzaG9ydGVuZWQgb3B0aW9uIG5hbWVzXG5cdFx0X3B1YmxpYy5vcHRpb25zLmFsaWduID0gX3B1YmxpYy5vcHRpb25zLmFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuYWxpZ247XG5cdFx0X3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduID0gX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuaGVhZGVyQWxpZ247XG5cdFx0XG5cdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzID0gX3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzKGhlYWRlcik7XG5cblx0XHRoZWFkZXIgPSBbaGVhZGVyXTtcblx0XHRfcHJpdmF0ZS50YWJsZS5oZWFkZXIgPSBoZWFkZXIubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93LHtcblx0XHRcdFx0aGVhZGVyOnRydWVcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0X3ByaXZhdGUudGFibGUuYm9keSA9IGJvZHkubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBfcHVibGljO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgYSB0YWJsZSB0byBhIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxuXHQgKiBAbWVtYmVyb2YgVGFibGUgXG5cdCAqIEBleGFtcGxlIFxuXHQgKiBgYGBcblx0ICogdmFyIHN0ciA9IHQxLnJlbmRlcigpOyBcblx0ICogY29uc29sZS5sb2coc3RyKTsgLy9vdXRwdXRzIHRhYmxlXG5cdCAqIGBgYFxuXHQqL1xuXHRfcHVibGljLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHN0ciA9ICcnLFxuXHRcdFx0XHRwYXJ0ID0gWydoZWFkZXInLCdib2R5J10sXG5cdFx0XHRcdGJBcnIgPSBbXSxcblx0XHRcdFx0bWFyZ2luTGVmdCA9IEFycmF5KF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0ICsgMSkuam9pbignXFwgJyksXG5cdFx0XHRcdGJTID0gX3B1YmxpYy5vcHRpb25zLmJvcmRlckNoYXJhY3RlcnNbX3B1YmxpYy5vcHRpb25zLmJvcmRlclN0eWxlXSxcblx0XHRcdFx0Ym9yZGVycyA9IFtdO1xuXG5cdFx0Ly9Cb3JkZXJzXG5cdFx0Zm9yKGE9MDthPDM7YSsrKXtcblx0XHRcdGJvcmRlcnMucHVzaCgnJyk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHMuZm9yRWFjaChmdW5jdGlvbih3LGksYXJyKXtcblx0XHRcdFx0Ym9yZGVyc1thXSArPSBBcnJheSh3KS5qb2luKGJTW2FdLmgpICtcblx0XHRcdFx0XHQoKGkrMSAhPT0gYXJyLmxlbmd0aCkgPyBiU1thXS5qIDogYlNbYV0ucik7XG5cdFx0XHR9KTtcblx0XHRcdGJvcmRlcnNbYV0gPSBiU1thXS5sICsgYm9yZGVyc1thXTtcblx0XHRcdGJvcmRlcnNbYV0gPSBib3JkZXJzW2FdLnNwbGl0KCcnKTtcblx0XHRcdGJvcmRlcnNbYV1bYm9yZGVyc1thXS5sZW5ndGgxXSA9IGJTW2FdLnI7XG5cdFx0XHRib3JkZXJzW2FdID0gYm9yZGVyc1thXS5qb2luKCcnKTtcblx0XHRcdGJvcmRlcnNbYV0gPSBtYXJnaW5MZWZ0ICsgYm9yZGVyc1thXSArICdcXG4nO1xuXHRcdH1cblx0XHRcblx0XHRzdHIgKz0gYm9yZGVyc1swXTtcblxuXHRcdC8vUm93c1xuXHRcdHBhcnQuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuXHRcdFx0d2hpbGUoX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoKXtcblx0XHRcdFx0cm93ID0gX3ByaXZhdGUudGFibGVbcF0uc2hpZnQoKTtcblx0XHRcdFxuXHRcdFx0XHRyb3cuZm9yRWFjaChmdW5jdGlvbihsaW5lKXtcblx0XHRcdFx0XHRzdHIgPSBzdHIgXG5cdFx0XHRcdFx0XHQrIG1hcmdpbkxlZnQgXG5cdFx0XHRcdFx0XHQrIGJTWzFdLnZcblx0XHRcdFx0XHRcdCtcdGxpbmUuam9pbihiU1sxXS52KSBcblx0XHRcdFx0XHRcdCsgYlNbMV0udlxuXHRcdFx0XHRcdFx0KyAnXFxuJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL0pvaW5pbmcgYm9yZGVyXG5cdFx0XHRcdGlmKCEoaT09MSAmJiBfcHJpdmF0ZS50YWJsZVtwXS5sZW5ndGg9PT0wKSl7XG5cdFx0XHRcdFx0c3RyICs9IGJvcmRlcnNbMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdH0pO1xuXHRcdFxuXHRcdC8vQm90dG9tIGJvcmRlclxuXHRcdHN0ciArPSBib3JkZXJzWzJdO1xuXG5cdFx0cmV0dXJuIEFycmF5KF9wdWJsaWMub3B0aW9ucy5tYXJnaW5Ub3AgKyAxKS5qb2luKCdcXG4nKSArIHN0cjtcblx0fVx0XG5cbn07XG5cblxuLyoqXG4gKiBAY2xhc3MgVGFibGVcbiAqIEBwYXJhbSB7YXJyYXl9IGhlYWRlclx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0LSBbU2VlIGV4YW1wbGVdKCNleGFtcGxlLXVzYWdlKVxuICogQHBhcmFtIHtvYmplY3R9IGhlYWRlci5jb2x1bW5cdFx0XHRcdFx0XHRcdFx0XHQtIENvbHVtbiBvcHRpb25zXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBoZWFkZXIuY29sdW1uLmZvcm1hdHRlclx0XHRcdC0gUnVucyBhIGNhbGxiYWNrIG9uIGVhY2ggY2VsbCB2YWx1ZSBpbiB0aGUgcGFyZW50IGNvbHVtblxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWFyZ2luTGVmdFx0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5Ub3BcdFx0XHRcdC0gZGVmYXVsdDogMFx0XHRcdFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWF4V2lkdGhcdFx0XHRcdFx0LSBkZWZhdWx0OiAyMCBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdCb3R0b21cdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nTGVmdFx0XHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ1JpZ2h0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nVG9wXHRcdFx0XHQtIGRlZmF1bHQ6IDBcdFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uYWxpYXNcdFx0XHRcdFx0XHQtIEFsZXJuYXRlIGhlYWRlciBjb2x1bW4gbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uYWxpZ25cdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IFwiY2VudGVyXCJcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmNvbG9yXHRcdFx0XHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5oZWFkZXJBbGlnblx0XHRcdC0gZGVmYXVsdDogXCJjZW50ZXJcIiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckNvbG9yXHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yXG4gKlxuICogQHBhcmFtIHthcnJheX0gcm93c1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQtIFtTZWUgZXhhbXBsZV0oI2V4YW1wbGUtdXNhZ2UpXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcdFx0XHRcdFx0XHRcdFx0XHQtIFRhYmxlIG9wdGlvbnMgXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5ib3JkZXJTdHlsZVx0XHRcdC0gZGVmYXVsdDogMSAoMCA9IG5vIGJvcmRlcikgXG4gKiBSZWZlcnMgdG8gdGhlIGluZGV4IG9mIHRoZSBkZXNpcmVkIGNoYXJhY3RlciBzZXQuIFxuICogQHBhcmFtIHthcnJheX0gb3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzXHQtIFtTZWUgQG5vdGVdKCNub3RlKSBcbiAqIEByZXR1cm5zIHtUYWJsZX1cbiAqIEBub3RlXG4gKiA8YSBuYW1lPVwibm90ZVwiLz5cbiAqIERlZmF1bHQgYm9yZGVyIGNoYXJhY3RlciBzZXRzOlxuICogYGBgXG4gKlx0W1xuICpcdFx0W1xuICpcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiAqXHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG4gKlx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG4gKlx0XHRdLFxuICpcdFx0W1xuICpcdFx0XHR7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG4gKlx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcbiAqXHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSUXCIsIGo6IFwi4pS0XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSYXCJ9XG4gKlx0XHRdLFxuICpcdFx0W1xuICpcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcbiAqXHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG4gKlx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9XG4gKlx0XHRdXG4gKlx0XVxuICogYGBgXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiB2YXIgVGFibGUgPSByZXF1aXJlKCd0dHktdGFibGUnKTtcbiAqIFRhYmxlKGhlYWRlcixyb3dzLG9wdGlvbnMpO1xuICogYGBgXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhlYWRlcixyb3dzLG9wdGlvbnMpe1xuXHR2YXIgbyA9IG5ldyBjbHMoKTtcblx0cmV0dXJuIG8uX3ByaXZhdGUuc2V0dXAoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG52YXIgYW5zaVN0eWxlcyA9IHJlcXVpcmUoJ2Fuc2ktc3R5bGVzJyk7XG52YXIgc3RyaXBBbnNpID0gcmVxdWlyZSgnc3RyaXAtYW5zaScpO1xudmFyIGhhc0Fuc2kgPSByZXF1aXJlKCdoYXMtYW5zaScpO1xudmFyIHN1cHBvcnRzQ29sb3IgPSByZXF1aXJlKCdzdXBwb3J0cy1jb2xvcicpO1xudmFyIGRlZmluZVByb3BzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG52YXIgaXNTaW1wbGVXaW5kb3dzVGVybSA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgIS9eeHRlcm0vaS50ZXN0KHByb2Nlc3MuZW52LlRFUk0pO1xuXG5mdW5jdGlvbiBDaGFsayhvcHRpb25zKSB7XG5cdC8vIGRldGVjdCBtb2RlIGlmIG5vdCBzZXQgbWFudWFsbHlcblx0dGhpcy5lbmFibGVkID0gIW9wdGlvbnMgfHwgb3B0aW9ucy5lbmFibGVkID09PSB1bmRlZmluZWQgPyBzdXBwb3J0c0NvbG9yIDogb3B0aW9ucy5lbmFibGVkO1xufVxuXG4vLyB1c2UgYnJpZ2h0IGJsdWUgb24gV2luZG93cyBhcyB0aGUgbm9ybWFsIGJsdWUgY29sb3IgaXMgaWxsZWdpYmxlXG5pZiAoaXNTaW1wbGVXaW5kb3dzVGVybSkge1xuXHRhbnNpU3R5bGVzLmJsdWUub3BlbiA9ICdcXHUwMDFiWzk0bSc7XG59XG5cbnZhciBzdHlsZXMgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgcmV0ID0ge307XG5cblx0T2JqZWN0LmtleXMoYW5zaVN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0YW5zaVN0eWxlc1trZXldLmNsb3NlUmUgPSBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZ1JlZ2V4cChhbnNpU3R5bGVzW2tleV0uY2xvc2UpLCAnZycpO1xuXG5cdFx0cmV0W2tleV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgdGhpcy5fc3R5bGVzLmNvbmNhdChrZXkpKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufSkoKTtcblxudmFyIHByb3RvID0gZGVmaW5lUHJvcHMoZnVuY3Rpb24gY2hhbGsoKSB7fSwgc3R5bGVzKTtcblxuZnVuY3Rpb24gYnVpbGQoX3N0eWxlcykge1xuXHR2YXIgYnVpbGRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gYXBwbHlTdHlsZS5hcHBseShidWlsZGVyLCBhcmd1bWVudHMpO1xuXHR9O1xuXG5cdGJ1aWxkZXIuX3N0eWxlcyA9IF9zdHlsZXM7XG5cdGJ1aWxkZXIuZW5hYmxlZCA9IHRoaXMuZW5hYmxlZDtcblx0Ly8gX19wcm90b19fIGlzIHVzZWQgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlLlxuXHQvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXHRidWlsZGVyLl9fcHJvdG9fXyA9IHByb3RvO1xuXG5cdHJldHVybiBidWlsZGVyO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlKCkge1xuXHQvLyBzdXBwb3J0IHZhcmFncywgYnV0IHNpbXBseSBjYXN0IHRvIHN0cmluZyBpbiBjYXNlIHRoZXJlJ3Mgb25seSBvbmUgYXJnXG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHR2YXIgYXJnc0xlbiA9IGFyZ3MubGVuZ3RoO1xuXHR2YXIgc3RyID0gYXJnc0xlbiAhPT0gMCAmJiBTdHJpbmcoYXJndW1lbnRzWzBdKTtcblxuXHRpZiAoYXJnc0xlbiA+IDEpIHtcblx0XHQvLyBkb24ndCBzbGljZSBgYXJndW1lbnRzYCwgaXQgcHJldmVudHMgdjggb3B0aW1pemF0aW9uc1xuXHRcdGZvciAodmFyIGEgPSAxOyBhIDwgYXJnc0xlbjsgYSsrKSB7XG5cdFx0XHRzdHIgKz0gJyAnICsgYXJnc1thXTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIXRoaXMuZW5hYmxlZCB8fCAhc3RyKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHZhciBuZXN0ZWRTdHlsZXMgPSB0aGlzLl9zdHlsZXM7XG5cdHZhciBpID0gbmVzdGVkU3R5bGVzLmxlbmd0aDtcblxuXHQvLyBUdXJucyBvdXQgdGhhdCBvbiBXaW5kb3dzIGRpbW1lZCBncmF5IHRleHQgYmVjb21lcyBpbnZpc2libGUgaW4gY21kLmV4ZSxcblx0Ly8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9jaGFsay9pc3N1ZXMvNThcblx0Ly8gSWYgd2UncmUgb24gV2luZG93cyBhbmQgd2UncmUgZGVhbGluZyB3aXRoIGEgZ3JheSBjb2xvciwgdGVtcG9yYXJpbHkgbWFrZSAnZGltJyBhIG5vb3AuXG5cdHZhciBvcmlnaW5hbERpbSA9IGFuc2lTdHlsZXMuZGltLm9wZW47XG5cdGlmIChpc1NpbXBsZVdpbmRvd3NUZXJtICYmIChuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JheScpICE9PSAtMSB8fCBuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JleScpICE9PSAtMSkpIHtcblx0XHRhbnNpU3R5bGVzLmRpbS5vcGVuID0gJyc7XG5cdH1cblxuXHR3aGlsZSAoaS0tKSB7XG5cdFx0dmFyIGNvZGUgPSBhbnNpU3R5bGVzW25lc3RlZFN0eWxlc1tpXV07XG5cblx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHQvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG5cdFx0Ly8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cblx0XHRzdHIgPSBjb2RlLm9wZW4gKyBzdHIucmVwbGFjZShjb2RlLmNsb3NlUmUsIGNvZGUub3BlbikgKyBjb2RlLmNsb3NlO1xuXHR9XG5cblx0Ly8gUmVzZXQgdGhlIG9yaWdpbmFsICdkaW0nIGlmIHdlIGNoYW5nZWQgaXQgdG8gd29yayBhcm91bmQgdGhlIFdpbmRvd3MgZGltbWVkIGdyYXkgaXNzdWUuXG5cdGFuc2lTdHlsZXMuZGltLm9wZW4gPSBvcmlnaW5hbERpbTtcblxuXHRyZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuXHR2YXIgcmV0ID0ge307XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0cmV0W25hbWVdID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIFtuYW1lXSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZGVmaW5lUHJvcHMoQ2hhbGsucHJvdG90eXBlLCBpbml0KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDaGFsaygpO1xubW9kdWxlLmV4cG9ydHMuc3R5bGVzID0gYW5zaVN0eWxlcztcbm1vZHVsZS5leHBvcnRzLmhhc0NvbG9yID0gaGFzQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN0cmlwQ29sb3IgPSBzdHJpcEFuc2k7XG5tb2R1bGUuZXhwb3J0cy5zdXBwb3J0c0NvbG9yID0gc3VwcG9ydHNDb2xvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMgKCkge1xuXHR2YXIgc3R5bGVzID0ge1xuXHRcdG1vZGlmaWVyczoge1xuXHRcdFx0cmVzZXQ6IFswLCAwXSxcblx0XHRcdGJvbGQ6IFsxLCAyMl0sIC8vIDIxIGlzbid0IHdpZGVseSBzdXBwb3J0ZWQgYW5kIDIyIGRvZXMgdGhlIHNhbWUgdGhpbmdcblx0XHRcdGRpbTogWzIsIDIyXSxcblx0XHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHRcdHVuZGVybGluZTogWzQsIDI0XSxcblx0XHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0XHRoaWRkZW46IFs4LCAyOF0sXG5cdFx0XHRzdHJpa2V0aHJvdWdoOiBbOSwgMjldXG5cdFx0fSxcblx0XHRjb2xvcnM6IHtcblx0XHRcdGJsYWNrOiBbMzAsIDM5XSxcblx0XHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0XHRncmVlbjogWzMyLCAzOV0sXG5cdFx0XHR5ZWxsb3c6IFszMywgMzldLFxuXHRcdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0XHRtYWdlbnRhOiBbMzUsIDM5XSxcblx0XHRcdGN5YW46IFszNiwgMzldLFxuXHRcdFx0d2hpdGU6IFszNywgMzldLFxuXHRcdFx0Z3JheTogWzkwLCAzOV1cblx0XHR9LFxuXHRcdGJnQ29sb3JzOiB7XG5cdFx0XHRiZ0JsYWNrOiBbNDAsIDQ5XSxcblx0XHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRcdGJnR3JlZW46IFs0MiwgNDldLFxuXHRcdFx0YmdZZWxsb3c6IFs0MywgNDldLFxuXHRcdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRcdGJnTWFnZW50YTogWzQ1LCA0OV0sXG5cdFx0XHRiZ0N5YW46IFs0NiwgNDldLFxuXHRcdFx0YmdXaGl0ZTogWzQ3LCA0OV1cblx0XHR9XG5cdH07XG5cblx0Ly8gZml4IGh1bWFuc1xuXHRzdHlsZXMuY29sb3JzLmdyZXkgPSBzdHlsZXMuY29sb3JzLmdyYXk7XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChncm91cE5hbWUpIHtcblx0XHR2YXIgZ3JvdXAgPSBzdHlsZXNbZ3JvdXBOYW1lXTtcblxuXHRcdE9iamVjdC5rZXlzKGdyb3VwKS5mb3JFYWNoKGZ1bmN0aW9uIChzdHlsZU5hbWUpIHtcblx0XHRcdHZhciBzdHlsZSA9IGdyb3VwW3N0eWxlTmFtZV07XG5cblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0gZ3JvdXBbc3R5bGVOYW1lXSA9IHtcblx0XHRcdFx0b3BlbjogJ1xcdTAwMWJbJyArIHN0eWxlWzBdICsgJ20nLFxuXHRcdFx0XHRjbG9zZTogJ1xcdTAwMWJbJyArIHN0eWxlWzFdICsgJ20nXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgZ3JvdXBOYW1lLCB7XG5cdFx0XHR2YWx1ZTogZ3JvdXAsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0Z2V0OiBhc3NlbWJsZVN0eWxlc1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtYXRjaE9wZXJhdG9yc1JlID0gL1t8XFxcXHt9KClbXFxdXiQrKj8uXS9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0aWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcblx0fVxuXG5cdHJldHVybiBzdHIucmVwbGFjZShtYXRjaE9wZXJhdG9yc1JlLCAgJ1xcXFwkJicpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4Jyk7XG52YXIgcmUgPSBuZXcgUmVnRXhwKGFuc2lSZWdleCgpLnNvdXJjZSk7IC8vIHJlbW92ZSB0aGUgYGdgIGZsYWdcbm1vZHVsZS5leHBvcnRzID0gcmUudGVzdC5iaW5kKHJlKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYXJndiA9IHByb2Nlc3MuYXJndjtcblxudmFyIHRlcm1pbmF0b3IgPSBhcmd2LmluZGV4T2YoJy0tJyk7XG52YXIgaGFzRmxhZyA9IGZ1bmN0aW9uIChmbGFnKSB7XG5cdGZsYWcgPSAnLS0nICsgZmxhZztcblx0dmFyIHBvcyA9IGFyZ3YuaW5kZXhPZihmbGFnKTtcblx0cmV0dXJuIHBvcyAhPT0gLTEgJiYgKHRlcm1pbmF0b3IgIT09IC0xID8gcG9zIDwgdGVybWluYXRvciA6IHRydWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXHRpZiAoJ0ZPUkNFX0NPTE9SJyBpbiBwcm9jZXNzLmVudikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKGhhc0ZsYWcoJ25vLWNvbG9yJykgfHxcblx0XHRoYXNGbGFnKCduby1jb2xvcnMnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPWZhbHNlJykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9dHJ1ZScpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9YWx3YXlzJykpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnN0ZG91dCAmJiAhcHJvY2Vzcy5zdGRvdXQuaXNUVFkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKCdDT0xPUlRFUk0nIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5lbnYuVEVSTSA9PT0gJ2R1bWInKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKC9ec2NyZWVufF54dGVybXxednQxMDB8Y29sb3J8YW5zaXxjeWd3aW58bGludXgvaS50ZXN0KHByb2Nlc3MuZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59KSgpO1xuIiwiLyohXHJcbiAqIEBuYW1lIEphdmFTY3JpcHQvTm9kZUpTIE1lcmdlIHYxLjIuMFxyXG4gKiBAYXV0aG9yIHllaWtvc1xyXG4gKiBAcmVwb3NpdG9yeSBodHRwczovL2dpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlXHJcblxyXG4gKiBDb3B5cmlnaHQgMjAxNCB5ZWlrb3MgLSBNSVQgbGljZW5zZVxyXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZS9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXHJcbjsoZnVuY3Rpb24oaXNOb2RlKSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIG9uZSBvciBtb3JlIG9iamVjdHMgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgUHVibGljID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIGZhbHNlLCBhcmd1bWVudHMpO1xyXG5cclxuXHR9LCBwdWJsaWNOYW1lID0gJ21lcmdlJztcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9yIG1vcmUgb2JqZWN0cyByZWN1cnNpdmVseSBcclxuXHQgKiBAcGFyYW0gYm9vbD8gY2xvbmVcclxuXHQgKiBAcGFyYW0gbWl4ZWQsLi4uIGFyZ3VtZW50c1xyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdFB1YmxpYy5yZWN1cnNpdmUgPSBmdW5jdGlvbihjbG9uZSkge1xyXG5cclxuXHRcdHJldHVybiBtZXJnZShjbG9uZSA9PT0gdHJ1ZSwgdHJ1ZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogQ2xvbmUgdGhlIGlucHV0IHJlbW92aW5nIGFueSByZWZlcmVuY2VcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcmV0dXJuIG1peGVkXHJcblx0ICovXHJcblxyXG5cdFB1YmxpYy5jbG9uZSA9IGZ1bmN0aW9uKGlucHV0KSB7XHJcblxyXG5cdFx0dmFyIG91dHB1dCA9IGlucHV0LFxyXG5cdFx0XHR0eXBlID0gdHlwZU9mKGlucHV0KSxcclxuXHRcdFx0aW5kZXgsIHNpemU7XHJcblxyXG5cdFx0aWYgKHR5cGUgPT09ICdhcnJheScpIHtcclxuXHJcblx0XHRcdG91dHB1dCA9IFtdO1xyXG5cdFx0XHRzaXplID0gaW5wdXQubGVuZ3RoO1xyXG5cclxuXHRcdFx0Zm9yIChpbmRleD0wO2luZGV4PHNpemU7KytpbmRleClcclxuXHJcblx0XHRcdFx0b3V0cHV0W2luZGV4XSA9IFB1YmxpYy5jbG9uZShpbnB1dFtpbmRleF0pO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdG91dHB1dCA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yIChpbmRleCBpbiBpbnB1dClcclxuXHJcblx0XHRcdFx0b3V0cHV0W2luZGV4XSA9IFB1YmxpYy5jbG9uZShpbnB1dFtpbmRleF0pO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0cHV0O1xyXG5cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb2JqZWN0cyByZWN1cnNpdmVseVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEBwYXJhbSBtaXhlZCBleHRlbmRcclxuXHQgKiBAcmV0dXJuIG1peGVkXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlX3JlY3Vyc2l2ZShiYXNlLCBleHRlbmQpIHtcclxuXHJcblx0XHRpZiAodHlwZU9mKGJhc2UpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJldHVybiBleHRlbmQ7XHJcblxyXG5cdFx0Zm9yICh2YXIga2V5IGluIGV4dGVuZCkge1xyXG5cclxuXHRcdFx0aWYgKHR5cGVPZihiYXNlW2tleV0pID09PSAnb2JqZWN0JyAmJiB0eXBlT2YoZXh0ZW5kW2tleV0pID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0XHRiYXNlW2tleV0gPSBtZXJnZV9yZWN1cnNpdmUoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGJhc2U7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9yIG1vcmUgb2JqZWN0c1xyXG5cdCAqIEBwYXJhbSBib29sIGNsb25lXHJcblx0ICogQHBhcmFtIGJvb2wgcmVjdXJzaXZlXHJcblx0ICogQHBhcmFtIGFycmF5IGFyZ3ZcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZShjbG9uZSwgcmVjdXJzaXZlLCBhcmd2KSB7XHJcblxyXG5cdFx0dmFyIHJlc3VsdCA9IGFyZ3ZbMF0sXHJcblx0XHRcdHNpemUgPSBhcmd2Lmxlbmd0aDtcclxuXHJcblx0XHRpZiAoY2xvbmUgfHwgdHlwZU9mKHJlc3VsdCkgIT09ICdvYmplY3QnKVxyXG5cclxuXHRcdFx0cmVzdWx0ID0ge307XHJcblxyXG5cdFx0Zm9yICh2YXIgaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpIHtcclxuXHJcblx0XHRcdHZhciBpdGVtID0gYXJndltpbmRleF0sXHJcblxyXG5cdFx0XHRcdHR5cGUgPSB0eXBlT2YoaXRlbSk7XHJcblxyXG5cdFx0XHRpZiAodHlwZSAhPT0gJ29iamVjdCcpIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGl0ZW0pIHtcclxuXHJcblx0XHRcdFx0dmFyIHNpdGVtID0gY2xvbmUgPyBQdWJsaWMuY2xvbmUoaXRlbVtrZXldKSA6IGl0ZW1ba2V5XTtcclxuXHJcblx0XHRcdFx0aWYgKHJlY3Vyc2l2ZSkge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKHJlc3VsdFtrZXldLCBzaXRlbSk7XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBzaXRlbTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0eXBlIG9mIHZhcmlhYmxlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBzdHJpbmdcclxuXHQgKlxyXG5cdCAqIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vdHlwZW9mdmFyXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHR5cGVPZihpbnB1dCkge1xyXG5cclxuXHRcdHJldHVybiAoe30pLnRvU3RyaW5nLmNhbGwoaW5wdXQpLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdGlmIChpc05vZGUpIHtcclxuXHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IFB1YmxpYztcclxuXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHR3aW5kb3dbcHVibGljTmFtZV0gPSBQdWJsaWM7XHJcblxyXG5cdH1cclxuXHJcbn0pKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZSAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKTsiLCIndXNlIHN0cmljdCc7XG52YXIgYW5zaVJlZ2V4ID0gcmVxdWlyZSgnYW5zaS1yZWdleCcpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRyZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgPyBzdHIucmVwbGFjZShhbnNpUmVnZXgsICcnKSA6IHN0cjtcbn07XG4iLCIvKiFcbiAqIHdvcmQtd3JhcCA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvd29yZC13cmFwPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1LCBKb24gU2NobGlua2VydC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqXG4gKiBBZGFwdGVkIGZyb20gaHR0cDovL2phbWVzLnBhZG9sc2V5LmNvbS9qYXZhc2NyaXB0L3dvcmR3cmFwLWZvci1qYXZhc2NyaXB0L1xuICogQGF0dHJpYnV0aW9uXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmIChzdHIgPT0gbnVsbCkge1xuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IDUwO1xuICB2YXIgaW5kZW50ID0gKHR5cGVvZiBvcHRpb25zLmluZGVudCA9PT0gJ3N0cmluZycpXG4gICAgPyBvcHRpb25zLmluZGVudFxuICAgIDogJyAgJztcblxuICB2YXIgbmV3bGluZSA9IG9wdGlvbnMubmV3bGluZSB8fCAnXFxuJyArIGluZGVudDtcblxuICB2YXIgcmUgPSBuZXcgUmVnRXhwKCcuezEsJyArIHdpZHRoICsgJ30oXFxcXHMrfCQpfFxcXFxTKz8oXFxcXHMrfCQpJywgJ2cnKTtcblxuICBpZiAob3B0aW9ucy5jdXQpIHtcbiAgICByZSA9IG5ldyBSZWdFeHAoJy57MSwnICsgd2lkdGggKyAnfScsICdnJyk7XG4gIH1cblxuICB2YXIgbGluZXMgPSBzdHIubWF0Y2gocmUpIHx8IFtdO1xuICB2YXIgcmVzID0gaW5kZW50ICsgbGluZXMuam9pbihuZXdsaW5lKTtcblxuICBpZiAob3B0aW9ucy50cmltID09PSB0cnVlKSB7XG4gICAgcmVzID0gcmVzLnJlcGxhY2UoL1sgXFx0XSokL2dtLCAnJyk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iXX0=
