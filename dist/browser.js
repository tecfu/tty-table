"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// adapters/automattic-cli-table.js
var require_automattic_cli_table = __commonJS({
  "adapters/automattic-cli-table.js"(exports2, module2) {
    "use strict";
    var Factory2 = require_factory();
    var Table = function(options) {
      options = options || {};
      options.adapter = "automattic";
      var header = [];
      if (options.head && options.head instanceof Array) {
        options.head.forEach(function(val) {
          header.push({
            value: val
          });
        });
      }
      if (options.colWidths) {
        options.colWidths.forEach(function(val, i) {
          header[i].width = val;
        });
      }
      if (options.colAligns) {
        options.colAligns.forEach(function(val, i) {
          header[i].align = val;
          header[i].headerAlign = val;
        });
      }
      options.style = options.style || {};
      if (options.style["padding-left"]) {
        options.paddingLeft = options.style["padding-left"];
      }
      if (options.style["padding-right"]) {
        options.paddingRight = options.style["padding-right"];
      }
      if (options.style.head && options.style.head instanceof Array) {
        options.headerColor = options.style.head[0];
      }
      if (options.style.body && options.style.body instanceof Array) {
        options.color = options.style.body[0];
      }
      if (options.style.compact) {
        options.compact = true;
      }
      const t = Factory2(header, [], [], options);
      t.toString = t.render;
      return t;
    };
    module2.exports = Table;
  }
});

// adapters/default-adapter.js
var require_default_adapter = __commonJS({
  "adapters/default-adapter.js"(exports2, module2) {
    "use strict";
    var Factory2 = require_factory();
    module2.exports = Factory2;
  }
});

// src/style.js
var require_style = __commonJS({
  "src/style.js"(exports2, module2) {
    "use strict";
    var chalk = require("chalk");
    var kleur = require("kleur");
    var colorLib = process && process.stdout ? chalk : kleur;
    var stripAnsi = require("strip-ansi");
    module2.exports.style = (str, ...colors) => {
      const out = colors.reduce(function(input, color) {
        return colorLib[color](input);
      }, str);
      return out;
    };
    module2.exports.styleEachChar = (str, ...colors) => {
      const chars = [...stripAnsi(str)];
      const out = chars.reduce((prev, current) => {
        const coded = colors.reduce((input, color) => {
          return colorLib[color](input);
        }, current);
        return prev + coded;
      }, "");
      return out;
    };
    module2.exports.resetStyle = function(str) {
      this.configure({ reset: true });
      return stripAnsi(str);
    };
    module2.exports.colorizeCell = (str, cellOptions, rowType) => {
      let color = false;
      switch (true) {
        case rowType === "body":
          color = cellOptions.color || color;
          break;
        case rowType === "header":
          color = cellOptions.headerColor || color;
          break;
        default:
          color = cellOptions.footerColor || color;
      }
      if (color) {
        str = exports2.style(str, color);
      }
      return str;
    };
    module2.exports.isColorEnabled = () => {
      return process && process.stdout ? colorLib.level > 0 : colorLib.enabled;
    };
  }
});

