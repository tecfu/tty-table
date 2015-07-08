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
				row = row.concat(Array.apply(null, new Array(difL))
															.map(function(){return null})); 
			}
			else if(difL < 0){
				row = row.length(_private.table.columnWidths.length);
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

},{"_process":1,"chalk":2,"merge":8,"strip-ansi":9,"wordwrap":11}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvYW5zaS1zdHlsZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL25vZGVfbW9kdWxlcy9oYXMtYW5zaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jaGFsay9ub2RlX21vZHVsZXMvaGFzLWFuc2kvbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2hhbGsvbm9kZV9tb2R1bGVzL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmdlL21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd29yZHdyYXAvaW5kZXguanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZXNjYXBlU3RyaW5nUmVnZXhwID0gcmVxdWlyZSgnZXNjYXBlLXN0cmluZy1yZWdleHAnKTtcbnZhciBhbnNpU3R5bGVzID0gcmVxdWlyZSgnYW5zaS1zdHlsZXMnKTtcbnZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XG52YXIgaGFzQW5zaSA9IHJlcXVpcmUoJ2hhcy1hbnNpJyk7XG52YXIgc3VwcG9ydHNDb2xvciA9IHJlcXVpcmUoJ3N1cHBvcnRzLWNvbG9yJyk7XG52YXIgZGVmaW5lUHJvcHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcztcbnZhciBpc1NpbXBsZVdpbmRvd3NUZXJtID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiAhL154dGVybS9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSk7XG5cbmZ1bmN0aW9uIENoYWxrKG9wdGlvbnMpIHtcblx0Ly8gZGV0ZWN0IG1vZGUgaWYgbm90IHNldCBtYW51YWxseVxuXHR0aGlzLmVuYWJsZWQgPSAhb3B0aW9ucyB8fCBvcHRpb25zLmVuYWJsZWQgPT09IHVuZGVmaW5lZCA/IHN1cHBvcnRzQ29sb3IgOiBvcHRpb25zLmVuYWJsZWQ7XG59XG5cbi8vIHVzZSBicmlnaHQgYmx1ZSBvbiBXaW5kb3dzIGFzIHRoZSBub3JtYWwgYmx1ZSBjb2xvciBpcyBpbGxlZ2libGVcbmlmIChpc1NpbXBsZVdpbmRvd3NUZXJtKSB7XG5cdGFuc2lTdHlsZXMuYmx1ZS5vcGVuID0gJ1xcdTAwMWJbOTRtJztcbn1cblxudmFyIHN0eWxlcyA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciByZXQgPSB7fTtcblxuXHRPYmplY3Qua2V5cyhhbnNpU3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRhbnNpU3R5bGVzW2tleV0uY2xvc2VSZSA9IG5ldyBSZWdFeHAoZXNjYXBlU3RyaW5nUmVnZXhwKGFuc2lTdHlsZXNba2V5XS5jbG9zZSksICdnJyk7XG5cblx0XHRyZXRba2V5XSA9IHtcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gYnVpbGQuY2FsbCh0aGlzLCB0aGlzLl9zdHlsZXMuY29uY2F0KGtleSkpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59KSgpO1xuXG52YXIgcHJvdG8gPSBkZWZpbmVQcm9wcyhmdW5jdGlvbiBjaGFsaygpIHt9LCBzdHlsZXMpO1xuXG5mdW5jdGlvbiBidWlsZChfc3R5bGVzKSB7XG5cdHZhciBidWlsZGVyID0gZnVuY3Rpb24gYnVpbGRlcigpIHtcblx0XHRyZXR1cm4gYXBwbHlTdHlsZS5hcHBseShidWlsZGVyLCBhcmd1bWVudHMpO1xuXHR9O1xuXG5cdGJ1aWxkZXIuX3N0eWxlcyA9IF9zdHlsZXM7XG5cdGJ1aWxkZXIuZW5hYmxlZCA9IHRoaXMuZW5hYmxlZDtcblx0Ly8gX19wcm90b19fIGlzIHVzZWQgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlLlxuXHQvKmVzbGludCBuby1wcm90bzogMCAqL1xuXHRidWlsZGVyLl9fcHJvdG9fXyA9IHByb3RvO1xuXG5cdHJldHVybiBidWlsZGVyO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlKCkge1xuXHQvLyBzdXBwb3J0IHZhcmFncywgYnV0IHNpbXBseSBjYXN0IHRvIHN0cmluZyBpbiBjYXNlIHRoZXJlJ3Mgb25seSBvbmUgYXJnXG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHR2YXIgYXJnc0xlbiA9IGFyZ3MubGVuZ3RoO1xuXHR2YXIgc3RyID0gYXJnc0xlbiAhPT0gMCAmJiBTdHJpbmcoYXJndW1lbnRzWzBdKTtcblxuXHRpZiAoYXJnc0xlbiA+IDEpIHtcblx0XHQvLyBkb24ndCBzbGljZSBgYXJndW1lbnRzYCwgaXQgcHJldmVudHMgdjggb3B0aW1pemF0aW9uc1xuXHRcdGZvciAodmFyIGEgPSAxOyBhIDwgYXJnc0xlbjsgYSsrKSB7XG5cdFx0XHRzdHIgKz0gJyAnICsgYXJnc1thXTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIXRoaXMuZW5hYmxlZCB8fCAhc3RyKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHZhciBuZXN0ZWRTdHlsZXMgPSB0aGlzLl9zdHlsZXM7XG5cdHZhciBpID0gbmVzdGVkU3R5bGVzLmxlbmd0aDtcblxuXHQvLyBUdXJucyBvdXQgdGhhdCBvbiBXaW5kb3dzIGRpbW1lZCBncmF5IHRleHQgYmVjb21lcyBpbnZpc2libGUgaW4gY21kLmV4ZSxcblx0Ly8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9jaGFsay9pc3N1ZXMvNThcblx0Ly8gSWYgd2UncmUgb24gV2luZG93cyBhbmQgd2UncmUgZGVhbGluZyB3aXRoIGEgZ3JheSBjb2xvciwgdGVtcG9yYXJpbHkgbWFrZSAnZGltJyBhIG5vb3AuXG5cdHZhciBvcmlnaW5hbERpbSA9IGFuc2lTdHlsZXMuZGltLm9wZW47XG5cdGlmIChpc1NpbXBsZVdpbmRvd3NUZXJtICYmIChuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JheScpICE9PSAtMSB8fCBuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JleScpICE9PSAtMSkpIHtcblx0XHRhbnNpU3R5bGVzLmRpbS5vcGVuID0gJyc7XG5cdH1cblxuXHR3aGlsZSAoaS0tKSB7XG5cdFx0dmFyIGNvZGUgPSBhbnNpU3R5bGVzW25lc3RlZFN0eWxlc1tpXV07XG5cblx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHQvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG5cdFx0Ly8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cblx0XHRzdHIgPSBjb2RlLm9wZW4gKyBzdHIucmVwbGFjZShjb2RlLmNsb3NlUmUsIGNvZGUub3BlbikgKyBjb2RlLmNsb3NlO1xuXHR9XG5cblx0Ly8gUmVzZXQgdGhlIG9yaWdpbmFsICdkaW0nIGlmIHdlIGNoYW5nZWQgaXQgdG8gd29yayBhcm91bmQgdGhlIFdpbmRvd3MgZGltbWVkIGdyYXkgaXNzdWUuXG5cdGFuc2lTdHlsZXMuZGltLm9wZW4gPSBvcmlnaW5hbERpbTtcblxuXHRyZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuXHR2YXIgcmV0ID0ge307XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0cmV0W25hbWVdID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIFtuYW1lXSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZGVmaW5lUHJvcHMoQ2hhbGsucHJvdG90eXBlLCBpbml0KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDaGFsaygpO1xubW9kdWxlLmV4cG9ydHMuc3R5bGVzID0gYW5zaVN0eWxlcztcbm1vZHVsZS5leHBvcnRzLmhhc0NvbG9yID0gaGFzQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN0cmlwQ29sb3IgPSBzdHJpcEFuc2k7XG5tb2R1bGUuZXhwb3J0cy5zdXBwb3J0c0NvbG9yID0gc3VwcG9ydHNDb2xvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMgKCkge1xuXHR2YXIgc3R5bGVzID0ge1xuXHRcdG1vZGlmaWVyczoge1xuXHRcdFx0cmVzZXQ6IFswLCAwXSxcblx0XHRcdGJvbGQ6IFsxLCAyMl0sIC8vIDIxIGlzbid0IHdpZGVseSBzdXBwb3J0ZWQgYW5kIDIyIGRvZXMgdGhlIHNhbWUgdGhpbmdcblx0XHRcdGRpbTogWzIsIDIyXSxcblx0XHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHRcdHVuZGVybGluZTogWzQsIDI0XSxcblx0XHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0XHRoaWRkZW46IFs4LCAyOF0sXG5cdFx0XHRzdHJpa2V0aHJvdWdoOiBbOSwgMjldXG5cdFx0fSxcblx0XHRjb2xvcnM6IHtcblx0XHRcdGJsYWNrOiBbMzAsIDM5XSxcblx0XHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0XHRncmVlbjogWzMyLCAzOV0sXG5cdFx0XHR5ZWxsb3c6IFszMywgMzldLFxuXHRcdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0XHRtYWdlbnRhOiBbMzUsIDM5XSxcblx0XHRcdGN5YW46IFszNiwgMzldLFxuXHRcdFx0d2hpdGU6IFszNywgMzldLFxuXHRcdFx0Z3JheTogWzkwLCAzOV1cblx0XHR9LFxuXHRcdGJnQ29sb3JzOiB7XG5cdFx0XHRiZ0JsYWNrOiBbNDAsIDQ5XSxcblx0XHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRcdGJnR3JlZW46IFs0MiwgNDldLFxuXHRcdFx0YmdZZWxsb3c6IFs0MywgNDldLFxuXHRcdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRcdGJnTWFnZW50YTogWzQ1LCA0OV0sXG5cdFx0XHRiZ0N5YW46IFs0NiwgNDldLFxuXHRcdFx0YmdXaGl0ZTogWzQ3LCA0OV1cblx0XHR9XG5cdH07XG5cblx0Ly8gZml4IGh1bWFuc1xuXHRzdHlsZXMuY29sb3JzLmdyZXkgPSBzdHlsZXMuY29sb3JzLmdyYXk7XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChncm91cE5hbWUpIHtcblx0XHR2YXIgZ3JvdXAgPSBzdHlsZXNbZ3JvdXBOYW1lXTtcblxuXHRcdE9iamVjdC5rZXlzKGdyb3VwKS5mb3JFYWNoKGZ1bmN0aW9uIChzdHlsZU5hbWUpIHtcblx0XHRcdHZhciBzdHlsZSA9IGdyb3VwW3N0eWxlTmFtZV07XG5cblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0gZ3JvdXBbc3R5bGVOYW1lXSA9IHtcblx0XHRcdFx0b3BlbjogJ1xcdTAwMWJbJyArIHN0eWxlWzBdICsgJ20nLFxuXHRcdFx0XHRjbG9zZTogJ1xcdTAwMWJbJyArIHN0eWxlWzFdICsgJ20nXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgZ3JvdXBOYW1lLCB7XG5cdFx0XHR2YWx1ZTogZ3JvdXAsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0Z2V0OiBhc3NlbWJsZVN0eWxlc1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtYXRjaE9wZXJhdG9yc1JlID0gL1t8XFxcXHt9KClbXFxdXiQrKj8uXS9nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0aWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcblx0fVxuXG5cdHJldHVybiBzdHIucmVwbGFjZShtYXRjaE9wZXJhdG9yc1JlLCAgJ1xcXFwkJicpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4Jyk7XG52YXIgcmUgPSBuZXcgUmVnRXhwKGFuc2lSZWdleCgpLnNvdXJjZSk7IC8vIHJlbW92ZSB0aGUgYGdgIGZsYWdcbm1vZHVsZS5leHBvcnRzID0gcmUudGVzdC5iaW5kKHJlKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYXJndiA9IHByb2Nlc3MuYXJndjtcblxudmFyIHRlcm1pbmF0b3IgPSBhcmd2LmluZGV4T2YoJy0tJyk7XG52YXIgaGFzRmxhZyA9IGZ1bmN0aW9uIChmbGFnKSB7XG5cdGZsYWcgPSAnLS0nICsgZmxhZztcblx0dmFyIHBvcyA9IGFyZ3YuaW5kZXhPZihmbGFnKTtcblx0cmV0dXJuIHBvcyAhPT0gLTEgJiYgKHRlcm1pbmF0b3IgIT09IC0xID8gcG9zIDwgdGVybWluYXRvciA6IHRydWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXHRpZiAoJ0ZPUkNFX0NPTE9SJyBpbiBwcm9jZXNzLmVudikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKGhhc0ZsYWcoJ25vLWNvbG9yJykgfHxcblx0XHRoYXNGbGFnKCduby1jb2xvcnMnKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9yPWZhbHNlJykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ2NvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9dHJ1ZScpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9YWx3YXlzJykpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnN0ZG91dCAmJiAhcHJvY2Vzcy5zdGRvdXQuaXNUVFkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKCdDT0xPUlRFUk0nIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5lbnYuVEVSTSA9PT0gJ2R1bWInKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYgKC9ec2NyZWVufF54dGVybXxednQxMDB8Y29sb3J8YW5zaXxjeWd3aW58bGludXgvaS50ZXN0KHByb2Nlc3MuZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59KSgpO1xuIiwiLyohXHJcbiAqIEBuYW1lIEphdmFTY3JpcHQvTm9kZUpTIE1lcmdlIHYxLjIuMFxyXG4gKiBAYXV0aG9yIHllaWtvc1xyXG4gKiBAcmVwb3NpdG9yeSBodHRwczovL2dpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlXHJcblxyXG4gKiBDb3B5cmlnaHQgMjAxNCB5ZWlrb3MgLSBNSVQgbGljZW5zZVxyXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZS9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXHJcbjsoZnVuY3Rpb24oaXNOb2RlKSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIG9uZSBvciBtb3JlIG9iamVjdHMgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgUHVibGljID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIGZhbHNlLCBhcmd1bWVudHMpO1xyXG5cclxuXHR9LCBwdWJsaWNOYW1lID0gJ21lcmdlJztcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9yIG1vcmUgb2JqZWN0cyByZWN1cnNpdmVseSBcclxuXHQgKiBAcGFyYW0gYm9vbD8gY2xvbmVcclxuXHQgKiBAcGFyYW0gbWl4ZWQsLi4uIGFyZ3VtZW50c1xyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblxyXG5cdFB1YmxpYy5yZWN1cnNpdmUgPSBmdW5jdGlvbihjbG9uZSkge1xyXG5cclxuXHRcdHJldHVybiBtZXJnZShjbG9uZSA9PT0gdHJ1ZSwgdHJ1ZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogQ2xvbmUgdGhlIGlucHV0IHJlbW92aW5nIGFueSByZWZlcmVuY2VcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcmV0dXJuIG1peGVkXHJcblx0ICovXHJcblxyXG5cdFB1YmxpYy5jbG9uZSA9IGZ1bmN0aW9uKGlucHV0KSB7XHJcblxyXG5cdFx0dmFyIG91dHB1dCA9IGlucHV0LFxyXG5cdFx0XHR0eXBlID0gdHlwZU9mKGlucHV0KSxcclxuXHRcdFx0aW5kZXgsIHNpemU7XHJcblxyXG5cdFx0aWYgKHR5cGUgPT09ICdhcnJheScpIHtcclxuXHJcblx0XHRcdG91dHB1dCA9IFtdO1xyXG5cdFx0XHRzaXplID0gaW5wdXQubGVuZ3RoO1xyXG5cclxuXHRcdFx0Zm9yIChpbmRleD0wO2luZGV4PHNpemU7KytpbmRleClcclxuXHJcblx0XHRcdFx0b3V0cHV0W2luZGV4XSA9IFB1YmxpYy5jbG9uZShpbnB1dFtpbmRleF0pO1xyXG5cclxuXHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdG91dHB1dCA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yIChpbmRleCBpbiBpbnB1dClcclxuXHJcblx0XHRcdFx0b3V0cHV0W2luZGV4XSA9IFB1YmxpYy5jbG9uZShpbnB1dFtpbmRleF0pO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0cHV0O1xyXG5cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSB0d28gb2JqZWN0cyByZWN1cnNpdmVseVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEBwYXJhbSBtaXhlZCBleHRlbmRcclxuXHQgKiBAcmV0dXJuIG1peGVkXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlX3JlY3Vyc2l2ZShiYXNlLCBleHRlbmQpIHtcclxuXHJcblx0XHRpZiAodHlwZU9mKGJhc2UpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJldHVybiBleHRlbmQ7XHJcblxyXG5cdFx0Zm9yICh2YXIga2V5IGluIGV4dGVuZCkge1xyXG5cclxuXHRcdFx0aWYgKHR5cGVPZihiYXNlW2tleV0pID09PSAnb2JqZWN0JyAmJiB0eXBlT2YoZXh0ZW5kW2tleV0pID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0XHRiYXNlW2tleV0gPSBtZXJnZV9yZWN1cnNpdmUoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XHJcblxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGJhc2U7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9yIG1vcmUgb2JqZWN0c1xyXG5cdCAqIEBwYXJhbSBib29sIGNsb25lXHJcblx0ICogQHBhcmFtIGJvb2wgcmVjdXJzaXZlXHJcblx0ICogQHBhcmFtIGFycmF5IGFyZ3ZcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZShjbG9uZSwgcmVjdXJzaXZlLCBhcmd2KSB7XHJcblxyXG5cdFx0dmFyIHJlc3VsdCA9IGFyZ3ZbMF0sXHJcblx0XHRcdHNpemUgPSBhcmd2Lmxlbmd0aDtcclxuXHJcblx0XHRpZiAoY2xvbmUgfHwgdHlwZU9mKHJlc3VsdCkgIT09ICdvYmplY3QnKVxyXG5cclxuXHRcdFx0cmVzdWx0ID0ge307XHJcblxyXG5cdFx0Zm9yICh2YXIgaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpIHtcclxuXHJcblx0XHRcdHZhciBpdGVtID0gYXJndltpbmRleF0sXHJcblxyXG5cdFx0XHRcdHR5cGUgPSB0eXBlT2YoaXRlbSk7XHJcblxyXG5cdFx0XHRpZiAodHlwZSAhPT0gJ29iamVjdCcpIGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGl0ZW0pIHtcclxuXHJcblx0XHRcdFx0dmFyIHNpdGVtID0gY2xvbmUgPyBQdWJsaWMuY2xvbmUoaXRlbVtrZXldKSA6IGl0ZW1ba2V5XTtcclxuXHJcblx0XHRcdFx0aWYgKHJlY3Vyc2l2ZSkge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKHJlc3VsdFtrZXldLCBzaXRlbSk7XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBzaXRlbTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0eXBlIG9mIHZhcmlhYmxlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBzdHJpbmdcclxuXHQgKlxyXG5cdCAqIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vdHlwZW9mdmFyXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHR5cGVPZihpbnB1dCkge1xyXG5cclxuXHRcdHJldHVybiAoe30pLnRvU3RyaW5nLmNhbGwoaW5wdXQpLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdGlmIChpc05vZGUpIHtcclxuXHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IFB1YmxpYztcclxuXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHR3aW5kb3dbcHVibGljTmFtZV0gPSBQdWJsaWM7XHJcblxyXG5cdH1cclxuXHJcbn0pKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZSAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKTsiLCIndXNlIHN0cmljdCc7XG52YXIgYW5zaVJlZ2V4ID0gcmVxdWlyZSgnYW5zaS1yZWdleCcpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRyZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgPyBzdHIucmVwbGFjZShhbnNpUmVnZXgsICcnKSA6IHN0cjtcbn07XG4iLCJ2YXIgc3RyaXBBbnNpID0gcmVxdWlyZSgnc3RyaXAtYW5zaScpO1xudmFyIHdvcmR3cmFwID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RhcnQsIHN0b3AsIHBhcmFtcykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHBhcmFtcyA9IHN0YXJ0O1xuICAgICAgICBzdGFydCA9IHBhcmFtcy5zdGFydDtcbiAgICAgICAgc3RvcCA9IHBhcmFtcy5zdG9wO1xuICAgIH1cbiAgICBcbiAgICBpZiAodHlwZW9mIHN0b3AgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHBhcmFtcyA9IHN0b3A7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgfHwgcGFyYW1zLnN0YXJ0O1xuICAgICAgICBzdG9wID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXN0b3ApIHtcbiAgICAgICAgc3RvcCA9IHN0YXJ0O1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIFxuICAgIGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcbiAgICB2YXIgbW9kZSA9IHBhcmFtcy5tb2RlIHx8ICdzb2Z0JztcbiAgICB2YXIgcmUgPSBtb2RlID09PSAnaGFyZCcgPyAvXFxiLyA6IC8oXFxTK1xccyspLztcbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIGNodW5rcyA9IHRleHQudG9TdHJpbmcoKVxuICAgICAgICAgICAgLnNwbGl0KHJlKVxuICAgICAgICAgICAgLnJlZHVjZShmdW5jdGlvbiAoYWNjLCB4KSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdoYXJkJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmlwQW5zaSh4KS5sZW5ndGg7IGkgKz0gc3RvcCAtIHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY2MucHVzaCh4LnNsaWNlKGksIGkgKyBzdG9wIC0gc3RhcnQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGFjYy5wdXNoKHgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH0sIFtdKVxuICAgICAgICA7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY2h1bmtzLnJlZHVjZShmdW5jdGlvbiAobGluZXMsIHJhd0NodW5rKSB7XG4gICAgICAgICAgICBpZiAocmF3Q2h1bmsgPT09ICcnKSByZXR1cm4gbGluZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjaHVuayA9IHJhd0NodW5rLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgaSA9IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBpZiAoc3RyaXBBbnNpKGxpbmVzW2ldKS5sZW5ndGggKyBzdHJpcEFuc2koY2h1bmspLmxlbmd0aCA+IHN0b3ApIHtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IGxpbmVzW2ldLnJlcGxhY2UoL1xccyskLywgJycpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNodW5rLnNwbGl0KC9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoc3RhcnQgKyAxKS5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICsgYy5yZXBsYWNlKC9eXFxzKy8sICcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2h1bmsubWF0Y2goL1xcbi8pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhzID0gY2h1bmsuc3BsaXQoL1xcbi8pO1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldICs9IHhzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgeHMuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KHN0YXJ0ICsgMSkuam9pbignICcpXG4gICAgICAgICAgICAgICAgICAgICAgICArIGMucmVwbGFjZSgvXlxccysvLCAnJylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldICs9IGNodW5rO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgICAgIH0sIFsgbmV3IEFycmF5KHN0YXJ0ICsgMSkuam9pbignICcpIF0pLmpvaW4oJ1xcbicpO1xuICAgIH07XG59O1xuXG53b3Jkd3JhcC5zb2Z0ID0gd29yZHdyYXA7XG5cbndvcmR3cmFwLmhhcmQgPSBmdW5jdGlvbiAoc3RhcnQsIHN0b3ApIHtcbiAgICByZXR1cm4gd29yZHdyYXAoc3RhcnQsIHN0b3AsIHsgbW9kZSA6ICdoYXJkJyB9KTtcbn07XG4iLCJ2YXIgbWVyZ2UgPSByZXF1aXJlKFwibWVyZ2VcIiksXG5cdFx0Y2hhbGsgPSByZXF1aXJlKFwiY2hhbGtcIiksXG5cdFx0c3RyaXBBbnNpID0gcmVxdWlyZShcInN0cmlwLWFuc2lcIiksXG5cdFx0d29yZHdyYXAgPSByZXF1aXJlKFwid29yZHdyYXBcIik7XG5cblxudmFyIGNscyA9IGZ1bmN0aW9uKCl7XG5cblxuXHR2YXIgX3B1YmxpYyA9IHRoaXMuX3B1YmxpYyA9IHt9LFxuXHRcdFx0X3ByaXZhdGUgPSB0aGlzLl9wcml2YXRlID0ge307XG5cblxuXHQvKiogXG5cdCAqIFByaXZhdGUgVmFyaWFibGVzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3ByaXZhdGUuZGVmYXVsdHMgPSB7XG5cdFx0ZGVmYXVsdFZhbHVlIDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAodHlwZW9mIGNoYWxrICE9PSAndW5kZWZpbmVkJykgPyBjaGFsay5yZWQoXCIjRVJSXCIpIDogXCIjRVJSXCI7XG5cdFx0XHQvL3JldHVybiAnbnVsbCc7XG5cdFx0fSgpLFxuXHRcdG1hcmdpblRvcCA6IDEsXG5cdFx0bWFyZ2luTGVmdCA6IDIsXG5cdFx0bWF4V2lkdGggOiAyMCxcblx0XHRmb3JtYXR0ZXIgOiBudWxsLFxuXHRcdGhlYWRlckFsaWduIDogXCJjZW50ZXJcIixcblx0XHRhbGlnbiA6IFwiY2VudGVyXCIsXG5cdFx0cGFkZGluZ1JpZ2h0IDogMCxcblx0XHRwYWRkaW5nTGVmdCA6IDAsXG5cdFx0cGFkZGluZ0JvdHRvbSA6IDAsXG5cdFx0cGFkZGluZ1RvcCA6IDAsXG5cdFx0Y29sb3IgOiBmYWxzZSxcblx0XHRoZWFkZXJDb2xvciA6IGZhbHNlLFxuXHRcdGJvcmRlclN0eWxlIDogMSxcblx0XHRib3JkZXJDaGFyYWN0ZXJzIDogW1xuXHRcdFx0W1xuXHRcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcblx0XHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn0sXG5cdFx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCLilIJcIiwgbDogXCLilIxcIiwgajogXCLilKxcIiwgaDogXCLilIBcIiwgcjogXCLilJBcIn0sXG5cdFx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUnFwiLCBqOiBcIuKUvFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUpFwifSxcblx0XHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pSUXCIsIGo6IFwi4pS0XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSYXCJ9XG5cdFx0XHRdLFxuXHRcdFx0W1xuXHRcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcblx0XHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn0sXG5cdFx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9XG5cdFx0XHRdXG5cdFx0XVxuXHR9O1xuXG5cblx0Ly9Db25zdGFudHNcblx0X3ByaXZhdGUuR1VUVEVSID0gMTtcblxuXG5cdF9wcml2YXRlLnRhYmxlID0ge1xuXHRcdGNvbHVtbnMgOiBbXSxcblx0XHRjb2x1bW5XaWR0aHMgOiBbXSxcblx0XHRjb2x1bW5Jbm5lcldpZHRocyA6IFtdLFxuXHRcdGhlYWRlciA6IFtdLFxuXHRcdGJvZHkgOiBbXVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFByaXZhdGUgTWV0aG9kc1xuXHQgKlxuXHQgKi9cblxuXG5cdF9wcml2YXRlLmJ1aWxkUm93ID0gZnVuY3Rpb24ocm93LG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBtaW5Sb3dIZWlnaHQgPSAwO1xuXHRcdFxuXHRcdC8vc3VwcG9ydCBib3RoIHJvd3MgcGFzc2VkIGFzIGFuIGFycmF5IFxuXHRcdC8vYW5kIHJvd3MgcGFzc2VkIGFzIGFuIG9iamVjdFxuXHRcdGlmKHR5cGVvZiByb3cgPT09ICdvYmplY3QnICYmICEocm93IGluc3RhbmNlb2YgQXJyYXkpKXtcblx0XHRcdHJvdyA9XHRfcHJpdmF0ZS50YWJsZS5jb2x1bW5zLm1hcChmdW5jdGlvbihvYmplY3Qpe1xuXHRcdFx0XHRyZXR1cm4gcm93W29iamVjdC52YWx1ZV0gfHwgbnVsbDtcdFx0XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdC8vRW5mb3JjZSByb3cgc2l6ZVxuXHRcdFx0dmFyIGRpZkwgPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHMubGVuZ3RoIC0gcm93Lmxlbmd0aDtcblx0XHRcdGlmKGRpZkwgPiAwKXtcblx0XHRcdFx0cm93ID0gcm93LmNvbmNhdChBcnJheS5hcHBseShudWxsLCBuZXcgQXJyYXkoZGlmTCkpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9KSk7IFxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkaWZMIDwgMCl7XG5cdFx0XHRcdHJvdyA9IHJvdy5sZW5ndGgoX3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9nZXQgcm93IGFzIGFycmF5IG9mIGNlbGwgYXJyYXlzXG5cdFx0dmFyIGNBcnJzID0gcm93Lm1hcChmdW5jdGlvbihjZWxsLGluZGV4KXtcblx0XHRcdHZhciBjID0gX3ByaXZhdGUuYnVpbGRDZWxsKGNlbGwsaW5kZXgsb3B0aW9ucyk7XG5cdFx0XHR2YXIgY2VsbEFyciA9IGMuY2VsbEFycjtcblx0XHRcdGlmKG9wdGlvbnMuaGVhZGVyKXtcblx0XHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1uSW5uZXJXaWR0aHMucHVzaChjLndpZHRoKTtcblx0XHRcdH1cblx0XHRcdG1pblJvd0hlaWdodCA9IChtaW5Sb3dIZWlnaHQgPCBjZWxsQXJyLmxlbmd0aCkgPyBjZWxsQXJyLmxlbmd0aCA6IG1pblJvd0hlaWdodDtcblx0XHRcdHJldHVybiBjZWxsQXJyO1xuXHRcdH0pO1xuXG5cdFx0Ly9BZGp1c3QgbWluUm93SGVpZ2h0IHRvIHJlZmxlY3QgdmVydGljYWwgcm93IHBhZGRpbmdcblx0XHRtaW5Sb3dIZWlnaHQgPSAob3B0aW9ucy5oZWFkZXIpID8gbWluUm93SGVpZ2h0IDogbWluUm93SGVpZ2h0ICsgXG5cdFx0XHQoX3B1YmxpYy5vcHRpb25zLnBhZGRpbmdCb3R0b20gKyBfcHVibGljLm9wdGlvbnMucGFkZGluZ1RvcCk7XG5cblx0XHQvL2NvbnZlcnQgYXJyYXkgb2YgY2VsbCBhcnJheXMgdG8gYXJyYXkgb2YgbGluZXNcblx0XHR2YXIgbGluZXMgPSBBcnJheS5hcHBseShudWxsLHtsZW5ndGg6bWluUm93SGVpZ2h0fSlcblx0XHRcdC5tYXAoRnVuY3Rpb24uY2FsbCxmdW5jdGlvbigpe3JldHVybiBbXX0pO1xuXG5cdFx0Y0FycnMuZm9yRWFjaChmdW5jdGlvbihjZWxsQXJyLGEpe1xuXHRcdFx0dmFyIHdoaXRlbGluZSA9IEFycmF5KF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRoc1thXSkuam9pbignXFwgJyk7XG5cdFx0XHRpZighb3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0XHQvL0FkZCB3aGl0ZXNwYWNlIGZvciB0b3AgcGFkZGluZ1xuXHRcdFx0XHRmb3IoaT0wOyBpPF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nVG9wOyBpKyspe1xuXHRcdFx0XHRcdGNlbGxBcnIudW5zaGlmdCh3aGl0ZWxpbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvL0FkZCB3aGl0ZXNwYWNlIGZvciBib3R0b20gcGFkZGluZ1xuXHRcdFx0XHRmb3IoaT0wOyBpPF9wdWJsaWMub3B0aW9ucy5wYWRkaW5nQm90dG9tOyBpKyspe1xuXHRcdFx0XHRcdGNlbGxBcnIucHVzaCh3aGl0ZWxpbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcblx0XHRcdGZvcih2YXIgYj0wOyBiPG1pblJvd0hlaWdodDsgYisrKXtcdFxuXHRcdFx0XHRsaW5lc1tiXS5wdXNoKCh0eXBlb2YgY2VsbEFycltiXSAhPSAndW5kZWZpbmVkJykgPyBjZWxsQXJyW2JdIDogd2hpdGVsaW5lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fTtcblxuXHRfcHJpdmF0ZS5idWlsZENlbGwgPSBmdW5jdGlvbihjZWxsLGNvbHVtbkluZGV4LG9wdGlvbnMpe1xuXG5cdFx0Ly9QdWxsIGNvbHVtbiBvcHRpb25zXHRcblx0XHR2YXIgb3V0cHV0O1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFxuXHRcdGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXIpe1xuXHRcdFx0Y2VsbCA9IG1lcmdlKHRydWUsX3B1YmxpYy5vcHRpb25zLGNlbGwpO1xuXHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1ucy5wdXNoKGNlbGwpO1xuXHRcdFx0b3V0cHV0ID0gY2VsbC5hbGlhcyB8fCBjZWxsLnZhbHVlO1xuXHRcdFx0Y29sdW1uT3B0aW9ucyA9IGNlbGw7XG5cdFx0fVx0XG5cdFx0ZWxzZXtcblx0XHRcdGNvbHVtbk9wdGlvbnMgPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5zW2NvbHVtbkluZGV4XTtcblx0XHRcdGlmKHR5cGVvZiBjZWxsID09PSAnb2JqZWN0JyAmJiBjZWxsICE9PSBudWxsKXtcdFxuXHRcdFx0XHRjb2x1bW5PcHRpb25zID0gbWVyZ2UodHJ1ZSxjb2x1bW5PcHRpb25zLGNlbGwpO1x0XHRcblx0XHRcdFx0b3V0cHV0ID0gY2VsbC52YWx1ZTtcblx0XHRcdH1cdFxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0b3V0cHV0ID0gY2VsbDtcblx0XHRcdH1cblxuXHRcdFx0Ly9SZXBsYWNlIHVuZGVmaW5lZC9udWxsIGNlbGwgdmFsdWVzIHdpdGggcGxhY2Vob2xkZXJcblx0XHRcdG91dHB1dCA9ICh0eXBlb2Ygb3V0cHV0ID09PSAndW5kZWZpbmVkJyB8fCBvdXRwdXQgPT09IG51bGwpID8gXG5cdFx0XHRcdF9wdWJsaWMub3B0aW9ucy5kZWZhdWx0VmFsdWUgOiBvdXRwdXQ7XG5cdFx0XHRcdFx0XHRcblx0XHRcdC8vUnVuIGZvcm1hdHRlclxuXHRcdFx0aWYodHlwZW9mIGNvbHVtbk9wdGlvbnMuZm9ybWF0dGVyID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdFx0b3V0cHV0ID0gY29sdW1uT3B0aW9ucy5mb3JtYXR0ZXIob3V0cHV0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly9BdXRvbWF0aWMgdGV4dCB3cmFwXG5cdFx0dmFyIHdyYXBPYmogID0gX3ByaXZhdGUud3JhcENlbGxDb250ZW50KG91dHB1dCxjb2x1bW5JbmRleCxjb2x1bW5PcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQob3B0aW9ucyAmJiBvcHRpb25zLmhlYWRlcikgPyBcImhlYWRlclwiIDogXCJib2R5XCIpO1xuXHRcdG91dHB1dCA9IHdyYXBPYmoub3V0cHV0O1xuXHRcdFxuXHRcdC8vcmV0dXJuIGFzIGFycmF5IG9mIGxpbmVzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGNlbGxBcnIgOiBvdXRwdXQuc3BsaXQoJ1xcbicpLFxuXHRcdFx0d2lkdGggOiB3cmFwT2JqLndpZHRoXG5cdFx0fTtcblx0fTtcblxuXHRfcHJpdmF0ZS5jb2xvcml6ZUFsbFdvcmRzID0gZnVuY3Rpb24oY29sb3Isc3RyKXtcblx0XHQvL0NvbG9yIGVhY2ggd29yZCBpbiB0aGUgY2VsbCBzbyB0aGF0IGxpbmUgYnJlYWtzIGRvbid0IGJyZWFrIGNvbG9yIFxuXHRcdHZhciBhcnIgPSBzdHIucmVwbGFjZSgvKFxcUyspL2dpLGZ1bmN0aW9uKG1hdGNoKXtcblx0XHRcdHJldHVybiBjaGFsa1tjb2xvcl0obWF0Y2gpKydcXCAnO1xuXHRcdH0pO1xuXHRcdHJldHVybiBhcnI7XG5cdH07XG5cblx0X3ByaXZhdGUuY29sb3JpemVMaW5lID0gZnVuY3Rpb24oY29sb3Isc3RyKXtcblx0XHRyZXR1cm4gY2hhbGtbY29sb3JdKHN0cik7XG5cdH07XG5cblx0X3ByaXZhdGUud3JhcENlbGxDb250ZW50ID0gZnVuY3Rpb24odmFsdWUsY29sdW1uSW5kZXgsY29sdW1uT3B0aW9ucyxyb3dUeXBlKXtcblx0XHR2YXIgc3RyaW5nID0gdmFsdWUudG9TdHJpbmcoKSxcblx0XHRcdFx0d2lkdGggPSBfcHJpdmF0ZS50YWJsZS5jb2x1bW5XaWR0aHNbY29sdW1uSW5kZXhdLFxuXHRcdFx0XHRpbm5lcldpZHRoID0gd2lkdGggLSBjb2x1bW5PcHRpb25zLnBhZGRpbmdMZWZ0IFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQtIGNvbHVtbk9wdGlvbnMucGFkZGluZ1JpZ2h0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC0gX3ByaXZhdGUuR1VUVEVSOyAvL2JvcmRlci9ndXR0ZXJcblxuXHRcdC8vQnJlYWsgc3RyaW5nIGludG8gYXJyYXkgb2YgbGluZXNcblx0XHR3cmFwID0gd29yZHdyYXAoaW5uZXJXaWR0aCk7XG5cdFx0c3RyaW5nID0gd3JhcChzdHJpbmcpOyBcblxuXHRcdHZhciBzdHJBcnIgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xuXG5cdFx0Ly9Gb3JtYXQgZWFjaCBsaW5lXG5cdFx0c3RyQXJyID0gc3RyQXJyLm1hcChmdW5jdGlvbihsaW5lKXtcblxuXHRcdFx0Ly9BcHBseSBjb2xvcnNcblx0XHRcdHN3aXRjaCh0cnVlKXtcblx0XHRcdFx0Y2FzZShyb3dUeXBlID09PSAnaGVhZGVyJyk6XG5cdFx0XHRcdFx0bGluZSA9IChjb2x1bW5PcHRpb25zLmNvbG9yIHx8IF9wdWJsaWMub3B0aW9ucy5jb2xvcikgPyBcblx0XHRcdFx0XHRcdF9wcml2YXRlLmNvbG9yaXplTGluZShjb2x1bW5PcHRpb25zLmhlYWRlckNvbG9yIHx8IF9wdWJsaWMub3B0aW9ucy5jb2xvcixsaW5lKSA6IFxuXHRcdFx0XHRcdFx0bGluZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSh0eXBlb2YgY29sdW1uT3B0aW9ucy5jb2xvciA9PT0gJ3N0cmluZycpOlxuXHRcdFx0XHRcdGxpbmUgPSBfcHJpdmF0ZS5jb2xvcml6ZUxpbmUoY29sdW1uT3B0aW9ucy5jb2xvcixsaW5lKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSh0eXBlb2YgX3B1YmxpYy5vcHRpb25zLmNvbG9yID09PSAnc3RyaW5nJyk6XG5cdFx0XHRcdFx0bGluZSA9IF9wcml2YXRlLmNvbG9yaXplTGluZShfcHVibGljLm9wdGlvbnMuY29sb3IsbGluZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vTGVmdCwgUmlnaHQgUGFkZGluZ1xuXHRcdFx0bGluZSA9IEFycmF5KGNvbHVtbk9wdGlvbnMucGFkZGluZ0xlZnQgKyAxKS5qb2luKCcgJykgK1xuXHRcdFx0XHRcdFx0bGluZSArXG5cdFx0XHRcdFx0XHRBcnJheShjb2x1bW5PcHRpb25zLnBhZGRpbmdSaWdodCArIDEpLmpvaW4oJyAnKTtcblx0XHRcdHZhciBsaW5lTGVuZ3RoID0gc3RyaXBBbnNpKGxpbmUpLmxlbmd0aDtcblxuXHRcdFx0Ly9hbGlnbiBcblx0XHRcdHZhciBhbGlnblRndCA9IChyb3dUeXBlID09PSAnaGVhZGVyJykgPyBcImhlYWRlckFsaWduXCIgOiBcImFsaWduXCI7XG5cdFx0XHRpZihsaW5lTGVuZ3RoIDwgd2lkdGgpe1xuXHRcdFx0XHR2YXIgc3BhY2VBdmFpbGFibGUgPSB3aWR0aCAtIGxpbmVMZW5ndGg7IFxuXHRcdFx0XHRzd2l0Y2godHJ1ZSl7XG5cdFx0XHRcdFx0Y2FzZShjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ2NlbnRlcicpOlxuXHRcdFx0XHRcdFx0dmFyIGV2ZW4gPSAoc3BhY2VBdmFpbGFibGUgJTIgPT09IDApO1xuXHRcdFx0XHRcdFx0c3BhY2VBdmFpbGFibGUgPSAoZXZlbikgPyBzcGFjZUF2YWlsYWJsZSA6IFxuXHRcdFx0XHRcdFx0XHRzcGFjZUF2YWlsYWJsZSAtIDE7XG5cdFx0XHRcdFx0XHRpZihzcGFjZUF2YWlsYWJsZSA+IDEpe1xuXHRcdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoc3BhY2VBdmFpbGFibGUvMikuam9pbignICcpICsgXG5cdFx0XHRcdFx0XHRcdFx0bGluZSArXG5cdFx0XHRcdFx0XHRcdFx0QXJyYXkoc3BhY2VBdmFpbGFibGUvMiArICgoZXZlbik/MToyKSkuam9pbignICcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZShjb2x1bW5PcHRpb25zW2FsaWduVGd0XSA9PT0gJ3JpZ2h0Jyk6XG5cdFx0XHRcdFx0XHRsaW5lID0gQXJyYXkoc3BhY2VBdmFpbGFibGUpLmpvaW4oJyAnKSArIGxpbmU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0bGluZSA9IGxpbmUgKyBBcnJheShzcGFjZUF2YWlsYWJsZSkuam9pbignICcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBsaW5lO1xuXHRcdH0pO1xuXG5cdFx0c3RyaW5nID0gc3RyQXJyLmpvaW4oJ1xcbicpO1xuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHRvdXRwdXQgOiBzdHJpbmcsXG5cdFx0XHR3aWR0aCA6IGlubmVyV2lkdGhcblx0XHR9O1xuXHR9O1xuXG5cdF9wcml2YXRlLmdldENvbHVtbldpZHRocyA9IGZ1bmN0aW9uKHJvdyl7XG5cdFx0Ly9XaWR0aHMgYXMgcHJlc2NyaWJlZFxuXHRcdHZhciB3aWR0aHMgPSByb3cubWFwKGZ1bmN0aW9uKGNlbGwpe1xuXHRcdFx0aWYodHlwZW9mIGNlbGwgPT09ICdvYmplY3QnICYmIHR5cGVvZiBjZWxsLndpZHRoICE9PSd1bmRlZmluZWQnKXtcblx0XHRcdFx0cmV0dXJuIGNlbGwud2lkdGg7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRyZXR1cm4gX3B1YmxpYy5vcHRpb25zLm1heFdpZHRoO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly9DaGVjayB0byBtYWtlIHN1cmUgd2lkdGhzIHdpbGwgZml0IHRoZSBjdXJyZW50IGRpc3BsYXksIG9yIHJlc2l6ZS5cblx0XHR2YXIgdG90YWxXaWR0aCA9IHdpZHRocy5yZWR1Y2UoZnVuY3Rpb24ocHJldixjdXJyKXtcblx0XHRcdHJldHVybiBwcmV2K2N1cnI7XG5cdFx0fSk7XG5cdFx0Ly9BZGQgbWFyZ2luTGVmdCB0byB0b3RhbFdpZHRoXG5cdFx0dG90YWxXaWR0aCArPSBfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdDtcblxuXHRcdC8vQ2hlY2sgcHJvY2VzcyBleGlzdHMgaW4gY2FzZSB3ZSBhcmUgaW4gYnJvd3NlclxuXHRcdGlmKHByb2Nlc3MgJiYgcHJvY2Vzcy5zdGRvdXQgJiYgdG90YWxXaWR0aCA+IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMpe1xuXHRcdFx0Ly9yZWNhbGN1bGF0ZSBwcm9wb3J0aW9uYXRlbHkgdG8gZml0IHNpemVcblx0XHRcdHZhciBwcm9wID0gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucyA+IHRvdGFsV2lkdGg7XG5cdFx0XHRwcm9wID0gcHJvcC50b0ZpeGVkKDIpLTAuMDE7XG5cdFx0XHR3aWR0aHMgPSB3aWR0aHMubWFwKGZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IocHJvcCp2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGhzO1xuXHR9O1xuXG5cblx0LyoqIFxuXHQgKiBQdWJsaWMgVmFyaWFibGVzXG5cdCAqXG5cdCAqL1xuXG5cblx0X3B1YmxpYy5vcHRpb25zID0ge307XG5cblxuXHQvKipcblx0ICogUHVibGljIE1ldGhvZHNcblx0ICpcblx0ICovXG5cblxuXHRfcHJpdmF0ZS5zZXR1cCA9IGZ1bmN0aW9uKGhlYWRlcixib2R5LG9wdGlvbnMpe1xuXHRcdFxuXHRcdF9wdWJsaWMub3B0aW9ucyA9IG1lcmdlKHRydWUsX3ByaXZhdGUuZGVmYXVsdHMsb3B0aW9ucyk7XG5cblx0XHQvL2JhY2tmaXhlcyBmb3Igc2hvcnRlbmVkIG9wdGlvbiBuYW1lc1xuXHRcdF9wdWJsaWMub3B0aW9ucy5hbGlnbiA9IF9wdWJsaWMub3B0aW9ucy5hbGlnbm1lbnQgfHwgX3B1YmxpYy5vcHRpb25zLmFsaWduO1xuXHRcdF9wdWJsaWMub3B0aW9ucy5oZWFkZXJBbGlnbiA9IF9wdWJsaWMub3B0aW9ucy5oZWFkZXJBbGlnbm1lbnQgfHwgX3B1YmxpYy5vcHRpb25zLmhlYWRlckFsaWduO1xuXHRcdFxuXHRcdF9wcml2YXRlLnRhYmxlLmNvbHVtbldpZHRocyA9IF9wcml2YXRlLmdldENvbHVtbldpZHRocyhoZWFkZXIpO1xuXG5cdFx0aGVhZGVyID0gW2hlYWRlcl07XG5cdFx0X3ByaXZhdGUudGFibGUuaGVhZGVyID0gaGVhZGVyLm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyx7XG5cdFx0XHRcdGhlYWRlcjp0cnVlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdF9wcml2YXRlLnRhYmxlLmJvZHkgPSBib2R5Lm1hcChmdW5jdGlvbihyb3cpe1xuXHRcdFx0cmV0dXJuIF9wcml2YXRlLmJ1aWxkUm93KHJvdyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gX3B1YmxpYztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIGEgdGFibGUgdG8gYSBzdHJpbmdcblx0ICogQHJldHVybnMge1N0cmluZ31cblx0ICogQG1lbWJlcm9mIFRhYmxlIFxuXHQgKiBAZXhhbXBsZSBcblx0ICogYGBgXG5cdCAqIHZhciBzdHIgPSB0MS5yZW5kZXIoKTsgXG5cdCAqIGNvbnNvbGUubG9nKHN0cik7IC8vb3V0cHV0cyB0YWJsZVxuXHQgKiBgYGBcblx0Ki9cblx0X3B1YmxpYy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBzdHIgPSAnJyxcblx0XHRcdFx0cGFydCA9IFsnaGVhZGVyJywnYm9keSddLFxuXHRcdFx0XHRiQXJyID0gW10sXG5cdFx0XHRcdG1hcmdpbkxlZnQgPSBBcnJheShfcHVibGljLm9wdGlvbnMubWFyZ2luTGVmdCArIDEpLmpvaW4oJ1xcICcpLFxuXHRcdFx0XHRiUyA9IF9wdWJsaWMub3B0aW9ucy5ib3JkZXJDaGFyYWN0ZXJzW19wdWJsaWMub3B0aW9ucy5ib3JkZXJTdHlsZV0sXG5cdFx0XHRcdGJvcmRlcnMgPSBbXTtcblxuXHRcdC8vQm9yZGVyc1xuXHRcdGZvcihhPTA7YTwzO2ErKyl7XG5cdFx0XHRib3JkZXJzLnB1c2goJycpO1xuXHRcdFx0X3ByaXZhdGUudGFibGUuY29sdW1uV2lkdGhzLmZvckVhY2goZnVuY3Rpb24odyxpLGFycil7XG5cdFx0XHRcdGJvcmRlcnNbYV0gKz0gQXJyYXkodykuam9pbihiU1thXS5oKSBcblx0XHRcdFx0XHQrICgoaSsxICE9PSBhcnIubGVuZ3RoKSA/IGJTW2FdLmogOiBiU1thXS5yKTtcblx0XHRcdH0pO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJTW2FdLmwgKyBib3JkZXJzW2FdO1xuXHRcdFx0Ym9yZGVyc1thXSA9IGJvcmRlcnNbYV0uc3BsaXQoJycpO1xuXHRcdFx0Ym9yZGVyc1thXVtib3JkZXJzW2FdLmxlbmd0aDFdID0gYlNbYV0ucjtcblx0XHRcdGJvcmRlcnNbYV0gPSBib3JkZXJzW2FdLmpvaW4oJycpO1xuXHRcdFx0Ym9yZGVyc1thXSA9IG1hcmdpbkxlZnQgKyBib3JkZXJzW2FdICsgJ1xcbic7XG5cdFx0fVxuXHRcdFxuXHRcdHN0ciArPSBib3JkZXJzWzBdO1xuXG5cdFx0Ly9Sb3dzXG5cdFx0cGFydC5mb3JFYWNoKGZ1bmN0aW9uKHAsaSl7XG5cdFx0XHR3aGlsZShfcHJpdmF0ZS50YWJsZVtwXS5sZW5ndGgpe1xuXHRcdFx0XHRyb3cgPSBfcHJpdmF0ZS50YWJsZVtwXS5zaGlmdCgpO1xuXHRcdFx0XG5cdFx0XHRcdHJvdy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xuXHRcdFx0XHRcdHN0ciA9IHN0ciBcblx0XHRcdFx0XHRcdCsgbWFyZ2luTGVmdCBcblx0XHRcdFx0XHRcdCsgYlNbMV0udlxuXHRcdFx0XHRcdFx0K1x0bGluZS5qb2luKGJTWzFdLnYpIFxuXHRcdFx0XHRcdFx0KyBiU1sxXS52XG5cdFx0XHRcdFx0XHQrICdcXG4nO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vSm9pbmluZyBib3JkZXJcblx0XHRcdFx0aWYoIShpPT0xICYmIF9wcml2YXRlLnRhYmxlW3BdLmxlbmd0aD09PTApKXtcblx0XHRcdFx0XHRzdHIgKz0gYm9yZGVyc1sxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVx0XG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly9Cb3R0b20gYm9yZGVyXG5cdFx0c3RyICs9IGJvcmRlcnNbMl07XG5cblx0XHRyZXR1cm4gQXJyYXkoX3B1YmxpYy5vcHRpb25zLm1hcmdpblRvcCArIDEpLmpvaW4oJ1xcbicpICsgc3RyO1xuXHR9XHRcblxufTtcblxuXG4vKipcbiAqIEBjbGFzcyBUYWJsZVxuICogQHBhcmFtIHthcnJheX0gaGVhZGVyXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQtIFtTZWUgZXhhbXBsZV0oI2V4YW1wbGUtdXNhZ2UpXG4gKiBAcGFyYW0ge29iamVjdH0gaGVhZGVyLmNvbHVtblx0XHRcdFx0XHRcdFx0XHRcdC0gQ29sdW1uIG9wdGlvbnNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhlYWRlci5jb2x1bW4uZm9ybWF0dGVyXHRcdFx0LSBSdW5zIGEgY2FsbGJhY2sgb24gZWFjaCBjZWxsIHZhbHVlIGluIHRoZSBwYXJlbnQgY29sdW1uXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXJnaW5MZWZ0XHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLm1hcmdpblRvcFx0XHRcdFx0LSBkZWZhdWx0OiAwXHRcdFx0XG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5tYXhXaWR0aFx0XHRcdFx0XHQtIGRlZmF1bHQ6IDIwIFxuICogQHBhcmFtIHtudW1iZXJ9IGhlYWRlci5jb2x1bW4ucGFkZGluZ0JvdHRvbVx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdMZWZ0XHRcdFx0LSBkZWZhdWx0OiAwXG4gKiBAcGFyYW0ge251bWJlcn0gaGVhZGVyLmNvbHVtbi5wYWRkaW5nUmlnaHRcdFx0XHQtIGRlZmF1bHQ6IDBcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWFkZXIuY29sdW1uLnBhZGRpbmdUb3BcdFx0XHRcdC0gZGVmYXVsdDogMFx0XG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlhc1x0XHRcdFx0XHRcdC0gQWxlcm5hdGUgaGVhZGVyIGNvbHVtbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyLmNvbHVtbi5hbGlnblx0XHRcdFx0XHRcdC0gZGVmYXVsdDogXCJjZW50ZXJcIlxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uY29sb3JcdFx0XHRcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXIuY29sdW1uLmhlYWRlckFsaWduXHRcdFx0LSBkZWZhdWx0OiBcImNlbnRlclwiIFxuICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlci5jb2x1bW4uaGVhZGVyQ29sb3JcdFx0XHQtIGRlZmF1bHQ6IHRlcm1pbmFsIGRlZmF1bHQgY29sb3JcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSByb3dzXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC0gW1NlZSBleGFtcGxlXSgjZXhhbXBsZS11c2FnZSlcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1x0XHRcdFx0XHRcdFx0XHRcdC0gVGFibGUgb3B0aW9ucyBcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmJvcmRlclN0eWxlXHRcdFx0LSBkZWZhdWx0OiAxICgwID0gbm8gYm9yZGVyKSBcbiAqIFJlZmVycyB0byB0aGUgaW5kZXggb2YgdGhlIGRlc2lyZWQgY2hhcmFjdGVyIHNldC4gXG4gKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zLmJvcmRlckNoYXJhY3RlcnNcdC0gW1NlZSBAbm90ZV0oI25vdGUpIFxuICogQHJldHVybnMge1RhYmxlfVxuICogQG5vdGVcbiAqIDxhIG5hbWU9XCJub3RlXCIvPlxuICogRGVmYXVsdCBib3JkZXIgY2hhcmFjdGVyIHNldHM6XG4gKiBgYGBcbiAqXHRbXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcIiBcIiwgbDogXCIgXCIsIGo6IFwiIFwiLCBoOiBcIiBcIiwgcjogXCIgXCJ9LFxuICpcdFx0XHR7djogXCIgXCIsIGw6IFwiIFwiLCBqOiBcIiBcIiwgaDogXCIgXCIsIHI6IFwiIFwifSxcbiAqXHRcdFx0e3Y6IFwiIFwiLCBsOiBcIiBcIiwgajogXCIgXCIsIGg6IFwiIFwiLCByOiBcIiBcIn1cbiAqXHRcdF0sXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcIuKUglwiLCBsOiBcIuKUjFwiLCBqOiBcIuKUrFwiLCBoOiBcIuKUgFwiLCByOiBcIuKUkFwifSxcbiAqXHRcdFx0e3Y6IFwi4pSCXCIsIGw6IFwi4pScXCIsIGo6IFwi4pS8XCIsIGg6IFwi4pSAXCIsIHI6IFwi4pSkXCJ9LFxuICpcdFx0XHR7djogXCLilIJcIiwgbDogXCLilJRcIiwgajogXCLilLRcIiwgaDogXCLilIBcIiwgcjogXCLilJhcIn1cbiAqXHRcdF0sXG4gKlx0XHRbXG4gKlx0XHRcdHt2OiBcInxcIiwgbDogXCIrXCIsIGo6IFwiK1wiLCBoOiBcIi1cIiwgcjogXCIrXCJ9LFxuICpcdFx0XHR7djogXCJ8XCIsIGw6IFwiK1wiLCBqOiBcIitcIiwgaDogXCItXCIsIHI6IFwiK1wifSxcbiAqXHRcdFx0e3Y6IFwifFwiLCBsOiBcIitcIiwgajogXCIrXCIsIGg6IFwiLVwiLCByOiBcIitcIn1cbiAqXHRcdF1cbiAqXHRdXG4gKiBgYGBcbiAqIEBleGFtcGxlXG4gKiBgYGBcbiAqIHZhciBUYWJsZSA9IHJlcXVpcmUoJ3R0eS10YWJsZScpO1xuICogVGFibGUoaGVhZGVyLHJvd3Msb3B0aW9ucyk7XG4gKiBgYGBcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGVhZGVyLHJvd3Msb3B0aW9ucyl7XG5cdHZhciBvID0gbmV3IGNscygpO1xuXHRyZXR1cm4gby5fcHJpdmF0ZS5zZXR1cChoZWFkZXIscm93cyxvcHRpb25zKTtcbn07XG4iXX0=
