var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

const defaults = {
  borderCharacters: {
    "invisible": [
      {v: " ", l: " ", j: " ", h: " ", r: " "},
      {v: " ", l: " ", j: " ", h: " ", r: " "},
      {v: " ", l: " ", j: " ", h: " ", r: " "}
    ],
    "solid": [
      {v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
      {v: "│", l: "├", j: "┼", h: "─", r: "┤"},
      {v: "│", l: "└", j: "┴", h: "─", r: "┘"}
    ],
    "dashed": [
      {v: "|", l: "+", j: "+", h: "-", r: "+"},
      {v: "|", l: "+", j: "+", h: "-", r: "+"},
      {v: "|", l: "+", j: "+", h: "-", r: "+"}
    ],
    "none": [
      {v: "", l: "", j: "", h: "", r: ""},
      {v: "", l: "", j: "", h: "", r: ""},
      {v: "", l: "", j: "", h: "", r: ""}
    ]
  },
  align: "center",
  borderColor: null,
  borderStyle: "solid",
  color: false,
  compact: false,
  defaultErrorValue: "�",
  // defaultValue: "\u001b[31m?\u001b[39m",
  defaultValue: "[32m[37m[41m ?[49m[32m[39m",
  errorOnNull: false,
  footerAlign: "center",
  footerColor: false,
  formatter: null,
  headerAlign: "center",
  headerColor: "yellow",
  marginLeft: 2,
  marginTop: 1,
  paddingBottom: 0,
  paddingLeft: 1,
  paddingRight: 1,
  paddingTop: 0,
  showHeader: null, // undocumented
  truncate: false,
  width: "auto",
  GUTTER: 1, // undocumented
  columnSettings: [],
  // save so cell options can be merged into column options
  table: {
    body: "",
    columnInnerWidths: [],
    columnWidths: [],
    columns: [],
    footer: "",
    header: "", // post-rendered strings.
    height: 0,
    typeLocked: false // once a table type is selected can't switch
  }
};


// support deprecated border style values
defaults.borderCharacters["0"] = defaults.borderCharacters["none"];
defaults.borderCharacters["1"] = defaults.borderCharacters["solid"];
defaults.borderCharacters["2"] = defaults.borderCharacters["dashed"];


var defaults_1 = defaults;

const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = {};

const $ = {
	enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

	// modifiers
	reset: init(0, 0),
	bold: init(1, 22),
	dim: init(2, 22),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),

	// colors
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	grey: init(90, 39),

	// background colors
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49)
};

function run(arr, str) {
	let i=0, tmp, beg='', end='';
	for (; i < arr.length; i++) {
		tmp = arr[i];
		beg += tmp.open;
		end += tmp.close;
		if (str.includes(tmp.close)) {
			str = str.replace(tmp.rgx, tmp.close + tmp.open);
		}
	}
	return beg + str + end;
}

function chain(has, keys) {
	let ctx = { has, keys };

	ctx.reset = $.reset.bind(ctx);
	ctx.bold = $.bold.bind(ctx);
	ctx.dim = $.dim.bind(ctx);
	ctx.italic = $.italic.bind(ctx);
	ctx.underline = $.underline.bind(ctx);
	ctx.inverse = $.inverse.bind(ctx);
	ctx.hidden = $.hidden.bind(ctx);
	ctx.strikethrough = $.strikethrough.bind(ctx);

	ctx.black = $.black.bind(ctx);
	ctx.red = $.red.bind(ctx);
	ctx.green = $.green.bind(ctx);
	ctx.yellow = $.yellow.bind(ctx);
	ctx.blue = $.blue.bind(ctx);
	ctx.magenta = $.magenta.bind(ctx);
	ctx.cyan = $.cyan.bind(ctx);
	ctx.white = $.white.bind(ctx);
	ctx.gray = $.gray.bind(ctx);
	ctx.grey = $.grey.bind(ctx);

	ctx.bgBlack = $.bgBlack.bind(ctx);
	ctx.bgRed = $.bgRed.bind(ctx);
	ctx.bgGreen = $.bgGreen.bind(ctx);
	ctx.bgYellow = $.bgYellow.bind(ctx);
	ctx.bgBlue = $.bgBlue.bind(ctx);
	ctx.bgMagenta = $.bgMagenta.bind(ctx);
	ctx.bgCyan = $.bgCyan.bind(ctx);
	ctx.bgWhite = $.bgWhite.bind(ctx);

	return ctx;
}

function init(open, close) {
	let blk = {
		open: `\x1b[${open}m`,
		close: `\x1b[${close}m`,
		rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
	};
	return function (txt) {
		if (this !== void 0 && this.has !== void 0) {
			this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
			return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
		}
		return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
	};
}

var kleur = $;

var style = createCommonjsModule(function (module, exports) {
module.exports.color = (str, ...colors) => {
  return colors.reduce(function(input, color) {
    return kleur[color](input)
  }, str)
};

module.exports.colorizeCell = (str, cellOptions, rowType) => {

  let color = false; // false will keep terminal default

  switch(true) {
    case(rowType === "body"):
      color = cellOptions.color || color;
      break

    case(rowType === "header"):
      color = cellOptions.headerColor || color;
      break

    default:
      color = cellOptions.footerColor || color;
  }

  if (color) {
    str = exports.color(str, color);
  }

  return str
};
});
var style_1 = style.color;
var style_2 = style.colorizeCell;

var ansiRegex = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