// adapters/terminal-adapter.js
var require_terminal_adapter = __commonJS({
  "adapters/terminal-adapter.js"() {
    "use strict";
    var path = require("path");
    var fs = require("fs");
    var csv = require("csv");
    var style = require_style().style;
    var yargs = require("yargs");
    yargs.epilog("Copyright github.com/tecfu 2018");
    yargs.option("config", {
      describe: "Specify the configuration for your table."
    });
    yargs.option("csv-delimiter", {
      describe: "Set the field delimiter. One character only.",
      default: ","
    });
    yargs.option("csv-escape", {
      describe: "Set the escape character. One character only."
    });
    yargs.option("csv-rowDelimiter", {
      describe: 'String used to delimit record rows. You can also use a special constant: "auto","unix","max","windows","unicode".',
      default: "\n"
    });
    yargs.option("format", {
      describe: "Set input data format",
      choices: ["json", "csv"],
      default: "csv"
    });
    yargs.option("options\u2010*", {
      describe: "Specify an optional setting where * is the setting name. See README.md for a complete list."
    });
    yargs = yargs.help("h").argv;
    var emitError = function(type, detail) {
      console.log(`
${style(type, "white", "bgRed")}

${detail}`);
      process.exit(1);
    };
    var alreadyRendered = false;
    var previousHeight = 0;
    var dataFormat = "csv";
    switch (true) {
      case typeof yargs.format === "undefined":
        break;
      case yargs.format.toString().match(/json/i) !== null:
        dataFormat = "json";
        break;
      default:
    }
    var options = {};
    Object.keys(yargs).forEach(function(key) {
      const keyParts = key.split("-");
      if (keyParts[0] === "options") {
        options[keyParts[1]] = yargs[key];
      }
    });
    var header = [];
    if (yargs.header) {
      if (!fs.existsSync(path.resolve(yargs.header))) {
        emitError(
          "Invalid file path",
          `Cannot find config file at: ${yargs.header}.`
        );
      }
      header = require(path.resolve(yargs.header));
    }
    var runTable = function(header2, body) {
      const Table = require_factory();
      options.terminalAdapter = true;
      const t1 = Table(header2, body, options);
      console.log("\x1B[?25l");
      if (alreadyRendered) {
        console.log(`\x1B[${previousHeight + 3}A`);
        console.log("\x1B[0J");
      } else {
        alreadyRendered = true;
      }
      console.log(t1.render());
      previousHeight = t1.height;
    };
    var chunks = [];
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function(chunk) {
      chunks.push(chunk);
    });
    process.stdin.on("end", function() {
      const stdin = chunks.join("");
      switch (true) {
        case dataFormat === "json":
          let data;
          try {
            data = JSON.parse(stdin);
          } catch (e) {
            emitError(
              "JSON parse error",
              "Please check to make sure that your input data consists of JSON or specify a different format with the --format flag."
            );
          }
          runTable(header, data);
          break;
        default:
          const formatterOptions = {};
          Object.keys(yargs).forEach(function(key) {
            if (key.slice(0, 4) === "csv-" && typeof yargs[key] !== "undefined") {
              formatterOptions[key.slice(4)] = yargs[key];
            }
          });
          csv.parse(stdin, formatterOptions, function(err, data2) {
            if (err || typeof data2 === "undefined") {
              emitError(
                "CSV parse error",
                "Please check to make sure that your input data consists of valid comma separated values or specify a different format with the --format flag."
              );
            }
            runTable(header, data2);
          });
      }
    });
    if (process.platform === "win32") {
      const rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.on("SIGINT", function() {
        process.emit("SIGINT");
      });
    }
    process.on("SIGINT", function() {
      process.exit();
    });
    process.on("exit", function() {
      console.log("\x1B[?25h");
    });
  }
});

// require("../adapters/**/*") in src/factory.js
var globRequire_adapters;
var init_ = __esm({
  'require("../adapters/**/*") in src/factory.js'() {
    globRequire_adapters = __glob({
      "../adapters/automattic-cli-table.js": () => require_automattic_cli_table(),
      "../adapters/default-adapter.js": () => require_default_adapter(),
      "../adapters/terminal-adapter.js": () => require_terminal_adapter()
    });
  }
});

// src/defaults.js
var require_defaults = __commonJS({
  "src/defaults.js"(exports2, module2) {
    "use strict";
    var defaults = {
      borderCharacters: {
        invisible: [
          { v: " ", l: " ", j: " ", h: " ", r: " " },
          { v: " ", l: " ", j: " ", h: " ", r: " " },
          { v: " ", l: " ", j: " ", h: " ", r: " " }
        ],
        solid: [
          { v: "\u2502", l: "\u250C", j: "\u252C", h: "\u2500", r: "\u2510" },
          { v: "\u2502", l: "\u251C", j: "\u253C", h: "\u2500", r: "\u2524" },
          { v: "\u2502", l: "\u2514", j: "\u2534", h: "\u2500", r: "\u2518" }
        ],
        dashed: [
          { v: "|", l: "+", j: "+", h: "-", r: "+" },
          { v: "|", l: "+", j: "+", h: "-", r: "+" },
          { v: "|", l: "+", j: "+", h: "-", r: "+" }
        ],
        none: [
          { v: "", l: "", j: "", h: "", r: "" },
          { v: "", l: "", j: "", h: "", r: "" },
          { v: "", l: "", j: "", h: "", r: "" }
        ]
      },
      align: "center",
      borderColor: null,
      borderStyle: "solid",
      color: false,
      COLUMNS: 80,
      // if !process.stdout.columns assume redirecting to write stream 80 columns is VT200 standard
      compact: false,
      defaultErrorValue: "\uFFFD",
      defaultValue: "",
      errorOnNull: false,
      FIXED_WIDTH: false,
      footerAlign: "center",
      footerColor: false,
      formatter: null,
      headerAlign: "center",
      headerColor: "yellow",
      isNull: false,
      // undocumented cell setting
      marginLeft: 2,
      marginTop: 1,
      paddingBottom: 0,
      paddingLeft: 1,
      paddingRight: 1,
      paddingTop: 0,
      showHeader: null,
      // undocumented
      truncate: false,
      width: "100%",
      GUTTER: 1,
      // undocumented
      columnSettings: [],
      // save so cell options can be merged into column options
      table: {
        body: "",
        columnInnerWidths: [],
        columnWidths: [],
        columns: [],
        footer: "",
        header: "",
        // post-rendered strings.
        height: 0,
        typeLocked: false
        // once a table type is selected can't switch
      }
    };
    defaults.borderCharacters["0"] = defaults.borderCharacters.none;
    defaults.borderCharacters["1"] = defaults.borderCharacters.solid;
    defaults.borderCharacters["2"] = defaults.borderCharacters.dashed;
    module2.exports = defaults;
  }
});

