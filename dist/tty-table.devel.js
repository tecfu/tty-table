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
		callback : null,
		headerAlignment : "center",
		alignment : "center",
		paddingRight : 0,
		paddingLeft : 0,
		paddingBottom : 0,
		paddingTop : 0,
		color : false,
		headerColor : false,
		borderStyle : 1,
		borderStyles : [
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
			output = cell.value;
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

			//Alignment 
			var alignTgt = (rowType === 'header') ? "headerAlignment" : "alignment";
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
				bS = _public.options.borderStyles[_public.options.borderStyle],
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
 * @param {array} rows
 * @param {object} options										- Table options 
 * @param {number} options.marginTop					- default: 0			
 * @param {number} options.marginLeft					- default: 0
 * @param {number} options.maxWidth						- default: 20 
 * @param {function} options.callback					- default: null
 * @param {string} options.headerAlignment		- default: "center"
 * @param {string} options.alignment					- default: "center"
 * @param {number} options.paddingRight				- default: 0
 * @param {number} options.paddingLeft				- default: 0
 * @param {number} options.paddingBottom			- default: 0
 * @param {number} options.paddingTop					- default: 0	
 * @param {string} options.color							- default: terminal default color
 * @param {string} options.headerColor				- default: terminal default color 
 * @param {number} options.borderStyles				- default: 1 (0 = no border)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9tYWluLmpzIiwiLi4vLi4vLi4vdXNyL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9hbnNpLXN0eWxlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvZXNjYXBlLXN0cmluZy1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2hhcy1hbnNpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9ub2RlX21vZHVsZXMvYW5zaS1yZWdleC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyZ2UvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvc3RyaXAtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93b3Jkd3JhcC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIG1lcmdlID0gcmVxdWlyZShcIm1lcmdlXCIpLFxuXHRcdGNoYWxrID0gcmVxdWlyZShcImNoYWxrXCIpLFxuXHRcdHN0cmlwQW5zaSA9IHJlcXVpcmUoXCJzdHJpcC1hbnNpXCIpLFxuXHRcdHdvcmR3cmFwID0gcmVxdWlyZShcIndvcmR3cmFwXCIpO1xuXG5cbnZhciBjbHMgPSBmdW5jdGlvbigpe1xuXG5cblx0dmFyIF9wdWJsaWMgPSB0aGlzLl9wdWJsaWMgPSB7fSxcblx0XHRcdF9wcml2YXRlID0gdGhpcy5fcHJpdmF0ZSA9IHt9O1xuXG5cblx0LyoqIFxuXHQgKiBQcml2YXRlIFZhcmlhYmxlc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmRlZmF1bHRzID0ge1xuXHRcdG1hcmdpblRvcCA6IDEsXG5cdFx0bWFyZ2luTGVmdCA6IDIsXG5cdFx0bWF4V2lkdGggOiAyMCxcblx0XHRjYWxsYmFjayA6IG51bGwsXG5cdFx0aGVhZGVyQWxpZ25tZW50IDogXCJjZW50ZXJcIixcblx0XHRhbGlnbm1lbnQgOiBcImNlbnRlclwiLFxuXHRcdHBhZGRpbmdSaWdodCA6IDAsXG5cdFx0cGFkZGluZ0xlZnQgOiAwLFxuXHRcdHBhZGRpbmdCb3R0b20gOiAwLFxuXHRcdHBhZGRpbmdUb3AgOiAwLFxuXHRcdGNvbG9yIDogZmFsc2UsXG5cdFx0aGVhZGVyQ29sb3IgOiBmYWxzZSxcblx0XHRib3JkZXJTdHlsZSA6IDEsXG5cdFx0Ym9yZGVyU3R5bGVzIDogW1xuXHRcdFx0W1xuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSUXCIsIGo6IFwi4pS0XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSYXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9XG5cdFx0XHRdXG5cdFx0XVxuXHR9O1xuXG5cblx0Ly9Db25zdGFudHNcblx0X3ByaXZhdGUuR1VUVEVSID0gMTtcblxuXG5cdF9wcml2YXRlLnRhYmxlID0ge1xuXHRcdGNvbHVtbnMgOiBbXSxcblx0XHRjb2x1bW5XaWR0aHMgOiBbXSxcblx0XHRjb2x1bW5Jbm5lcldpZHRocyA6IFtdLFxuXHRcdGhlYWRlciA6IFtdLFxuXHRcdGJvZHkgOiBbXVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFByaXZhdGUgTWV0aG9kc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmJ1aWxkUm93ID0gZnVuY3Rpb24ocm93LG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBtaW5Sb3dIZWlnaHQgPSAwO1xuXHRcdFxuXHRcdC8vZ2V0IHJvdyBhcyBhcnJheSBvZiBjZWxsIGFycmF5c1xuXHRcdHZhciBjQXJycyA9IHJvdy5tYXAoZnVuY3Rpb24oY2VsbCxpbmRleCl7XG5cdFx0XHR2YXIgYyA9IF9wcml2YXRlLmJ1aWxkQ2VsbChjZWxsLGluZGV4LG9wdGlvbnMpO1xuXHRcdFx0dmFyIGNlbGxBcnIgPSBjLmNlbGxBcnI7XG5cdFx0XHRpZihvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbklubmVyV2lkdGhzLnB1c2goYy53aWR0aCk7XG5cdFx0XHR9XG5cdFx0XHRtaW5Sb3dIZWlnaHQgPSAobWluUm93SGVpZ2h0IDwgY2VsbEFyci5sZW5ndGgpID8gY2VsbEFyci5sZW5ndGggOiBtaW5Sb3dIZWlnaHQ7XG5cdFx0XHRyZXR1cm4gY2VsbEFycjtcblx0XHR9KTtcblxuXHRcdC8vQWRqdXN0IG1pblJvd0hlaWdodCB0byByZWZsZWN0IHZlcnRpY2FsIHJvdyBwYWRkaW5nXG5cdFx0bWluUm93SGVpZ2h0ID0gKG9wdGlvbnMuaGVhZGVyKSA/IG1pblJvd0hlaWdodCA6IG1pblJvd0hlaWdodCArIFxuXHRcdFx0KF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nQm90dG9tICsgX3B1YmxpYy5vcHRpb25zLnBhZGRpbmdUb3ApO1xuXG5cdFx0Ly9jb252ZXJ0IGFycmF5IG9mIGNlbGwgYXJyYXlzIHRvIGFycmF5IG9mIGxpbmVzXG5cdFx0dmFyIGxpbmVzID0gQXJyYXkuYXBwbHkobnVsbCx7bGVuZ3RoOm1pblJvd0hlaWdodH0pXG5cdFx0XHQubWFwKEZ1bmN0aW9uLmNhbGwsZnVuY3Rpb24oKXtyZXR1cm4gW119KTtcblxuXHRcdGNBcnJzLmZvckVhY2goZnVuY3Rpb24oY2VsbEFycixhKXtcblx0XHRcdHZhciB3aGl0ZWxpbmUgPSBBcnJheShfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHNbYV0pLmpvaW4oJ1xcICcpO1xuXHRcdFx0aWYoIW9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdFx0Ly9BZGQgd2hpdGVzcGFjZSBmb3IgdG9wIHBhZGRpbmdcblx0XHRcdFx0Zm9yKGk9MDsgaTxfcHVibGljLm9wdGlvbnMucGFkZGluZ1RvcDsgaSsrKXtcblx0XHRcdFx0XHRjZWxsQXJyLnVuc2hpZnQod2hpdGVsaW5lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly9BZGQgd2hpdGVzcGFjZSBmb3IgYm90dG9tIHBhZGRpbmdcblx0XHRcdFx0Zm9yKGk9MDsgaTxfcHVibGljLm9wdGlvbnMucGFkZGluZ0JvdHRvbTsgaSsrKXtcblx0XHRcdFx0XHRjZWxsQXJyLnB1c2god2hpdGVsaW5lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVx0XG5cdFx0XHRmb3IodmFyIGI9MDsgYjxtaW5Sb3dIZWlnaHQ7IGIrKyl7XHRcblx0XHRcdFx0bGluZXNbYl0ucHVzaCgodHlwZW9mIGNlbGxBcnJbYl0gIT0gJ3VuZGVmaW5lZCcpID8gY2VsbEFycltiXSA6IHdoaXRlbGluZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbGluZXM7XG5cdH07XG5cblx0X3ByaXZhdGUuYnVpbGRDZWxsID0gZnVuY3Rpb24oY2VsbCxjb2x1bW5JbmRleCxvcHRpb25zKXtcblxuXHRcdC8vUHVsbCBjb2x1bW4gb3B0aW9uc1x0XG5cdFx0dmFyIG91dHB1dDtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcblx0XHRpZihvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdGNlbGwgPSBtZXJnZSh0cnVlLF9wdWJsaWMub3B0aW9ucyxjZWxsKTtcblx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbnMucHVzaChjZWxsKTtcblx0XHRcdG91dHB1dCA9IGNlbGwudmFsdWU7XG5cdFx0XHRjb2x1bW5PcHRpb25zID0gY2VsbDtcblx0XHR9XHRcblx0XHRlbHNle1xuXHRcdFx0Y29sdW1uT3B0aW9ucyA9IF9wcml2YXRlLnRhYmxlLmNvbHVtbnNbY29sdW1uSW5kZXhdO1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnKXtcdFxuXHRcdFx0XHRjb2x1bW5PcHRpb25zID0gbWVyZ2UodHJ1ZSxjb2x1bW5PcHRpb25zLGNlbGwpO1x0XHRcblx0XHRcdFx0Y2VsbCA9IHZhbHVlO1x0XHRcdFxuXHRcdFx0fVx0XG5cdFx0XG5cdFx0XHRpZih0eXBlb2YgY29sdW1uT3B0aW9ucy5mb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0XHRvdXRwdXQgPSBjb2x1bW5PcHRpb25zLmZvcm1hdHRlcihjZWxsKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdG91dHB1dCA9IGNlbGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vQXV0b21hdGljIHRleHQgd3JhcFxuXHRcdHZhciB3cmFwT2JqICA9IF9wcml2YXRlLndyYXBDZWxsQ29udGVudChvdXRwdXQsY29sdW1uSW5kZXgsY29sdW1uT3B0aW9ucyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0KG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXIpID8gXCJoZWFkZXJcIiA6IFwiYm9keVwiKTtcblx0XHRvdXRwdXQgPSB3cmFwT2JqLm91dHB1dDtcblx0XHRcblx0XHQvL3JldHVybiBhcyBhcnJheSBvZiBsaW5lc1xuXHRcdHJldHVybiB7XG5cdFx0XHRjZWxsQXJyIDogb3V0cHV0LnNwbGl0KCdcXG4nKSxcblx0XHRcdHdpZHRoIDogd3JhcE9iai53aWR0aFxuXHRcdH07XG5cdH07XG5cblx0X3ByaXZhdGUuY29sb3JpemVBbGxXb3JkcyA9IGZ1bmN0aW9uKGNvbG9yLHN0cil7XG5cdFx0Ly9Db2xvciBlYWNoIHdvcmQgaW4gdGhlIGNlbGwgc28gdGhhdCBsaW5lIGJyZWFrcyBkb24ndCBicmVhayBjb2xvciBcblx0XHR2YXIgYXJyID0gc3RyLnJlcGxhY2UoLyhcXFMrKS9naSxmdW5jdGlvbihtYXRjaCl7XG5cdFx0XHRyZXR1cm4gY2hhbGtbY29sb3JdKG1hdGNoKSsnXFwgJztcblx0XHR9KTtcblx0XHRyZXR1cm4gYXJyO1xuXHR9O1xuXG5cdF9wcml2YXRlLmNvbG9yaXplTGluZSA9IGZ1bmN0aW9uKGNvbG9yLHN0cil7XG5cdFx0cmV0dXJuIGNoYWxrW2NvbG9yXShzdHIpO1xuXHR9O1xuXG5cdF9wcml2YXRlLndyYXBDZWxsQ29udGVudCA9IGZ1bmN0aW9uKHZhbHVlLGNvbHVtbkluZGV4LGNvbHVtbk9wdGlvbnMscm93VHlwZSl7XG5cdFx0dmFyIHN0cmluZyA9IHZhbHVlLnRvU3RyaW5nKCksXG5cdFx0XHRcdHdpZHRoID0gX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzW2NvbHVtbkluZGV4XSxcblx0XHRcdFx0aW5uZXJXaWR0aCA9IHdpZHRoIC0gY29sdW1uT3B0aW9ucy5wYWRkaW5nTGVmdCBcblx0XHRcdFx0XHRcdFx0XHRcdFx0LSBjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQtIF9wcml2YXRlLkdVVFRFUjsgLy9ib3JkZXIvZ3V0dGVyXG5cblx0XHQvL0JyZWFrIHN0cmluZyBpbnRvIGFycmF5IG9mIGxpbmVzXG5cdFx0d3JhcCA9IHdvcmR3cmFwKGlubmVyV2lkdGgpO1xuXHRcdHN0cmluZyA9IHdyYXAoc3RyaW5nKTsgXG5cblx0XHR2YXIgc3RyQXJyID0gc3RyaW5nLnNwbGl0KCdcXG4nKTtcblxuXHRcdC8vRm9ybWF0IGVhY2ggbGluZVxuXHRcdHN0ckFyciA9IHN0ckFyci5tYXAoZnVuY3Rpb24obGluZSl7XG5cblx0XHRcdC8vQXBwbHkgY29sb3JzXG5cdFx0XHRzd2l0Y2godHJ1ZSl7XG5cdFx0XHRcdGNhc2Uocm93VHlwZSA9PT0gJ2hlYWRlcicpOlxuXHRcdFx0XHRcdGxpbmUgPSAoY29sdW1uT3B0aW9ucy5jb2xvciB8fCBfcHVibGljLm9wdGlvbnMuY29sb3IpID8gXG5cdFx0XHRcdFx0XHRfcHJpdmF0ZS5jb2xvcml6ZUxpbmUoY29sdW1uT3B0aW9ucy5oZWFkZXJDb2xvciB8fCBfcHVibGljLm9wdGlvbnMuY29sb3IsbGluZSkgOiBcblx0XHRcdFx0XHRcdGxpbmU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UodHlwZW9mIGNvbHVtbk9wdGlvbnMuY29sb3IgPT09ICdzdHJpbmcnKTpcblx0XHRcdFx0XHRsaW5lID0gX3ByaXZhdGUuY29sb3JpemVMaW5lKGNvbHVtbk9wdGlvbnMuY29sb3IsbGluZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UodHlwZW9mIF9wdWJsaWMub3B0aW9ucy5jb2xvciA9PT0gJ3N0cmluZycpOlxuXHRcdFx0XHRcdGxpbmUgPSBfcHJpdmF0ZS5jb2xvcml6ZUxpbmUoX3B1YmxpYy5vcHRpb25zLmNvbG9yLGxpbmUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL0xlZnQsIFJpZ2h0IFBhZGRpbmdcblx0XHRcdGxpbmUgPSBBcnJheShjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0ICsgMSkuam9pbignICcpICtcblx0XHRcdFx0XHRcdGxpbmUgK1xuXHRcdFx0XHRcdFx0QXJyYXkoY29sdW1uT3B0aW9ucy5wYWRkaW5nUmlnaHQgKyAxKS5qb2luKCcgJyk7XG5cdFx0XHR2YXIgbGluZUxlbmd0aCA9IHN0cmlwQW5zaShsaW5lKS5sZW5ndGg7XG5cblx0XHRcdC8vQWxpZ25tZW50IFxuXHRcdFx0dmFyIGFsaWduVGd0ID0gKHJvd1R5cGUgPT09ICdoZWFkZXInKSA/IFwiaGVhZGVyQWxpZ25tZW50XCIgOiBcImFsaWdubWVudFwiO1xuXHRcdFx0aWYobGluZUxlbmd0aCA8IHdpZHRoKXtcblx0XHRcdFx0dmFyIHNwYWNlQXZhaWxhYmxlID0gd2lkdGggLSBsaW5lTGVuZ3RoOyBcblx0XHRcdFx0c3dpdGNoKHRydWUpe1xuXHRcdFx0XHRcdGNhc2UoY29sdW1uT3B0aW9uc1thbGlnblRndF0gPT09ICdjZW50ZXInKTpcblx0XHRcdFx0XHRcdHZhciBldmVuID0gKHNwYWNlQXZhaWxhYmxlICUyID09PSAwKTtcblx0XHRcdFx0XHRcdHNwYWNlQXZhaWxhYmxlID0gKGV2ZW4pID8gc3BhY2VBdmFpbGFibGUgOiBcblx0XHRcdFx0XHRcdFx0c3BhY2VBdmFpbGFibGUgLSAxO1xuXHRcdFx0XHRcdFx0aWYoc3BhY2VBdmFpbGFibGUgPiAxKXtcblx0XHRcdFx0XHRcdFx0bGluZSA9IEFycmF5KHNwYWNlQXZhaWxhYmxlLzIpLmpvaW4oJyAnKSArIFxuXHRcdFx0XHRcdFx0XHRcdGxpbmUgK1xuXHRcdFx0XHRcdFx0XHRcdEFycmF5KHNwYWNlQXZhaWxhYmxlLzIgKyAoKGV2ZW4pPzE6MikpLmpvaW4oJyAnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UoY29sdW1uT3B0aW9uc1thbGlnblRndF0gPT09ICdyaWdodCcpOlxuXHRcdFx0XHRcdFx0bGluZSA9IEFycmF5KHNwYWNlQXZhaWxhYmxlKS5qb2luKCcgJykgKyBsaW5lO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGxpbmUgPSBsaW5lICsgQXJyYXkoc3BhY2VBdmFpbGFibGUpLmpvaW4oJyAnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbGluZTtcblx0XHR9KTtcblxuXHRcdHN0cmluZyA9IHN0ckFyci5qb2luKCdcXG4nKTtcblx0XHRcblx0XHRyZXR1cm4ge1xuXHRcdFx0b3V0cHV0IDogc3RyaW5nLFxuXHRcdFx0d2lkdGggOiBpbm5lcldpZHRoXG5cdFx0fTtcblx0fTtcblxuXHRfcHJpdmF0ZS5nZXRDb2x1bW5XaWR0aHMgPSBmdW5jdGlvbihyb3cpe1xuXHRcdC8vV2lkdGhzIGFzIHByZXNjcmliZWRcblx0XHR2YXIgd2lkdGhzID0gcm93Lm1hcChmdW5jdGlvbihjZWxsKXtcblx0XHRcdGlmKHR5cGVvZiBjZWxsID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgY2VsbC53aWR0aCAhPT0ndW5kZWZpbmVkJyl7XG5cdFx0XHRcdHJldHVybiBjZWxsLndpZHRoO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0cmV0dXJuIF9wdWJsaWMub3B0aW9ucy5tYXhXaWR0aDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vQ2hlY2sgdG8gbWFrZSBzdXJlIHdpZHRocyB3aWxsIGZpdCB0aGUgY3VycmVudCBkaXNwbGF5LCBvciByZXNpemUuXG5cdFx0dmFyIHRvdGFsV2lkdGggPSB3aWR0aHMucmVkdWNlKGZ1bmN0aW9uKHByZXYsY3Vycil7XG5cdFx0XHRyZXR1cm4gcHJlditjdXJyO1xuXHRcdH0pO1xuXHRcdC8vQWRkIG1hcmdpbkxlZnQgdG8gdG90YWxXaWR0aFxuXHRcdHRvdGFsV2lkdGggKz0gX3B1YmxpYy5vcHRpb25zLm1hcmdpbkxlZnQ7XG5cblx0XHQvL0NoZWNrIHByb2Nlc3MgZXhpc3RzIGluIGNhc2Ugd2UgYXJlIGluIGJyb3dzZXJcblx0XHRpZihwcm9jZXNzICYmIHByb2Nlc3Muc3Rkb3V0ICYmIHRvdGFsV2lkdGggPiBwcm9jZXNzLnN0ZG91dC5jb2x1bW5zKXtcblx0XHRcdC8vcmVjYWxjdWxhdGUgcHJvcG9ydGlvbmF0ZWx5IHRvIGZpdCBzaXplXG5cdFx0XHR2YXIgcHJvcCA9IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMgPiB0b3RhbFdpZHRoO1xuXHRcdFx0cHJvcCA9IHByb3AudG9GaXhlZCgyKS0wLjAxO1xuXHRcdFx0d2lkdGhzID0gd2lkdGhzLm1hcChmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiBNYXRoLmZsb29yKHByb3AqdmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRocztcblx0fTtcblxuXG5cdC8qKiBcblx0ICogUHVibGljIFZhcmlhYmxlc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wdWJsaWMub3B0aW9ucyA9IHt9O1xuXG5cblx0LyoqXG5cdCAqIFB1YmxpYyBNZXRob2RzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3ByaXZhdGUuc2V0dXAgPSBmdW5jdGlvbihoZWFkZXIsYm9keSxvcHRpb25zKXtcblx0XHRcblx0XHRfcHVibGljLm9wdGlvbnMgPSBtZXJnZSh0cnVlLF9wcml2YXRlLmRlZmF1bHRzLG9wdGlvbnMpO1xuXHRcdFxuXHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRocyA9IF9wcml2YXRlLmdldENvbHVtbldpZHRocyhoZWFkZXIpO1xuXG5cdFx0aGVhZGVyID0gW2hlYWRlcl07XG5cdFx0X3ByaXZhdGUudGFibGUuaGVhZGVyID0gaGVhZGVyLm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyx7XG5cdFx0XHRcdGhlYWRlcjp0cnVlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdF9wcml2YXRlLnRhYmxlLmJvZHkgPSBib2R5Lm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gX3B1YmxpYztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIGEgdGFibGUgdG8gYSBzdHJpbmdcblx0ICogQHJldHVybnMge1N0cmluZ31cblx0ICogQG1lbWJlcm9mIFRhYmxlIFxuXHQgKiBAZXhhbXBsZSBcblx0ICogYGBgXG5cdCAqIHZhciBzdHIgPSB0MS5yZW5kZXIoKTsgXG5cdCAqIGNvbnNvbGUubG9nKHN0cik7IC8vb3V0cHV0cyB0YWJsZVxuXHQgKiBgYGBcblx0Ki9cblx0X3B1YmxpYy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBzdHIgPSAnJyxcblx0XHRcdFx0cGFydCA9IFsnaGVhZGVyJywnYm9keSddLFxuXHRcdFx0XHRiQXJyID0gW10sXG5cdFx0XHRcdG1hcmdpbkxlZnQgPSBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdCArIDEpLmpvaW4oJ1xcICcpLFxuXHRcdFx0XHRiUyA9IF9wdWJsaWMub3B0aW9ucy5ib3JkZXJTdHlsZXNbX3B1YmxpYy5vcHRpb25zLmJvcmRlclN0eWxlXSxcblx0XHRcdFx0Ym9yZGVycyA9IFtdO1xuXG5cdFx0Ly9Cb3JkZXJzXG5cdFx0Zm9yKGE9MDthPDM7YSsrKXtcblx0XHRcdGJvcmRlcnMucHVzaCgnJyk7XG5cdFx0XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHMuZm9yRWFjaChmdW5jdGlvbih3LGksYXJyKXtcblx0XHRcdFx0Ym9yZGVyc1thXSArPSBBcnJheSh3KS5qb2luKGJTW2FdLmgpIFxuXHRcdFx0XHRcdCsgKChpKzEgIT09IGFyci5sZW5ndGgpID8gYlNbYV0uaiA6IGJTW2FdLnIpO1xuXHRcdFx0fSk7XG5cdFx0XHRib3JkZXJzW2FdID0gYlNbYV0ubCArIGJvcmRlcnNbYV07XG5cdFx0XHRib3JkZXJzW2FdID0gYm9yZGVyc1thXS5zcGxpdCgnJyk7XG5cdFx0XHRib3JkZXJzW2FdW2JvcmRlcnNbYV0ubGVuZ3RoMV0gPSBiU1thXS5yO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJvcmRlcnNbYV0uam9pbignJyk7XG5cdFx0XHRib3JkZXJzW2FdID0gbWFyZ2luTGVmdCArIGJvcmRlcnNbYV0gKyAnXFxuJztcblx0XHR9XG5cdFx0XG5cdFx0c3RyICs9IGJvcmRlcnNbMF07XG5cblx0XHQvL1Jvd3Ncblx0XHRwYXJ0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcblx0XHRcdHdoaWxlKF9wcml2YXRlLnRhYmxlW3BdLmxlbmd0aCl7XG5cdFx0XHRcdHJvdyA9IF9wcml2YXRlLnRhYmxlW3BdLnNoaWZ0KCk7XG5cdFx0XHRcblx0XHRcdFx0cm93LmZvckVhY2goZnVuY3Rpb24obGluZSl7XG5cdFx0XHRcdFx0c3RyID0gc3RyIFxuXHRcdFx0XHRcdFx0KyBtYXJnaW5MZWZ0IFxuXHRcdFx0XHRcdFx0KyBiU1sxXS52XG5cdFx0XHRcdFx0XHQrXHRsaW5lLmpvaW4oYlNbMV0udikgXG5cdFx0XHRcdFx0XHQrIGJTWzFdLnZcblx0XHRcdFx0XHRcdCsgJ1xcbic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9Kb2luaW5nIGJvcmRlclxuXHRcdFx0XHRpZighKGk9PTEgJiYgX3ByaXZhdGUudGFibGVbcF0ubGVuZ3RoPT09MCkpe1xuXHRcdFx0XHRcdHN0ciArPSBib3JkZXJzWzFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHR9KTtcblx0XHRcblx0XHQvL0JvdHRvbSBib3JkZXJcblx0XHRzdHIgKz0gYm9yZGVyc1syXTtcblxuXHRcdHJldHVybiBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luVG9wICsgMSkuam9pbignXFxuJykgKyBzdHI7XG5cdH1cdFxuXG59O1xuXG5cbi8qKlxuICogQGNsYXNzIFRhYmxlXG4gKiBAcGFyYW0ge2FycmF5fSBoZWFkZXJcbiAqIEBwYXJhbSB7YXJyYXl9IHJvd3NcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHRcdFx0XHRcdFx0XHRcdFx0XHQtIFRhYmxlIG9wdGlvbnMgXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5tYXJnaW5Ub3BcdFx0XHRcdFx0LSBkZWZhdWx0OiAwXHRcdFx0XG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5tYXJnaW5MZWZ0XHRcdFx0XHRcdC0gZGVmYXVsdDogMFxuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubWF4V2lkdGhcdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IDIwIFxuICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0aW9ucy5jYWxsYmFja1x0XHRcdFx0XHQtIGRlZmF1bHQ6IG51bGxcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmhlYWRlckFsaWdubWVudFx0XHQtIGRlZmF1bHQ6IFwiY2VudGVyXCJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmFsaWdubWVudFx0XHRcdFx0XHQtIGRlZmF1bHQ6IFwiY2VudGVyXCJcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnBhZGRpbmdSaWdodFx0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5wYWRkaW5nTGVmdFx0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5wYWRkaW5nQm90dG9tXHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5wYWRkaW5nVG9wXHRcdFx0XHRcdC0gZGVmYXVsdDogMFx0XG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jb2xvclx0XHRcdFx0XHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5oZWFkZXJDb2xvclx0XHRcdFx0LSBkZWZhdWx0OiB0ZXJtaW5hbCBkZWZhdWx0IGNvbG9yIFxuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuYm9yZGVyU3R5bGVzXHRcdFx0XHQtIGRlZmF1bHQ6IDEgKDAgPSBubyBib3JkZXIpXG4gKiBAcmV0dXJucyB7VGFibGV9XG4gKiBAZXhhbXBsZVxuICogYGBgXG4gKiB2YXIgVGFibGUgPSByZXF1aXJlKCd0dHktdGFibGUnKTtcbiAqIFRhYmxlKGhlYWRlcixyb3dzLG9wdGlvbnMpO1xuICogYGBgXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhlYWRlcixyb3dzLG9wdGlvbnMpe1xuXHR2YXIgbyA9IG5ldyBjbHMoKTtcblx0cmV0dXJuIG8uX3ByaXZhdGUuc2V0dXAoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xudmFyIGFuc2lTdHlsZXMgPSByZXF1aXJlKCdhbnNpLXN0eWxlcycpO1xudmFyIHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcbnZhciBoYXNBbnNpID0gcmVxdWlyZSgnaGFzLWFuc2knKTtcbnZhciBzdXBwb3J0c0NvbG9yID0gcmVxdWlyZSgnc3VwcG9ydHMtY29sb3InKTtcbnZhciBkZWZpbmVQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIGlzU2ltcGxlV2luZG93c1Rlcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmICEvXnh0ZXJtL2kudGVzdChwcm9jZXNzLmVudi5URVJNKTtcblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuXHQvLyBkZXRlY3QgbW9kZSBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdHRoaXMuZW5hYmxlZCA9ICFvcHRpb25zIHx8IG9wdGlvbnMuZW5hYmxlZCA9PT0gdW5kZWZpbmVkID8gc3VwcG9ydHNDb2xvciA6IG9wdGlvbnMuZW5hYmxlZDtcbn1cblxuLy8gdXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcblx0YW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxYls5NG0nO1xufVxuXG52YXIgc3R5bGVzID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKGFuc2lTdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFuc2lTdHlsZXNba2V5XS5jbG9zZVJlID0gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlc1trZXldLmNsb3NlKSwgJ2cnKTtcblxuXHRcdHJldFtrZXldID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIHRoaXMuX3N0eWxlcy5jb25jYXQoa2V5KSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn0pKCk7XG5cbnZhciBwcm90byA9IGRlZmluZVByb3BzKGZ1bmN0aW9uIGNoYWxrKCkge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMpIHtcblx0dmFyIGJ1aWxkZXIgPSBmdW5jdGlvbiBidWlsZGVyKCkge1xuXHRcdHJldHVybiBhcHBseVN0eWxlLmFwcGx5KGJ1aWxkZXIsIGFyZ3VtZW50cyk7XG5cdH07XG5cblx0YnVpbGRlci5fc3R5bGVzID0gX3N0eWxlcztcblx0YnVpbGRlci5lbmFibGVkID0gdGhpcy5lbmFibGVkO1xuXHQvLyBfX3Byb3RvX18gaXMgdXNlZCBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGUuXG5cdC8qZXNsaW50IG5vLXByb3RvOiAwICovXG5cdGJ1aWxkZXIuX19wcm90b19fID0gcHJvdG87XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGUoKSB7XG5cdC8vIHN1cHBvcnQgdmFyYWdzLCBidXQgc2ltcGx5IGNhc3QgdG8gc3RyaW5nIGluIGNhc2UgdGhlcmUncyBvbmx5IG9uZSBhcmdcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBhcmdzTGVuID0gYXJncy5sZW5ndGg7XG5cdHZhciBzdHIgPSBhcmdzTGVuICE9PSAwICYmIFN0cmluZyhhcmd1bWVudHNbMF0pO1xuXG5cdGlmIChhcmdzTGVuID4gMSkge1xuXHRcdC8vIGRvbid0IHNsaWNlIGBhcmd1bWVudHNgLCBpdCBwcmV2ZW50cyB2OCBvcHRpbWl6YXRpb25zXG5cdFx0Zm9yICh2YXIgYSA9IDE7IGEgPCBhcmdzTGVuOyBhKyspIHtcblx0XHRcdHN0ciArPSAnICcgKyBhcmdzW2FdO1xuXHRcdH1cblx0fVxuXG5cdGlmICghdGhpcy5lbmFibGVkIHx8ICFzdHIpIHtcblx0XHRyZXR1cm4gc3RyO1xuXHR9XG5cblx0dmFyIG5lc3RlZFN0eWxlcyA9IHRoaXMuX3N0eWxlcztcblx0dmFyIGkgPSBuZXN0ZWRTdHlsZXMubGVuZ3RoO1xuXG5cdC8vIFR1cm5zIG91dCB0aGF0IG9uIFdpbmRvd3MgZGltbWVkIGdyYXkgdGV4dCBiZWNvbWVzIGludmlzaWJsZSBpbiBjbWQuZXhlLFxuXHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL2lzc3Vlcy81OFxuXHQvLyBJZiB3ZSdyZSBvbiBXaW5kb3dzIGFuZCB3ZSdyZSBkZWFsaW5nIHdpdGggYSBncmF5IGNvbG9yLCB0ZW1wb3JhcmlseSBtYWtlICdkaW0nIGEgbm9vcC5cblx0dmFyIG9yaWdpbmFsRGltID0gYW5zaVN0eWxlcy5kaW0ub3Blbjtcblx0aWYgKGlzU2ltcGxlV2luZG93c1Rlcm0gJiYgKG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmF5JykgIT09IC0xIHx8IG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmV5JykgIT09IC0xKSkge1xuXHRcdGFuc2lTdHlsZXMuZGltLm9wZW4gPSAnJztcblx0fVxuXG5cdHdoaWxlIChpLS0pIHtcblx0XHR2YXIgY29kZSA9IGFuc2lTdHlsZXNbbmVzdGVkU3R5bGVzW2ldXTtcblxuXHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdHN0ciA9IGNvZGUub3BlbiArIHN0ci5yZXBsYWNlKGNvZGUuY2xvc2VSZSwgY29kZS5vcGVuKSArIGNvZGUuY2xvc2U7XG5cdH1cblxuXHQvLyBSZXNldCB0aGUgb3JpZ2luYWwgJ2RpbScgaWYgd2UgY2hhbmdlZCBpdCB0byB3b3JrIGFyb3VuZCB0aGUgV2luZG93cyBkaW1tZWQgZ3JheSBpc3N1ZS5cblx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9IG9yaWdpbmFsRGltO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRyZXRbbmFtZV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgW25hbWVdKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufVxuXG5kZWZpbmVQcm9wcyhDaGFsay5wcm90b3R5cGUsIGluaXQoKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IENoYWxrKCk7XG5tb2R1bGUuZXhwb3J0cy5zdHlsZXMgPSBhbnNpU3R5bGVzO1xubW9kdWxlLmV4cG9ydHMuaGFzQ29sb3IgPSBoYXNBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3RyaXBDb2xvciA9IHN0cmlwQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN1cHBvcnRzQ29sb3IgPSBzdXBwb3J0c0NvbG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcyAoKSB7XG5cdHZhciBzdHlsZXMgPSB7XG5cdFx0bW9kaWZpZXJzOiB7XG5cdFx0XHRyZXNldDogWzAsIDBdLFxuXHRcdFx0Ym9sZDogWzEsIDIyXSwgLy8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdFx0ZGltOiBbMiwgMjJdLFxuXHRcdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XHR9LFxuXHRcdGNvbG9yczoge1xuXHRcdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdFx0cmVkOiBbMzEsIDM5XSxcblx0XHRcdGdyZWVuOiBbMzIsIDM5XSxcblx0XHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0XHRibHVlOiBbMzQsIDM5XSxcblx0XHRcdG1hZ2VudGE6IFszNSwgMzldLFxuXHRcdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0XHR3aGl0ZTogWzM3LCAzOV0sXG5cdFx0XHRncmF5OiBbOTAsIDM5XVxuXHRcdH0sXG5cdFx0YmdDb2xvcnM6IHtcblx0XHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdFx0YmdSZWQ6IFs0MSwgNDldLFxuXHRcdFx0YmdHcmVlbjogWzQyLCA0OV0sXG5cdFx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0XHRiZ0JsdWU6IFs0NCwgNDldLFxuXHRcdFx0YmdNYWdlbnRhOiBbNDUsIDQ5XSxcblx0XHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0XHRiZ1doaXRlOiBbNDcsIDQ5XVxuXHRcdH1cblx0fTtcblxuXHQvLyBmaXggaHVtYW5zXG5cdHN0eWxlcy5jb2xvcnMuZ3JleSA9IHN0eWxlcy5jb2xvcnMuZ3JheTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSkge1xuXHRcdHZhciBncm91cCA9IHN0eWxlc1tncm91cE5hbWVdO1xuXG5cdFx0T2JqZWN0LmtleXMoZ3JvdXApLmZvckVhY2goZnVuY3Rpb24gKHN0eWxlTmFtZSkge1xuXHRcdFx0dmFyIHN0eWxlID0gZ3JvdXBbc3R5bGVOYW1lXTtcblxuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSBncm91cFtzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiAnXFx1MDAxYlsnICsgc3R5bGVbMF0gKyAnbScsXG5cdFx0XHRcdGNsb3NlOiAnXFx1MDAxYlsnICsgc3R5bGVbMV0gKyAnbSdcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsICdleHBvcnRzJywge1xuXHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRnZXQ6IGFzc2VtYmxlU3R5bGVzXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1hdGNoT3BlcmF0b3JzUmUgPSAvW3xcXFxce30oKVtcXF1eJCsqPy5dL2c7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuXHR9XG5cblx0cmV0dXJuIHN0ci5yZXBsYWNlKG1hdGNoT3BlcmF0b3JzUmUsICAnXFxcXCQmJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKTtcbnZhciByZSA9IG5ldyBSZWdFeHAoYW5zaVJlZ2V4KCkuc291cmNlKTsgLy8gcmVtb3ZlIHRoZSBgZ2AgZmxhZ1xubW9kdWxlLmV4cG9ydHMgPSByZS50ZXN0LmJpbmQocmUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1PUlpjZi1ucXJ5PT48XS9nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcmd2ID0gcHJvY2Vzcy5hcmd2O1xuXG52YXIgdGVybWluYXRvciA9IGFyZ3YuaW5kZXhPZignLS0nKTtcbnZhciBoYXNGbGFnID0gZnVuY3Rpb24gKGZsYWcpIHtcblx0ZmxhZyA9ICctLScgKyBmbGFnO1xuXHR2YXIgcG9zID0gYXJndi5pbmRleE9mKGZsYWcpO1xuXHRyZXR1cm4gcG9zICE9PSAtMSAmJiAodGVybWluYXRvciAhPT0gLTEgPyBwb3MgPCB0ZXJtaW5hdG9yIDogdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnbm8tY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ25vLWNvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9ZmFsc2UnKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCdjb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj10cnVlJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1hbHdheXMnKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3Muc3Rkb3V0ICYmICFwcm9jZXNzLnN0ZG91dC5pc1RUWSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLmVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn0pKCk7XG4iLCIvKiFcclxuICogQG5hbWUgSmF2YVNjcmlwdC9Ob2RlSlMgTWVyZ2UgdjEuMi4wXHJcbiAqIEBhdXRob3IgeWVpa29zXHJcbiAqIEByZXBvc2l0b3J5IGh0dHBzOi8vZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2VcclxuXHJcbiAqIENvcHlyaWdodCAyMDE0IHllaWtvcyAtIE1JVCBsaWNlbnNlXHJcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbihpc05vZGUpIHtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2Ugb25lIG9yIG1vcmUgb2JqZWN0cyBcclxuXHQgKiBAcGFyYW0gYm9vbD8gY2xvbmVcclxuXHQgKiBAcGFyYW0gbWl4ZWQsLi4uIGFyZ3VtZW50c1xyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdHZhciBQdWJsaWMgPSBmdW5jdGlvbihjbG9uZSkge1xyXG5cclxuXHRcdHJldHVybiBtZXJnZShjbG9uZSA9PT0gdHJ1ZSwgZmFsc2UsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH0sIHB1YmxpY05hbWUgPSAnbWVyZ2UnO1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzIHJlY3Vyc2l2ZWx5IFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0UHVibGljLnJlY3Vyc2l2ZSA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCB0cnVlLCBhcmd1bWVudHMpO1xyXG5cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBDbG9uZSB0aGUgaW5wdXQgcmVtb3ZpbmcgYW55IHJlZmVyZW5jZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0UHVibGljLmNsb25lID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuXHJcblx0XHR2YXIgb3V0cHV0ID0gaW5wdXQsXHJcblx0XHRcdHR5cGUgPSB0eXBlT2YoaW5wdXQpLFxyXG5cdFx0XHRpbmRleCwgc2l6ZTtcclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0gW107XHJcblx0XHRcdHNpemUgPSBpbnB1dC5sZW5ndGg7XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4IGluIGlucHV0KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXQ7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvYmplY3RzIHJlY3Vyc2l2ZWx5XHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHBhcmFtIG1peGVkIGV4dGVuZFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2VfcmVjdXJzaXZlKGJhc2UsIGV4dGVuZCkge1xyXG5cclxuXHRcdGlmICh0eXBlT2YoYmFzZSkgIT09ICdvYmplY3QnKVxyXG5cclxuXHRcdFx0cmV0dXJuIGV4dGVuZDtcclxuXHJcblx0XHRmb3IgKHZhciBrZXkgaW4gZXh0ZW5kKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZU9mKGJhc2Vba2V5XSkgPT09ICdvYmplY3QnICYmIHR5cGVPZihleHRlbmRba2V5XSkgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYmFzZTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzXHJcblx0ICogQHBhcmFtIGJvb2wgY2xvbmVcclxuXHQgKiBAcGFyYW0gYm9vbCByZWN1cnNpdmVcclxuXHQgKiBAcGFyYW0gYXJyYXkgYXJndlxyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlKGNsb25lLCByZWN1cnNpdmUsIGFyZ3YpIHtcclxuXHJcblx0XHR2YXIgcmVzdWx0ID0gYXJndlswXSxcclxuXHRcdFx0c2l6ZSA9IGFyZ3YubGVuZ3RoO1xyXG5cclxuXHRcdGlmIChjbG9uZSB8fCB0eXBlT2YocmVzdWx0KSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXN1bHQgPSB7fTtcclxuXHJcblx0XHRmb3IgKHZhciBpbmRleD0wO2luZGV4PHNpemU7KytpbmRleCkge1xyXG5cclxuXHRcdFx0dmFyIGl0ZW0gPSBhcmd2W2luZGV4XSxcclxuXHJcblx0XHRcdFx0dHlwZSA9IHR5cGVPZihpdGVtKTtcclxuXHJcblx0XHRcdGlmICh0eXBlICE9PSAnb2JqZWN0JykgY29udGludWU7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gaXRlbSkge1xyXG5cclxuXHRcdFx0XHR2YXIgc2l0ZW0gPSBjbG9uZSA/IFB1YmxpYy5jbG9uZShpdGVtW2tleV0pIDogaXRlbVtrZXldO1xyXG5cclxuXHRcdFx0XHRpZiAocmVjdXJzaXZlKSB7XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBtZXJnZV9yZWN1cnNpdmUocmVzdWx0W2tleV0sIHNpdGVtKTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IHNpdGVtO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHR5cGUgb2YgdmFyaWFibGVcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcmV0dXJuIHN0cmluZ1xyXG5cdCAqXHJcblx0ICogQHNlZSBodHRwOi8vanNwZXJmLmNvbS90eXBlb2Z2YXJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHlwZU9mKGlucHV0KSB7XHJcblxyXG5cdFx0cmV0dXJuICh7fSkudG9TdHJpbmcuY2FsbChpbnB1dCkuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKGlzTm9kZSkge1xyXG5cclxuXHRcdG1vZHVsZS5leHBvcnRzID0gUHVibGljO1xyXG5cclxuXHR9IGVsc2Uge1xyXG5cclxuXHRcdHdpbmRvd1twdWJsaWNOYW1lXSA9IFB1YmxpYztcclxuXHJcblx0fVxyXG5cclxufSkodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ci5yZXBsYWNlKGFuc2lSZWdleCwgJycpIDogc3RyO1xufTtcbiIsInZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XG52YXIgd29yZHdyYXAgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCwgcGFyYW1zKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gcGFyYW1zLnN0YXJ0O1xuICAgICAgICBzdG9wID0gcGFyYW1zLnN0b3A7XG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2Ygc3RvcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RvcDtcbiAgICAgICAgc3RhcnQgPSBzdGFydCB8fCBwYXJhbXMuc3RhcnQ7XG4gICAgICAgIHN0b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIFxuICAgIGlmICghc3RvcCkge1xuICAgICAgICBzdG9wID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xuICAgIHZhciBtb2RlID0gcGFyYW1zLm1vZGUgfHwgJ3NvZnQnO1xuICAgIHZhciByZSA9IG1vZGUgPT09ICdoYXJkJyA/IC9cXGIvIDogLyhcXFMrXFxzKykvO1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgY2h1bmtzID0gdGV4dC50b1N0cmluZygpXG4gICAgICAgICAgICAuc3BsaXQocmUpXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHgpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2hhcmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaXBBbnNpKHgpLmxlbmd0aDsgaSArPSBzdG9wIC0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHguc2xpY2UoaSwgaSArIHN0b3AgLSBzdGFydCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgYWNjLnB1c2goeClcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjaHVua3MucmVkdWNlKGZ1bmN0aW9uIChsaW5lcywgcmF3Q2h1bmspIHtcbiAgICAgICAgICAgIGlmIChyYXdDaHVuayA9PT0gJycpIHJldHVybiBsaW5lcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNodW5rID0gcmF3Q2h1bmsucmVwbGFjZSgvXFx0L2csICcgICAgJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpID0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGlmIChzdHJpcEFuc2kobGluZXNbaV0pLmxlbmd0aCArIHN0cmlwQW5zaShjaHVuaykubGVuZ3RoID4gc3RvcCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZXNbaV0ucmVwbGFjZSgvXFxzKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2h1bmsuc3BsaXQoL1xcbi8pLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheShzdGFydCArIDEpLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBjLnJlcGxhY2UoL15cXHMrLywgJycpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaHVuay5tYXRjaCgvXFxuLykpIHtcbiAgICAgICAgICAgICAgICB2YXIgeHMgPSBjaHVuay5zcGxpdCgvXFxuLyk7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0geHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB4cy5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICsgYy5yZXBsYWNlKC9eXFxzKy8sICcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0gY2h1bms7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgICAgfSwgWyBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJykgXSkuam9pbignXFxuJyk7XG4gICAgfTtcbn07XG5cbndvcmR3cmFwLnNvZnQgPSB3b3Jkd3JhcDtcblxud29yZHdyYXAuaGFyZCA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCkge1xuICAgIHJldHVybiB3b3Jkd3JhcChzdGFydCwgc3RvcCwgeyBtb2RlIDogJ2hhcmQnIH0pO1xufTtcbiJdfQ==