var stripAnsi = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var clone_1 = createCommonjsModule(function (module) {
var clone = (function() {

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
function clone(parent, circular, depth, prototype) {
  var filter;
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    filter = circular.filter;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      if (Buffer.allocUnsafe) {
        // Node.js >= 4.5.0
        child = Buffer.allocUnsafe(parent.length);
      } else {
        // Older Node.js versions
        child = new Buffer(parent.length);
      }
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if ( module.exports) {
  module.exports = clone;
}
});

var defaults$1 = function(options, defaults) {
  options = options || {};

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = clone_1(defaults[key]);
    }
  });

  return options;
};

var combining = [
    [ 0x0300, 0x036F ], [ 0x0483, 0x0486 ], [ 0x0488, 0x0489 ],
    [ 0x0591, 0x05BD ], [ 0x05BF, 0x05BF ], [ 0x05C1, 0x05C2 ],
    [ 0x05C4, 0x05C5 ], [ 0x05C7, 0x05C7 ], [ 0x0600, 0x0603 ],
    [ 0x0610, 0x0615 ], [ 0x064B, 0x065E ], [ 0x0670, 0x0670 ],
    [ 0x06D6, 0x06E4 ], [ 0x06E7, 0x06E8 ], [ 0x06EA, 0x06ED ],
    [ 0x070F, 0x070F ], [ 0x0711, 0x0711 ], [ 0x0730, 0x074A ],
    [ 0x07A6, 0x07B0 ], [ 0x07EB, 0x07F3 ], [ 0x0901, 0x0902 ],
    [ 0x093C, 0x093C ], [ 0x0941, 0x0948 ], [ 0x094D, 0x094D ],
    [ 0x0951, 0x0954 ], [ 0x0962, 0x0963 ], [ 0x0981, 0x0981 ],
    [ 0x09BC, 0x09BC ], [ 0x09C1, 0x09C4 ], [ 0x09CD, 0x09CD ],
    [ 0x09E2, 0x09E3 ], [ 0x0A01, 0x0A02 ], [ 0x0A3C, 0x0A3C ],
    [ 0x0A41, 0x0A42 ], [ 0x0A47, 0x0A48 ], [ 0x0A4B, 0x0A4D ],
    [ 0x0A70, 0x0A71 ], [ 0x0A81, 0x0A82 ], [ 0x0ABC, 0x0ABC ],
    [ 0x0AC1, 0x0AC5 ], [ 0x0AC7, 0x0AC8 ], [ 0x0ACD, 0x0ACD ],
    [ 0x0AE2, 0x0AE3 ], [ 0x0B01, 0x0B01 ], [ 0x0B3C, 0x0B3C ],
    [ 0x0B3F, 0x0B3F ], [ 0x0B41, 0x0B43 ], [ 0x0B4D, 0x0B4D ],
    [ 0x0B56, 0x0B56 ], [ 0x0B82, 0x0B82 ], [ 0x0BC0, 0x0BC0 ],
    [ 0x0BCD, 0x0BCD ], [ 0x0C3E, 0x0C40 ], [ 0x0C46, 0x0C48 ],
    [ 0x0C4A, 0x0C4D ], [ 0x0C55, 0x0C56 ], [ 0x0CBC, 0x0CBC ],
    [ 0x0CBF, 0x0CBF ], [ 0x0CC6, 0x0CC6 ], [ 0x0CCC, 0x0CCD ],
    [ 0x0CE2, 0x0CE3 ], [ 0x0D41, 0x0D43 ], [ 0x0D4D, 0x0D4D ],
    [ 0x0DCA, 0x0DCA ], [ 0x0DD2, 0x0DD4 ], [ 0x0DD6, 0x0DD6 ],
    [ 0x0E31, 0x0E31 ], [ 0x0E34, 0x0E3A ], [ 0x0E47, 0x0E4E ],
    [ 0x0EB1, 0x0EB1 ], [ 0x0EB4, 0x0EB9 ], [ 0x0EBB, 0x0EBC ],
    [ 0x0EC8, 0x0ECD ], [ 0x0F18, 0x0F19 ], [ 0x0F35, 0x0F35 ],
    [ 0x0F37, 0x0F37 ], [ 0x0F39, 0x0F39 ], [ 0x0F71, 0x0F7E ],
    [ 0x0F80, 0x0F84 ], [ 0x0F86, 0x0F87 ], [ 0x0F90, 0x0F97 ],
    [ 0x0F99, 0x0FBC ], [ 0x0FC6, 0x0FC6 ], [ 0x102D, 0x1030 ],
    [ 0x1032, 0x1032 ], [ 0x1036, 0x1037 ], [ 0x1039, 0x1039 ],
    [ 0x1058, 0x1059 ], [ 0x1160, 0x11FF ], [ 0x135F, 0x135F ],
    [ 0x1712, 0x1714 ], [ 0x1732, 0x1734 ], [ 0x1752, 0x1753 ],
    [ 0x1772, 0x1773 ], [ 0x17B4, 0x17B5 ], [ 0x17B7, 0x17BD ],
    [ 0x17C6, 0x17C6 ], [ 0x17C9, 0x17D3 ], [ 0x17DD, 0x17DD ],
    [ 0x180B, 0x180D ], [ 0x18A9, 0x18A9 ], [ 0x1920, 0x1922 ],
    [ 0x1927, 0x1928 ], [ 0x1932, 0x1932 ], [ 0x1939, 0x193B ],
    [ 0x1A17, 0x1A18 ], [ 0x1B00, 0x1B03 ], [ 0x1B34, 0x1B34 ],
    [ 0x1B36, 0x1B3A ], [ 0x1B3C, 0x1B3C ], [ 0x1B42, 0x1B42 ],
    [ 0x1B6B, 0x1B73 ], [ 0x1DC0, 0x1DCA ], [ 0x1DFE, 0x1DFF ],
    [ 0x200B, 0x200F ], [ 0x202A, 0x202E ], [ 0x2060, 0x2063 ],
    [ 0x206A, 0x206F ], [ 0x20D0, 0x20EF ], [ 0x302A, 0x302F ],
    [ 0x3099, 0x309A ], [ 0xA806, 0xA806 ], [ 0xA80B, 0xA80B ],
    [ 0xA825, 0xA826 ], [ 0xFB1E, 0xFB1E ], [ 0xFE00, 0xFE0F ],
    [ 0xFE20, 0xFE23 ], [ 0xFEFF, 0xFEFF ], [ 0xFFF9, 0xFFFB ],
    [ 0x10A01, 0x10A03 ], [ 0x10A05, 0x10A06 ], [ 0x10A0C, 0x10A0F ],
    [ 0x10A38, 0x10A3A ], [ 0x10A3F, 0x10A3F ], [ 0x1D167, 0x1D169 ],
    [ 0x1D173, 0x1D182 ], [ 0x1D185, 0x1D18B ], [ 0x1D1AA, 0x1D1AD ],
    [ 0x1D242, 0x1D244 ], [ 0xE0001, 0xE0001 ], [ 0xE0020, 0xE007F ],
    [ 0xE0100, 0xE01EF ]
];