// node_modules/clone/clone.js
var require_clone = __commonJS({
  "node_modules/clone/clone.js"(exports2, module2) {
    "use strict";
    var clone = (function() {
      "use strict";
      function clone2(parent, circular, depth, prototype) {
        var filter;
        if (typeof circular === "object") {
          depth = circular.depth;
          prototype = circular.prototype;
          filter = circular.filter;
          circular = circular.circular;
        }
        var allParents = [];
        var allChildren = [];
        var useBuffer = typeof Buffer != "undefined";
        if (typeof circular == "undefined")
          circular = true;
        if (typeof depth == "undefined")
          depth = Infinity;
        function _clone(parent2, depth2) {
          if (parent2 === null)
            return null;
          if (depth2 == 0)
            return parent2;
          var child;
          var proto;
          if (typeof parent2 != "object") {
            return parent2;
          }
          if (clone2.__isArray(parent2)) {
            child = [];
          } else if (clone2.__isRegExp(parent2)) {
            child = new RegExp(parent2.source, __getRegExpFlags(parent2));
            if (parent2.lastIndex) child.lastIndex = parent2.lastIndex;
          } else if (clone2.__isDate(parent2)) {
            child = new Date(parent2.getTime());
          } else if (useBuffer && Buffer.isBuffer(parent2)) {
            if (Buffer.allocUnsafe) {
              child = Buffer.allocUnsafe(parent2.length);
            } else {
              child = new Buffer(parent2.length);
            }
            parent2.copy(child);
            return child;
          } else {
            if (typeof prototype == "undefined") {
              proto = Object.getPrototypeOf(parent2);
              child = Object.create(proto);
            } else {
              child = Object.create(prototype);
              proto = prototype;
            }
          }
          if (circular) {
            var index = allParents.indexOf(parent2);
            if (index != -1) {
              return allChildren[index];
            }
            allParents.push(parent2);
            allChildren.push(child);
          }
          for (var i in parent2) {
            var attrs;
            if (proto) {
              attrs = Object.getOwnPropertyDescriptor(proto, i);
            }
            if (attrs && attrs.set == null) {
              continue;
            }
            child[i] = _clone(parent2[i], depth2 - 1);
          }
          return child;
        }
        return _clone(parent, depth);
      }
      clone2.clonePrototype = function clonePrototype(parent) {
        if (parent === null)
          return null;
        var c = function() {
        };
        c.prototype = parent;
        return new c();
      };
      function __objToStr(o) {
        return Object.prototype.toString.call(o);
      }
      ;
      clone2.__objToStr = __objToStr;
      function __isDate(o) {
        return typeof o === "object" && __objToStr(o) === "[object Date]";
      }
      ;
      clone2.__isDate = __isDate;
      function __isArray(o) {
        return typeof o === "object" && __objToStr(o) === "[object Array]";
      }
      ;
      clone2.__isArray = __isArray;
      function __isRegExp(o) {
        return typeof o === "object" && __objToStr(o) === "[object RegExp]";
      }
      ;
      clone2.__isRegExp = __isRegExp;
      function __getRegExpFlags(re) {
        var flags = "";
        if (re.global) flags += "g";
        if (re.ignoreCase) flags += "i";
        if (re.multiline) flags += "m";
        return flags;
      }
      ;
      clone2.__getRegExpFlags = __getRegExpFlags;
      return clone2;
    })();
    if (typeof module2 === "object" && module2.exports) {
      module2.exports = clone;
    }
  }
});

// node_modules/defaults/index.js
var require_defaults2 = __commonJS({
  "node_modules/defaults/index.js"(exports2, module2) {
    "use strict";
    var clone = require_clone();
    module2.exports = function(options, defaults) {
      options = options || {};
      Object.keys(defaults).forEach(function(key) {
        if (typeof options[key] === "undefined") {
          options[key] = clone(defaults[key]);
        }
      });
      return options;
    };
  }
});

