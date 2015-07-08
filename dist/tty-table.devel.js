(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TtyTable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/src/main.js":[function(require,module,exports){
(function (process){
var merge = require("merge"),
		chalk = require("chalk"),
		stripAnsi = require("strip-ansi"),
		wordwrap = require("wordwrap");


var cls = function(){


	var _public = this._public = {},
			_private = this._private = {};


	/** 
	 * Private Variables
	 *
	 */


	_private.defaults = {
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
			if(typeof cell === 'object'){	
				columnOptions = merge(true,columnOptions,cell);		
				cell = value;			
			}	
		
			if(typeof columnOptions.formatter === 'function'){
				output = columnOptions.formatter(cell);
			}
			else{
				output = cell;
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

	_private.wrapCellContent = function(value,columnIndex,columnOptions,rowType){
		var string = value.toString(),
				width = _private.table.columnWidths[columnIndex],
				innerWidth = width - columnOptions.paddingLeft 
										- columnOptions.paddingRight
										- _private.GUTTER; //border/gutter

		//Break string into array of lines
		wrap = wordwrap(innerWidth);
		string = wrap(string); 

		var strArr = string.split('\n');

		//Format each line
		strArr = strArr.map(function(line){

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
			
			//Left, Right Padding
			line = Array(columnOptions.paddingLeft + 1).join(' ') +
						line +
						Array(columnOptions.paddingRight + 1).join(' ');
			var lineLength = stripAnsi(line).length;

			//align 
			var alignTgt = (rowType === 'header') ? "headerAlign" : "align";
			if(lineLength < width){
				var spaceAvailable = width - lineLength; 
				switch(true){
					case(columnOptions[alignTgt] === 'center'):
						var even = (spaceAvailable %2 === 0);
						spaceAvailable = (even) ? spaceAvailable : 
							spaceAvailable - 1;
						if(spaceAvailable > 1){
							line = Array(spaceAvailable/2).join(' ') + 
								line +
								Array(spaceAvailable/2 + ((even)?1:2)).join(' ');
						}
						break;
					case(columnOptions[alignTgt] === 'right'):
						line = Array(spaceAvailable).join(' ') + line;
						break;
					default:
						line = line + Array(spaceAvailable).join(' ');
				}
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
			var prop = process.stdout.columns > totalWidth;
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
				borders[a] += Array(w).join(bS[a].h) 
					+ ((i+1 !== arr.length) ? bS[a].j : bS[a].r);
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
 * @param {array} header
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
 * @param {array} rows
 *
 * @param {object} options									- Table options 
 * @param {number} options.borderStyle			- default: 1 (0 = no border) 
 * Refers to the index of the desired character set. 
 * @param {array} options.borderCharacters			 
 * @returns {Table}
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

},{"_process":1,"chalk":2,"merge":8,"strip-ansi":9,"wordwrap":11}],1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
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

// TODO(shtylman)
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
	var builder = function builder() {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/*eslint no-proto: 0 */
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
var stripAnsi = require('strip-ansi');
var wordwrap = module.exports = function (start, stop, params) {
    if (typeof start === 'object') {
        params = start;
        start = params.start;
        stop = params.stop;
    }
    
    if (typeof stop === 'object') {
        params = stop;
        start = start || params.start;
        stop = undefined;
    }
    
    if (!stop) {
        stop = start;
        start = 0;
    }
    
    if (!params) params = {};
    var mode = params.mode || 'soft';
    var re = mode === 'hard' ? /\b/ : /(\S+\s+)/;
    
    return function (text) {
        var chunks = text.toString()
            .split(re)
            .reduce(function (acc, x) {
                if (mode === 'hard') {
                    for (var i = 0; i < stripAnsi(x).length; i += stop - start) {
                        acc.push(x.slice(i, i + stop - start));
                    }
                }
                else acc.push(x)
                return acc;
            }, [])
        ;
        
        return chunks.reduce(function (lines, rawChunk) {
            if (rawChunk === '') return lines;
            
            var chunk = rawChunk.replace(/\t/g, '    ');
            
            var i = lines.length - 1;
            if (stripAnsi(lines[i]).length + stripAnsi(chunk).length > stop) {
                lines[i] = lines[i].replace(/\s+$/, '');
                
                chunk.split(/\n/).forEach(function (c) {
                    lines.push(
                        new Array(start + 1).join(' ')
                        + c.replace(/^\s+/, '')
                    );
                });
            }
            else if (chunk.match(/\n/)) {
                var xs = chunk.split(/\n/);
                lines[i] += xs.shift();
                xs.forEach(function (c) {
                    lines.push(
                        new Array(start + 1).join(' ')
                        + c.replace(/^\s+/, '')
                    );
                });
            }
            else {
                lines[i] += chunk;
            }
            
            return lines;
        }, [ new Array(start + 1).join(' ') ]).join('\n');
    };
};

wordwrap.soft = wordwrap;

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode : 'hard' });
};

},{"strip-ansi":9}]},{},[])("/src/main.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9tYWluLmpzIiwiLi4vLi4vLi4vdXNyL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9hbnNpLXN0eWxlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvZXNjYXBlLXN0cmluZy1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2hhcy1hbnNpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9ub2RlX21vZHVsZXMvYW5zaS1yZWdleC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyZ2UvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvc3RyaXAtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93b3Jkd3JhcC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgbWVyZ2UgPSByZXF1aXJlKFwibWVyZ2VcIiksXG5cdFx0Y2hhbGsgPSByZXF1aXJlKFwiY2hhbGtcIiksXG5cdFx0c3RyaXBBbnNpID0gcmVxdWlyZShcInN0cmlwLWFuc2lcIiksXG5cdFx0d29yZHdyYXAgPSByZXF1aXJlKFwid29yZHdyYXBcIik7XG5cblxudmFyIGNscyA9IGZ1bmN0aW9uKCl7XG5cblxuXHR2YXIgX3B1YmxpYyA9IHRoaXMuX3B1YmxpYyA9IHt9LFxuXHRcdFx0X3ByaXZhdGUgPSB0aGlzLl9wcml2YXRlID0ge307XG5cblxuXHQvKiogXG5cdCAqIFByaXZhdGUgVmFyaWFibGVzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3ByaXZhdGUuZGVmYXVsdHMgPSB7XG5cdFx0bWFyZ2luVG9wIDogMSxcblx0XHRtYXJnaW5MZWZ0IDogMixcblx0XHRtYXhXaWR0aCA6IDIwLFxuXHRcdGZvcm1hdHRlciA6IG51bGwsXG5cdFx0aGVhZGVyQWxpZ24gOiBcImNlbnRlclwiLFxuXHRcdGFsaWduIDogXCJjZW50ZXJcIixcblx0XHRwYWRkaW5nUmlnaHQgOiAwLFxuXHRcdHBhZGRpbmdMZWZ0IDogMCxcblx0XHRwYWRkaW5nQm90dG9tIDogMCxcblx0XHRwYWRkaW5nVG9wIDogMCxcblx0XHRjb2xvciA6IGZhbHNlLFxuXHRcdGhlYWRlckNvbG9yIDogZmFsc2UsXG5cdFx0Ym9yZGVyU3R5bGUgOiAxLFxuXHRcdGJvcmRlckNoYXJhY3RlcnMgOiBbXG5cdFx0XHRbXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn1cblx0XHRcdF0sXG5cdFx0XHRbXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUjFwiLCBqOiBcIuKUrFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUkFwifSxcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pScXCIsIGo6IFwi4pS8XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSkXCJ9LFxuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJRcIiwgajogXCLilLRcIiwgaDogXCLilIBcIiwgcjogXCLilJhcIn1cblx0XHRcdF0sXG5cdFx0XHRbXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn1cblx0XHRcdF1cblx0XHRdXG5cdH07XG5cblxuXHQvL0NvbnN0YW50c1xuXHRfcHJpdmF0ZS5HVVRURVIgPSAxO1xuXG5cblx0X3ByaXZhdGUudGFibGUgPSB7XG5cdFx0Y29sdW1ucyA6IFtdLFxuXHRcdGNvbHVtbldpZHRocyA6IFtdLFxuXHRcdGNvbHVtbklubmVyV2lkdGhzIDogW10sXG5cdFx0aGVhZGVyIDogW10sXG5cdFx0Ym9keSA6IFtdXG5cdH07XG5cblxuXHQvKipcblx0ICogUHJpdmF0ZSBNZXRob2RzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3ByaXZhdGUuYnVpbGRSb3cgPSBmdW5jdGlvbihyb3csb3B0aW9ucyl7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIG1pblJvd0hlaWdodCA9IDA7XG5cdFx0XG5cdFx0Ly9nZXQgcm93IGFzIGFycmF5IG9mIGNlbGwgYXJyYXlzXG5cdFx0dmFyIGNBcnJzID0gcm93Lm1hcChmdW5jdGlvbihjZWxsLGluZGV4KXtcblx0XHRcdHZhciBjID0gX3ByaXZhdGUuYnVpbGRDZWxsKGNlbGwsaW5kZXgsb3B0aW9ucyk7XG5cdFx0XHR2YXIgY2VsbEFyciA9IGMuY2VsbEFycjtcblx0XHRcdGlmKG9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1uSW5uZXJXaWR0aHMucHVzaChjLndpZHRoKTtcblx0XHRcdH1cblx0XHRcdG1pblJvd0hlaWdodCA9IChtaW5Sb3dIZWlnaHQgPCBjZWxsQXJyLmxlbmd0aCkgPyBjZWxsQXJyLmxlbmd0aCA6IG1pblJvd0hlaWdodDtcblx0XHRcdHJldHVybiBjZWxsQXJyO1xuXHRcdH0pO1xuXG5cdFx0Ly9BZGp1c3QgbWluUm93SGVpZ2h0IHRvIHJlZmxlY3QgdmVydGljYWwgcm93IHBhZGRpbmdcblx0XHRtaW5Sb3dIZWlnaHQgPSAob3B0aW9ucy5oZWFkZXIpID8gbWluUm93SGVpZ2h0IDogbWluUm93SGVpZ2h0ICsgXG5cdFx0XHQoX3B1YmxpYy5vcHRpb25zLnBhZGRpbmdCb3R0b20gKyBfcHVibGljLm9wdGlvbnMucGFkZGluZ1RvcCk7XG5cblx0XHQvL2NvbnZlcnQgYXJyYXkgb2YgY2VsbCBhcnJheXMgdG8gYXJyYXkgb2YgbGluZXNcblx0XHR2YXIgbGluZXMgPSBBcnJheS5hcHBseShudWxsLHtsZW5ndGg6bWluUm93SGVpZ2h0fSlcblx0XHRcdC5tYXAoRnVuY3Rpb24uY2FsbCxmdW5jdGlvbigpe3JldHVybiBbXX0pO1xuXG5cdFx0Y0FycnMuZm9yRWFjaChmdW5jdGlvbihjZWxsQXJyLGEpe1xuXHRcdFx0dmFyIHdoaXRlbGluZSA9IEFycmF5KF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRoc1thXSkuam9pbignXFwgJyk7XG5cdFx0XHRpZighb3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0XHQvL0FkZCB3aGl0ZXNwYWNlIGZvciB0b3AgcGFkZGluZ1xuXHRcdFx0XHRmb3IoaT0wOyBpPF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nVG9wOyBpKyspe1xuXHRcdFx0XHRcdGNlbGxBcnIudW5zaGlmdCh3aGl0ZWxpbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvL0FkZCB3aGl0ZXNwYWNlIGZvciBib3R0b20gcGFkZGluZ1xuXHRcdFx0XHRmb3IoaT0wOyBpPF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nQm90dG9tOyBpKyspe1xuXHRcdFx0XHRcdGNlbGxBcnIucHVzaCh3aGl0ZWxpbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHRcdGZvcih2YXIgYj0wOyBiPG1pblJvd0hlaWdodDsgYisrKXtcdFxuXHRcdFx0XHRsaW5lc1tiXS5wdXNoKCh0eXBlb2YgY2VsbEFycltiXSAhPSAndW5kZWZpbmVkJykgPyBjZWxsQXJyW2JdIDogd2hpdGVsaW5lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fTtcblxuXHRfcHJpdmF0ZS5idWlsZENlbGwgPSBmdW5jdGlvbihjZWxsLGNvbHVtbkluZGV4LG9wdGlvbnMpe1xuXG5cdFx0Ly9QdWxsIGNvbHVtbiBvcHRpb25zXHRcblx0XHR2YXIgb3V0cHV0O1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFxuXHRcdGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0Y2VsbCA9IG1lcmdlKHRydWUsX3B1YmxpYy5vcHRpb25zLGNlbGwpO1xuXHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1ucy5wdXNoKGNlbGwpO1xuXHRcdFx0b3V0cHV0ID0gY2VsbC5hbGlhcyB8fCBjZWxsLnZhbHVlO1xuXHRcdFx0Y29sdW1uT3B0aW9ucyA9IGNlbGw7XG5cdFx0fVx0XG5cdFx0ZWxzZXtcblx0XHRcdGNvbHVtbk9wdGlvbnMgPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5zW2NvbHVtbkluZGV4XTtcblx0XHRcdGlmKHR5cGVvZiBjZWxsID09PSAnb2JqZWN0Jyl7XHRcblx0XHRcdFx0Y29sdW1uT3B0aW9ucyA9IG1lcmdlKHRydWUsY29sdW1uT3B0aW9ucyxjZWxsKTtcdFx0XG5cdFx0XHRcdGNlbGwgPSB2YWx1ZTtcdFx0XHRcblx0XHRcdH1cdFxuXHRcdFxuXHRcdFx0aWYodHlwZW9mIGNvbHVtbk9wdGlvbnMuZm9ybWF0dGVyID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdFx0b3V0cHV0ID0gY29sdW1uT3B0aW9ucy5mb3JtYXR0ZXIoY2VsbCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRvdXRwdXQgPSBjZWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvL0F1dG9tYXRpYyB0ZXh0IHdyYXBcblx0XHR2YXIgd3JhcE9iaiAgPSBfcHJpdmF0ZS53cmFwQ2VsbENvbnRlbnQob3V0cHV0LGNvbHVtbkluZGV4LGNvbHVtbk9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVyKSA/IFwiaGVhZGVyXCIgOiBcImJvZHlcIik7XG5cdFx0b3V0cHV0ID0gd3JhcE9iai5vdXRwdXQ7XG5cdFx0XG5cdFx0Ly9yZXR1cm4gYXMgYXJyYXkgb2YgbGluZXNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2VsbEFyciA6IG91dHB1dC5zcGxpdCgnXFxuJyksXG5cdFx0XHR3aWR0aCA6IHdyYXBPYmoud2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmNvbG9yaXplQWxsV29yZHMgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdC8vQ29sb3IgZWFjaCB3b3JkIGluIHRoZSBjZWxsIHNvIHRoYXQgbGluZSBicmVha3MgZG9uJ3QgYnJlYWsgY29sb3IgXG5cdFx0dmFyIGFyciA9IHN0ci5yZXBsYWNlKC8oXFxTKykvZ2ksZnVuY3Rpb24obWF0Y2gpe1xuXHRcdFx0cmV0dXJuIGNoYWxrW2NvbG9yXShtYXRjaCkrJ1xcICc7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFycjtcblx0fTtcblxuXHRfcHJpdmF0ZS5jb2xvcml6ZUxpbmUgPSBmdW5jdGlvbihjb2xvcixzdHIpe1xuXHRcdHJldHVybiBjaGFsa1tjb2xvcl0oc3RyKTtcblx0fTtcblxuXHRfcHJpdmF0ZS53cmFwQ2VsbENvbnRlbnQgPSBmdW5jdGlvbih2YWx1ZSxjb2x1bW5JbmRleCxjb2x1bW5PcHRpb25zLHJvd1R5cGUpe1xuXHRcdHZhciBzdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpLFxuXHRcdFx0XHR3aWR0aCA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRoc1tjb2x1bW5JbmRleF0sXG5cdFx0XHRcdGlubmVyV2lkdGggPSB3aWR0aCAtIGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC0gY29sdW1uT3B0aW9ucy5wYWRkaW5nUmlnaHRcblx0XHRcdFx0XHRcdFx0XHRcdFx0LSBfcHJpdmF0ZS5HVVRURVI7IC8vYm9yZGVyL2d1dHRlclxuXG5cdFx0Ly9CcmVhayBzdHJpbmcgaW50byBhcnJheSBvZiBsaW5lc1xuXHRcdHdyYXAgPSB3b3Jkd3JhcChpbm5lcldpZHRoKTtcblx0XHRzdHJpbmcgPSB3cmFwKHN0cmluZyk7IFxuXG5cdFx0dmFyIHN0ckFyciA9IHN0cmluZy5zcGxpdCgnXFxuJyk7XG5cblx0XHQvL0Zvcm1hdCBlYWNoIGxpbmVcblx0XHRzdHJBcnIgPSBzdHJBcnIubWFwKGZ1bmN0aW9uKGxpbmUpe1xuXG5cdFx0XHQvL0FwcGx5IGNvbG9yc1xuXHRcdFx0c3dpdGNoKHRydWUpe1xuXHRcdFx0XHRjYXNlKHJvd1R5cGUgPT09ICdoZWFkZXInKTpcblx0XHRcdFx0XHRsaW5lID0gKGNvbHVtbk9wdGlvbnMuY29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yKSA/IFxuXHRcdFx0XHRcdFx0X3ByaXZhdGUuY29sb3JpemVMaW5lKGNvbHVtbk9wdGlvbnMuaGVhZGVyQ29sb3IgfHwgX3B1YmxpYy5vcHRpb25zLmNvbG9yLGxpbmUpIDogXG5cdFx0XHRcdFx0XHRsaW5lO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBjb2x1bW5PcHRpb25zLmNvbG9yID09PSAnc3RyaW5nJyk6XG5cdFx0XHRcdFx0bGluZSA9IF9wcml2YXRlLmNvbG9yaXplTGluZShjb2x1bW5PcHRpb25zLmNvbG9yLGxpbmUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlKHR5cGVvZiBfcHVibGljLm9wdGlvbnMuY29sb3IgPT09ICdzdHJpbmcnKTpcblx0XHRcdFx0XHRsaW5lID0gX3ByaXZhdGUuY29sb3JpemVMaW5lKF9wdWJsaWMub3B0aW9ucy5jb2xvcixsaW5lKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly9MZWZ0LCBSaWdodCBQYWRkaW5nXG5cdFx0XHRsaW5lID0gQXJyYXkoY29sdW1uT3B0aW9ucy5wYWRkaW5nTGVmdCArIDEpLmpvaW4oJyAnKSArXG5cdFx0XHRcdFx0XHRsaW5lICtcblx0XHRcdFx0XHRcdEFycmF5KGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0ICsgMSkuam9pbignICcpO1xuXHRcdFx0dmFyIGxpbmVMZW5ndGggPSBzdHJpcEFuc2kobGluZSkubGVuZ3RoO1xuXG5cdFx0XHQvL2FsaWduIFxuXHRcdFx0dmFyIGFsaWduVGd0ID0gKHJvd1R5cGUgPT09ICdoZWFkZXInKSA/IFwiaGVhZGVyQWxpZ25cIiA6IFwiYWxpZ25cIjtcblx0XHRcdGlmKGxpbmVMZW5ndGggPCB3aWR0aCl7XG5cdFx0XHRcdHZhciBzcGFjZUF2YWlsYWJsZSA9IHdpZHRoIC0gbGluZUxlbmd0aDsgXG5cdFx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0XHRjYXNlKGNvbHVtbk9wdGlvbnNbYWxpZ25UZ3RdID09PSAnY2VudGVyJyk6XG5cdFx0XHRcdFx0XHR2YXIgZXZlbiA9IChzcGFjZUF2YWlsYWJsZSAlMiA9PT0gMCk7XG5cdFx0XHRcdFx0XHRzcGFjZUF2YWlsYWJsZSA9IChldmVuKSA/IHNwYWNlQXZhaWxhYmxlIDogXG5cdFx0XHRcdFx0XHRcdHNwYWNlQXZhaWxhYmxlIC0gMTtcblx0XHRcdFx0XHRcdGlmKHNwYWNlQXZhaWxhYmxlID4gMSl7XG5cdFx0XHRcdFx0XHRcdGxpbmUgPSBBcnJheShzcGFjZUF2YWlsYWJsZS8yKS5qb2luKCcgJykgKyBcblx0XHRcdFx0XHRcdFx0XHRsaW5lICtcblx0XHRcdFx0XHRcdFx0XHRBcnJheShzcGFjZUF2YWlsYWJsZS8yICsgKChldmVuKT8xOjIpKS5qb2luKCcgJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlKGNvbHVtbk9wdGlvbnNbYWxpZ25UZ3RdID09PSAncmlnaHQnKTpcblx0XHRcdFx0XHRcdGxpbmUgPSBBcnJheShzcGFjZUF2YWlsYWJsZSkuam9pbignICcpICsgbGluZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRsaW5lID0gbGluZSArIEFycmF5KHNwYWNlQXZhaWxhYmxlKS5qb2luKCcgJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0fSk7XG5cblx0XHRzdHJpbmcgPSBzdHJBcnIuam9pbignXFxuJyk7XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdG91dHB1dCA6IHN0cmluZyxcblx0XHRcdHdpZHRoIDogaW5uZXJXaWR0aFxuXHRcdH07XG5cdH07XG5cblx0X3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzID0gZnVuY3Rpb24ocm93KXtcblx0XHQvL1dpZHRocyBhcyBwcmVzY3JpYmVkXG5cdFx0dmFyIHdpZHRocyA9IHJvdy5tYXAoZnVuY3Rpb24oY2VsbCl7XG5cdFx0XHRpZih0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNlbGwud2lkdGggIT09J3VuZGVmaW5lZCcpe1xuXHRcdFx0XHRyZXR1cm4gY2VsbC53aWR0aDtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHJldHVybiBfcHVibGljLm9wdGlvbnMubWF4V2lkdGg7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvL0NoZWNrIHRvIG1ha2Ugc3VyZSB3aWR0aHMgd2lsbCBmaXQgdGhlIGN1cnJlbnQgZGlzcGxheSwgb3IgcmVzaXplLlxuXHRcdHZhciB0b3RhbFdpZHRoID0gd2lkdGhzLnJlZHVjZShmdW5jdGlvbihwcmV2LGN1cnIpe1xuXHRcdFx0cmV0dXJuIHByZXYrY3Vycjtcblx0XHR9KTtcblx0XHQvL0FkZCBtYXJnaW5MZWZ0IHRvIHRvdGFsV2lkdGhcblx0XHR0b3RhbFdpZHRoICs9IF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0O1xuXG5cdFx0Ly9DaGVjayBwcm9jZXNzIGV4aXN0cyBpbiBjYXNlIHdlIGFyZSBpbiBicm93c2VyXG5cdFx0aWYocHJvY2VzcyAmJiBwcm9jZXNzLnN0ZG91dCAmJiB0b3RhbFdpZHRoID4gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyl7XG5cdFx0XHQvL3JlY2FsY3VsYXRlIHByb3BvcnRpb25hdGVseSB0byBmaXQgc2l6ZVxuXHRcdFx0dmFyIHByb3AgPSBwcm9jZXNzLnN0ZG91dC5jb2x1bW5zID4gdG90YWxXaWR0aDtcblx0XHRcdHByb3AgPSBwcm9wLnRvRml4ZWQoMiktMC4wMTtcblx0XHRcdHdpZHRocyA9IHdpZHRocy5tYXAoZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihwcm9wKnZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB3aWR0aHM7XG5cdH07XG5cblxuXHQvKiogXG5cdCAqIFB1YmxpYyBWYXJpYWJsZXNcblx0ICpcblx0ICovXG5cblxuXHRfcHVibGljLm9wdGlvbnMgPSB7fTtcblxuXG5cdC8qKlxuXHQgKiBQdWJsaWMgTWV0aG9kc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLnNldHVwID0gZnVuY3Rpb24oaGVhZGVyLGJvZHksb3B0aW9ucyl7XG5cdFx0XG5cdFx0X3B1YmxpYy5vcHRpb25zID0gbWVyZ2UodHJ1ZSxfcHJpdmF0ZS5kZWZhdWx0cyxvcHRpb25zKTtcblxuXHRcdC8vYmFja2ZpeGVzIGZvciBzaG9ydGVuZWQgb3B0aW9uIG5hbWVzXG5cdFx0X3B1YmxpYy5vcHRpb25zLmFsaWduID0gX3B1YmxpYy5vcHRpb25zLmFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuYWxpZ247XG5cdFx0X3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduID0gX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWdubWVudCB8fCBfcHVibGljLm9wdGlvbnMuaGVhZGVyQWxpZ247XG5cdFx0XG5cdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzID0gX3ByaXZhdGUuZ2V0Q29sdW1uV2lkdGhzKGhlYWRlcik7XG5cblx0XHRoZWFkZXIgPSBbaGVhZGVyXTtcblx0XHRfcHJpdmF0ZS50YWJsZS5oZWFkZXIgPSBoZWFkZXIubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93LHtcblx0XHRcdFx0aGVhZGVyOnRydWVcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0X3ByaXZhdGUudGFibGUuYm9keSA9IGJvZHkubWFwKGZ1bmN0aW9uKHJvdyl7XG5cdFx0XHRyZXR1cm4gX3ByaXZhdGUuYnVpbGRSb3cocm93KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBfcHVibGljO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgYSB0YWJsZSB0byBhIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxuXHQgKiBAbWVtYmVyb2YgVGFibGUgXG5cdCAqIEBleGFtcGxlIFxuXHQgKiBgYGBcblx0ICogdmFyIHN0ciA9IHQxLnJlbmRlcigpOyBcblx0ICogY29uc29sZS5sb2coc3RyKTsgLy9vdXRwdXRzIHRhYmxlXG5cdCAqIGBgYFxuXHQqL1xuXHRfcHVibGljLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHN0ciA9ICcnLFxuXHRcdFx0XHRwYXJ0ID0gWydoZWFkZXInLCdib2R5J10sXG5cdFx0XHRcdGJBcnIgPSBbXSxcblx0XHRcdFx0bWFyZ2luTGVmdCA9IEFycmF5KF9wdWJsaWMub3B0aW9ucy5tYXJnaW5MZWZ0ICsgMSkuam9pbignXFwgJyksXG5cdFx0XHRcdGJTID0gX3B1YmxpYy5vcHRpb25zLmJvcmRlckNoYXJhY3RlcnNbX3B1YmxpYy5vcHRpb25zLmJvcmRlclN0eWxlXSxcblx0XHRcdFx0Ym9yZGVycyA9IFtdO1xuXG5cdFx0Ly9Cb3JkZXJzXG5cdFx0Zm9yKGE9MDthPDM7YSsrKXtcblx0XHRcdGJvcmRlcnMucHVzaCgnJyk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHMuZm9yRWFjaChmdW5jdGlvbih3LGksYXJyKXtcblx0XHRcdFx0Ym9yZGVyc1thXSArPSBBcnJheSh3KS5qb2luKGJTW2FdLmgpIFxuXHRcdFx0XHRcdCsgKChpKzEgIT09IGFyci5sZW5ndGgpID8gYlNbYV0uaiA6IGJTW2FdLnIpO1xuXHRcdFx0fSk7XG5cdFx0XHRib3JkZXJzW2FdID0gYlNbYV0ubCArIGJvcmRlcnNbYV07XG5cdFx0XHRib3JkZXJzW2FdID0gYm9yZGVyc1thXS5zcGxpdCgnJyk7XG5cdFx0XHRib3JkZXJzW2FdW2JvcmRlcnNbYV0ubGVuZ3RoMV0gPSBiU1thXS5yO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJvcmRlcnNbYV0uam9pbignJyk7XG5cdFx0XHRib3JkZXJzW2FdID0gbWFyZ2luTGVmdCArIGJvcmRlcnNbYV0gKyAnXFxuJztcblx0XHR9XG5cdFx0XG5cdFx0c3RyICs9IGJvcmRlcnNbMF07XG5cblx0XHQvL1Jvd3Ncblx0XHRwYXJ0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcblx0XHRcdHdoaWxlKF9wcml2YXRlLnRhYmxlW3BdLmxlbmd0aCl7XG5cdFx0XHRcdHJvdyA9IF9wcml2YXRlLnRhYmxlW3BdLnNoaWZ0KCk7XG5cdFx0XHRcblx0XHRcdFx0cm93LmZvckVhY2goZnVuY3Rpb24obGluZSl7XG5cdFx0XHRcdFx0c3RyID0gc3RyIFxuXHRcdFx0XHRcdFx0KyBtYXJnaW5MZWZ0IFxuXHRcdFx0XHRcdFx0KyBiU1sxXS52XG5cdFx0XHRcdFx0XHQrXHRsaW5lLmpvaW4oYlNbMV0udikgXG5cdFx0XHRcdFx0XHQrIGJTWzFdLnZcblx0XHRcdFx0XHRcdCsgJ1xcbic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9Kb2luaW5nIGJvcmRlclxuXHRcdFx0XHRpZighKGk9PTEgJiYgX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoPT09MCkpe1xuXHRcdFx0XHRcdHN0ciArPSBib3JkZXJzWzFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHR9KTtcblx0XHRcblx0XHQvL0JvdHRvbSBib3JkZXJcblx0XHRzdHIgKz0gYm9yZGVyc1syXTtcblxuXHRcdHJldHVybiBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luVG9wICsgMSkuam9pbignXFxuJykgKyBzdHI7XG5cdH1cdFxuXG59O1xuXG5cbi8qKlxuICogQGNsYXNzIFRhYmxlXG4gKiBAcGFyYW0ge2FycmF5fSBoZWFkZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBoZWFkZXIuY29sdW1uXHRcdFx0XHRcdFx0XHRcdFx0LSBDb2x1bW4gb3B0aW9uc1xuICogQHBhcmFtIHtmdW5jdGlvbn0gaGVhZGVyLmNvbHVtbi5mb3JtYXR0ZXJcdFx0XHQtIFJ1bnMgYSBjYWxsYmFjayBvbiBlYWNoIGNlbGwgdmFsdWUgaW4gdGhlIHBhcmVudCBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLm1hcmdpbkxlZnRcdFx0XHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ubWFyZ2luVG9wXHRcdFx0XHQtIGRlZmF1bHQ6IDBcdFx0XHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLm1heFdpZHRoXHRcdFx0XHRcdC0gZGVmYXVsdDogMjAgXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nQm90dG9tXHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0xlZnRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdSaWdodFx0XHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ1RvcFx0XHRcdFx0LSBkZWZhdWx0OiAwXHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmFsaWFzXHRcdFx0XHRcdFx0LSBBbGVybmF0ZSBoZWFkZXIgY29sdW1uIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmFsaWduXHRcdFx0XHRcdFx0LSBkZWZhdWx0OiBcImNlbnRlclwiXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5jb2xvclx0XHRcdFx0XHRcdC0gZGVmYXVsdDogdGVybWluYWwgZGVmYXVsdCBjb2xvclxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uaGVhZGVyQWxpZ25cdFx0XHQtIGRlZmF1bHQ6IFwiY2VudGVyXCIgXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5oZWFkZXJDb2xvclx0XHRcdC0gZGVmYXVsdDogdGVybWluYWwgZGVmYXVsdCBjb2xvclxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IHJvd3NcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1x0XHRcdFx0XHRcdFx0XHRcdC0gVGFibGUgb3B0aW9ucyBcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmJvcmRlclN0eWxlXHRcdFx0LSBkZWZhdWx0OiAxICgwID0gbm8gYm9yZGVyKSBcbiAqIFJlZmVycyB0byB0aGUgaW5kZXggb2YgdGhlIGRlc2lyZWQgY2hhcmFjdGVyIHNldC4gXG4gKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zLmJvcmRlckNoYXJhY3RlcnNcdFx0XHQgXG4gKiBAcmV0dXJucyB7VGFibGV9XG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiB2YXIgVGFibGUgPSByZXF1aXJlKCd0dHktdGFibGUnKTtcbiAqIFRhYmxlKGhlYWRlcixyb3dzLG9wdGlvbnMpO1xuICogYGBgXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhlYWRlcixyb3dzLG9wdGlvbnMpe1xuXHR2YXIgbyA9IG5ldyBjbHMoKTtcblx0cmV0dXJuIG8uX3ByaXZhdGUuc2V0dXAoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xudmFyIGFuc2lTdHlsZXMgPSByZXF1aXJlKCdhbnNpLXN0eWxlcycpO1xudmFyIHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcbnZhciBoYXNBbnNpID0gcmVxdWlyZSgnaGFzLWFuc2knKTtcbnZhciBzdXBwb3J0c0NvbG9yID0gcmVxdWlyZSgnc3VwcG9ydHMtY29sb3InKTtcbnZhciBkZWZpbmVQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIGlzU2ltcGxlV2luZG93c1Rlcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmICEvXnh0ZXJtL2kudGVzdChwcm9jZXNzLmVudi5URVJNKTtcblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuXHQvLyBkZXRlY3QgbW9kZSBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdHRoaXMuZW5hYmxlZCA9ICFvcHRpb25zIHx8IG9wdGlvbnMuZW5hYmxlZCA9PT0gdW5kZWZpbmVkID8gc3VwcG9ydHNDb2xvciA6IG9wdGlvbnMuZW5hYmxlZDtcbn1cblxuLy8gdXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcblx0YW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxYls5NG0nO1xufVxuXG52YXIgc3R5bGVzID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKGFuc2lTdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFuc2lTdHlsZXNba2V5XS5jbG9zZVJlID0gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlc1trZXldLmNsb3NlKSwgJ2cnKTtcblxuXHRcdHJldFtrZXldID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIHRoaXMuX3N0eWxlcy5jb25jYXQoa2V5KSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn0pKCk7XG5cbnZhciBwcm90byA9IGRlZmluZVByb3BzKGZ1bmN0aW9uIGNoYWxrKCkge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMpIHtcblx0dmFyIGJ1aWxkZXIgPSBmdW5jdGlvbiBidWlsZGVyKCkge1xuXHRcdHJldHVybiBhcHBseVN0eWxlLmFwcGx5KGJ1aWxkZXIsIGFyZ3VtZW50cyk7XG5cdH07XG5cblx0YnVpbGRlci5fc3R5bGVzID0gX3N0eWxlcztcblx0YnVpbGRlci5lbmFibGVkID0gdGhpcy5lbmFibGVkO1xuXHQvLyBfX3Byb3RvX18gaXMgdXNlZCBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGUuXG5cdC8qZXNsaW50IG5vLXByb3RvOiAwICovXG5cdGJ1aWxkZXIuX19wcm90b19fID0gcHJvdG87XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGUoKSB7XG5cdC8vIHN1cHBvcnQgdmFyYWdzLCBidXQgc2ltcGx5IGNhc3QgdG8gc3RyaW5nIGluIGNhc2UgdGhlcmUncyBvbmx5IG9uZSBhcmdcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBhcmdzTGVuID0gYXJncy5sZW5ndGg7XG5cdHZhciBzdHIgPSBhcmdzTGVuICE9PSAwICYmIFN0cmluZyhhcmd1bWVudHNbMF0pO1xuXG5cdGlmIChhcmdzTGVuID4gMSkge1xuXHRcdC8vIGRvbid0IHNsaWNlIGBhcmd1bWVudHNgLCBpdCBwcmV2ZW50cyB2OCBvcHRpbWl6YXRpb25zXG5cdFx0Zm9yICh2YXIgYSA9IDE7IGEgPCBhcmdzTGVuOyBhKyspIHtcblx0XHRcdHN0ciArPSAnICcgKyBhcmdzW2FdO1xuXHRcdH1cblx0fVxuXG5cdGlmICghdGhpcy5lbmFibGVkIHx8ICFzdHIpIHtcblx0XHRyZXR1cm4gc3RyO1xuXHR9XG5cblx0dmFyIG5lc3RlZFN0eWxlcyA9IHRoaXMuX3N0eWxlcztcblx0dmFyIGkgPSBuZXN0ZWRTdHlsZXMubGVuZ3RoO1xuXG5cdC8vIFR1cm5zIG91dCB0aGF0IG9uIFdpbmRvd3MgZGltbWVkIGdyYXkgdGV4dCBiZWNvbWVzIGludmlzaWJsZSBpbiBjbWQuZXhlLFxuXHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL2lzc3Vlcy81OFxuXHQvLyBJZiB3ZSdyZSBvbiBXaW5kb3dzIGFuZCB3ZSdyZSBkZWFsaW5nIHdpdGggYSBncmF5IGNvbG9yLCB0ZW1wb3JhcmlseSBtYWtlICdkaW0nIGEgbm9vcC5cblx0dmFyIG9yaWdpbmFsRGltID0gYW5zaVN0eWxlcy5kaW0ub3Blbjtcblx0aWYgKGlzU2ltcGxlV2luZG93c1Rlcm0gJiYgKG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmF5JykgIT09IC0xIHx8IG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmV5JykgIT09IC0xKSkge1xuXHRcdGFuc2lTdHlsZXMuZGltLm9wZW4gPSAnJztcblx0fVxuXG5cdHdoaWxlIChpLS0pIHtcblx0XHR2YXIgY29kZSA9IGFuc2lTdHlsZXNbbmVzdGVkU3R5bGVzW2ldXTtcblxuXHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdHN0ciA9IGNvZGUub3BlbiArIHN0ci5yZXBsYWNlKGNvZGUuY2xvc2VSZSwgY29kZS5vcGVuKSArIGNvZGUuY2xvc2U7XG5cdH1cblxuXHQvLyBSZXNldCB0aGUgb3JpZ2luYWwgJ2RpbScgaWYgd2UgY2hhbmdlZCBpdCB0byB3b3JrIGFyb3VuZCB0aGUgV2luZG93cyBkaW1tZWQgZ3JheSBpc3N1ZS5cblx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9IG9yaWdpbmFsRGltO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRyZXRbbmFtZV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgW25hbWVdKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufVxuXG5kZWZpbmVQcm9wcyhDaGFsay5wcm90b3R5cGUsIGluaXQoKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IENoYWxrKCk7XG5tb2R1bGUuZXhwb3J0cy5zdHlsZXMgPSBhbnNpU3R5bGVzO1xubW9kdWxlLmV4cG9ydHMuaGFzQ29sb3IgPSBoYXNBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3RyaXBDb2xvciA9IHN0cmlwQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN1cHBvcnRzQ29sb3IgPSBzdXBwb3J0c0NvbG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcyAoKSB7XG5cdHZhciBzdHlsZXMgPSB7XG5cdFx0bW9kaWZpZXJzOiB7XG5cdFx0XHRyZXNldDogWzAsIDBdLFxuXHRcdFx0Ym9sZDogWzEsIDIyXSwgLy8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdFx0ZGltOiBbMiwgMjJdLFxuXHRcdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XHR9LFxuXHRcdGNvbG9yczoge1xuXHRcdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdFx0cmVkOiBbMzEsIDM5XSxcblx0XHRcdGdyZWVuOiBbMzIsIDM5XSxcblx0XHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0XHRibHVlOiBbMzQsIDM5XSxcblx0XHRcdG1hZ2VudGE6IFszNSwgMzldLFxuXHRcdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0XHR3aGl0ZTogWzM3LCAzOV0sXG5cdFx0XHRncmF5OiBbOTAsIDM5XVxuXHRcdH0sXG5cdFx0YmdDb2xvcnM6IHtcblx0XHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdFx0YmdSZWQ6IFs0MSwgNDldLFxuXHRcdFx0YmdHcmVlbjogWzQyLCA0OV0sXG5cdFx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0XHRiZ0JsdWU6IFs0NCwgNDldLFxuXHRcdFx0YmdNYWdlbnRhOiBbNDUsIDQ5XSxcblx0XHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0XHRiZ1doaXRlOiBbNDcsIDQ5XVxuXHRcdH1cblx0fTtcblxuXHQvLyBmaXggaHVtYW5zXG5cdHN0eWxlcy5jb2xvcnMuZ3JleSA9IHN0eWxlcy5jb2xvcnMuZ3JheTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSkge1xuXHRcdHZhciBncm91cCA9IHN0eWxlc1tncm91cE5hbWVdO1xuXG5cdFx0T2JqZWN0LmtleXMoZ3JvdXApLmZvckVhY2goZnVuY3Rpb24gKHN0eWxlTmFtZSkge1xuXHRcdFx0dmFyIHN0eWxlID0gZ3JvdXBbc3R5bGVOYW1lXTtcblxuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSBncm91cFtzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiAnXFx1MDAxYlsnICsgc3R5bGVbMF0gKyAnbScsXG5cdFx0XHRcdGNsb3NlOiAnXFx1MDAxYlsnICsgc3R5bGVbMV0gKyAnbSdcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsICdleHBvcnRzJywge1xuXHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRnZXQ6IGFzc2VtYmxlU3R5bGVzXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1hdGNoT3BlcmF0b3JzUmUgPSAvW3xcXFxce30oKVtcXF1eJCsqPy5dL2c7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuXHR9XG5cblx0cmV0dXJuIHN0ci5yZXBsYWNlKG1hdGNoT3BlcmF0b3JzUmUsICAnXFxcXCQmJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKTtcbnZhciByZSA9IG5ldyBSZWdFeHAoYW5zaVJlZ2V4KCkuc291cmNlKTsgLy8gcmVtb3ZlIHRoZSBgZ2AgZmxhZ1xubW9kdWxlLmV4cG9ydHMgPSByZS50ZXN0LmJpbmQocmUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1PUlpjZi1ucXJ5PT48XS9nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcmd2ID0gcHJvY2Vzcy5hcmd2O1xuXG52YXIgdGVybWluYXRvciA9IGFyZ3YuaW5kZXhPZignLS0nKTtcbnZhciBoYXNGbGFnID0gZnVuY3Rpb24gKGZsYWcpIHtcblx0ZmxhZyA9ICctLScgKyBmbGFnO1xuXHR2YXIgcG9zID0gYXJndi5pbmRleE9mKGZsYWcpO1xuXHRyZXR1cm4gcG9zICE9PSAtMSAmJiAodGVybWluYXRvciAhPT0gLTEgPyBwb3MgPCB0ZXJtaW5hdG9yIDogdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnbm8tY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ25vLWNvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9ZmFsc2UnKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCdjb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj10cnVlJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1hbHdheXMnKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3Muc3Rkb3V0ICYmICFwcm9jZXNzLnN0ZG91dC5pc1RUWSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLmVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn0pKCk7XG4iLCIvKiFcclxuICogQG5hbWUgSmF2YVNjcmlwdC9Ob2RlSlMgTWVyZ2UgdjEuMi4wXHJcbiAqIEBhdXRob3IgeWVpa29zXHJcbiAqIEByZXBvc2l0b3J5IGh0dHBzOi8vZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2VcclxuXHJcbiAqIENvcHlyaWdodCAyMDE0IHllaWtvcyAtIE1JVCBsaWNlbnNlXHJcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbihpc05vZGUpIHtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2Ugb25lIG9yIG1vcmUgb2JqZWN0cyBcclxuXHQgKiBAcGFyYW0gYm9vbD8gY2xvbmVcclxuXHQgKiBAcGFyYW0gbWl4ZWQsLi4uIGFyZ3VtZW50c1xyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdHZhciBQdWJsaWMgPSBmdW5jdGlvbihjbG9uZSkge1xyXG5cclxuXHRcdHJldHVybiBtZXJnZShjbG9uZSA9PT0gdHJ1ZSwgZmFsc2UsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH0sIHB1YmxpY05hbWUgPSAnbWVyZ2UnO1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzIHJlY3Vyc2l2ZWx5IFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0UHVibGljLnJlY3Vyc2l2ZSA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCB0cnVlLCBhcmd1bWVudHMpO1xyXG5cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBDbG9uZSB0aGUgaW5wdXQgcmVtb3ZpbmcgYW55IHJlZmVyZW5jZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0UHVibGljLmNsb25lID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuXHJcblx0XHR2YXIgb3V0cHV0ID0gaW5wdXQsXHJcblx0XHRcdHR5cGUgPSB0eXBlT2YoaW5wdXQpLFxyXG5cdFx0XHRpbmRleCwgc2l6ZTtcclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0gW107XHJcblx0XHRcdHNpemUgPSBpbnB1dC5sZW5ndGg7XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4IGluIGlucHV0KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXQ7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvYmplY3RzIHJlY3Vyc2l2ZWx5XHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHBhcmFtIG1peGVkIGV4dGVuZFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2VfcmVjdXJzaXZlKGJhc2UsIGV4dGVuZCkge1xyXG5cclxuXHRcdGlmICh0eXBlT2YoYmFzZSkgIT09ICdvYmplY3QnKVxyXG5cclxuXHRcdFx0cmV0dXJuIGV4dGVuZDtcclxuXHJcblx0XHRmb3IgKHZhciBrZXkgaW4gZXh0ZW5kKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZU9mKGJhc2Vba2V5XSkgPT09ICdvYmplY3QnICYmIHR5cGVPZihleHRlbmRba2V5XSkgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYmFzZTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzXHJcblx0ICogQHBhcmFtIGJvb2wgY2xvbmVcclxuXHQgKiBAcGFyYW0gYm9vbCByZWN1cnNpdmVcclxuXHQgKiBAcGFyYW0gYXJyYXkgYXJndlxyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlKGNsb25lLCByZWN1cnNpdmUsIGFyZ3YpIHtcclxuXHJcblx0XHR2YXIgcmVzdWx0ID0gYXJndlswXSxcclxuXHRcdFx0c2l6ZSA9IGFyZ3YubGVuZ3RoO1xyXG5cclxuXHRcdGlmIChjbG9uZSB8fCB0eXBlT2YocmVzdWx0KSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXN1bHQgPSB7fTtcclxuXHJcblx0XHRmb3IgKHZhciBpbmRleD0wO2luZGV4PHNpemU7KytpbmRleCkge1xyXG5cclxuXHRcdFx0dmFyIGl0ZW0gPSBhcmd2W2luZGV4XSxcclxuXHJcblx0XHRcdFx0dHlwZSA9IHR5cGVPZihpdGVtKTtcclxuXHJcblx0XHRcdGlmICh0eXBlICE9PSAnb2JqZWN0JykgY29udGludWU7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gaXRlbSkge1xyXG5cclxuXHRcdFx0XHR2YXIgc2l0ZW0gPSBjbG9uZSA/IFB1YmxpYy5jbG9uZShpdGVtW2tleV0pIDogaXRlbVtrZXldO1xyXG5cclxuXHRcdFx0XHRpZiAocmVjdXJzaXZlKSB7XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBtZXJnZV9yZWN1cnNpdmUocmVzdWx0W2tleV0sIHNpdGVtKTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IHNpdGVtO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHR5cGUgb2YgdmFyaWFibGVcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcmV0dXJuIHN0cmluZ1xyXG5cdCAqXHJcblx0ICogQHNlZSBodHRwOi8vanNwZXJmLmNvbS90eXBlb2Z2YXJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHlwZU9mKGlucHV0KSB7XHJcblxyXG5cdFx0cmV0dXJuICh7fSkudG9TdHJpbmcuY2FsbChpbnB1dCkuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKGlzTm9kZSkge1xyXG5cclxuXHRcdG1vZHVsZS5leHBvcnRzID0gUHVibGljO1xyXG5cclxuXHR9IGVsc2Uge1xyXG5cclxuXHRcdHdpbmRvd1twdWJsaWNOYW1lXSA9IFB1YmxpYztcclxuXHJcblx0fVxyXG5cclxufSkodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ci5yZXBsYWNlKGFuc2lSZWdleCwgJycpIDogc3RyO1xufTtcbiIsInZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XG52YXIgd29yZHdyYXAgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCwgcGFyYW1zKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gcGFyYW1zLnN0YXJ0O1xuICAgICAgICBzdG9wID0gcGFyYW1zLnN0b3A7XG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2Ygc3RvcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RvcDtcbiAgICAgICAgc3RhcnQgPSBzdGFydCB8fCBwYXJhbXMuc3RhcnQ7XG4gICAgICAgIHN0b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIFxuICAgIGlmICghc3RvcCkge1xuICAgICAgICBzdG9wID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xuICAgIHZhciBtb2RlID0gcGFyYW1zLm1vZGUgfHwgJ3NvZnQnO1xuICAgIHZhciByZSA9IG1vZGUgPT09ICdoYXJkJyA/IC9cXGIvIDogLyhcXFMrXFxzKykvO1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgY2h1bmtzID0gdGV4dC50b1N0cmluZygpXG4gICAgICAgICAgICAuc3BsaXQocmUpXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHgpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2hhcmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaXBBbnNpKHgpLmxlbmd0aDsgaSArPSBzdG9wIC0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHguc2xpY2UoaSwgaSArIHN0b3AgLSBzdGFydCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgYWNjLnB1c2goeClcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjaHVua3MucmVkdWNlKGZ1bmN0aW9uIChsaW5lcywgcmF3Q2h1bmspIHtcbiAgICAgICAgICAgIGlmIChyYXdDaHVuayA9PT0gJycpIHJldHVybiBsaW5lcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNodW5rID0gcmF3Q2h1bmsucmVwbGFjZSgvXFx0L2csICcgICAgJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpID0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGlmIChzdHJpcEFuc2kobGluZXNbaV0pLmxlbmd0aCArIHN0cmlwQW5zaShjaHVuaykubGVuZ3RoID4gc3RvcCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZXNbaV0ucmVwbGFjZSgvXFxzKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2h1bmsuc3BsaXQoL1xcbi8pLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheShzdGFydCArIDEpLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBjLnJlcGxhY2UoL15cXHMrLywgJycpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaHVuay5tYXRjaCgvXFxuLykpIHtcbiAgICAgICAgICAgICAgICB2YXIgeHMgPSBjaHVuay5zcGxpdCgvXFxuLyk7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0geHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB4cy5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICsgYy5yZXBsYWNlKC9eXFxzKy8sICcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0gY2h1bms7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgICAgfSwgWyBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJykgXSkuam9pbignXFxuJyk7XG4gICAgfTtcbn07XG5cbndvcmR3cmFwLnNvZnQgPSB3b3Jkd3JhcDtcblxud29yZHdyYXAuaGFyZCA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCkge1xuICAgIHJldHVybiB3b3Jkd3JhcChzdGFydCwgc3RvcCwgeyBtb2RlIDogJ2hhcmQnIH0pO1xufTtcbiJdfQ==