var DEFAULTS = {
  nul: 0,
  control: 0
};

var wcwidth_1 = function wcwidth(str) {
  return wcswidth(str, DEFAULTS)
};

var config = function(opts) {
  opts = defaults$1(opts || {}, DEFAULTS);
  return function wcwidth(str) {
    return wcswidth(str, opts)
  }
};

/*
 *  The following functions define the column width of an ISO 10646
 *  character as follows:
 *  - The null character (U+0000) has a column width of 0.
 *  - Other C0/C1 control characters and DEL will lead to a return value
 *    of -1.
 *  - Non-spacing and enclosing combining characters (general category
 *    code Mn or Me in the
 *    Unicode database) have a column width of 0.
 *  - SOFT HYPHEN (U+00AD) has a column width of 1.
 *  - Other format characters (general category code Cf in the Unicode
 *    database) and ZERO WIDTH
 *    SPACE (U+200B) have a column width of 0.
 *  - Hangul Jamo medial vowels and final consonants (U+1160-U+11FF)
 *    have a column width of 0.
 *  - Spacing characters in the East Asian Wide (W) or East Asian
 *    Full-width (F) category as
 *    defined in Unicode Technical Report #11 have a column width of 2.
 *  - All remaining characters (including all printable ISO 8859-1 and
 *    WGL4 characters, Unicode control characters, etc.) have a column
 *    width of 1.
 *  This implementation assumes that characters are encoded in ISO 10646.
*/

function wcswidth(str, opts) {
  if (typeof str !== 'string') return wcwidth(str, opts)

  var s = 0;
  for (var i = 0; i < str.length; i++) {
    var n = wcwidth(str.charCodeAt(i), opts);
    if (n < 0) return -1
    s += n;
  }

  return s
}