// node_modules/wcwidth/combining.js
var require_combining = __commonJS({
  "node_modules/wcwidth/combining.js"(exports2, module2) {
    "use strict";
    module2.exports = [
      [768, 879],
      [1155, 1158],
      [1160, 1161],
      [1425, 1469],
      [1471, 1471],
      [1473, 1474],
      [1476, 1477],
      [1479, 1479],
      [1536, 1539],
      [1552, 1557],
      [1611, 1630],
      [1648, 1648],
      [1750, 1764],
      [1767, 1768],
      [1770, 1773],
      [1807, 1807],
      [1809, 1809],
      [1840, 1866],
      [1958, 1968],
      [2027, 2035],
      [2305, 2306],
      [2364, 2364],
      [2369, 2376],
      [2381, 2381],
      [2385, 2388],
      [2402, 2403],
      [2433, 2433],
      [2492, 2492],
      [2497, 2500],
      [2509, 2509],
      [2530, 2531],
      [2561, 2562],
      [2620, 2620],
      [2625, 2626],
      [2631, 2632],
      [2635, 2637],
      [2672, 2673],
      [2689, 2690],
      [2748, 2748],
      [2753, 2757],
      [2759, 2760],
      [2765, 2765],
      [2786, 2787],
      [2817, 2817],
      [2876, 2876],
      [2879, 2879],
      [2881, 2883],
      [2893, 2893],
      [2902, 2902],
      [2946, 2946],
      [3008, 3008],
      [3021, 3021],
      [3134, 3136],
      [3142, 3144],
      [3146, 3149],
      [3157, 3158],
      [3260, 3260],
      [3263, 3263],
      [3270, 3270],
      [3276, 3277],
      [3298, 3299],
      [3393, 3395],
      [3405, 3405],
      [3530, 3530],
      [3538, 3540],
      [3542, 3542],
      [3633, 3633],
      [3636, 3642],
      [3655, 3662],
      [3761, 3761],
      [3764, 3769],
      [3771, 3772],
      [3784, 3789],
      [3864, 3865],
      [3893, 3893],
      [3895, 3895],
      [3897, 3897],
      [3953, 3966],
      [3968, 3972],
      [3974, 3975],
      [3984, 3991],
      [3993, 4028],
      [4038, 4038],
      [4141, 4144],
      [4146, 4146],
      [4150, 4151],
      [4153, 4153],
      [4184, 4185],
      [4448, 4607],
      [4959, 4959],
      [5906, 5908],
      [5938, 5940],
      [5970, 5971],
      [6002, 6003],
      [6068, 6069],
      [6071, 6077],
      [6086, 6086],
      [6089, 6099],
      [6109, 6109],
      [6155, 6157],
      [6313, 6313],
      [6432, 6434],
      [6439, 6440],
      [6450, 6450],
      [6457, 6459],
      [6679, 6680],
      [6912, 6915],
      [6964, 6964],
      [6966, 6970],
      [6972, 6972],
      [6978, 6978],
      [7019, 7027],
      [7616, 7626],
      [7678, 7679],
      [8203, 8207],
      [8234, 8238],
      [8288, 8291],
      [8298, 8303],
      [8400, 8431],
      [12330, 12335],
      [12441, 12442],
      [43014, 43014],
      [43019, 43019],
      [43045, 43046],
      [64286, 64286],
      [65024, 65039],
      [65056, 65059],
      [65279, 65279],
      [65529, 65531],
      [68097, 68099],
      [68101, 68102],
      [68108, 68111],
      [68152, 68154],
      [68159, 68159],
      [119143, 119145],
      [119155, 119170],
      [119173, 119179],
      [119210, 119213],
      [119362, 119364],
      [917505, 917505],
      [917536, 917631],
      [917760, 917999]
    ];
  }
});

// node_modules/wcwidth/index.js
var require_wcwidth = __commonJS({
  "node_modules/wcwidth/index.js"(exports2, module2) {
    "use strict";
    var defaults = require_defaults2();
    var combining = require_combining();
    var DEFAULTS = {
      nul: 0,
      control: 0
    };
    module2.exports = function wcwidth2(str) {
      return wcswidth(str, DEFAULTS);
    };
    module2.exports.config = function(opts) {
      opts = defaults(opts || {}, DEFAULTS);
      return function wcwidth2(str) {
        return wcswidth(str, opts);
      };
    };
    function wcswidth(str, opts) {
      if (typeof str !== "string") return wcwidth(str, opts);
      var s = 0;
      for (var i = 0; i < str.length; i++) {
        var n = wcwidth(str.charCodeAt(i), opts);
        if (n < 0) return -1;
        s += n;
      }
      return s;
    }
    function wcwidth(ucs, opts) {
      if (ucs === 0) return opts.nul;
      if (ucs < 32 || ucs >= 127 && ucs < 160) return opts.control;
      if (bisearch(ucs)) return 0;
      return 1 + (ucs >= 4352 && (ucs <= 4447 || // Hangul Jamo init. consonants
      ucs == 9001 || ucs == 9002 || ucs >= 11904 && ucs <= 42191 && ucs != 12351 || // CJK ... Yi
      ucs >= 44032 && ucs <= 55203 || // Hangul Syllables
      ucs >= 63744 && ucs <= 64255 || // CJK Compatibility Ideographs
      ucs >= 65040 && ucs <= 65049 || // Vertical forms
      ucs >= 65072 && ucs <= 65135 || // CJK Compatibility Forms
      ucs >= 65280 && ucs <= 65376 || // Fullwidth Forms
      ucs >= 65504 && ucs <= 65510 || ucs >= 131072 && ucs <= 196605 || ucs >= 196608 && ucs <= 262141));
    }
    function bisearch(ucs) {
      var min = 0;
      var max = combining.length - 1;
      var mid;
      if (ucs < combining[0][0] || ucs > combining[max][1]) return false;
      while (max >= min) {
        mid = Math.floor((min + max) / 2);
        if (ucs > combining[mid][1]) min = mid + 1;
        else if (ucs < combining[mid][0]) max = mid - 1;
        else return true;
      }
      return false;
    }
  }
});

