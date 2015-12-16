require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],"tty-table":[function(require,module,exports){
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

},{"_process":1,"chalk":2,"merge":8,"strip-ansi":9,"word-wrap":11}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2hvbWUvYmFzZS8ubnZtL3ZlcnNpb25zL25vZGUvdjQuMC4wL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vaG9tZS9iYXNlLy5udm0vdmVyc2lvbnMvbm9kZS92NC4wLjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvY2hhbGsvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9lc2NhcGUtc3RyaW5nLXJlZ2V4cC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvaGFzLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2hhcy1hbnNpL25vZGVfbW9kdWxlcy9hbnNpLXJlZ2V4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9zdXBwb3J0cy1jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJnZS9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9zdHJpcC1hbnNpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dvcmQtd3JhcC9pbmRleC5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xudmFyIGFuc2lTdHlsZXMgPSByZXF1aXJlKCdhbnNpLXN0eWxlcycpO1xudmFyIHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcbnZhciBoYXNBbnNpID0gcmVxdWlyZSgnaGFzLWFuc2knKTtcbnZhciBzdXBwb3J0c0NvbG9yID0gcmVxdWlyZSgnc3VwcG9ydHMtY29sb3InKTtcbnZhciBkZWZpbmVQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIGlzU2ltcGxlV2luZG93c1Rlcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmICEvXnh0ZXJtL2kudGVzdChwcm9jZXNzLmVudi5URVJNKTtcblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuXHQvLyBkZXRlY3QgbW9kZSBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdHRoaXMuZW5hYmxlZCA9ICFvcHRpb25zIHx8IG9wdGlvbnMuZW5hYmxlZCA9PT0gdW5kZWZpbmVkID8gc3VwcG9ydHNDb2xvciA6IG9wdGlvbnMuZW5hYmxlZDtcbn1cblxuLy8gdXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcblx0YW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxYls5NG0nO1xufVxuXG52YXIgc3R5bGVzID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKGFuc2lTdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFuc2lTdHlsZXNba2V5XS5jbG9zZVJlID0gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlc1trZXldLmNsb3NlKSwgJ2cnKTtcblxuXHRcdHJldFtrZXldID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIHRoaXMuX3N0eWxlcy5jb25jYXQoa2V5KSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn0pKCk7XG5cbnZhciBwcm90byA9IGRlZmluZVByb3BzKGZ1bmN0aW9uIGNoYWxrKCkge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMpIHtcblx0dmFyIGJ1aWxkZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGFwcGx5U3R5bGUuYXBwbHkoYnVpbGRlciwgYXJndW1lbnRzKTtcblx0fTtcblxuXHRidWlsZGVyLl9zdHlsZXMgPSBfc3R5bGVzO1xuXHRidWlsZGVyLmVuYWJsZWQgPSB0aGlzLmVuYWJsZWQ7XG5cdC8vIF9fcHJvdG9fXyBpcyB1c2VkIGJlY2F1c2Ugd2UgbXVzdCByZXR1cm4gYSBmdW5jdGlvbiwgYnV0IHRoZXJlIGlzXG5cdC8vIG5vIHdheSB0byBjcmVhdGUgYSBmdW5jdGlvbiB3aXRoIGEgZGlmZmVyZW50IHByb3RvdHlwZS5cblx0LyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblx0YnVpbGRlci5fX3Byb3RvX18gPSBwcm90bztcblxuXHRyZXR1cm4gYnVpbGRlcjtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZSgpIHtcblx0Ly8gc3VwcG9ydCB2YXJhZ3MsIGJ1dCBzaW1wbHkgY2FzdCB0byBzdHJpbmcgaW4gY2FzZSB0aGVyZSdzIG9ubHkgb25lIGFyZ1xuXHR2YXIgYXJncyA9IGFyZ3VtZW50cztcblx0dmFyIGFyZ3NMZW4gPSBhcmdzLmxlbmd0aDtcblx0dmFyIHN0ciA9IGFyZ3NMZW4gIT09IDAgJiYgU3RyaW5nKGFyZ3VtZW50c1swXSk7XG5cblx0aWYgKGFyZ3NMZW4gPiAxKSB7XG5cdFx0Ly8gZG9uJ3Qgc2xpY2UgYGFyZ3VtZW50c2AsIGl0IHByZXZlbnRzIHY4IG9wdGltaXphdGlvbnNcblx0XHRmb3IgKHZhciBhID0gMTsgYSA8IGFyZ3NMZW47IGErKykge1xuXHRcdFx0c3RyICs9ICcgJyArIGFyZ3NbYV07XG5cdFx0fVxuXHR9XG5cblx0aWYgKCF0aGlzLmVuYWJsZWQgfHwgIXN0cikge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHR2YXIgbmVzdGVkU3R5bGVzID0gdGhpcy5fc3R5bGVzO1xuXHR2YXIgaSA9IG5lc3RlZFN0eWxlcy5sZW5ndGg7XG5cblx0Ly8gVHVybnMgb3V0IHRoYXQgb24gV2luZG93cyBkaW1tZWQgZ3JheSB0ZXh0IGJlY29tZXMgaW52aXNpYmxlIGluIGNtZC5leGUsXG5cdC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvaXNzdWVzLzU4XG5cdC8vIElmIHdlJ3JlIG9uIFdpbmRvd3MgYW5kIHdlJ3JlIGRlYWxpbmcgd2l0aCBhIGdyYXkgY29sb3IsIHRlbXBvcmFyaWx5IG1ha2UgJ2RpbScgYSBub29wLlxuXHR2YXIgb3JpZ2luYWxEaW0gPSBhbnNpU3R5bGVzLmRpbS5vcGVuO1xuXHRpZiAoaXNTaW1wbGVXaW5kb3dzVGVybSAmJiAobmVzdGVkU3R5bGVzLmluZGV4T2YoJ2dyYXknKSAhPT0gLTEgfHwgbmVzdGVkU3R5bGVzLmluZGV4T2YoJ2dyZXknKSAhPT0gLTEpKSB7XG5cdFx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9ICcnO1xuXHR9XG5cblx0d2hpbGUgKGktLSkge1xuXHRcdHZhciBjb2RlID0gYW5zaVN0eWxlc1tuZXN0ZWRTdHlsZXNbaV1dO1xuXG5cdFx0Ly8gUmVwbGFjZSBhbnkgaW5zdGFuY2VzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgcmUtb3BlbmluZyBjb2RlXG5cdFx0Ly8gb3RoZXJ3aXNlIG9ubHkgdGhlIHBhcnQgb2YgdGhlIHN0cmluZyB1bnRpbCBzYWlkIGNsb3NpbmcgY29kZVxuXHRcdC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG5cdFx0c3RyID0gY29kZS5vcGVuICsgc3RyLnJlcGxhY2UoY29kZS5jbG9zZVJlLCBjb2RlLm9wZW4pICsgY29kZS5jbG9zZTtcblx0fVxuXG5cdC8vIFJlc2V0IHRoZSBvcmlnaW5hbCAnZGltJyBpZiB3ZSBjaGFuZ2VkIGl0IHRvIHdvcmsgYXJvdW5kIHRoZSBXaW5kb3dzIGRpbW1lZCBncmF5IGlzc3VlLlxuXHRhbnNpU3R5bGVzLmRpbS5vcGVuID0gb3JpZ2luYWxEaW07XG5cblx0cmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdHJldFtuYW1lXSA9IHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gYnVpbGQuY2FsbCh0aGlzLCBbbmFtZV0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59XG5cbmRlZmluZVByb3BzKENoYWxrLnByb3RvdHlwZSwgaW5pdCgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQ2hhbGsoKTtcbm1vZHVsZS5leHBvcnRzLnN0eWxlcyA9IGFuc2lTdHlsZXM7XG5tb2R1bGUuZXhwb3J0cy5oYXNDb2xvciA9IGhhc0Fuc2k7XG5tb2R1bGUuZXhwb3J0cy5zdHJpcENvbG9yID0gc3RyaXBBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3VwcG9ydHNDb2xvciA9IHN1cHBvcnRzQ29sb3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU3R5bGVzICgpIHtcblx0dmFyIHN0eWxlcyA9IHtcblx0XHRtb2RpZmllcnM6IHtcblx0XHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0XHRib2xkOiBbMSwgMjJdLCAvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0XHRkaW06IFsyLCAyMl0sXG5cdFx0XHRpdGFsaWM6IFszLCAyM10sXG5cdFx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0XHRpbnZlcnNlOiBbNywgMjddLFxuXHRcdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdFx0c3RyaWtldGhyb3VnaDogWzksIDI5XVxuXHRcdH0sXG5cdFx0Y29sb3JzOiB7XG5cdFx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHRcdHdoaXRlOiBbMzcsIDM5XSxcblx0XHRcdGdyYXk6IFs5MCwgMzldXG5cdFx0fSxcblx0XHRiZ0NvbG9yczoge1xuXHRcdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRcdGJnV2hpdGU6IFs0NywgNDldXG5cdFx0fVxuXHR9O1xuXG5cdC8vIGZpeCBodW1hbnNcblx0c3R5bGVzLmNvbG9ycy5ncmV5ID0gc3R5bGVzLmNvbG9ycy5ncmF5O1xuXG5cdE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXBOYW1lKSB7XG5cdFx0dmFyIGdyb3VwID0gc3R5bGVzW2dyb3VwTmFtZV07XG5cblx0XHRPYmplY3Qua2V5cyhncm91cCkuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGVOYW1lKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSBncm91cFtzdHlsZU5hbWVdO1xuXG5cdFx0XHRzdHlsZXNbc3R5bGVOYW1lXSA9IGdyb3VwW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46ICdcXHUwMDFiWycgKyBzdHlsZVswXSArICdtJyxcblx0XHRcdFx0Y2xvc2U6ICdcXHUwMDFiWycgKyBzdHlsZVsxXSArICdtJ1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsIGdyb3VwTmFtZSwge1xuXHRcdFx0dmFsdWU6IGdyb3VwLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdGVudW1lcmFibGU6IHRydWUsXG5cdGdldDogYXNzZW1ibGVTdHlsZXNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWF0Y2hPcGVyYXRvcnNSZSA9IC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nJyk7XG5cdH1cblxuXHRyZXR1cm4gc3RyLnJlcGxhY2UobWF0Y2hPcGVyYXRvcnNSZSwgICdcXFxcJCYnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYW5zaVJlZ2V4ID0gcmVxdWlyZSgnYW5zaS1yZWdleCcpO1xudmFyIHJlID0gbmV3IFJlZ0V4cChhbnNpUmVnZXgoKS5zb3VyY2UpOyAvLyByZW1vdmUgdGhlIGBnYCBmbGFnXG5tb2R1bGUuZXhwb3J0cyA9IHJlLnRlc3QuYmluZChyZSk7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIC9bXFx1MDAxYlxcdTAwOWJdW1soKSM7P10qKD86WzAtOV17MSw0fSg/OjtbMC05XXswLDR9KSopP1swLTlBLU9SWmNmLW5xcnk9PjxdL2c7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFyZ3YgPSBwcm9jZXNzLmFyZ3Y7XG5cbnZhciB0ZXJtaW5hdG9yID0gYXJndi5pbmRleE9mKCctLScpO1xudmFyIGhhc0ZsYWcgPSBmdW5jdGlvbiAoZmxhZykge1xuXHRmbGFnID0gJy0tJyArIGZsYWc7XG5cdHZhciBwb3MgPSBhcmd2LmluZGV4T2YoZmxhZyk7XG5cdHJldHVybiBwb3MgIT09IC0xICYmICh0ZXJtaW5hdG9yICE9PSAtMSA/IHBvcyA8IHRlcm1pbmF0b3IgOiB0cnVlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblx0aWYgKCdGT1JDRV9DT0xPUicgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCduby1jb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnbm8tY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1mYWxzZScpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKGhhc0ZsYWcoJ2NvbG9yJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcnMnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPXRydWUnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPWFsd2F5cycpKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5zdGRvdXQgJiYgIXByb2Nlc3Muc3Rkb3V0LmlzVFRZKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmICgnQ09MT1JURVJNJyBpbiBwcm9jZXNzLmVudikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MuZW52LlRFUk0gPT09ICdkdW1iJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmICgvXnNjcmVlbnxeeHRlcm18XnZ0MTAwfGNvbG9yfGFuc2l8Y3lnd2lufGxpbnV4L2kudGVzdChwcm9jZXNzLmVudi5URVJNKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufSkoKTtcbiIsIi8qIVxyXG4gKiBAbmFtZSBKYXZhU2NyaXB0L05vZGVKUyBNZXJnZSB2MS4yLjBcclxuICogQGF1dGhvciB5ZWlrb3NcclxuICogQHJlcG9zaXRvcnkgaHR0cHM6Ly9naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZVxyXG5cclxuICogQ29weXJpZ2h0IDIwMTQgeWVpa29zIC0gTUlUIGxpY2Vuc2VcclxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2UvbWFzdGVyL0xJQ0VOU0VcclxuICovXHJcblxyXG47KGZ1bmN0aW9uKGlzTm9kZSkge1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSBvbmUgb3IgbW9yZSBvYmplY3RzIFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0dmFyIFB1YmxpYyA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCBmYWxzZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fSwgcHVibGljTmFtZSA9ICdtZXJnZSc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHMgcmVjdXJzaXZlbHkgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMucmVjdXJzaXZlID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIHRydWUsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb25lIHRoZSBpbnB1dCByZW1vdmluZyBhbnkgcmVmZXJlbmNlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMuY2xvbmUgPSBmdW5jdGlvbihpbnB1dCkge1xyXG5cclxuXHRcdHZhciBvdXRwdXQgPSBpbnB1dCxcclxuXHRcdFx0dHlwZSA9IHR5cGVPZihpbnB1dCksXHJcblx0XHRcdGluZGV4LCBzaXplO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAnYXJyYXknKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSBbXTtcclxuXHRcdFx0c2l6ZSA9IGlucHV0Lmxlbmd0aDtcclxuXHJcblx0XHRcdGZvciAoaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSB7fTtcclxuXHJcblx0XHRcdGZvciAoaW5kZXggaW4gaW5wdXQpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9iamVjdHMgcmVjdXJzaXZlbHlcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcGFyYW0gbWl4ZWQgZXh0ZW5kXHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZV9yZWN1cnNpdmUoYmFzZSwgZXh0ZW5kKSB7XHJcblxyXG5cdFx0aWYgKHR5cGVPZihiYXNlKSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXR1cm4gZXh0ZW5kO1xyXG5cclxuXHRcdGZvciAodmFyIGtleSBpbiBleHRlbmQpIHtcclxuXHJcblx0XHRcdGlmICh0eXBlT2YoYmFzZVtrZXldKSA9PT0gJ29iamVjdCcgJiYgdHlwZU9mKGV4dGVuZFtrZXldKSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gZXh0ZW5kW2tleV07XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBiYXNlO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHNcclxuXHQgKiBAcGFyYW0gYm9vbCBjbG9uZVxyXG5cdCAqIEBwYXJhbSBib29sIHJlY3Vyc2l2ZVxyXG5cdCAqIEBwYXJhbSBhcnJheSBhcmd2XHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2UoY2xvbmUsIHJlY3Vyc2l2ZSwgYXJndikge1xyXG5cclxuXHRcdHZhciByZXN1bHQgPSBhcmd2WzBdLFxyXG5cdFx0XHRzaXplID0gYXJndi5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKGNsb25lIHx8IHR5cGVPZihyZXN1bHQpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJlc3VsdCA9IHt9O1xyXG5cclxuXHRcdGZvciAodmFyIGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KSB7XHJcblxyXG5cdFx0XHR2YXIgaXRlbSA9IGFyZ3ZbaW5kZXhdLFxyXG5cclxuXHRcdFx0XHR0eXBlID0gdHlwZU9mKGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgIT09ICdvYmplY3QnKSBjb250aW51ZTtcclxuXHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBpdGVtKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzaXRlbSA9IGNsb25lID8gUHVibGljLmNsb25lKGl0ZW1ba2V5XSkgOiBpdGVtW2tleV07XHJcblxyXG5cdFx0XHRcdGlmIChyZWN1cnNpdmUpIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShyZXN1bHRba2V5XSwgc2l0ZW0pO1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gc2l0ZW07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdHlwZSBvZiB2YXJpYWJsZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gc3RyaW5nXHJcblx0ICpcclxuXHQgKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL3R5cGVvZnZhclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0eXBlT2YoaW5wdXQpIHtcclxuXHJcblx0XHRyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKGlucHV0KS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcclxuXHJcblx0fVxyXG5cclxuXHRpZiAoaXNOb2RlKSB7XHJcblxyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBQdWJsaWM7XHJcblxyXG5cdH0gZWxzZSB7XHJcblxyXG5cdFx0d2luZG93W3B1YmxpY05hbWVdID0gUHVibGljO1xyXG5cclxuXHR9XHJcblxyXG59KSh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnID8gc3RyLnJlcGxhY2UoYW5zaVJlZ2V4LCAnJykgOiBzdHI7XG59O1xuIiwiLyohXG4gKiB3b3JkLXdyYXAgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3dvcmQtd3JhcD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKlxuICogQWRhcHRlZCBmcm9tIGh0dHA6Ly9qYW1lcy5wYWRvbHNleS5jb20vamF2YXNjcmlwdC93b3Jkd3JhcC1mb3ItamF2YXNjcmlwdC9cbiAqIEBhdHRyaWJ1dGlvblxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoc3RyID09IG51bGwpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCA1MDtcbiAgdmFyIGluZGVudCA9ICh0eXBlb2Ygb3B0aW9ucy5pbmRlbnQgPT09ICdzdHJpbmcnKVxuICAgID8gb3B0aW9ucy5pbmRlbnRcbiAgICA6ICcgICc7XG5cbiAgdmFyIG5ld2xpbmUgPSBvcHRpb25zLm5ld2xpbmUgfHwgJ1xcbicgKyBpbmRlbnQ7XG5cbiAgdmFyIHJlID0gbmV3IFJlZ0V4cCgnLnsxLCcgKyB3aWR0aCArICd9KFxcXFxzK3wkKXxcXFxcUys/KFxcXFxzK3wkKScsICdnJyk7XG5cbiAgaWYgKG9wdGlvbnMuY3V0KSB7XG4gICAgcmUgPSBuZXcgUmVnRXhwKCcuezEsJyArIHdpZHRoICsgJ30nLCAnZycpO1xuICB9XG5cbiAgdmFyIGxpbmVzID0gc3RyLm1hdGNoKHJlKSB8fCBbXTtcbiAgdmFyIHJlcyA9IGluZGVudCArIGxpbmVzLmpvaW4obmV3bGluZSk7XG5cbiAgaWYgKG9wdGlvbnMudHJpbSA9PT0gdHJ1ZSkge1xuICAgIHJlcyA9IHJlcy5yZXBsYWNlKC9bIFxcdF0qJC9nbSwgJycpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwidmFyIG1lcmdlID0gcmVxdWlyZShcIm1lcmdlXCIpLFxuXHRcdGNoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpLFxuXHRcdHN0cmlwQW5zaSA9IHJlcXVpcmUoXCJzdHJpcC1hbnNpXCIpLFxuXHRcdHdyYXAgPSByZXF1aXJlKFwid29yZC13cmFwXCIpO1xuXG5cbnZhciBjbHMgPSBmdW5jdGlvbigpe1xuXG5cblx0dmFyIF9wdWJsaWMgPSB0aGlzLl9wdWJsaWMgPSB7fSxcblx0XHRcdF9wcml2YXRlID0gdGhpcy5fcHJpdmF0ZSA9IHt9O1xuXG5cblx0LyoqIFxuXHQgKiBQcml2YXRlIFZhcmlhYmxlc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmRlZmF1bHRzID0ge1xuXHRcdGRlZmF1bHRWYWx1ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gKHR5cGVvZiBjaGFsayAhPT0gJ3VuZGVmaW5lZCcpID8gY2hhbGsucmVkKFwiI0VSUlwiKSA6IFwiI0VSUlwiO1xuXHRcdFx0Ly9yZXR1cm4gJ251bGwnO1xuXHRcdH0oKSxcblx0XHRtYXJnaW5Ub3AgOiAxLFxuXHRcdG1hcmdpbkxlZnQgOiAyLFxuXHRcdG1heFdpZHRoIDogMjAsXG5cdFx0Zm9ybWF0dGVyIDogbnVsbCxcblx0XHRoZWFkZXJBbGlnbiA6IFwiY2VudGVyXCIsXG5cdFx0YWxpZ24gOiBcImNlbnRlclwiLFxuXHRcdHBhZGRpbmdSaWdodCA6IDAsXG5cdFx0cGFkZGluZ0xlZnQgOiAwLFxuXHRcdHBhZGRpbmdCb3R0b20gOiAwLFxuXHRcdHBhZGRpbmdUb3AgOiAwLFxuXHRcdGNvbG9yIDogZmFsc2UsXG5cdFx0aGVhZGVyQ29sb3IgOiBmYWxzZSxcblx0XHRib3JkZXJTdHlsZSA6IDEsXG5cdFx0Ym9yZGVyQ2hhcmFjdGVycyA6IFtcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSMXCIsIGo6IFwi4pSsXCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSQXCJ9LFxuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJxcIiwgajogXCLilLxcIiwgaDogXCLilIBcIiwgcjogXCLilKRcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUlFwiLCBqOiBcIuKUtFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUmFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifVxuXHRcdFx0XVxuXHRcdF1cblx0fTtcblxuXG5cdC8vQ29uc3RhbnRzXG5cdF9wcml2YXRlLkdVVFRFUiA9IDE7XG5cblxuXHRfcHJpdmF0ZS50YWJsZSA9IHtcblx0XHRjb2x1bW5zIDogW10sXG5cdFx0Y29sdW1uV2lkdGhzIDogW10sXG5cdFx0Y29sdW1uSW5uZXJXaWR0aHMgOiBbXSxcblx0XHRoZWFkZXIgOiBbXSxcblx0XHRib2R5IDogW11cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBQcml2YXRlIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5idWlsZFJvdyA9IGZ1bmN0aW9uKHJvdyxvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgbWluUm93SGVpZ2h0ID0gMDtcblx0XHRcblx0XHQvL3N1cHBvcnQgYm90aCByb3dzIHBhc3NlZCBhcyBhbiBhcnJheSBcblx0XHQvL2FuZCByb3dzIHBhc3NlZCBhcyBhbiBvYmplY3Rcblx0XHRpZih0eXBlb2Ygcm93ID09PSAnb2JqZWN0JyAmJiAhKHJvdyBpbnN0YW5jZW9mIEFycmF5KSl7XG5cdFx0XHRyb3cgPVx0X3ByaXZhdGUudGFibGUuY29sdW1ucy5tYXAoZnVuY3Rpb24ob2JqZWN0KXtcblx0XHRcdFx0cmV0dXJuIHJvd1tvYmplY3QudmFsdWVdIHx8IG51bGw7XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQvL0VuZm9yY2Ugcm93IHNpemVcblx0XHRcdHZhciBkaWZMID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aCAtIHJvdy5sZW5ndGg7XG5cdFx0XHRpZihkaWZMID4gMCl7XG5cdFx0XHRcdC8vQWRkIG51bGwgZWxlbWVudCB0byBhcnJheVxuXHRcdFx0XHRyb3cgPSByb3cuY29uY2F0KEFycmF5LmFwcGx5KG51bGwsIG5ldyBBcnJheShkaWZMKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH0pKTsgXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRpZkwgPCAwKXtcblx0XHRcdFx0Ly9UcnVuY2F0ZSBhcnJheVxuXHRcdFx0XHRyb3cubGVuZ3RoID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL2dldCByb3cgYXMgYXJyYXkgb2YgY2VsbCBhcnJheXNcblx0XHR2YXIgY0FycnMgPSByb3cubWFwKGZ1bmN0aW9uKGNlbGwsaW5kZXgpe1xuXHRcdFx0dmFyIGMgPSBfcHJpdmF0ZS5idWlsZENlbGwoY2VsbCxpbmRleCxvcHRpb25zKTtcblx0XHRcdHZhciBjZWxsQXJyID0gYy5jZWxsQXJyO1xuXHRcdFx0aWYob3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5Jbm5lcldpZHRocy5wdXNoKGMud2lkdGgpO1xuXHRcdFx0fVxuXHRcdFx0bWluUm93SGVpZ2h0ID0gKG1pblJvd0hlaWdodCA8IGNlbGxBcnIubGVuZ3RoKSA/IGNlbGxBcnIubGVuZ3RoIDogbWluUm93SGVpZ2h0O1xuXHRcdFx0cmV0dXJuIGNlbGxBcnI7XG5cdFx0fSk7XG5cblx0XHQvL0FkanVzdCBtaW5Sb3dIZWlnaHQgdG8gcmVmbGVjdCB2ZXJ0aWNhbCByb3cgcGFkZGluZ1xuXHRcdG1pblJvd0hlaWdodCA9IChvcHRpb25zLmhlYWRlcikgPyBtaW5Sb3dIZWlnaHQgOiBtaW5Sb3dIZWlnaHQgKyBcblx0XHRcdChfcHVibGljLm9wdGlvbnMucGFkZGluZ0JvdHRvbSArIF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nVG9wKTtcblxuXHRcdC8vY29udmVydCBhcnJheSBvZiBjZWxsIGFycmF5cyB0byBhcnJheSBvZiBsaW5lc1xuXHRcdHZhciBsaW5lcyA9IEFycmF5LmFwcGx5KG51bGwse2xlbmd0aDptaW5Sb3dIZWlnaHR9KVxuXHRcdFx0Lm1hcChGdW5jdGlvbi5jYWxsLGZ1bmN0aW9uKCl7cmV0dXJuIFtdfSk7XG5cblx0XHRjQXJycy5mb3JFYWNoKGZ1bmN0aW9uKGNlbGxBcnIsYSl7XG5cdFx0XHR2YXIgd2hpdGVsaW5lID0gQXJyYXkoX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzW2FdKS5qb2luKCdcXCAnKTtcblx0XHRcdGlmKCFvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRcdC8vQWRkIHdoaXRlc3BhY2UgZm9yIHRvcCBwYWRkaW5nXG5cdFx0XHRcdGZvcihpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdUb3A7IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci51bnNoaWZ0KHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vQWRkIHdoaXRlc3BhY2UgZm9yIGJvdHRvbSBwYWRkaW5nXG5cdFx0XHRcdGZvcihpPTA7IGk8X3B1YmxpYy5vcHRpb25zLnBhZGRpbmdCb3R0b207IGkrKyl7XG5cdFx0XHRcdFx0Y2VsbEFyci5wdXNoKHdoaXRlbGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdFx0Zm9yKHZhciBiPTA7IGI8bWluUm93SGVpZ2h0OyBiKyspe1x0XG5cdFx0XHRcdGxpbmVzW2JdLnB1c2goKHR5cGVvZiBjZWxsQXJyW2JdICE9ICd1bmRlZmluZWQnKSA/IGNlbGxBcnJbYl0gOiB3aGl0ZWxpbmUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9O1xuXG5cdF9wcml2YXRlLmJ1aWxkQ2VsbCA9IGZ1bmN0aW9uKGNlbGwsY29sdW1uSW5kZXgsb3B0aW9ucyl7XG5cblx0XHQvL1B1bGwgY29sdW1uIG9wdGlvbnNcdFxuXHRcdHZhciBvdXRwdXQ7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XG5cdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRjZWxsID0gbWVyZ2UodHJ1ZSxfcHVibGljLm9wdGlvbnMsY2VsbCk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5zLnB1c2goY2VsbCk7XG5cdFx0XHRvdXRwdXQgPSBjZWxsLmFsaWFzIHx8IGNlbGwudmFsdWU7XG5cdFx0XHRjb2x1bW5PcHRpb25zID0gY2VsbDtcblx0XHR9XHRcblx0XHRlbHNle1xuXHRcdFx0Y29sdW1uT3B0aW9ucyA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbnNbY29sdW1uSW5kZXhdO1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIGNlbGwgIT09IG51bGwpe1x0XG5cdFx0XHRcdGNvbHVtbk9wdGlvbnMgPSBtZXJnZSh0cnVlLGNvbHVtbk9wdGlvbnMsY2VsbCk7XHRcdFxuXHRcdFx0XHRvdXRwdXQgPSBjZWxsLnZhbHVlO1xuXHRcdFx0fVx0XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRvdXRwdXQgPSBjZWxsO1xuXHRcdFx0fVxuXG5cdFx0XHQvL1JlcGxhY2UgdW5kZWZpbmVkL251bGwgY2VsbCB2YWx1ZXMgd2l0aCBwbGFjZWhvbGRlclxuXHRcdFx0b3V0cHV0ID0gKHR5cGVvZiBvdXRwdXQgPT09ICd1bmRlZmluZWQnIHx8IG91dHB1dCA9PT0gbnVsbCkgPyBcblx0XHRcdFx0X3B1YmxpYy5vcHRpb25zLmRlZmF1bHRWYWx1ZSA6IG91dHB1dDtcblx0XHRcdFx0XHRcdFxuXHRcdFx0Ly9SdW4gZm9ybWF0dGVyXG5cdFx0XHRpZih0eXBlb2YgY29sdW1uT3B0aW9ucy5mb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0XHRvdXRwdXQgPSBjb2x1bW5PcHRpb25zLmZvcm1hdHRlcihvdXRwdXQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvL0F1dG9tYXRpYyB0ZXh0IHdyYXBcblx0XHR2YXIgd3JhcE9iaiAgPSBfcHJpdmF0ZS53cmFwQ2VsbENvbnRlbnQob3V0cHV0LGNvbHVtbkluZGV4LGNvbHVtbk9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVyKSA/IFwiaGVhZGVyXCIgOiBcImJvZHlcIik7XG5cdFx0b3V0cHV0ID0gd3JhcE9iai5vdXRwdXQ7XG5cdFx0XG5cdFx0Ly9yZXR1cm4gYXMgYXJyYXkgb2YgbGluZXNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2VsbEFyciA6IG91dHB1dC5zcGxpdCgnXFxuJyksXG5cdFx0XHR3aWR0aCA6IHdyYXBPYmoud2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmNvbG9yaXplQWxsV29yZHMgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdC8vQ29sb3IgZWFjaCB3b3JkIGluIHRoZSBjZWxsIHNvIHRoYXQgbGluZSBicmVha3MgZG9uJ3QgYnJlYWsgY29sb3IgXG5cdFx0dmFyIGFyciA9IHN0ci5yZXBsYWNlKC8oXFxTKykvZ2ksZnVuY3Rpb24obWF0Y2gpe1xuXHRcdFx0cmV0dXJuIGNoYWxrW2NvbG9yXShtYXRjaCkrJ1xcICc7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFycjtcblx0fTtcblxuXHRfcHJpdmF0ZS5jb2xvcml6ZUxpbmUgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdHJldHVybiBjaGFsa1tjb2xvcl0oc3RyKTtcblx0fTtcblxuXHRfcHJpdmF0ZS5jYWxjdWxhdGVMZW5ndGggPSBmdW5jdGlvbiAobGluZSkge1xuXHRcdHJldHVybiBzdHJpcEFuc2kobGluZS5yZXBsYWNlKC9bXlxceDAwLVxceGZmXS9nLCdYWCcpKS5sZW5ndGg7XG5cdH07XG5cblx0X3ByaXZhdGUud3JhcENlbGxDb250ZW50ID0gZnVuY3Rpb24odmFsdWUsY29sdW1uSW5kZXgsY29sdW1uT3B0aW9ucyxyb3dUeXBlKXtcblx0XG5cdFx0Ly9FcXVhbGl6ZSBwYWRkaW5nIGZvciBjZW50ZXJlZCBsaW5lcyBcblx0XHRpZihjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpe1x0XG5cdFx0XHRjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0ID0gY29sdW1uT3B0aW9ucy5wYWRkaW5nUmlnaHQgPVxuXHRcdFx0XHRNYXRoLm1heChjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCxjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0LDApO1xuXHRcdH1cblxuXHRcdHZhciBzdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpLFxuXHRcdFx0XHR3aWR0aCA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF0sXG5cdFx0XHRcdGlubmVyV2lkdGggPSB3aWR0aCAtIGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgLVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCAtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF9wcml2YXRlLkdVVFRFUjsgLy9ib3JkZXIvZ3V0dGVyXG5cdFx0XG5cdFx0dmFyIGFsaWduVGd0ID0gKHJvd1R5cGUgPT09ICdoZWFkZXInKSA/IFwiaGVhZGVyQWxpZ25cIiA6IFwiYWxpZ25cIjtcblxuXHRcdGlmIChzdHJpbmcubGVuZ3RoIDwgX3ByaXZhdGUuY2FsY3VsYXRlTGVuZ3RoKHN0cmluZykpIHtcblx0XHRcdC8vV3JhcCBBc2lhbiBjaGFyYWN0ZXJzXG5cdFx0XHR2YXIgY291bnQgPSAwO1xuXHRcdFx0dmFyIHN0YXJ0ID0gMDtcblx0XHRcdHZhciBjaGFyYWN0ZXJzID0gc3RyaW5nLnNwbGl0KCcnKTtcblxuXHRcdFx0c3RyaW5nID0gY2hhcmFjdGVycy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIHZhbHVlLCBpKSB7XG5cdFx0XHRcdGNvdW50ICs9IF9wcml2YXRlLmNhbGN1bGF0ZUxlbmd0aCh2YWx1ZSk7XG5cdFx0XHRcdGlmIChjb3VudCA+IGlubmVyV2lkdGgpIHtcblx0XHRcdFx0XHRwcmV2LnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0LCBpKSk7XG5cdFx0XHRcdFx0c3RhcnQgPSBpO1xuXHRcdFx0XHRcdGNvdW50ID0gMDtcblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyYWN0ZXJzLmxlbmd0aCA9PT0gaSArIDEpIHtcblx0XHRcdFx0XHRwcmV2LnB1c2goc3RyaW5nLnNsaWNlKHN0YXJ0KSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcHJldjtcblx0XHRcdH0sIFtdKS5qb2luKCdcXG4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0XG5cdFx0XHRzdHJpbmcgPSB3cmFwKHN0cmluZyx7XG5cdFx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aCAtIFxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgLVxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHR0cmltIDogdHJ1ZSxcblx0XHRcdFx0aW5kZW50IDogJydcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vQnJlYWsgc3RyaW5nIGludG8gYXJyYXkgb2YgbGluZXNcblx0XHR2YXIgc3RyQXJyID0gc3RyaW5nLnNwbGl0KCdcXG4nKTtcblxuXHRcdC8vRm9ybWF0IGVhY2ggbGluZVxuXHRcdHN0ckFyciA9IHN0ckFyci5tYXAoZnVuY3Rpb24obGluZSl7XG5cblx0XHRcdGxpbmUgPSBsaW5lLnRyaW0oKTtcdFxuXHRcdFx0dmFyIGxpbmVMZW5ndGggPSBfcHJpdmF0ZS5jYWxjdWxhdGVMZW5ndGgobGluZSk7XG5cblx0XHRcdC8vYWxpZ24gXG5cdFx0XHRpZihsaW5lTGVuZ3RoIDwgd2lkdGgpe1xuXHRcdFx0XHR2YXIgZW1wdHlTcGFjZSA9IHdpZHRoIC0gbGluZUxlbmd0aDsgXG5cdFx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0XHRjYXNlKGNvbHVtbk9wdGlvbnNbYWxpZ25UZ3RdID09PSAnY2VudGVyJyk6XG5cdFx0XHRcdFx0XHRlbXB0eVNwYWNlIC0tO1xuXHRcdFx0XHRcdFx0dmFyIHBhZEJvdGggPSBNYXRoLmZsb29yKGVtcHR5U3BhY2UgLyAyKSwgXG5cdFx0XHRcdFx0XHRcdFx0cGFkUmVtYWluZGVyID0gZW1wdHlTcGFjZSAlIDI7XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkocGFkQm90aCArIDEpLmpvaW4oJyAnKSArIFxuXHRcdFx0XHRcdFx0XHRsaW5lICtcblx0XHRcdFx0XHRcdFx0QXJyYXkocGFkQm90aCArIDEgKyBwYWRSZW1haW5kZXIpLmpvaW4oJyAnKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UoY29sdW1uT3B0aW9uc1thbGlnblRndF0gPT09ICdyaWdodCcpOlxuXHRcdFx0XHRcdFx0bGluZSA9IEFycmF5KGVtcHR5U3BhY2UgLSBjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCkuam9pbignICcpICsgXG5cdFx0XHRcdFx0XHRcdFx0XHQgbGluZSArIFxuXHRcdFx0XHRcdFx0XHRcdFx0IEFycmF5KGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0ICsgMSkuam9pbignICcpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGxpbmUgPSBBcnJheShjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0ICsgMSkuam9pbignICcpICtcblx0XHRcdFx0XHRcdFx0XHRcdCBsaW5lICsgQXJyYXkoZW1wdHlTcGFjZSAtIGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQpLmpvaW4oJyAnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL0FwcGx5IGNvbG9yc1xuXHRcdFx0c3dpdGNoKHRydWUpe1xuXHRcdFx0XHRjYXNlKHJvd1R5cGUgPT09ICdoZWFkZXInKTpcblx0XHRcdFx0XHRsaW5lID0gKGNvbHVtbk9wdGlvbnMuY29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yKSA/IFxuXHRcdFx0XHRcdFx0X3ByaXZhdGUuY29sb3JpemVMaW5lKGNvbHVtbk9wdGlvbnMuaGVhZGVyQ29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yLGxpbmUpIDogXG5cdFx0XHRcdFx0XHRsaW5lO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBjb2x1bW5PcHRpb25zLmNvbG9yID09PSAnc3RyaW5nJyk6XG5cdFx0XHRcdFx0bGluZSA9IF9wcml2YXRlLmNvbG9yaXplTGluZShjb2x1bW5PcHRpb25zLmNvbG9yLGxpbmUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBfcHVibGljLm9wdGlvbnMuY29sb3IgPT09ICdzdHJpbmcnKTpcblx0XHRcdFx0XHRsaW5lID0gX3ByaXZhdGUuY29sb3JpemVMaW5lKF9wdWJsaWMub3B0aW9ucy5jb2xvcixsaW5lKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0fSk7XG5cblx0XHRzdHJpbmcgPSBzdHJBcnIuam9pbignXFxuJyk7XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdG91dHB1dCA6IHN0cmluZyxcblx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aFxuXHRcdH07XG5cdH07XG5cblx0X3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzID0gZnVuY3Rpb24ocm93KXtcblx0XHQvL1dpZHRocyBhcyBwcmVzY3JpYmVkXG5cdFx0dmFyIHdpZHRocyA9IHJvdy5tYXAoZnVuY3Rpb24oY2VsbCl7XG5cdFx0XHRpZih0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNlbGwud2lkdGggIT09J3VuZGVmaW5lZCcpe1xuXHRcdFx0XHRyZXR1cm4gY2VsbC53aWR0aDtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHJldHVybiBfcHVibGljLm9wdGlvbnMubWF4V2lkdGg7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvL0NoZWNrIHRvIG1ha2Ugc3VyZSB3aWR0aHMgd2lsbCBmaXQgdGhlIGN1cnJlbnQgZGlzcGxheSwgb3IgcmVzaXplLlxuXHRcdHZhciB0b3RhbFdpZHRoID0gd2lkdGhzLnJlZHVjZShmdW5jdGlvbihwcmV2LGN1cnIpe1xuXHRcdFx0cmV0dXJuIHByZXYrY3Vycjtcblx0XHR9KTtcblx0XHQvL0FkZCBtYXJnaW5MZWZ0IHRvIHRvdGFsV2lkdGhcblx0XHR0b3RhbFdpZHRoICs9IF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0O1xuXG5cdFx0Ly9DaGVjayBwcm9jZXNzIGV4aXN0cyBpbiBjYXNlIHdlIGFyZSBpbiBicm93c2VyXG5cdFx0aWYocHJvY2VzcyAmJiBwcm9jZXNzLnN0ZG91dCAmJiB0b3RhbFdpZHRoID4gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyl7XG5cdFx0XHQvL3JlY2FsY3VsYXRlIHByb3BvcnRpb25hdGVseSB0byBmaXQgc2l6ZVxuXHRcdFx0dmFyIHByb3AgPSBwcm9jZXNzLnN0ZG91dC5jb2x1bW5zIC8gdG90YWxXaWR0aDtcblx0XHRcdHByb3AgPSBwcm9wLnRvRml4ZWQoMiktMC4wMTtcblx0XHRcdHdpZHRocyA9IHdpZHRocy5tYXAoZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihwcm9wKnZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aHM7XG5cdH07XG5cblxuXHQvKiogXG5cdCAqIFB1YmxpYyBWYXJpYWJsZXNcblx0ICpcblx0ICovXG5cblxuXHRfcHVibGljLm9wdGlvbnMgPSB7fTtcblxuXG5cdC8qKlxuXHQgKiBQdWJsaWMgTWV0aG9kc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLnNldHVwID0gZnVuY3Rpb24oaGVhZGVyLGJvZHksb3B0aW9ucyl7XG5cdFx0XG5cdFx0X3B1YmxpYy5vcHRpb25zID0gbWVyZ2UodHJ1ZSxfcHJpdmF0ZS5kZWZhdWx0cyxvcHRpb25zKTtcblxuXHRcdC8vYmFja2ZpeGVzIGZvciBzaG9ydGVuZWQgb3B0aW9uIG5hbWVzXG5cdFx0X3B1YmxpYy5vcHRpb25zLmFsaWduID0gX3B1YmxpYy5vcHRpb25zLmFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuYWxpZ247XG5cdFx0X3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduID0gX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuaGVhZGVyQWxpZ247XG5cdFx0XG5cdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzID0gX3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzKGhlYWRlcik7XG5cblx0XHRoZWFkZXIgPSBbaGVhZGVyXTtcblx0XHRfcHJpdmF0ZS50YWJsZS5oZWFkZXIgPSBoZWFkZXIubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93LHtcblx0XHRcdFx0aGVhZGVyOnRydWVcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0X3ByaXZhdGUudGFibGUuYm9keSA9IGJvZHkubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBfcHVibGljO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgYSB0YWJsZSB0byBhIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxuXHQgKiBAbWVtYmVyb2YgVGFibGUgXG5cdCAqIEBleGFtcGxlIFxuXHQgKiBgYGBcblx0ICogdmFyIHN0ciA9IHQxLnJlbmRlcigpOyBcblx0ICogY29uc29sZS5sb2coc3RyKTsgLy9vdXRwdXRzIHRhYmxlXG5cdCAqIGBgYFxuXHQqL1xuXHRfcHVibGljLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHN0ciA9ICcnLFxuXHRcdFx0XHRwYXJ0ID0gWydoZWFkZXInLCdib2R5J10sXG5cdFx0XHRcdGJBcnIgPSBbXSxcblx0XHRcdFx0bWFyZ2luTGVmdCA9IEFycmF5KF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0ICsgMSkuam9pbignXFwgJyksXG5cdFx0XHRcdGJTID0gX3B1YmxpYy5vcHRpb25zLmJvcmRlckNoYXJhY3RlcnNbX3B1YmxpYy5vcHRpb25zLmJvcmRlclN0eWxlXSxcblx0XHRcdFx0Ym9yZGVycyA9IFtdO1xuXG5cdFx0Ly9Cb3JkZXJzXG5cdFx0Zm9yKGE9MDthPDM7YSsrKXtcblx0XHRcdGJvcmRlcnMucHVzaCgnJyk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHMuZm9yRWFjaChmdW5jdGlvbih3LGksYXJyKXtcblx0XHRcdFx0Ym9yZGVyc1thXSArPSBBcnJheSh3KS5qb2luKGJTW2FdLmgpICtcblx0XHRcdFx0XHQoKGkrMSAhPT0gYXJyLmxlbmd0aCkgPyBiU1thXS5qIDogYlNbYV0ucik7XG5cdFx0XHR9KTtcblx0XHRcdGJvcmRlcnNbYV0gPSBiU1thXS5sICsgYm9yZGVyc1thXTtcblx0XHRcdGJvcmRlcnNbYV0gPSBib3JkZXJzW2FdLnNwbGl0KCcnKTtcblx0XHRcdGJvcmRlcnNbYV1bYm9yZGVyc1thXS5sZW5ndGgxXSA9IGJTW2FdLnI7XG5cdFx0XHRib3JkZXJzW2FdID0gYm9yZGVyc1thXS5qb2luKCcnKTtcblx0XHRcdGJvcmRlcnNbYV0gPSBtYXJnaW5MZWZ0ICsgYm9yZGVyc1thXSArICdcXG4nO1xuXHRcdH1cblx0XHRcblx0XHRzdHIgKz0gYm9yZGVyc1swXTtcblxuXHRcdC8vUm93c1xuXHRcdHBhcnQuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuXHRcdFx0d2hpbGUoX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoKXtcblx0XHRcdFx0cm93ID0gX3ByaXZhdGUudGFibGVbcF0uc2hpZnQoKTtcblx0XHRcdFxuXHRcdFx0XHRyb3cuZm9yRWFjaChmdW5jdGlvbihsaW5lKXtcblx0XHRcdFx0XHRzdHIgPSBzdHIgXG5cdFx0XHRcdFx0XHQrIG1hcmdpbkxlZnQgXG5cdFx0XHRcdFx0XHQrIGJTWzFdLnZcblx0XHRcdFx0XHRcdCtcdGxpbmUuam9pbihiU1sxXS52KSBcblx0XHRcdFx0XHRcdCsgYlNbMV0udlxuXHRcdFx0XHRcdFx0KyAnXFxuJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL0pvaW5pbmcgYm9yZGVyXG5cdFx0XHRcdGlmKCEoaT09MSAmJiBfcHJpdmF0ZS50YWJsZVtwXS5sZW5ndGg9PT0wKSl7XG5cdFx0XHRcdFx0c3RyICs9IGJvcmRlcnNbMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cdFxuXHRcdH0pO1xuXHRcdFxuXHRcdC8vQm90dG9tIGJvcmRlclxuXHRcdHN0ciArPSBib3JkZXJzWzJdO1xuXG5cdFx0cmV0dXJuIEFycmF5KF9wdWJsaWMub3B0aW9ucy5tYXJnaW5Ub3AgKyAxKS5qb2luKCdcXG4nKSArIHN0cjtcblx0fVx0XG5cbn07XG5cblxuLyoqXG4gKiBAY2xhc3MgVGFibGVcbiAqIEBwYXJhbSB7YXJyYXl9IGhlYWRlclx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0LSBbU2VlIGV4YW1wbGVdKCNleGFtcGxlLXVzYWdlKVxuICogQHBhcmFtIHtvYmplY3R9IGhlYWRlci5jb2x1bW5cdFx0XHRcdFx0XHRcdFx0XHQtIENvbHVtbiBvcHRpb25zXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBoZWFkZXIuY29sdW1uLmZvcm1hdHRlclx0XHRcdC0gUnVucyBhIGNhbGxiYWNrIG9uIGVhY2ggY2VsbCB2YWx1ZSBpbiB0aGUgcGFyZW50IGNvbHVtblxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWFyZ2luTGVmdFx0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5Ub3BcdFx0XHRcdC0gZGVmYXVsdDogMFx0XHRcdFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWF4V2lkdGhcdFx0XHRcdFx0LSBkZWZhdWx0OiAyMCBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdCb3R0b21cdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nTGVmdFx0XHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ1JpZ2h0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nVG9wXHRcdFx0XHQtIGRlZmF1bHQ6IDBcdFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uYWxpYXNcdFx0XHRcdFx0XHQtIEFsZXJuYXRlIGhlYWRlciBjb2x1bW4gbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uYWxpZ25cdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IFwiY2VudGVyXCJcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmNvbG9yXHRcdFx0XHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5oZWFkZXJBbGlnblx0XHRcdC0gZGVmYXVsdDogXCJjZW50ZXJcIiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckNvbG9yXHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yXG4gKlxuICogQHBhcmFtIHthcnJheX0gcm93c1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQtIFtTZWUgZXhhbXBsZV0oI2V4YW1wbGUtdXNhZ2UpXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcdFx0XHRcdFx0XHRcdFx0XHQtIFRhYmxlIG9wdGlvbnMgXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5ib3JkZXJTdHlsZVx0XHRcdC0gZGVmYXVsdDogMSAoMCA9IG5vIGJvcmRlcikgXG4gKiBSZWZlcnMgdG8gdGhlIGluZGV4IG9mIHRoZSBkZXNpcmVkIGNoYXJhY3RlciBzZXQuIFxuICogQHBhcmFtIHthcnJheX0gb3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzXHQtIFtTZWUgQG5vdGVdKCNub3RlKSBcbiAqIEByZXR1cm5zIHtUYWJsZX1cbiAqIEBub3RlXG4gKiA8YSBuYW1lPVwibm90ZVwiLz5cbiAqIERlZmF1bHQgYm9yZGVyIGNoYXJhY3RlciBzZXRzOlxuICogYGBgXG4gKlx0W1xuICpcdFx0W1xuICpcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiAqXHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG4gKlx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG4gKlx0XHRdLFxuICpcdFx0W1xuICpcdFx0XHR7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG4gKlx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcbiAqXHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSUXCIsIGo6IFwi4pS0XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSYXCJ9XG4gKlx0XHRdLFxuICpcdFx0W1xuICpcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcbiAqXHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG4gKlx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9XG4gKlx0XHRdXG4gKlx0XVxuICogYGBgXG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiB2YXIgVGFibGUgPSByZXF1aXJlKCd0dHktdGFibGUnKTtcbiAqIFRhYmxlKGhlYWRlcixyb3dzLG9wdGlvbnMpO1xuICogYGBgXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhlYWRlcixyb3dzLG9wdGlvbnMpe1xuXHR2YXIgbyA9IG5ldyBjbHMoKTtcblx0cmV0dXJuIG8uX3ByaXZhdGUuc2V0dXAoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG59O1xuIl19