function wcwidth(ucs, opts) {
  // test for 8-bit control characters
  if (ucs === 0) return opts.nul
  if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0)) return opts.control

  // binary search in table of non-spacing characters
  if (bisearch(ucs)) return 0

  // if we arrive here, ucs is not a combining or C0/C1 control character
  return 1 +
      (ucs >= 0x1100 &&
       (ucs <= 0x115f ||                       // Hangul Jamo init. consonants
        ucs == 0x2329 || ucs == 0x232a ||
        (ucs >= 0x2e80 && ucs <= 0xa4cf &&
         ucs != 0x303f) ||                     // CJK ... Yi
        (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
        (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compatibility Ideographs
        (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
        (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compatibility Forms
        (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
        (ucs >= 0xffe0 && ucs <= 0xffe6) ||
        (ucs >= 0x20000 && ucs <= 0x2fffd) ||
        (ucs >= 0x30000 && ucs <= 0x3fffd)));
}

function bisearch(ucs) {
  var min = 0;
  var max = combining.length - 1;
  var mid;

  if (ucs < combining[0][0] || ucs > combining[max][1]) return false

  while (max >= min) {
    mid = Math.floor((min + max) / 2);
    if (ucs > combining[mid][1]) min = mid + 1;
    else if (ucs < combining[mid][0]) max = mid - 1;
    else return true
  }

  return false
}
wcwidth_1.config = config;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }



var main = function (input, breakAtLength) {

  var str = input.toString();
  var charArr = [].concat(_toConsumableArray(str));
  var index = 0;
  var indexOfLastFitChar = 0;
  var fittableLength = 0;

  while (charArr.length > 0) {

    var char = charArr.shift();
    var currentLength = fittableLength + wcwidth_1(char);

    if (currentLength <= breakAtLength) {
      indexOfLastFitChar = index;
      fittableLength = currentLength;
      index++;
    } else {
      break;
    }
  }

  //break after this character
  return indexOfLastFitChar;
};

function smartWrap(input, options) {
  //in case a template literal was passed that has newling characters,
  //split string by newlines and {} each resulting string
  const str = input.toString();
  const strArr = str.split("\n").map( string => {
    return wrap(string, options)
  });

  return strArr.join("\n")
}

const defaults$2 = () => {
  let obj = {};

  obj.breakword = false;
  obj.calculateSpaceRemaining = function(obj) {
    return Math.max(obj.lineLength - obj.spacesUsed - obj.paddingLeft - obj.paddingRight, 0)
  }; //function to set starting line length
  obj.currentLine = 0; //index of current line in 'lines[]'
  obj.input = []; //input string split by whitespace
  obj.lines = [
    []
  ]; //assume at least one line
  obj.minWidth = 2; //fallback to if width set too narrow
  obj.paddingLeft = 0;
  obj.paddingRight = 0;
  obj.errorChar = "�";
  obj.returnFormat = "string"; //or 'array'
  obj.skipPadding = false; //set to true when padding set too wide for line length
  obj.spacesUsed = 0; //spaces used so far on current line
  obj.splitAt = [" ","\t"];
  obj.trim = true;
  obj.width = 10;
  obj.words = [];

  return obj
};

function wrap(text,options) {

  options = options || {};

  if (options.errorChar) {
    // only allow a single errorChar
    options.errorChar = options.errorChar.split('')[0]; 

    // errorChar must not be wide character
    if (wcwidth_1(options.errorChar) > 1)
      throw new Error(`Error character cannot be a wide character (${options.errorChar})`)
  }
      
  let wrapObj = Object.assign({},defaults$2(),options);

  //make sure correct sign on padding
  wrapObj.paddingLeft = Math.abs(wrapObj.paddingLeft);
  wrapObj.paddingRight = Math.abs(wrapObj.paddingRight);

  wrapObj.lineLength = wrapObj.width -
   wrapObj.paddingLeft -
   wrapObj.paddingRight;

  if(wrapObj.lineLength < wrapObj.minWidth) {
    //skip padding if lineLength too narrow
    wrapObj.skipPadding = true;
    wrapObj.lineLength = wrapObj.minWidth;
  }

  //Break input into array of characters split by whitespace and/or tabs
  let wordArray = [];

  //to trim or not to trim...
  let modifiedText = text.toString();
  if(wrapObj.trim) {
    modifiedText = modifiedText.trim();
  }

  if(!wrapObj.breakword){
    //break string into words
    if(wrapObj.splitAt.indexOf("\t")!==-1) {
      //split at both spaces and tabs
      wordArray = modifiedText.split(/ |\t/i);
    } else{
      //split at whitespace
      wordArray = modifiedText.split(" ");
    }
  }
  else {
    //do not break string into words
    wordArray = [modifiedText];
  }

  //remove empty array elements
  wrapObj.words = wordArray.filter(val => {
    if (val.length > 0) {
      return true  
    }
  });

  let spaceRemaining, splitIndex, word;

  while(wrapObj.words.length > 0) {
    spaceRemaining = wrapObj.calculateSpaceRemaining(wrapObj);
    word = wrapObj.words.shift();
    let wordLength = wcwidth_1(word);

    switch(true) {
  
      // Too long for an empty line and is a single character
      case(wrapObj.lineLength < wordLength && [...word].length === 1):
          wrapObj.words.unshift(wrapObj.errorChar);
          break

       // Too long for an empty line, must be broken between 2 lines
      case(wrapObj.lineLength < wordLength):
        //Break it, then re-insert its parts into wrapObj.words
        //so can loop back to re-handle each word
        splitIndex = main(word,wrapObj.lineLength);
        let splitWord = [...word];
        wrapObj.words.unshift(splitWord.slice(0, splitIndex + 1).join(""));
        wrapObj.words.splice(1,0,splitWord.slice(splitIndex + 1).join("")); //+1 for substr fn
        break

      // Not enough space remaining in line, must be wrapped to next line
      case(spaceRemaining < wordLength):
        //add a new line to our array of lines
        wrapObj.lines.push([]);
        //note carriage to new line in counter
        wrapObj.currentLine++;
        //reset the spacesUsed to 0
        wrapObj.spacesUsed = 0;
        /* falls through */

      // Fits on current line
      default:
        //add word to line
        wrapObj.lines[wrapObj.currentLine].push(word);
        //reduce space remaining (add a space between words)
        wrapObj.spacesUsed += wordLength + 1;
    }
  }

  if(wrapObj.returnFormat === "array") {
    return wrapObj.lines
  } else{
    let lines = wrapObj.lines.map(function(line) {
      //restore spaces to line
      line = line.join(" ");
      //add padding to ends of line
      if(!wrapObj.skipPadding) {
        line = Array(wrapObj.paddingLeft+1).join(" ") +
             line +
             Array(wrapObj.paddingRight+1).join(" ");
      }
      return line
    });
    //return as string
    return lines.join("\n")
  }
}

var main$1 = smartWrap;

var format = createCommonjsModule(function (module, exports) {
module.exports.calculateLength = line => {
  // return stripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length
  return wcwidth_1(stripAnsi(line))
};


module.exports.wrapCellContent = (
  config,
  cellValue,
  columnIndex,
  cellOptions,
  rowType
) => {

  // ANSI chararacters that demarcate the start/end of a line
  const startAnsiRegexp = /^(\033\[[0-9;]*m)+/;
  const endAnsiRegexp = /(\033\[[0-9;]*m)+$/;

  // coerce cell value to string
  let string = cellValue.toString();

  // store matching ANSI characters
  let startMatches = string.match(startAnsiRegexp) || [""];

  // remove ANSI start-of-line chars
  string = string.replace(startAnsiRegexp, "");

  // store matching ANSI characters so can be later re-attached
  let endMatches = string.match(endAnsiRegexp) || [""];

  // remove ANSI end-of-line chars
  string = string.replace(endAnsiRegexp, "");

  let alignTgt;

  switch(rowType) {
    case("header"):
      alignTgt = "headerAlign";
      break
    case("body"):
      alignTgt = "align";
      break
    default:
      alignTgt = "footerAlign";
  }

  // equalize padding for centered lines
  if(cellOptions[alignTgt] === "center") {
    cellOptions.paddingLeft = cellOptions.paddingRight = Math.max(
      cellOptions.paddingRight,
      cellOptions.paddingLeft,
      0
    );
  }

  const columnWidth = config.table.columnWidths[columnIndex];

  // innerWidth is the width available for text within the cell
  const innerWidth = columnWidth
    - cellOptions.paddingLeft
    - cellOptions.paddingRight
    - config.GUTTER;

  if(typeof config.truncate === "string") {
    string = exports.truncate(string, cellOptions, innerWidth);
  } else {
    string = exports.wrap(string, cellOptions, innerWidth);
  }

  // format each line
  let strArr = string.split("\n").map( line => {
    line = line.trim();

    const lineLength = exports.calculateLength(line);

    // alignment
    if(lineLength < columnWidth) {
      let emptySpace = columnWidth - lineLength;

      switch(true) {
        case(cellOptions[alignTgt] === "center"):
          emptySpace --;
          let padBoth = Math.floor(emptySpace / 2),
            padRemainder = emptySpace % 2;
          line = Array(padBoth + 1).join(" ")
            + line
            + Array(padBoth + 1 + padRemainder).join(" ");
          break

        case(cellOptions[alignTgt] === "right"):
          line = Array(emptySpace - cellOptions.paddingRight).join(" ")
            + line
            + Array(cellOptions.paddingRight + 1).join(" ");
          break

        default:
          line = Array(cellOptions.paddingLeft + 1).join(" ")
            + line
            + Array(emptySpace - cellOptions.paddingLeft).join(" ");
      }
    }

    // put ANSI color codes BACK on the beginning and end of string
    return startMatches[0] + line + endMatches[0]
  });

  return {
    output: strArr,
    width: innerWidth
  }
};


module.exports.truncate = (string, cellOptions, maxWidth) => {
  const stringWidth = wcwidth_1(string);

  if(maxWidth < stringWidth) {
    // @todo give use option to decide if they want to break words on wrapping
    string = main$1(string, {
      width: maxWidth - cellOptions.truncate.length,
      breakword: true
    }).split("\n")[0];
    string = string + cellOptions.truncate;
  }

  return string
};


module.exports.wrap = (string, cellOptions, innerWidth) => {
  let outstring = main$1(string, {
    errorChar: cellOptions.defaultErrorValue,
    minWidth: 1,
    trim: true,
    width: innerWidth
  });

  return outstring
};


/**
 * Returns the widest cell give a collection of rows
 *
 * @param array rows
 * @param integer columnIndex
 * @returns integer
 */
module.exports.inferColumnWidth = (columnOptions, rows, columnIndex) => {

  let iterable;
  let widest = 0;

  // add a row that contains the header value, so we use that width too
  if(typeof columnOptions === "object" && columnOptions.value) {
    iterable = rows.slice();
    let z = new Array(iterable[0].length); // create a new empty row
    z[columnIndex] = columnOptions.value.toString();
    iterable.push(z);
  } else {
    // no header value, just use rows to derive max width
    iterable = rows;
  }

  iterable.forEach( row => {
    if(row[columnIndex] && row[columnIndex].toString().length > widest) {
      widest = wcwidth_1(row[columnIndex].toString());
    }
  });

  return widest
};


module.exports.getColumnWidths = (config, rows) => {

  // iterate over the header if we have it, iterate over the first row
  // if we do not (to step through the correct number of columns)
  let iterable = (config.table.header[0] && config.table.header[0].length > 0)
    ? config.table.header[0] : rows[0];

  let widths = iterable.map((column, columnIndex) => {
    let result;

    switch(true) {
      // column width specified in header
      case(typeof column === "object" && typeof column.width === "number"):
        result = column.width;
        break

      // global column width set in config
      case(config.width && config.width !== "auto"):
        result = config.width;
        break

      default:
      // 'auto' sets column width to longest value in initial data set
        let columnOptions = (config.table.header[0][columnIndex])
          ? config.table.header[0][columnIndex] : {};
        let measurableRows = (rows.length) ? rows : config.table.header[0];
        result = exports.inferColumnWidth(columnOptions, measurableRows, columnIndex);

        // add spaces for padding if not centered
        result = result + config.paddingLeft + config.paddingRight;
    }

    // add space for gutter
    result = result + config.GUTTER;

    return result
  });

  // calculate sum of all column widths (including marginLeft)
  let totalWidth = widths.reduce((prev, curr) => prev + curr);

  // if sum of all widths exceeds viewport, resize proportionately to fit
  if({} && {}.stdout && totalWidth > {}.stdout.columns) {
    // recalculate proportionately to fit
    let prop = ({}.stdout.columns - config.marginLeft) / totalWidth;

    prop = prop.toFixed(2) - 0.01;

    // when {}.stdout.columns is 0, width will be negative
    if (prop > 0) {
      widths = widths.map(value => Math.floor(prop * value));
    }
  }

  return widths
};
});
var format_1 = format.calculateLength;
var format_2 = format.wrapCellContent;
var format_3 = format.truncate;
var format_4 = format.wrap;
var format_5 = format.inferColumnWidth;
var format_6 = format.getColumnWidths;

var render = createCommonjsModule(function (module, exports) {
/**
 * Converts arrays of data into arrays of cell strings
 */
module.exports.stringifyData = (config, inputData) => {
  const sections = {
    header: [],
    body: [],
    footer: []
  };
  const marginLeft = Array(config.marginLeft + 1).join(" ");
  const borderStyle = config.borderCharacters[config.borderStyle];
  let borders = [];

  // support backwards compatibility cli-table's multiple constructor geometries
  // @TODO deprecate and support only a single format
  const constructorType = exports.getConstructorGeometry(inputData[0] || [], config);
  const rows = exports.coerceConstructor(config, inputData, constructorType);

  // when streaming values to tty-table, we don't want column widths to change
  // from one rows set to the next, so we save the first set of widths and reuse
  if(!commonjsGlobal.columnWidths) {
    commonjsGlobal.columnWidths = {};
  }

  if(commonjsGlobal.columnWidths[config.tableId]) {
    config.table.columnWidths = commonjsGlobal.columnWidths[config.tableId];
  } else {
    commonjsGlobal.columnWidths[config.tableId] = config.table.columnWidths = format.getColumnWidths(config, rows);
  }

  // stringify header cells
  // hide header if no column names or if specified in config
  switch (true) {
    case (config.showHeader !== null && !config.showHeader): // explicitly false, hide
      sections.header = [];
      break

    case (config.showHeader === true): // explicitly true, show
    case (!!config.table.header[0].find(obj => obj.value)): //  atleast one named column, show
      sections.header = config.table.header.map(row => {
        return exports.buildRow(config, row, "header", null, rows, inputData)
      });
      break

    default: // no named columns, hide
      sections.header = [];
  }

  // stringify body cells
  sections.body = rows.map((row, rowIndex) => {
    return exports.buildRow(config, row, "body", rowIndex, rows, inputData)
  });

  // stringify footer cells
  sections.footer = (config.table.footer instanceof Array && config.table.footer.length > 0) ? [config.table.footer] : [];

  sections.footer = sections.footer.map(row => {
    return exports.buildRow(config, row, "footer", null, rows, inputData)
  });

  // add borders
  // 0=header, 1=body, 2=footer
  for (let a=0; a<3; a++) {
    borders.push("");
    config.table.columnWidths.forEach(function (w, i, arr) {
      borders[a] += Array(w).join(borderStyle[a].h) +
        ((i+1 !== arr.length) ? borderStyle[a].j : borderStyle[a].r);
    });
    borders[a] = borderStyle[a].l + borders[a];
    borders[a] = borders[a].split("");
    borders[a][borders[a].length1] = borderStyle[a].r;
    borders[a] = borders[a].join("");
    // no trailing space on footer
    borders[a] = (a<2) ? `${marginLeft + borders[a]  }\n` : marginLeft + borders[a];
  }

  // top horizontal border
  let output = "";
  output += borders[0];

  // for each section (header,body,footer)
  Object.keys(sections).forEach((p, i) => {

    // for each row in the section
    while(sections[p].length) {

      let row = sections[p].shift();

      // if(row.length === 0) {break}

      row.forEach(line => {
        // vertical row borders
        output = `${output
          + marginLeft
          // left vertical border
          + borderStyle[1].v
          // join cells on vertical border
          + line.join(borderStyle[1].v)
          // right vertical border
          + borderStyle[1].v
          // end of line
        }\n`;
      });

      // bottom horizontal row border
      switch(true) {
      // skip if end of body and no footer
        case(sections[p].length === 0
             && i === 1
             && sections.footer.length === 0):
          break

        // skip if end of footer
        case(sections[p].length === 0
             && i === 2):
          break

        // skip if compact
        case(config.compact && p === "body" && !row.empty):
          break

        // skip if border style is "none"
        case(config.borderStyle === "none" && config.compact):
          break

        default:
          output += borders[1];
      }
    }
  });

  // bottom horizontal border
  output += borders[2];

  let finalOutput = Array(config.marginTop + 1).join("\n") + output;

  // record the height of the output
  config.height = finalOutput.split(/\r\n|\r|\n/).length;

  return finalOutput
};


module.exports.buildRow = (config, row, rowType, rowIndex, rowData, inputData) => {
  let minRowHeight = 0;

  // tag row as empty if empty
  // (used) for compact tables
  if(row.length === 0 && config.compact) {
    row.empty = true;
    return row
  }

  // force row to have correct number of columns
  let difL = config.table.columnWidths.length - row.length;

  if(difL > 0) {
    // add empty element to array
    row = row.concat(Array.apply(null, new Array(difL)).map(() => null));
  } else if (difL < 0) {
    // truncate array
    row.length = config.table.columnWidths.length;
  }

  // get row as array of cell arrays
  // can't use es5 row functions (map, forEach because i.e.
  // [1,,3] will only iterate 1,3
  let cArrs = [];
  let rowLength = row.length;

  for(let index=0; index<rowLength; index++) {

    let c = exports.buildCell(config, row[index], index, rowType, rowIndex, rowData, inputData);
    let cellArr = c.cellArr;

    if(rowType === "header") {
      config.table.columnInnerWidths.push(c.width);
    }

    minRowHeight = (minRowHeight < cellArr.length) ?
      cellArr.length : minRowHeight;

    cArrs.push(cellArr);
  }

  // adjust minRowHeight to reflect vertical row padding
  minRowHeight = (rowType === "header") ? minRowHeight :
    minRowHeight + (config.paddingBottom + config.paddingTop);

  // convert array of cell arrays to array of lines
  let lines = Array.apply(null, {length: minRowHeight})
    .map(Function.call, () => []);

  cArrs.forEach(function(cellArr, a) {
    let whiteline = Array(config.table.columnWidths[a]).join(" ");

    if(rowType ==="body") {
      // add whitespace for top padding
      for(let i=0; i<config.paddingTop; i++) {
        cellArr.unshift(whiteline);
      }

      // add whitespace for bottom padding
      for(let i=0; i<config.paddingBottom; i++) {
        cellArr.push(whiteline);
      }
    }
    for(let b=0; b<minRowHeight; b++) {
      lines[b].push((typeof cellArr[b] !== "undefined") ?
        cellArr[b] : whiteline);
    }
  });

  return lines
};


module.exports.buildCell = (config, cell, columnIndex, rowType, rowIndex, rowData, inputData) => {
  let cellValue;
  let cellOptions = Object.assign(
    {},
    config,
    (rowType === "body") ? config.columnSettings[columnIndex] : {}, // ignore columnSettings for footer
    (typeof cell === "object") ? cell : {}
  );

  if(rowType === "header") {
    config.table.columns.push(cellOptions);
    cellValue = cellOptions.alias || cellOptions.value || "";
  } else {
    // set cellValue
    switch(true) {
      case(typeof cell === "undefined" || cell === null):
        // replace undefined/null cell values with placeholder
        cellValue = (config.errorOnNull) ? config.defaultErrorValue : config.defaultValue;
        break

      case(typeof cell === "object" && typeof cell.value !== "undefined"):
        cellValue = cell.value;
        break

      case(typeof cell === "function"):
        cellValue = cell.bind({ style: style.color })(
          cellValue,
          columnIndex,
          rowIndex,
          rowData,
          inputData
        );
        break

      default:
        // cell is assumed to be a scalar
        cellValue = cell;
    }

    // run formatter
    if(typeof cellOptions.formatter === "function") {
      cellValue = cellOptions.formatter
        .bind({ style: style.color })(
          cellValue,
          columnIndex,
          rowIndex,
          rowData,
          inputData
        );
    }
  }

  // colorize cellValue
  cellValue = style.colorizeCell(cellValue, cellOptions, rowType);

  // textwrap cellValue
  let wrapObj  = format.wrapCellContent(config, cellValue, columnIndex, cellOptions, rowType);

  // return as array of lines
  return {
    cellArr: wrapObj.output,
    width: wrapObj.width
  }
};


/**
 * Check for a backwards compatible (cli-table) constructor
 */
module.exports.getConstructorGeometry = (row, config) => {
  let type;

  // rows passed as an object
  if(typeof row === "object" && !(row instanceof Array)) {
    let keys = Object.keys(row);

    if(config.adapter === "automattic") {
      // detected cross table
      let key = keys[0];

      if(row[key] instanceof Array) {
        type = "automattic-cross";
      } else {
        // detected vertical table
        type = "automattic-vertical";
      }
    } else {
      // detected horizontal table
      type = "o-horizontal";
    }
  } else {
    // rows passed as an array
    type = "a-horizontal";
  }

  return type
};


/**
 * Coerce backwards compatible constructor styles
 */
module.exports.coerceConstructor = (config, rows, constructorType) => {

  let output = [];
  switch(constructorType) {
    case("automattic-cross"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;

      output = rows.map(obj => {
        let arr = [];
        let key = Object.keys(obj)[0];
        arr.push(key);
        return arr.concat(obj[key])
      });
      break

    case("automattic-vertical"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;

      output = rows.map(function(value) {
        let key = Object.keys(value)[0];
        return [key, value[key]]
      });
      break

    case("o-horizontal"):
      // cell property names are specified in header columns
      if (config.table.header[0].length
        && config.table.header[0].every(obj => obj.value)) {
        output = rows.map(row => config.table.header[0]
          .map(obj => row[obj.value]));
      } // eslint-disable-line brace-style
      // no property names given, default to object property order
      else {
        output = rows.map(obj => Object.values(obj));
      }
      break

    case("a-horizontal"):
      output = rows;
      break
  }

  return output
};


// @TODO For rotating horizontal data into a vertical table
// assumes all rows are same length
module.exports.verticalizeMatrix = (config, inputArray) => {

  // grow to # arrays equal to number of columns in input array
  let outputArray = [];
  let headers = config.table.columns;

  // create a row for each heading, and prepend the row
  // with the heading name
  headers.forEach(name => outputArray.push([name]));

  inputArray.forEach(row => {
    row.forEach((element, index) => outputArray[index].push(element));
  });

  return outputArray
};
});
var render_1 = render.stringifyData;
var render_2 = render.buildRow;
var render_3 = render.buildCell;
var render_4 = render.getConstructorGeometry;
var render_5 = render.coerceConstructor;
var render_6 = render.verticalizeMatrix;

let counter = 0;


/**
* @class Table
* @param {array} header                          - [See example](#example-usage)
* @param {object} header.column                  - Column options
* @param {string} header.column.alias            - Alternate header column name
* @param {string} header.column.align            - default: "center"
* @param {string} header.column.color            - default: terminal default color
* @param {string} header.column.footerAlign      - default: "center"
* @param {string} header.column.footerColor      - default: terminal default color
* @param {function(cellValue, columnIndex, rowIndex, rowData, inputData)</code} header.column.formatter      - Runs a callback on each cell value in the parent column
* @param {string} header.column.headerAlign      - default: "center"
* @param {string} header.column.headerColor      - default: terminal's default color
* @param {number} header.column.marginLeft       - default: 0
* @param {number} header.column.marginTop        - default: 0
* @param {string|number} header.column.width     - default: "auto"
* @param {number} header.column.paddingBottom    - default: 0
* @param {number} header.column.paddingLeft      - default: 1
* @param {number} header.column.paddingRight     - default: 1
* @param {number} header.column.paddingTop       - default: 0
*
* @param {array} rows                      - [See example](#example-usage)
*
* @param {object} options                  - Table options
* @param {string} options.borderStyle      - default: "solid". options: "solid", "dashed", "none"
* @param {object} options.borderCharacters  - [See @note](#note)
* @param {string} options.borderColor      - default: terminal's default color
* @param {boolean} options.compact      - default: false
* Removes horizontal lines when true.
* @param {mixed} options.defaultErrorValue - default: '�'
* @param {mixed} options.defaultValue - default: '?'
* @param {boolean} options.errorOnNull    - default: false
* @param {mixed} options.truncate - default: false
* <br/>
* When this property is set to a string, cell contents will be truncated by that string instead of wrapped when they extend beyond of the width of the cell.
* <br/>
* For example if:
* <br/>
* <code>"truncate":"..."</code>
* <br/>
* the cell will be truncated with "..."

* @returns {Table}

* @example
* ```js
* let Table = require('tty-table');
* let t1 = Table(header,rows,options);
* console.log(t1.render());
* ```
*
*/
const Factory = function(paramsArr) {

  let _configKey = Symbol["config"];
  let header = [];
  let body = [];
  let footer = [];
  let options = {};

  // handle different parameter scenarios
  switch(true) {

    // header, rows, footer, and options
    case(paramsArr.length === 4):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows (body)
      footer = paramsArr[2];
      options = paramsArr[3];
      break

    // header, rows, footer
    case(paramsArr.length === 3 && paramsArr[2] instanceof Array):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      footer = paramsArr[2];
      break

    // header, rows, options
    case(paramsArr.length === 3 && typeof paramsArr[2] === "object"):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      options = paramsArr[2];
      break

    // header, rows            (rows, footer is not an option)
    case(paramsArr.length === 2 && paramsArr[1] instanceof Array):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      break

    // rows, options
    case(paramsArr.length === 2 && typeof paramsArr[1] === "object"):
      body.push(...paramsArr[0]); // creates new array to store our rows
      options = paramsArr[1];
      break

    // rows
    case(paramsArr.length === 1 && paramsArr[0] instanceof Array):
      body.push(...paramsArr[0]);
      break

    // adapter called: i.e. `require('tty-table')('automattic-cli')`
    case(paramsArr.length === 1 && typeof paramsArr[0] === "string"):
      return commonjsRequire(`../adapters/${  paramsArr[0]}`)

    default:
      console.log("Error: Bad params. \nSee docs at github.com/tecfu/tty-table")
      ()();
  }

  // For "deep" copy, use JSON.parse
  const cloneddefaults = JSON.parse(JSON.stringify(defaults_1));
  let config = Object.assign({}, cloneddefaults, options);

  // backfixes for shortened option names
  config.align = config.alignment || config.align;
  config.headerAlign = config.headerAlignment || config.headerAlign;

  // for truncate true is equivalent to empty string
  if(config.truncate === true) config.truncate = "";

  // if borderColor customized, color the border character set
  if(config.borderColor) {
    config.borderCharacters[config.borderStyle] =
      config.borderCharacters[config.borderStyle].map(function(obj) {
        Object.keys(obj).forEach(function(key) {
          obj[key] = style.color(obj[key], config.borderColor);
        });
        return obj
      });
  }

  // save a copy for merging columnSettings into cell options
  config.columnSettings = header.slice(0);

  // header
  config.table.header = header;

  // match header geometry with body array
  config.table.header = [config.table.header];

  // footer
  config.table.footer = footer;

  // counting table enables fixed column widths for streams,
  // variable widths for multiple tables simulateously
  if(config.terminalAdapter !== true) {
    counter++; // fix columnwidths for streams
  }
  config.tableId = counter;

  // create a new object with an Array prototype
  let tableObject = Object.create(body);

  // save configuration to new object
  tableObject[_configKey] = config;

  /**
   * Add method to render table to a string
   * @returns {String}
   * @memberof Table
   * @example
   * ```js
   * let str = t1.render();
   * console.log(str); //outputs table
   * ```
  */
  tableObject.render = function() {
    let output = render.stringifyData(this[_configKey], this.slice(0));  // get string output
    tableObject.height = this[_configKey].height;
    return output
  };

  return tableObject
};


var factory = function() {
  return new Factory(arguments)
};

var defaultAdapter = factory;

export default defaultAdapter;
