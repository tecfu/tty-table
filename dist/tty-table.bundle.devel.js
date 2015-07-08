require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"strip-ansi":9}],"tty-table":[function(require,module,exports){
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


	_private.buildRow = function(input,options){
		options = options || {};
		var minRowHeight = 0;
		
		//support both rows passed as an array 
		//and rows passed as an object
		var row;
		if(typeof input === 'object' && !(input instanceof Array)){
			row =	_private.table.columns.map(function(object){
				return input[object.value] || "#ERR";		
			});
		}
		else{
			row = input;
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

},{"_process":1,"chalk":2,"merge":8,"strip-ansi":9,"wordwrap":11}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvYW5zaS1zdHlsZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvaGFzLWFuc2kvbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmdlL21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd29yZHdyYXAvaW5kZXguanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xudmFyIGFuc2lTdHlsZXMgPSByZXF1aXJlKCdhbnNpLXN0eWxlcycpO1xudmFyIHN0cmlwQW5zaSA9IHJlcXVpcmUoJ3N0cmlwLWFuc2knKTtcbnZhciBoYXNBbnNpID0gcmVxdWlyZSgnaGFzLWFuc2knKTtcbnZhciBzdXBwb3J0c0NvbG9yID0gcmVxdWlyZSgnc3VwcG9ydHMtY29sb3InKTtcbnZhciBkZWZpbmVQcm9wcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xudmFyIGlzU2ltcGxlV2luZG93c1Rlcm0gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmICEvXnh0ZXJtL2kudGVzdChwcm9jZXNzLmVudi5URVJNKTtcblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuXHQvLyBkZXRlY3QgbW9kZSBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdHRoaXMuZW5hYmxlZCA9ICFvcHRpb25zIHx8IG9wdGlvbnMuZW5hYmxlZCA9PT0gdW5kZWZpbmVkID8gc3VwcG9ydHNDb2xvciA6IG9wdGlvbnMuZW5hYmxlZDtcbn1cblxuLy8gdXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcblx0YW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxYls5NG0nO1xufVxuXG52YXIgc3R5bGVzID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHJldCA9IHt9O1xuXG5cdE9iamVjdC5rZXlzKGFuc2lTdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFuc2lTdHlsZXNba2V5XS5jbG9zZVJlID0gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlc1trZXldLmNsb3NlKSwgJ2cnKTtcblxuXHRcdHJldFtrZXldID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIHRoaXMuX3N0eWxlcy5jb25jYXQoa2V5KSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn0pKCk7XG5cbnZhciBwcm90byA9IGRlZmluZVByb3BzKGZ1bmN0aW9uIGNoYWxrKCkge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMpIHtcblx0dmFyIGJ1aWxkZXIgPSBmdW5jdGlvbiBidWlsZGVyKCkge1xuXHRcdHJldHVybiBhcHBseVN0eWxlLmFwcGx5KGJ1aWxkZXIsIGFyZ3VtZW50cyk7XG5cdH07XG5cblx0YnVpbGRlci5fc3R5bGVzID0gX3N0eWxlcztcblx0YnVpbGRlci5lbmFibGVkID0gdGhpcy5lbmFibGVkO1xuXHQvLyBfX3Byb3RvX18gaXMgdXNlZCBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGUuXG5cdC8qZXNsaW50IG5vLXByb3RvOiAwICovXG5cdGJ1aWxkZXIuX19wcm90b19fID0gcHJvdG87XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGUoKSB7XG5cdC8vIHN1cHBvcnQgdmFyYWdzLCBidXQgc2ltcGx5IGNhc3QgdG8gc3RyaW5nIGluIGNhc2UgdGhlcmUncyBvbmx5IG9uZSBhcmdcblx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdHZhciBhcmdzTGVuID0gYXJncy5sZW5ndGg7XG5cdHZhciBzdHIgPSBhcmdzTGVuICE9PSAwICYmIFN0cmluZyhhcmd1bWVudHNbMF0pO1xuXG5cdGlmIChhcmdzTGVuID4gMSkge1xuXHRcdC8vIGRvbid0IHNsaWNlIGBhcmd1bWVudHNgLCBpdCBwcmV2ZW50cyB2OCBvcHRpbWl6YXRpb25zXG5cdFx0Zm9yICh2YXIgYSA9IDE7IGEgPCBhcmdzTGVuOyBhKyspIHtcblx0XHRcdHN0ciArPSAnICcgKyBhcmdzW2FdO1xuXHRcdH1cblx0fVxuXG5cdGlmICghdGhpcy5lbmFibGVkIHx8ICFzdHIpIHtcblx0XHRyZXR1cm4gc3RyO1xuXHR9XG5cblx0dmFyIG5lc3RlZFN0eWxlcyA9IHRoaXMuX3N0eWxlcztcblx0dmFyIGkgPSBuZXN0ZWRTdHlsZXMubGVuZ3RoO1xuXG5cdC8vIFR1cm5zIG91dCB0aGF0IG9uIFdpbmRvd3MgZGltbWVkIGdyYXkgdGV4dCBiZWNvbWVzIGludmlzaWJsZSBpbiBjbWQuZXhlLFxuXHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL2lzc3Vlcy81OFxuXHQvLyBJZiB3ZSdyZSBvbiBXaW5kb3dzIGFuZCB3ZSdyZSBkZWFsaW5nIHdpdGggYSBncmF5IGNvbG9yLCB0ZW1wb3JhcmlseSBtYWtlICdkaW0nIGEgbm9vcC5cblx0dmFyIG9yaWdpbmFsRGltID0gYW5zaVN0eWxlcy5kaW0ub3Blbjtcblx0aWYgKGlzU2ltcGxlV2luZG93c1Rlcm0gJiYgKG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmF5JykgIT09IC0xIHx8IG5lc3RlZFN0eWxlcy5pbmRleE9mKCdncmV5JykgIT09IC0xKSkge1xuXHRcdGFuc2lTdHlsZXMuZGltLm9wZW4gPSAnJztcblx0fVxuXG5cdHdoaWxlIChpLS0pIHtcblx0XHR2YXIgY29kZSA9IGFuc2lTdHlsZXNbbmVzdGVkU3R5bGVzW2ldXTtcblxuXHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdHN0ciA9IGNvZGUub3BlbiArIHN0ci5yZXBsYWNlKGNvZGUuY2xvc2VSZSwgY29kZS5vcGVuKSArIGNvZGUuY2xvc2U7XG5cdH1cblxuXHQvLyBSZXNldCB0aGUgb3JpZ2luYWwgJ2RpbScgaWYgd2UgY2hhbmdlZCBpdCB0byB3b3JrIGFyb3VuZCB0aGUgV2luZG93cyBkaW1tZWQgZ3JheSBpc3N1ZS5cblx0YW5zaVN0eWxlcy5kaW0ub3BlbiA9IG9yaWdpbmFsRGltO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRyZXRbbmFtZV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgW25hbWVdKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufVxuXG5kZWZpbmVQcm9wcyhDaGFsay5wcm90b3R5cGUsIGluaXQoKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IENoYWxrKCk7XG5tb2R1bGUuZXhwb3J0cy5zdHlsZXMgPSBhbnNpU3R5bGVzO1xubW9kdWxlLmV4cG9ydHMuaGFzQ29sb3IgPSBoYXNBbnNpO1xubW9kdWxlLmV4cG9ydHMuc3RyaXBDb2xvciA9IHN0cmlwQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN1cHBvcnRzQ29sb3IgPSBzdXBwb3J0c0NvbG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcyAoKSB7XG5cdHZhciBzdHlsZXMgPSB7XG5cdFx0bW9kaWZpZXJzOiB7XG5cdFx0XHRyZXNldDogWzAsIDBdLFxuXHRcdFx0Ym9sZDogWzEsIDIyXSwgLy8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdFx0ZGltOiBbMiwgMjJdLFxuXHRcdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XHR9LFxuXHRcdGNvbG9yczoge1xuXHRcdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdFx0cmVkOiBbMzEsIDM5XSxcblx0XHRcdGdyZWVuOiBbMzIsIDM5XSxcblx0XHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0XHRibHVlOiBbMzQsIDM5XSxcblx0XHRcdG1hZ2VudGE6IFszNSwgMzldLFxuXHRcdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0XHR3aGl0ZTogWzM3LCAzOV0sXG5cdFx0XHRncmF5OiBbOTAsIDM5XVxuXHRcdH0sXG5cdFx0YmdDb2xvcnM6IHtcblx0XHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdFx0YmdSZWQ6IFs0MSwgNDldLFxuXHRcdFx0YmdHcmVlbjogWzQyLCA0OV0sXG5cdFx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0XHRiZ0JsdWU6IFs0NCwgNDldLFxuXHRcdFx0YmdNYWdlbnRhOiBbNDUsIDQ5XSxcblx0XHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0XHRiZ1doaXRlOiBbNDcsIDQ5XVxuXHRcdH1cblx0fTtcblxuXHQvLyBmaXggaHVtYW5zXG5cdHN0eWxlcy5jb2xvcnMuZ3JleSA9IHN0eWxlcy5jb2xvcnMuZ3JheTtcblxuXHRPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSkge1xuXHRcdHZhciBncm91cCA9IHN0eWxlc1tncm91cE5hbWVdO1xuXG5cdFx0T2JqZWN0LmtleXMoZ3JvdXApLmZvckVhY2goZnVuY3Rpb24gKHN0eWxlTmFtZSkge1xuXHRcdFx0dmFyIHN0eWxlID0gZ3JvdXBbc3R5bGVOYW1lXTtcblxuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSBncm91cFtzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiAnXFx1MDAxYlsnICsgc3R5bGVbMF0gKyAnbScsXG5cdFx0XHRcdGNsb3NlOiAnXFx1MDAxYlsnICsgc3R5bGVbMV0gKyAnbSdcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsICdleHBvcnRzJywge1xuXHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRnZXQ6IGFzc2VtYmxlU3R5bGVzXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1hdGNoT3BlcmF0b3JzUmUgPSAvW3xcXFxce30oKVtcXF1eJCsqPy5dL2c7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuXHR9XG5cblx0cmV0dXJuIHN0ci5yZXBsYWNlKG1hdGNoT3BlcmF0b3JzUmUsICAnXFxcXCQmJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFuc2lSZWdleCA9IHJlcXVpcmUoJ2Fuc2ktcmVnZXgnKTtcbnZhciByZSA9IG5ldyBSZWdFeHAoYW5zaVJlZ2V4KCkuc291cmNlKTsgLy8gcmVtb3ZlIHRoZSBgZ2AgZmxhZ1xubW9kdWxlLmV4cG9ydHMgPSByZS50ZXN0LmJpbmQocmUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiAvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1PUlpjZi1ucXJ5PT48XS9nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcmd2ID0gcHJvY2Vzcy5hcmd2O1xuXG52YXIgdGVybWluYXRvciA9IGFyZ3YuaW5kZXhPZignLS0nKTtcbnZhciBoYXNGbGFnID0gZnVuY3Rpb24gKGZsYWcpIHtcblx0ZmxhZyA9ICctLScgKyBmbGFnO1xuXHR2YXIgcG9zID0gYXJndi5pbmRleE9mKGZsYWcpO1xuXHRyZXR1cm4gcG9zICE9PSAtMSAmJiAodGVybWluYXRvciAhPT0gLTEgPyBwb3MgPCB0ZXJtaW5hdG9yIDogdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnbm8tY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ25vLWNvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9ZmFsc2UnKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCdjb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj10cnVlJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1hbHdheXMnKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3Muc3Rkb3V0ICYmICFwcm9jZXNzLnN0ZG91dC5pc1RUWSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLmVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn0pKCk7XG4iLCIvKiFcclxuICogQG5hbWUgSmF2YVNjcmlwdC9Ob2RlSlMgTWVyZ2UgdjEuMi4wXHJcbiAqIEBhdXRob3IgeWVpa29zXHJcbiAqIEByZXBvc2l0b3J5IGh0dHBzOi8vZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2VcclxuXHJcbiAqIENvcHlyaWdodCAyMDE0IHllaWtvcyAtIE1JVCBsaWNlbnNlXHJcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlL21hc3Rlci9MSUNFTlNFXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbihpc05vZGUpIHtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2Ugb25lIG9yIG1vcmUgb2JqZWN0cyBcclxuXHQgKiBAcGFyYW0gYm9vbD8gY2xvbmVcclxuXHQgKiBAcGFyYW0gbWl4ZWQsLi4uIGFyZ3VtZW50c1xyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdHZhciBQdWJsaWMgPSBmdW5jdGlvbihjbG9uZSkge1xyXG5cclxuXHRcdHJldHVybiBtZXJnZShjbG9uZSA9PT0gdHJ1ZSwgZmFsc2UsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH0sIHB1YmxpY05hbWUgPSAnbWVyZ2UnO1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzIHJlY3Vyc2l2ZWx5IFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0UHVibGljLnJlY3Vyc2l2ZSA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCB0cnVlLCBhcmd1bWVudHMpO1xyXG5cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBDbG9uZSB0aGUgaW5wdXQgcmVtb3ZpbmcgYW55IHJlZmVyZW5jZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0UHVibGljLmNsb25lID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuXHJcblx0XHR2YXIgb3V0cHV0ID0gaW5wdXQsXHJcblx0XHRcdHR5cGUgPSB0eXBlT2YoaW5wdXQpLFxyXG5cdFx0XHRpbmRleCwgc2l6ZTtcclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0gW107XHJcblx0XHRcdHNpemUgPSBpbnB1dC5sZW5ndGg7XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4IGluIGlucHV0KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gUHVibGljLmNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRwdXQ7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvYmplY3RzIHJlY3Vyc2l2ZWx5XHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHBhcmFtIG1peGVkIGV4dGVuZFxyXG5cdCAqIEByZXR1cm4gbWl4ZWRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2VfcmVjdXJzaXZlKGJhc2UsIGV4dGVuZCkge1xyXG5cclxuXHRcdGlmICh0eXBlT2YoYmFzZSkgIT09ICdvYmplY3QnKVxyXG5cclxuXHRcdFx0cmV0dXJuIGV4dGVuZDtcclxuXHJcblx0XHRmb3IgKHZhciBrZXkgaW4gZXh0ZW5kKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZU9mKGJhc2Vba2V5XSkgPT09ICdvYmplY3QnICYmIHR5cGVPZihleHRlbmRba2V5XSkgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYmFzZTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb3IgbW9yZSBvYmplY3RzXHJcblx0ICogQHBhcmFtIGJvb2wgY2xvbmVcclxuXHQgKiBAcGFyYW0gYm9vbCByZWN1cnNpdmVcclxuXHQgKiBAcGFyYW0gYXJyYXkgYXJndlxyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlKGNsb25lLCByZWN1cnNpdmUsIGFyZ3YpIHtcclxuXHJcblx0XHR2YXIgcmVzdWx0ID0gYXJndlswXSxcclxuXHRcdFx0c2l6ZSA9IGFyZ3YubGVuZ3RoO1xyXG5cclxuXHRcdGlmIChjbG9uZSB8fCB0eXBlT2YocmVzdWx0KSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXN1bHQgPSB7fTtcclxuXHJcblx0XHRmb3IgKHZhciBpbmRleD0wO2luZGV4PHNpemU7KytpbmRleCkge1xyXG5cclxuXHRcdFx0dmFyIGl0ZW0gPSBhcmd2W2luZGV4XSxcclxuXHJcblx0XHRcdFx0dHlwZSA9IHR5cGVPZihpdGVtKTtcclxuXHJcblx0XHRcdGlmICh0eXBlICE9PSAnb2JqZWN0JykgY29udGludWU7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gaXRlbSkge1xyXG5cclxuXHRcdFx0XHR2YXIgc2l0ZW0gPSBjbG9uZSA/IFB1YmxpYy5jbG9uZShpdGVtW2tleV0pIDogaXRlbVtrZXldO1xyXG5cclxuXHRcdFx0XHRpZiAocmVjdXJzaXZlKSB7XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBtZXJnZV9yZWN1cnNpdmUocmVzdWx0W2tleV0sIHNpdGVtKTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IHNpdGVtO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHR5cGUgb2YgdmFyaWFibGVcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcmV0dXJuIHN0cmluZ1xyXG5cdCAqXHJcblx0ICogQHNlZSBodHRwOi8vanNwZXJmLmNvbS90eXBlb2Z2YXJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHlwZU9mKGlucHV0KSB7XHJcblxyXG5cdFx0cmV0dXJuICh7fSkudG9TdHJpbmcuY2FsbChpbnB1dCkuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKGlzTm9kZSkge1xyXG5cclxuXHRcdG1vZHVsZS5leHBvcnRzID0gUHVibGljO1xyXG5cclxuXHR9IGVsc2Uge1xyXG5cclxuXHRcdHdpbmRvd1twdWJsaWNOYW1lXSA9IFB1YmxpYztcclxuXHJcblx0fVxyXG5cclxufSkodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ci5yZXBsYWNlKGFuc2lSZWdleCwgJycpIDogc3RyO1xufTtcbiIsInZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XG52YXIgd29yZHdyYXAgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCwgcGFyYW1zKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gcGFyYW1zLnN0YXJ0O1xuICAgICAgICBzdG9wID0gcGFyYW1zLnN0b3A7XG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2Ygc3RvcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcGFyYW1zID0gc3RvcDtcbiAgICAgICAgc3RhcnQgPSBzdGFydCB8fCBwYXJhbXMuc3RhcnQ7XG4gICAgICAgIHN0b3AgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIFxuICAgIGlmICghc3RvcCkge1xuICAgICAgICBzdG9wID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFwYXJhbXMpIHBhcmFtcyA9IHt9O1xuICAgIHZhciBtb2RlID0gcGFyYW1zLm1vZGUgfHwgJ3NvZnQnO1xuICAgIHZhciByZSA9IG1vZGUgPT09ICdoYXJkJyA/IC9cXGIvIDogLyhcXFMrXFxzKykvO1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgY2h1bmtzID0gdGV4dC50b1N0cmluZygpXG4gICAgICAgICAgICAuc3BsaXQocmUpXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHgpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2hhcmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaXBBbnNpKHgpLmxlbmd0aDsgaSArPSBzdG9wIC0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHguc2xpY2UoaSwgaSArIHN0b3AgLSBzdGFydCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgYWNjLnB1c2goeClcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjaHVua3MucmVkdWNlKGZ1bmN0aW9uIChsaW5lcywgcmF3Q2h1bmspIHtcbiAgICAgICAgICAgIGlmIChyYXdDaHVuayA9PT0gJycpIHJldHVybiBsaW5lcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNodW5rID0gcmF3Q2h1bmsucmVwbGFjZSgvXFx0L2csICcgICAgJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpID0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGlmIChzdHJpcEFuc2kobGluZXNbaV0pLmxlbmd0aCArIHN0cmlwQW5zaShjaHVuaykubGVuZ3RoID4gc3RvcCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZXNbaV0ucmVwbGFjZSgvXFxzKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2h1bmsuc3BsaXQoL1xcbi8pLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheShzdGFydCArIDEpLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBjLnJlcGxhY2UoL15cXHMrLywgJycpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaHVuay5tYXRjaCgvXFxuLykpIHtcbiAgICAgICAgICAgICAgICB2YXIgeHMgPSBjaHVuay5zcGxpdCgvXFxuLyk7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0geHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB4cy5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICsgYy5yZXBsYWNlKC9eXFxzKy8sICcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gKz0gY2h1bms7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgICAgfSwgWyBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJykgXSkuam9pbignXFxuJyk7XG4gICAgfTtcbn07XG5cbndvcmR3cmFwLnNvZnQgPSB3b3Jkd3JhcDtcblxud29yZHdyYXAuaGFyZCA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCkge1xuICAgIHJldHVybiB3b3Jkd3JhcChzdGFydCwgc3RvcCwgeyBtb2RlIDogJ2hhcmQnIH0pO1xufTtcbiIsInZhciBtZXJnZSA9IHJlcXVpcmUoXCJtZXJnZVwiKSxcblx0XHRjaGFsayA9IHJlcXVpcmUoXCJjaGFsa1wiKSxcblx0XHRzdHJpcEFuc2kgPSByZXF1aXJlKFwic3RyaXAtYW5zaVwiKSxcblx0XHR3b3Jkd3JhcCA9IHJlcXVpcmUoXCJ3b3Jkd3JhcFwiKTtcblxuXG52YXIgY2xzID0gZnVuY3Rpb24oKXtcblxuXG5cdHZhciBfcHVibGljID0gdGhpcy5fcHVibGljID0ge30sXG5cdFx0XHRfcHJpdmF0ZSA9IHRoaXMuX3ByaXZhdGUgPSB7fTtcblxuXG5cdC8qKiBcblx0ICogUHJpdmF0ZSBWYXJpYWJsZXNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5kZWZhdWx0cyA9IHtcblx0XHRtYXJnaW5Ub3AgOiAxLFxuXHRcdG1hcmdpbkxlZnQgOiAyLFxuXHRcdG1heFdpZHRoIDogMjAsXG5cdFx0Zm9ybWF0dGVyIDogbnVsbCxcblx0XHRoZWFkZXJBbGlnbiA6IFwiY2VudGVyXCIsXG5cdFx0YWxpZ24gOiBcImNlbnRlclwiLFxuXHRcdHBhZGRpbmdSaWdodCA6IDAsXG5cdFx0cGFkZGluZ0xlZnQgOiAwLFxuXHRcdHBhZGRpbmdCb3R0b20gOiAwLFxuXHRcdHBhZGRpbmdUb3AgOiAwLFxuXHRcdGNvbG9yIDogZmFsc2UsXG5cdFx0aGVhZGVyQ29sb3IgOiBmYWxzZSxcblx0XHRib3JkZXJTdHlsZSA6IDEsXG5cdFx0Ym9yZGVyQ2hhcmFjdGVycyA6IFtcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSMXCIsIGo6IFwi4pSsXCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSQXCJ9LFxuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJxcIiwgajogXCLilLxcIiwgaDogXCLilIBcIiwgcjogXCLilKRcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUlFwiLCBqOiBcIuKUtFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUmFwifVxuXHRcdFx0XSxcblx0XHRcdFtcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifVxuXHRcdFx0XVxuXHRcdF1cblx0fTtcblxuXG5cdC8vQ29uc3RhbnRzXG5cdF9wcml2YXRlLkdVVFRFUiA9IDE7XG5cblxuXHRfcHJpdmF0ZS50YWJsZSA9IHtcblx0XHRjb2x1bW5zIDogW10sXG5cdFx0Y29sdW1uV2lkdGhzIDogW10sXG5cdFx0Y29sdW1uSW5uZXJXaWR0aHMgOiBbXSxcblx0XHRoZWFkZXIgOiBbXSxcblx0XHRib2R5IDogW11cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBQcml2YXRlIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5idWlsZFJvdyA9IGZ1bmN0aW9uKGlucHV0LG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBtaW5Sb3dIZWlnaHQgPSAwO1xuXHRcdFxuXHRcdC8vc3VwcG9ydCBib3RoIHJvd3MgcGFzc2VkIGFzIGFuIGFycmF5IFxuXHRcdC8vYW5kIHJvd3MgcGFzc2VkIGFzIGFuIG9iamVjdFxuXHRcdHZhciByb3c7XG5cdFx0aWYodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiAhKGlucHV0IGluc3RhbmNlb2YgQXJyYXkpKXtcblx0XHRcdHJvdyA9XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5zLm1hcChmdW5jdGlvbihvYmplY3Qpe1xuXHRcdFx0XHRyZXR1cm4gaW5wdXRbb2JqZWN0LnZhbHVlXSB8fCBcIiNFUlJcIjtcdFx0XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHJvdyA9IGlucHV0O1xuXHRcdH1cblxuXHRcdC8vZ2V0IHJvdyBhcyBhcnJheSBvZiBjZWxsIGFycmF5c1xuXHRcdHZhciBjQXJycyA9IHJvdy5tYXAoZnVuY3Rpb24oY2VsbCxpbmRleCl7XG5cdFx0XHR2YXIgYyA9IF9wcml2YXRlLmJ1aWxkQ2VsbChjZWxsLGluZGV4LG9wdGlvbnMpO1xuXHRcdFx0dmFyIGNlbGxBcnIgPSBjLmNlbGxBcnI7XG5cdFx0XHRpZihvcHRpb25zLmhlYWRlcil7XG5cdFx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbklubmVyV2lkdGhzLnB1c2goYy53aWR0aCk7XG5cdFx0XHR9XG5cdFx0XHRtaW5Sb3dIZWlnaHQgPSAobWluUm93SGVpZ2h0IDwgY2VsbEFyci5sZW5ndGgpID8gY2VsbEFyci5sZW5ndGggOiBtaW5Sb3dIZWlnaHQ7XG5cdFx0XHRyZXR1cm4gY2VsbEFycjtcblx0XHR9KTtcblxuXHRcdC8vQWRqdXN0IG1pblJvd0hlaWdodCB0byByZWZsZWN0IHZlcnRpY2FsIHJvdyBwYWRkaW5nXG5cdFx0bWluUm93SGVpZ2h0ID0gKG9wdGlvbnMuaGVhZGVyKSA/IG1pblJvd0hlaWdodCA6IG1pblJvd0hlaWdodCArIFxuXHRcdFx0KF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nQm90dG9tICsgX3B1YmxpYy5vcHRpb25zLnBhZGRpbmdUb3ApO1xuXG5cdFx0Ly9jb252ZXJ0IGFycmF5IG9mIGNlbGwgYXJyYXlzIHRvIGFycmF5IG9mIGxpbmVzXG5cdFx0dmFyIGxpbmVzID0gQXJyYXkuYXBwbHkobnVsbCx7bGVuZ3RoOm1pblJvd0hlaWdodH0pXG5cdFx0XHQubWFwKEZ1bmN0aW9uLmNhbGwsZnVuY3Rpb24oKXtyZXR1cm4gW119KTtcblxuXHRcdGNBcnJzLmZvckVhY2goZnVuY3Rpb24oY2VsbEFycixhKXtcblx0XHRcdHZhciB3aGl0ZWxpbmUgPSBBcnJheShfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHNbYV0pLmpvaW4oJ1xcICcpO1xuXHRcdFx0aWYoIW9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdFx0Ly9BZGQgd2hpdGVzcGFjZSBmb3IgdG9wIHBhZGRpbmdcblx0XHRcdFx0Zm9yKGk9MDsgaTxfcHVibGljLm9wdGlvbnMucGFkZGluZ1RvcDsgaSsrKXtcblx0XHRcdFx0XHRjZWxsQXJyLnVuc2hpZnQod2hpdGVsaW5lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly9BZGQgd2hpdGVzcGFjZSBmb3IgYm90dG9tIHBhZGRpbmdcblx0XHRcdFx0Zm9yKGk9MDsgaTxfcHVibGljLm9wdGlvbnMucGFkZGluZ0JvdHRvbTsgaSsrKXtcblx0XHRcdFx0XHRjZWxsQXJyLnB1c2god2hpdGVsaW5lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVx0XG5cdFx0XHRmb3IodmFyIGI9MDsgYjxtaW5Sb3dIZWlnaHQ7IGIrKyl7XHRcblx0XHRcdFx0bGluZXNbYl0ucHVzaCgodHlwZW9mIGNlbGxBcnJbYl0gIT0gJ3VuZGVmaW5lZCcpID8gY2VsbEFycltiXSA6IHdoaXRlbGluZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbGluZXM7XG5cdH07XG5cblx0X3ByaXZhdGUuYnVpbGRDZWxsID0gZnVuY3Rpb24oY2VsbCxjb2x1bW5JbmRleCxvcHRpb25zKXtcblxuXHRcdC8vUHVsbCBjb2x1bW4gb3B0aW9uc1x0XG5cdFx0dmFyIG91dHB1dDtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcblx0XHRpZihvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdGNlbGwgPSBtZXJnZSh0cnVlLF9wdWJsaWMub3B0aW9ucyxjZWxsKTtcblx0XHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbnMucHVzaChjZWxsKTtcblx0XHRcdG91dHB1dCA9IGNlbGwuYWxpYXMgfHwgY2VsbC52YWx1ZTtcblx0XHRcdGNvbHVtbk9wdGlvbnMgPSBjZWxsO1xuXHRcdH1cdFxuXHRcdGVsc2V7XG5cdFx0XHRjb2x1bW5PcHRpb25zID0gX3ByaXZhdGUudGFibGUuY29sdW1uc1tjb2x1bW5JbmRleF07XG5cdFx0XHRpZih0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcpe1x0XG5cdFx0XHRcdGNvbHVtbk9wdGlvbnMgPSBtZXJnZSh0cnVlLGNvbHVtbk9wdGlvbnMsY2VsbCk7XHRcdFxuXHRcdFx0XHRjZWxsID0gdmFsdWU7XHRcdFx0XG5cdFx0XHR9XHRcblx0XHRcblx0XHRcdGlmKHR5cGVvZiBjb2x1bW5PcHRpb25zLmZvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRcdG91dHB1dCA9IGNvbHVtbk9wdGlvbnMuZm9ybWF0dGVyKGNlbGwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0b3V0cHV0ID0gY2VsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly9BdXRvbWF0aWMgdGV4dCB3cmFwXG5cdFx0dmFyIHdyYXBPYmogID0gX3ByaXZhdGUud3JhcENlbGxDb250ZW50KG91dHB1dCxjb2x1bW5JbmRleCxjb2x1bW5PcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQob3B0aW9ucyAmJiBvcHRpb25zLmhlYWRlcikgPyBcImhlYWRlclwiIDogXCJib2R5XCIpO1xuXHRcdG91dHB1dCA9IHdyYXBPYmoub3V0cHV0O1xuXHRcdFxuXHRcdC8vcmV0dXJuIGFzIGFycmF5IG9mIGxpbmVzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGNlbGxBcnIgOiBvdXRwdXQuc3BsaXQoJ1xcbicpLFxuXHRcdFx0d2lkdGggOiB3cmFwT2JqLndpZHRoXG5cdFx0fTtcblx0fTtcblxuXHRfcHJpdmF0ZS5jb2xvcml6ZUFsbFdvcmRzID0gZnVuY3Rpb24oY29sb3Isc3RyKXtcblx0XHQvL0NvbG9yIGVhY2ggd29yZCBpbiB0aGUgY2VsbCBzbyB0aGF0IGxpbmUgYnJlYWtzIGRvbid0IGJyZWFrIGNvbG9yIFxuXHRcdHZhciBhcnIgPSBzdHIucmVwbGFjZSgvKFxcUyspL2dpLGZ1bmN0aW9uKG1hdGNoKXtcblx0XHRcdHJldHVybiBjaGFsa1tjb2xvcl0obWF0Y2gpKydcXCAnO1xuXHRcdH0pO1xuXHRcdHJldHVybiBhcnI7XG5cdH07XG5cblx0X3ByaXZhdGUuY29sb3JpemVMaW5lID0gZnVuY3Rpb24oY29sb3Isc3RyKXtcblx0XHRyZXR1cm4gY2hhbGtbY29sb3JdKHN0cik7XG5cdH07XG5cblx0X3ByaXZhdGUud3JhcENlbGxDb250ZW50ID0gZnVuY3Rpb24odmFsdWUsY29sdW1uSW5kZXgsY29sdW1uT3B0aW9ucyxyb3dUeXBlKXtcblx0XHR2YXIgc3RyaW5nID0gdmFsdWUudG9TdHJpbmcoKSxcblx0XHRcdFx0d2lkdGggPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHNbY29sdW1uSW5kZXhdLFxuXHRcdFx0XHRpbm5lcldpZHRoID0gd2lkdGggLSBjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0IFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQtIGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC0gX3ByaXZhdGUuR1VUVEVSOyAvL2JvcmRlci9ndXR0ZXJcblxuXHRcdC8vQnJlYWsgc3RyaW5nIGludG8gYXJyYXkgb2YgbGluZXNcblx0XHR3cmFwID0gd29yZHdyYXAoaW5uZXJXaWR0aCk7XG5cdFx0c3RyaW5nID0gd3JhcChzdHJpbmcpOyBcblxuXHRcdHZhciBzdHJBcnIgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Ly9Gb3JtYXQgZWFjaCBsaW5lXG5cdFx0c3RyQXJyID0gc3RyQXJyLm1hcChmdW5jdGlvbihsaW5lKXtcblxuXHRcdFx0Ly9BcHBseSBjb2xvcnNcblx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0Y2FzZShyb3dUeXBlID09PSAnaGVhZGVyJyk6XG5cdFx0XHRcdFx0bGluZSA9IChjb2x1bW5PcHRpb25zLmNvbG9yIHx8IF9wdWJsaWMub3B0aW9ucy5jb2xvcikgPyBcblx0XHRcdFx0XHRcdF9wcml2YXRlLmNvbG9yaXplTGluZShjb2x1bW5PcHRpb25zLmhlYWRlckNvbG9yIHx8IF9wdWJsaWMub3B0aW9ucy5jb2xvcixsaW5lKSA6IFxuXHRcdFx0XHRcdFx0bGluZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSh0eXBlb2YgY29sdW1uT3B0aW9ucy5jb2xvciA9PT0gJ3N0cmluZycpOlxuXHRcdFx0XHRcdGxpbmUgPSBfcHJpdmF0ZS5jb2xvcml6ZUxpbmUoY29sdW1uT3B0aW9ucy5jb2xvcixsaW5lKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSh0eXBlb2YgX3B1YmxpYy5vcHRpb25zLmNvbG9yID09PSAnc3RyaW5nJyk6XG5cdFx0XHRcdFx0bGluZSA9IF9wcml2YXRlLmNvbG9yaXplTGluZShfcHVibGljLm9wdGlvbnMuY29sb3IsbGluZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vTGVmdCwgUmlnaHQgUGFkZGluZ1xuXHRcdFx0bGluZSA9IEFycmF5KGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgKyAxKS5qb2luKCcgJykgK1xuXHRcdFx0XHRcdFx0bGluZSArXG5cdFx0XHRcdFx0XHRBcnJheShjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCArIDEpLmpvaW4oJyAnKTtcblx0XHRcdHZhciBsaW5lTGVuZ3RoID0gc3RyaXBBbnNpKGxpbmUpLmxlbmd0aDtcblxuXHRcdFx0Ly9hbGlnbiBcblx0XHRcdHZhciBhbGlnblRndCA9IChyb3dUeXBlID09PSAnaGVhZGVyJykgPyBcImhlYWRlckFsaWduXCIgOiBcImFsaWduXCI7XG5cdFx0XHRpZihsaW5lTGVuZ3RoIDwgd2lkdGgpe1xuXHRcdFx0XHR2YXIgc3BhY2VBdmFpbGFibGUgPSB3aWR0aCAtIGxpbmVMZW5ndGg7IFxuXHRcdFx0XHRzd2l0Y2godHJ1ZSl7XG5cdFx0XHRcdFx0Y2FzZShjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpOlxuXHRcdFx0XHRcdFx0dmFyIGV2ZW4gPSAoc3BhY2VBdmFpbGFibGUgJTIgPT09IDApO1xuXHRcdFx0XHRcdFx0c3BhY2VBdmFpbGFibGUgPSAoZXZlbikgPyBzcGFjZUF2YWlsYWJsZSA6IFxuXHRcdFx0XHRcdFx0XHRzcGFjZUF2YWlsYWJsZSAtIDE7XG5cdFx0XHRcdFx0XHRpZihzcGFjZUF2YWlsYWJsZSA+IDEpe1xuXHRcdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoc3BhY2VBdmFpbGFibGUvMikuam9pbignICcpICsgXG5cdFx0XHRcdFx0XHRcdFx0bGluZSArXG5cdFx0XHRcdFx0XHRcdFx0QXJyYXkoc3BhY2VBdmFpbGFibGUvMiArICgoZXZlbik/MToyKSkuam9pbignICcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZShjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ3JpZ2h0Jyk6XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoc3BhY2VBdmFpbGFibGUpLmpvaW4oJyAnKSArIGxpbmU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0bGluZSA9IGxpbmUgKyBBcnJheShzcGFjZUF2YWlsYWJsZSkuam9pbignICcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBsaW5lO1xuXHRcdH0pO1xuXG5cdFx0c3RyaW5nID0gc3RyQXJyLmpvaW4oJ1xcbicpO1xuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHRvdXRwdXQgOiBzdHJpbmcsXG5cdFx0XHR3aWR0aCA6IGlubmVyV2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmdldENvbHVtbldpZHRocyA9IGZ1bmN0aW9uKHJvdyl7XG5cdFx0Ly9XaWR0aHMgYXMgcHJlc2NyaWJlZFxuXHRcdHZhciB3aWR0aHMgPSByb3cubWFwKGZ1bmN0aW9uKGNlbGwpe1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBjZWxsLndpZHRoICE9PSd1bmRlZmluZWQnKXtcblx0XHRcdFx0cmV0dXJuIGNlbGwud2lkdGg7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRyZXR1cm4gX3B1YmxpYy5vcHRpb25zLm1heFdpZHRoO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly9DaGVjayB0byBtYWtlIHN1cmUgd2lkdGhzIHdpbGwgZml0IHRoZSBjdXJyZW50IGRpc3BsYXksIG9yIHJlc2l6ZS5cblx0XHR2YXIgdG90YWxXaWR0aCA9IHdpZHRocy5yZWR1Y2UoZnVuY3Rpb24ocHJldixjdXJyKXtcblx0XHRcdHJldHVybiBwcmV2K2N1cnI7XG5cdFx0fSk7XG5cdFx0Ly9BZGQgbWFyZ2luTGVmdCB0byB0b3RhbFdpZHRoXG5cdFx0dG90YWxXaWR0aCArPSBfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdDtcblxuXHRcdC8vQ2hlY2sgcHJvY2VzcyBleGlzdHMgaW4gY2FzZSB3ZSBhcmUgaW4gYnJvd3NlclxuXHRcdGlmKHByb2Nlc3MgJiYgcHJvY2Vzcy5zdGRvdXQgJiYgdG90YWxXaWR0aCA+IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMpe1xuXHRcdFx0Ly9yZWNhbGN1bGF0ZSBwcm9wb3J0aW9uYXRlbHkgdG8gZml0IHNpemVcblx0XHRcdHZhciBwcm9wID0gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyA+IHRvdGFsV2lkdGg7XG5cdFx0XHRwcm9wID0gcHJvcC50b0ZpeGVkKDIpLTAuMDE7XG5cdFx0XHR3aWR0aHMgPSB3aWR0aHMubWFwKGZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IocHJvcCp2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGhzO1xuXHR9O1xuXG5cblx0LyoqIFxuXHQgKiBQdWJsaWMgVmFyaWFibGVzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3B1YmxpYy5vcHRpb25zID0ge307XG5cblxuXHQvKipcblx0ICogUHVibGljIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5zZXR1cCA9IGZ1bmN0aW9uKGhlYWRlcixib2R5LG9wdGlvbnMpe1xuXHRcdFxuXHRcdF9wdWJsaWMub3B0aW9ucyA9IG1lcmdlKHRydWUsX3ByaXZhdGUuZGVmYXVsdHMsb3B0aW9ucyk7XG5cblx0XHQvL2JhY2tmaXhlcyBmb3Igc2hvcnRlbmVkIG9wdGlvbiBuYW1lc1xuXHRcdF9wdWJsaWMub3B0aW9ucy5hbGlnbiA9IF9wdWJsaWMub3B0aW9ucy5hbGlnbm1lbnQgfHwgX3B1YmxpYy5vcHRpb25zLmFsaWduO1xuXHRcdF9wdWJsaWMub3B0aW9ucy5oZWFkZXJBbGlnbiA9IF9wdWJsaWMub3B0aW9ucy5oZWFkZXJBbGlnbm1lbnQgfHwgX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduO1xuXHRcdFxuXHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRocyA9IF9wcml2YXRlLmdldENvbHVtbldpZHRocyhoZWFkZXIpO1xuXG5cdFx0aGVhZGVyID0gW2hlYWRlcl07XG5cdFx0X3ByaXZhdGUudGFibGUuaGVhZGVyID0gaGVhZGVyLm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyx7XG5cdFx0XHRcdGhlYWRlcjp0cnVlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdF9wcml2YXRlLnRhYmxlLmJvZHkgPSBib2R5Lm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gX3B1YmxpYztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIGEgdGFibGUgdG8gYSBzdHJpbmdcblx0ICogQHJldHVybnMge1N0cmluZ31cblx0ICogQG1lbWJlcm9mIFRhYmxlIFxuXHQgKiBAZXhhbXBsZSBcblx0ICogYGBgXG5cdCAqIHZhciBzdHIgPSB0MS5yZW5kZXIoKTsgXG5cdCAqIGNvbnNvbGUubG9nKHN0cik7IC8vb3V0cHV0cyB0YWJsZVxuXHQgKiBgYGBcblx0Ki9cblx0X3B1YmxpYy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBzdHIgPSAnJyxcblx0XHRcdFx0cGFydCA9IFsnaGVhZGVyJywnYm9keSddLFxuXHRcdFx0XHRiQXJyID0gW10sXG5cdFx0XHRcdG1hcmdpbkxlZnQgPSBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdCArIDEpLmpvaW4oJ1xcICcpLFxuXHRcdFx0XHRiUyA9IF9wdWJsaWMub3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzW19wdWJsaWMub3B0aW9ucy5ib3JkZXJTdHlsZV0sXG5cdFx0XHRcdGJvcmRlcnMgPSBbXTtcblxuXHRcdC8vQm9yZGVyc1xuXHRcdGZvcihhPTA7YTwzO2ErKyl7XG5cdFx0XHRib3JkZXJzLnB1c2goJycpO1xuXHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmZvckVhY2goZnVuY3Rpb24odyxpLGFycil7XG5cdFx0XHRcdGJvcmRlcnNbYV0gKz0gQXJyYXkodykuam9pbihiU1thXS5oKSBcblx0XHRcdFx0XHQrICgoaSsxICE9PSBhcnIubGVuZ3RoKSA/IGJTW2FdLmogOiBiU1thXS5yKTtcblx0XHRcdH0pO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJTW2FdLmwgKyBib3JkZXJzW2FdO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJvcmRlcnNbYV0uc3BsaXQoJycpO1xuXHRcdFx0Ym9yZGVyc1thXVtib3JkZXJzW2FdLmxlbmd0aDFdID0gYlNbYV0ucjtcblx0XHRcdGJvcmRlcnNbYV0gPSBib3JkZXJzW2FdLmpvaW4oJycpO1xuXHRcdFx0Ym9yZGVyc1thXSA9IG1hcmdpbkxlZnQgKyBib3JkZXJzW2FdICsgJ1xcbic7XG5cdFx0fVxuXHRcdFxuXHRcdHN0ciArPSBib3JkZXJzWzBdO1xuXG5cdFx0Ly9Sb3dzXG5cdFx0cGFydC5mb3JFYWNoKGZ1bmN0aW9uKHAsaSl7XG5cdFx0XHR3aGlsZShfcHJpdmF0ZS50YWJsZVtwXS5sZW5ndGgpe1xuXHRcdFx0XHRyb3cgPSBfcHJpdmF0ZS50YWJsZVtwXS5zaGlmdCgpO1xuXHRcdFx0XG5cdFx0XHRcdHJvdy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xuXHRcdFx0XHRcdHN0ciA9IHN0ciBcblx0XHRcdFx0XHRcdCsgbWFyZ2luTGVmdCBcblx0XHRcdFx0XHRcdCsgYlNbMV0udlxuXHRcdFx0XHRcdFx0K1x0bGluZS5qb2luKGJTWzFdLnYpIFxuXHRcdFx0XHRcdFx0KyBiU1sxXS52XG5cdFx0XHRcdFx0XHQrICdcXG4nO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vSm9pbmluZyBib3JkZXJcblx0XHRcdFx0aWYoIShpPT0xICYmIF9wcml2YXRlLnRhYmxlW3BdLmxlbmd0aD09PTApKXtcblx0XHRcdFx0XHRzdHIgKz0gYm9yZGVyc1sxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVx0XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly9Cb3R0b20gYm9yZGVyXG5cdFx0c3RyICs9IGJvcmRlcnNbMl07XG5cblx0XHRyZXR1cm4gQXJyYXkoX3B1YmxpYy5vcHRpb25zLm1hcmdpblRvcCArIDEpLmpvaW4oJ1xcbicpICsgc3RyO1xuXHR9XHRcblxufTtcblxuXG4vKipcbiAqIEBjbGFzcyBUYWJsZVxuICogQHBhcmFtIHthcnJheX0gaGVhZGVyXG4gKiBAcGFyYW0ge29iamVjdH0gaGVhZGVyLmNvbHVtblx0XHRcdFx0XHRcdFx0XHRcdC0gQ29sdW1uIG9wdGlvbnNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhlYWRlci5jb2x1bW4uZm9ybWF0dGVyXHRcdFx0LSBSdW5zIGEgY2FsbGJhY2sgb24gZWFjaCBjZWxsIHZhbHVlIGluIHRoZSBwYXJlbnQgY29sdW1uXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5MZWZ0XHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLm1hcmdpblRvcFx0XHRcdFx0LSBkZWZhdWx0OiAwXHRcdFx0XG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXhXaWR0aFx0XHRcdFx0XHQtIGRlZmF1bHQ6IDIwIFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0JvdHRvbVx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdMZWZ0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nUmlnaHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdUb3BcdFx0XHRcdC0gZGVmYXVsdDogMFx0XG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlhc1x0XHRcdFx0XHRcdC0gQWxlcm5hdGUgaGVhZGVyIGNvbHVtbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlnblx0XHRcdFx0XHRcdC0gZGVmYXVsdDogXCJjZW50ZXJcIlxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uY29sb3JcdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckFsaWduXHRcdFx0LSBkZWZhdWx0OiBcImNlbnRlclwiIFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uaGVhZGVyQ29sb3JcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSByb3dzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcdFx0XHRcdFx0XHRcdFx0XHQtIFRhYmxlIG9wdGlvbnMgXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5ib3JkZXJTdHlsZVx0XHRcdC0gZGVmYXVsdDogMSAoMCA9IG5vIGJvcmRlcikgXG4gKiBSZWZlcnMgdG8gdGhlIGluZGV4IG9mIHRoZSBkZXNpcmVkIGNoYXJhY3RlciBzZXQuIFxuICogQHBhcmFtIHthcnJheX0gb3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzXHRcdFx0IFxuICogQHJldHVybnMge1RhYmxlfVxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogdmFyIFRhYmxlID0gcmVxdWlyZSgndHR5LXRhYmxlJyk7XG4gKiBUYWJsZShoZWFkZXIscm93cyxvcHRpb25zKTtcbiAqIGBgYFxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihoZWFkZXIscm93cyxvcHRpb25zKXtcblx0dmFyIG8gPSBuZXcgY2xzKCk7XG5cdHJldHVybiBvLl9wcml2YXRlLnNldHVwKGhlYWRlcixyb3dzLG9wdGlvbnMpO1xufTtcbiJdfQ==