// src/format.js
var require_format = __commonJS({
  "src/format.js"(exports2, module2) {
    "use strict";
    var stripAnsi = require("strip-ansi");
    var smartwrap = require("smartwrap");
    var wcwidth = require_wcwidth();
    var addPadding = (config, width) => {
      return width + config.paddingLeft + config.paddingRight;
    };
    var getMaxLength = (columnOptions, rows, columnIndex) => {
      let iterable;
      if (columnOptions && (columnOptions.value || columnOptions.alias)) {
        let val = columnOptions.alias || columnOptions.value;
        val = val.toString();
        const headerRow = Array(rows[0].length);
        headerRow[columnIndex] = val;
        iterable = rows.slice();
        iterable.push(headerRow);
      } else {
        iterable = rows;
      }
      const widest = iterable.reduce((prev, row) => {
        if (row[columnIndex]) {
          const value = row[columnIndex].value ? row[columnIndex].value : row[columnIndex];
          const width = Math.max(
            ...stripAnsi(value.toString()).split(/[\n\r]/).map((s) => wcwidth(s))
          );
          return width > prev ? width : prev;
        }
        return prev;
      }, 0);
      return widest;
    };
    var getAvailableWidth = (config) => {
      if (process && (process.stdout && process.stdout.columns || process.env && process.env.COLUMNS)) {
        let viewport = process.stdout && process.stdout.columns ? process.stdout.columns : process.env.COLUMNS;
        viewport = viewport - config.marginLeft;
        if (config.width !== "auto" && /^\d+%$/.test(config.width)) {
          return Math.min(1, config.width.slice(0, -1) * 0.01) * viewport;
        }
        if (config.width !== "auto" && /^\d+$/.test(config.width)) {
          config.FIXED_WIDTH = true;
          return config.width;
        }
        return viewport;
      }
      if (typeof window !== "undefined") return window.innerWidth;
      return config.COLUMNS - config.marginLeft;
    };
    module2.exports.getStringLength = (string) => {
      return wcwidth(stripAnsi(string));
    };
    module2.exports.wrapCellText = (config, cellValue, columnIndex, cellOptions, rowType) => {
      const startAnsiRegexp = /^(\033\[[0-9;]*m)+/;
      const endAnsiRegexp = /(\033\[[0-9;]*m)+$/;
      let string = cellValue.toString();
      const startMatches = string.match(startAnsiRegexp) || [""];
      string = string.replace(startAnsiRegexp, "");
      const endMatches = string.match(endAnsiRegexp) || [""];
      string = string.replace(endAnsiRegexp, "");
      let alignTgt;
      switch (rowType) {
        case "header":
          alignTgt = "headerAlign";
          break;
        case "body":
          alignTgt = "align";
          break;
        default:
          alignTgt = "footerAlign";
      }
      if (cellOptions[alignTgt] === "center") {
        cellOptions.paddingLeft = cellOptions.paddingRight = Math.max(
          cellOptions.paddingRight,
          cellOptions.paddingLeft,
          0
        );
      }
      const columnWidth = config.table.columnWidths[columnIndex];
      const innerWidth = columnWidth - cellOptions.paddingLeft - cellOptions.paddingRight - config.GUTTER;
      if (typeof config.truncate === "string") {
        string = exports2.truncate(string, cellOptions, innerWidth);
      } else {
        string = exports2.wrap(string, cellOptions, innerWidth);
      }
      const cell = string.split("\n").map((line) => {
        line = line.trim();
        const lineLength = exports2.getStringLength(line);
        if (lineLength < columnWidth) {
          let emptySpace = columnWidth - lineLength;
          switch (true) {
            case cellOptions[alignTgt] === "center":
              emptySpace--;
              const padBoth = Math.floor(emptySpace / 2);
              const padRemainder = emptySpace % 2;
              line = Array(padBoth + 1).join(" ") + line + Array(padBoth + 1 + padRemainder).join(" ");
              break;
            case cellOptions[alignTgt] === "right":
              line = Array(emptySpace - cellOptions.paddingRight).join(" ") + line + Array(cellOptions.paddingRight + 1).join(" ");
              break;
            default:
              line = Array(cellOptions.paddingLeft + 1).join(" ") + line + Array(emptySpace - cellOptions.paddingLeft).join(" ");
          }
        }
        return startMatches[0] + line + endMatches[0];
      });
      return { cell, innerWidth };
    };
    module2.exports.truncate = (string, cellOptions, maxWidth) => {
      const stringWidth = wcwidth(string);
      if (maxWidth < stringWidth) {
        string = smartwrap(string, {
          width: maxWidth - cellOptions.truncate.length,
          breakword: true
        }).split("\n")[0];
        string = string + cellOptions.truncate;
      }
      return string;
    };
    module2.exports.wrap = (string, cellOptions, innerWidth) => {
      const outstring = smartwrap(string, {
        errorChar: cellOptions.defaultErrorValue,
        minWidth: 1,
        trim: true,
        width: innerWidth
      });
      return outstring;
    };
    module2.exports.getColumnWidths = (config, rows) => {
      const availableWidth = getAvailableWidth(config);
      const iterable = config.table.header[0] && config.table.header[0].length > 0 ? config.table.header[0] : rows[0];
      let widths = iterable.map((column, columnIndex) => {
        let result;
        switch (true) {
          // column width is a percentage of table width specified in column header
          case (typeof column === "object" && /^\d+%$/.test(column.width)):
            result = column.width.slice(0, -1) * 0.01 * availableWidth;
            result = addPadding(config, result);
            break;
          // column width is specified in column header
          case (typeof column === "object" && /^\d+$/.test(column.width)):
            result = column.width;
            break;
          // 'auto' sets column width to its longest value in the initial data set
          default:
            const columnOptions = config.table.header[0][columnIndex] ? config.table.header[0][columnIndex] : {};
            const measurableRows = rows.length ? rows : config.table.header[0];
            result = getMaxLength(columnOptions, measurableRows, columnIndex);
            result = addPadding(config, result);
        }
        result = result + config.GUTTER;
        return result;
      });
      const totalWidth = widths.reduce((prev, current) => prev + current);
      if (totalWidth > availableWidth || config.FIXED_WIDTH) {
        const proportion = (availableWidth / totalWidth).toFixed(2) - 0.01;
        const relativeWidths = widths.map((value) => Math.max(2, Math.floor(proportion * value)));
        if (config.FIXED_WIDTH) return relativeWidths;
        if (proportion > 0) {
          const totalRelativeWidths = relativeWidths.reduce((prev, current) => prev + current);
          widths = totalRelativeWidths < totalWidth ? relativeWidths : widths;
        }
      } else {
        widths = widths.map(Math.floor);
      }
      return widths;
    };
  }
});

// src/render.js
var require_render = __commonJS({
  "src/render.js"(exports2, module2) {
    "use strict";
    var Style = require_style();
    var Format = require_format();
    var stripAnsi = require("strip-ansi");
    module2.exports.stringifyData = (config, inputData) => {
      const sections = {
        header: [],
        body: [],
        footer: []
      };
      const marginLeft = Array(config.marginLeft + 1).join(" ");
      const borderStyle = config.borderCharacters[config.borderStyle];
      const borders = [];
      const constructorType = exports2.getConstructorGeometry(inputData[0] || [], config);
      const rows = exports2.coerceConstructorGeometry(config, inputData, constructorType);
      if (!global.columnWidths) {
        global.columnWidths = {};
      }
      if (global.columnWidths[config.tableId]) {
        config.table.columnWidths = global.columnWidths[config.tableId];
      } else {
        const formattedRows = rows.map((row, rowIndex) => {
          return row.map((cell, cellIndex) => {
            return exports2.buildCell(config, cell, cellIndex, "body", rowIndex, rows, inputData, true);
          });
        });
        global.columnWidths[config.tableId] = config.table.columnWidths = Format.getColumnWidths(config, formattedRows);
      }
      switch (true) {
        case (config.showHeader !== null && !config.showHeader):
          sections.header = [];
          break;
        case config.showHeader === true:
        // explicitly true, show
        case !!config.table.header[0].find((obj) => obj.value || obj.alias):
          sections.header = config.table.header.map((row) => {
            return exports2.buildRow(config, row, "header", null, rows, inputData);
          });
          break;
        default:
          sections.header = [];
      }
      sections.body = rows.map((row, rowIndex) => {
        return exports2.buildRow(config, row, "body", rowIndex, rows, inputData);
      });
      sections.footer = config.table.footer instanceof Array && config.table.footer.length > 0 ? [config.table.footer] : [];
      sections.footer = sections.footer.map((row) => {
        return exports2.buildRow(config, row, "footer", null, rows, inputData);
      });
      for (let a = 0; a < 3; a++) {
        borders[a] = borderStyle[a].l;
        config.table.columnWidths.forEach((columnWidth, index, arr) => {
          borders[a] += Array(Math.max(columnWidth, 2)).join(borderStyle[a].h);
          borders[a] += index + 1 < arr.length ? borderStyle[a].j : "";
        });
        borders[a] += borderStyle[a].r;
        borders[a] = a < 2 ? `${marginLeft + borders[a]}
` : marginLeft + borders[a];
      }
      let output = borders[0];
      Object.keys(sections).forEach((p, i) => {
        while (sections[p].length) {
          const row = sections[p].shift();
          row.forEach((line) => {
            output = `${output + marginLeft + borderStyle[1].v + line.join(borderStyle[1].v) + borderStyle[1].v}
`;
          });
          switch (true) {
            // skip if end of body and no footer
            case (sections[p].length === 0 && i === 1 && sections.footer.length === 0):
              break;
            // skip if end of footer
            case (sections[p].length === 0 && i === 2):
              break;
            // skip if compact
            case (config.compact && p === "body" && !row.empty):
              break;
            // skip if border style is "none"
            case (config.borderStyle === "none" && config.compact):
              break;
            default:
              output += borders[1];
          }
        }
      });
      output += borders[2];
      const finalOutput = Array(config.marginTop + 1).join("\n") + output;
      config.height = finalOutput.split(/\r\n|\r|\n/).length;
      return finalOutput;
    };
    module2.exports.buildRow = (config, row, rowType, rowIndex, rowData, inputData) => {
      let minRowHeight = 0;
      if (row.length === 0 && config.compact) {
        row.empty = true;
        return row;
      }
      const lengthDifference = config.table.columnWidths.length - row.length;
      if (lengthDifference > 0) {
        row = row.concat(Array.apply(null, new Array(lengthDifference)).map(() => null));
      } else if (lengthDifference < 0) {
        row.length = config.table.columnWidths.length;
      }
      row = row.map((elem, elemIndex) => {
        const cell = exports2.buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData);
        minRowHeight = minRowHeight < cell.length ? cell.length : minRowHeight;
        return cell;
      });
      minRowHeight = rowType === "header" ? minRowHeight : minRowHeight + (config.paddingBottom + config.paddingTop);
      const linedRow = Array.apply(null, { length: minRowHeight }).map(Function.call, () => []);
      row.forEach(function(cell, a) {
        const whitespace = Array(config.table.columnWidths[a]).join(" ");
        if (rowType === "body") {
          for (let i = 0; i < config.paddingTop; i++) {
            cell.unshift(whitespace);
          }
          for (let i = 0; i < config.paddingBottom; i++) {
            cell.push(whitespace);
          }
        }
        for (let i = 0; i < minRowHeight; i++) {
          linedRow[i].push(typeof cell[i] !== "undefined" ? cell[i] : whitespace);
        }
      });
      return linedRow;
    };
    module2.exports.buildCell = (config, elem, columnIndex, rowType, rowIndex, rowData, inputData, dryRun = false) => {
      let cellValue = null;
      const cellOptions = Object.assign(
        { reset: false },
        config,
        rowType !== "header" ? config.columnSettings[columnIndex] : {},
        typeof elem === "object" ? elem : {}
      );
      if (rowType === "header") {
        config.table.columns.push(cellOptions);
        cellValue = cellOptions.alias || cellOptions.value || "";
      } else {
        switch (true) {
          case (typeof elem === "undefined" || elem === null):
            cellValue = config.errorOnNull ? config.defaultErrorValue : config.defaultValue;
            if (!Style.isColorEnabled()) {
              cellValue = stripAnsi(cellValue);
            }
            cellOptions.isNull = true;
            break;
          case (typeof elem === "object" && elem !== null && typeof elem.value !== "undefined"):
            cellValue = elem.value;
            break;
          case typeof elem === "function":
            cellValue = elem.bind({
              configure: function(object) {
                return Object.assign(cellOptions, object);
              },
              style: Style.style,
              resetStyle: Style.resetStyle
            })(
              cellValue,
              columnIndex,
              rowIndex,
              rowData,
              inputData
            );
            break;
          default:
            cellValue = elem;
        }
        if (rowType === "body" && typeof cellOptions.formatter === "function") {
          cellValue = cellOptions.formatter.bind({
            configure: function(object) {
              return Object.assign(cellOptions, object);
            },
            style: Style.style,
            resetStyle: Style.resetStyle
          })(
            cellValue,
            columnIndex,
            rowIndex,
            rowData,
            inputData
          );
        }
        if (dryRun) {
          return cellValue;
        }
      }
      if (!cellOptions.reset) {
        cellValue = Style.colorizeCell(cellValue, cellOptions, rowType);
      }
      const { cell, innerWidth } = Format.wrapCellText(cellOptions, cellValue, columnIndex, cellOptions, rowType);
      if (rowType === "header") {
        config.table.columnInnerWidths.push(innerWidth);
      }
      return cell;
    };
    module2.exports.getConstructorGeometry = (row, config) => {
      let type;
      if (typeof row === "object" && !(row instanceof Array)) {
        const keys = Object.keys(row);
        if (config.adapter === "automattic") {
          const key = keys[0];
          if (row[key] instanceof Array) {
            type = "automattic-cross";
          } else {
            type = "automattic-vertical";
          }
        } else {
          type = "o-horizontal";
        }
      } else {
        type = "a-horizontal";
      }
      return type;
    };
    module2.exports.coerceConstructorGeometry = (config, rows, constructorType) => {
      let output = [];
      switch (constructorType) {
        case "automattic-cross":
          config.columnSettings[0] = config.columnSettings[0] || {};
          config.columnSettings[0].color = config.headerColor;
          output = rows.map((obj) => {
            const arr = [];
            const key = Object.keys(obj)[0];
            arr.push(key);
            return arr.concat(obj[key]);
          });
          break;
        case "automattic-vertical":
          config.columnSettings[0] = config.columnSettings[0] || {};
          config.columnSettings[0].color = config.headerColor;
          output = rows.map(function(value) {
            const key = Object.keys(value)[0];
            return [key, value[key]];
          });
          break;
        case "o-horizontal":
          if (config.table.header[0].length && config.table.header[0].every((obj) => obj.value)) {
            output = rows.map((row) => config.table.header[0].map((obj) => row[obj.value]));
          } else {
            output = rows.map((obj) => Object.values(obj));
          }
          break;
        case "a-horizontal":
          output = rows;
          break;
        default:
      }
      return output;
    };
  }
});

// src/factory.js
var require_factory = __commonJS({
  "src/factory.js"(exports2, module2) {
    "use strict";
    init_();
    var defaults = require_defaults();
    var Render = require_render();
    var Style = require_style();
    var counter = 0;
    var Factory2 = function(paramsArr) {
      const _configKey = Symbol.config;
      let header = [];
      const body = [];
      let footer = [];
      let options = {};
      switch (true) {
        // header, rows, footer, and options
        case paramsArr.length === 4:
          header = paramsArr[0];
          body.push(...paramsArr[1]);
          footer = paramsArr[2];
          options = paramsArr[3];
          break;
        // header, rows, footer
        case (paramsArr.length === 3 && paramsArr[2] instanceof Array):
          header = paramsArr[0];
          body.push(...paramsArr[1]);
          footer = paramsArr[2];
          break;
        // header, rows, options
        case (paramsArr.length === 3 && typeof paramsArr[2] === "object"):
          header = paramsArr[0];
          body.push(...paramsArr[1]);
          options = paramsArr[2];
          break;
        // header, rows            (rows, footer is not an option)
        case (paramsArr.length === 2 && paramsArr[1] instanceof Array):
          header = paramsArr[0];
          body.push(...paramsArr[1]);
          break;
        // rows, options
        case (paramsArr.length === 2 && typeof paramsArr[1] === "object"):
          body.push(...paramsArr[0]);
          options = paramsArr[1];
          break;
        // rows
        case (paramsArr.length === 1 && paramsArr[0] instanceof Array):
          body.push(...paramsArr[0]);
          break;
        // adapter called: i.e. `require('tty-table')('automattic-cli')`
        case (paramsArr.length === 1 && typeof paramsArr[0] === "string"):
          const adapters = {
            "automattic-cli-table": () => require_automattic_cli_table(),
            "default-adapter": () => require_default_adapter(),
            "terminal-adapter": () => require_terminal_adapter()
          };
          return (adapters[paramsArr[0]] || (() => globRequire_adapters(`../adapters/${paramsArr[0]}`)))();
        /* istanbul ignore next */
        default:
          console.log("Error: Bad params. \nSee docs at github.com/tecfu/tty-table");
          process.exit();
      }
      const cloneddefaults = JSON.parse(JSON.stringify(defaults));
      const config = Object.assign({}, cloneddefaults, options);
      config.align = config.alignment || config.align;
      config.headerAlign = config.headerAlignment || config.headerAlign;
      if (config.truncate === true) config.truncate = "";
      if (config.borderColor) {
        config.borderCharacters[config.borderStyle] = config.borderCharacters[config.borderStyle].map(function(obj) {
          Object.keys(obj).forEach(function(key) {
            obj[key] = Style.style(obj[key], config.borderColor);
          });
          return obj;
        });
      }
      config.columnSettings = header.slice(0);
      config.table.header = header;
      config.table.header = [config.table.header];
      config.table.footer = footer;
      if (config.terminalAdapter !== true) {
        counter++;
      }
      config.tableId = counter;
      const tableObject = Object.create(body);
      tableObject[_configKey] = config;
      tableObject.render = function() {
        const output = Render.stringifyData(this[_configKey], this.slice(0));
        tableObject.height = this[_configKey].height;
        return output;
      };
      return tableObject;
    };
    var Table = function() {
      return new Factory2(arguments);
    };
    Table.resetStyle = Style.resetStyle;
    Table.style = Style.styleEachChar;
    module2.exports = Table;
  }
});

// src/browser.ts
var browser_exports = {};
__export(browser_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(browser_exports);

// src/index.ts
var import_factory = __toESM(require_factory());
var src_default = import_factory.default;
;if (typeof module !== "undefined" && typeof module.exports?.default === "function") { module.exports = Object.assign(module.exports.default, module.exports) }
//# sourceMappingURL=browser.js.map