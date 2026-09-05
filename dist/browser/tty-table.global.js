"use strict";
var TtyTable = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/clone/clone.js
  var require_clone = __commonJS({
    "node_modules/clone/clone.js"(exports, module) {
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
      if (typeof module === "object" && module.exports) {
        module.exports = clone;
      }
    }
  });

  // node_modules/defaults/index.js
  var require_defaults = __commonJS({
    "node_modules/defaults/index.js"(exports, module) {
      "use strict";
      var clone = require_clone();
      module.exports = function(options, defaults2) {
        options = options || {};
        Object.keys(defaults2).forEach(function(key) {
          if (typeof options[key] === "undefined") {
            options[key] = clone(defaults2[key]);
          }
        });
        return options;
      };
    }
  });

  // node_modules/wcwidth/combining.js
  var require_combining = __commonJS({
    "node_modules/wcwidth/combining.js"(exports, module) {
      "use strict";
      module.exports = [
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
    "node_modules/wcwidth/index.js"(exports, module) {
      "use strict";
      var defaults2 = require_defaults();
      var combining = require_combining();
      var DEFAULTS = {
        nul: 0,
        control: 0
      };
      module.exports = function wcwidth3(str) {
        return wcswidth(str, DEFAULTS);
      };
      module.exports.config = function(opts) {
        opts = defaults2(opts || {}, DEFAULTS);
        return function wcwidth3(str) {
          return wcswidth(str, opts);
        };
      };
      function wcswidth(str, opts) {
        if (typeof str !== "string") return wcwidth2(str, opts);
        var s = 0;
        for (var i = 0; i < str.length; i++) {
          var n = wcwidth2(str.charCodeAt(i), opts);
          if (n < 0) return -1;
          s += n;
        }
        return s;
      }
      function wcwidth2(ucs, opts) {
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

  // src/browser.ts
  var browser_exports = {};
  __export(browser_exports, {
    Table: () => Table,
    default: () => src_default,
    resetStyle: () => resetStyle,
    style: () => style2,
    styleEachChar: () => styleEachChar
  });

  // src/defaults.ts
  var borderCharacters = {
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
    ],
    "0": [],
    "1": [],
    "2": []
  };
  borderCharacters["0"] = borderCharacters.none;
  borderCharacters["1"] = borderCharacters.solid;
  borderCharacters["2"] = borderCharacters.dashed;
  var defaults = {
    borderCharacters,
    align: "center",
    headerAlign: "center",
    footerAlign: "center",
    borderColor: false,
    borderStyle: "solid",
    color: false,
    headerColor: "yellow",
    footerColor: false,
    COLUMNS: 80,
    compact: false,
    defaultErrorValue: "\uFFFD",
    defaultValue: "",
    errorOnNull: false,
    FIXED_WIDTH: false,
    marginLeft: 2,
    marginTop: 1,
    paddingBottom: 0,
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 0,
    showHeader: null,
    truncate: false,
    width: "100%",
    GUTTER: 1,
    columnSettings: [],
    height: 0,
    tableId: 0
  };

  // src/format.ts
  var import_wcwidth = __toESM(require_wcwidth());

  // src/ansi.ts
  var ANSI = /\u001B\[[0-?]*[ -\/]*[@-~]/g;
  var codes = {
    reset: "0",
    bold: "1",
    dim: "2",
    italic: "3",
    underline: "4",
    inverse: "7",
    hidden: "8",
    strikethrough: "9",
    black: "30",
    red: "31",
    green: "32",
    yellow: "33",
    blue: "34",
    magenta: "35",
    cyan: "36",
    white: "37",
    gray: "90",
    grey: "90",
    bgBlack: "40",
    bgRed: "41",
    bgGreen: "42",
    bgYellow: "43",
    bgBlue: "44",
    bgMagenta: "45",
    bgCyan: "46",
    bgWhite: "47"
  };
  var stripAnsi = (value) => value.replace(ANSI, "");
  var displayWidth = (value, wcwidth2) => Math.max(0, ...stripAnsi(value).split(/\r?\n/).map(wcwidth2));
  var style = (value, ...styles) => {
    const active = styles.map((s) => codes[s]).filter(Boolean);
    return active.length ? `\x1B[${active.join(";")}m${value}\x1B[0m` : value;
  };
  var styleEachChar = (value, ...styles) => [...stripAnsi(value)].map((char) => style(char, ...styles)).join("");
  var ansiSafeSlice = (value, width, wcwidth2) => {
    if (width <= 0) return "";
    let out = "";
    let visible = 0;
    let i = 0;
    while (i < value.length && visible < width) {
      ANSI.lastIndex = i;
      const match = ANSI.exec(value);
      if (match?.index === i) {
        out += match[0];
        i += match[0].length;
        continue;
      }
      const cp = String.fromCodePoint(value.codePointAt(i));
      const w = wcwidth2(cp);
      if (visible + w > width) break;
      out += cp;
      visible += w;
      i += cp.length;
    }
    return out;
  };

  // src/format.ts
  var getStringLength = (value) => displayWidth(value, import_wcwidth.default);
  var pad = (value, width, align) => {
    const missing = Math.max(0, width - getStringLength(value));
    if (align === "right") return " ".repeat(missing) + value;
    if (align === "center") {
      const left = Math.floor(missing / 2);
      return " ".repeat(left) + value + " ".repeat(missing - left);
    }
    return value + " ".repeat(missing);
  };
  var wrap = (value, width) => {
    if (width <= 0) return [""];
    return value.split(/\r?\n/).flatMap((line) => {
      if (!line) return [""];
      const out = [];
      let rest = line;
      while (getStringLength(rest) > width) {
        let cut = ansiSafeSlice(rest, width, import_wcwidth.default);
        if (!cut) break;
        const plain = stripAnsi(rest);
        const plainCut = stripAnsi(cut);
        const lastSpace = plainCut.lastIndexOf(" ");
        if (lastSpace > 0) {
          const target = plainCut.slice(0, lastSpace);
          cut = ansiSafeSlice(rest, getStringLength(target), import_wcwidth.default);
        }
        out.push(cut);
        rest = rest.slice(cut.length).replace(/^\s+/, "");
      }
      out.push(rest);
      return out;
    });
  };
  var truncate = (value, marker, width) => {
    if (getStringLength(value) <= width) return value;
    const available = Math.max(0, width - getStringLength(marker));
    return ansiSafeSlice(value, available, import_wcwidth.default) + marker;
  };
  var getMaxLength = (column, rows, index) => {
    const values = rows.map((row) => row[index]).concat(column.value ?? column.alias ?? "");
    return Math.max(0, ...values.map((value) => getStringLength(String(value?.value ?? value ?? ""))));
  };
  var getAvailableWidth = (config) => {
    const viewport = Number(process.stdout?.columns || process.env.COLUMNS || config.COLUMNS) - config.marginLeft;
    if (config.width === "auto") return viewport;
    if (typeof config.width === "number") return Math.max(1, config.width);
    if (/^\d+%$/.test(config.width)) return Math.max(1, Math.floor(viewport * Number(config.width.slice(0, -1)) / 100));
    if (/^\d+$/.test(String(config.width))) return Number(config.width);
    return viewport;
  };
  var getColumnWidths = (config, rows) => {
    const header = config.columnSettings;
    const count = Math.max(header.length, ...rows.map((r) => r.length), 0);
    const available = getAvailableWidth(config);
    const raw = Array.from({ length: count }, (_, index) => {
      const col = header[index] ?? {};
      let width;
      if (typeof col.width === "number") width = col.width;
      else if (typeof col.width === "string" && /^\d+%$/.test(col.width)) width = available * Number(col.width.slice(0, -1)) / 100;
      else if (typeof col.width === "string" && /^\d+$/.test(col.width)) width = Number(col.width);
      else width = getMaxLength(col, rows, index) + config.paddingLeft + config.paddingRight;
      return Math.max(2, Math.floor(width) + config.GUTTER);
    });
    const total = raw.reduce((a, b) => a + b, 0);
    if (total <= available && !config.FIXED_WIDTH) return raw;
    if (!total) return raw;
    const scale = available / total;
    return raw.map((w) => Math.max(2, Math.floor(w * scale)));
  };
  var formatCell = (value, width, options, align) => {
    const inner = Math.max(1, width - (options.paddingLeft ?? 1) - (options.paddingRight ?? 1) - 1);
    let text = String(value ?? "");
    if (typeof options.truncate === "string") text = truncate(text, options.truncate, inner);
    const lines = typeof options.truncate === "string" ? [text] : wrap(text, inner);
    return lines.map((line) => pad(" ".repeat(options.paddingLeft ?? 1) + line + " ".repeat(options.paddingRight ?? 1), width, align));
  };

  // src/style.ts
  var style2 = (value, ...styles) => style(String(value), ...styles);
  var resetStyle = (value) => stripAnsi(value);
  var colorizeCell = (value, options, rowType) => {
    const color = rowType === "header" ? options.headerColor : rowType === "footer" ? options.footerColor : options.color;
    return color ? style2(value, color) : String(value ?? "");
  };

  // src/render.ts
  var tableCounter = 0;
  var normalizeOptions = (options = {}, header) => {
    const merged = { ...defaults, ...options };
    merged.align = options.alignment ?? options.align ?? defaults.align;
    merged.headerAlign = options.headerAlignment ?? options.headerAlign ?? defaults.headerAlign;
    merged.columnSettings = header.map((item) => typeof item === "object" && item !== null ? item : {});
    merged.borderStyle = options.borderStyle ?? defaults.borderStyle;
    merged.tableId = ++tableCounter;
    merged.truncate = options.truncate === true ? "" : options.truncate ?? false;
    return merged;
  };
  var valueFromCell = (cell) => {
    if (cell && typeof cell === "object" && "value" in cell) return cell.value;
    return cell;
  };
  var rowValues = (row, header, adapter) => {
    if (Array.isArray(row)) return row;
    if (!row || typeof row !== "object") return [row];
    const object = row;
    if (adapter === "automattic") {
      const key = Object.keys(object)[0];
      const value = key ? object[key] : void 0;
      return Array.isArray(value) ? [key, ...value] : [key, value];
    }
    if (header.length && header.every((h) => h && typeof h === "object" && "value" in h)) return header.map((h) => object[h.value]);
    return Object.values(object);
  };
  var applyFormatter = (value, options, rowIndex, columnIndex, row, input) => {
    if (typeof options.formatter !== "function") return value;
    const context = {
      value,
      columnIndex,
      rowIndex,
      row,
      input,
      configure: (next) => Object.assign(options, next),
      style: (v, ...styles) => style2(v, ...styles),
      resetStyle
    };
    return options.formatter.modern ? options.formatter.modern(context) : options.formatter.call(context, value, columnIndex, rowIndex, row, input);
  };
  var renderTable = (header, input, footer, options = {}) => {
    const config = normalizeOptions(options, header);
    const rows = input.map((row) => rowValues(row, header, options.adapter));
    config.columnSettings = header.map((item) => typeof item === "object" && item !== null ? item : {});
    const widths = getColumnWidths(config, rows);
    const border = config.borderCharacters[String(config.borderStyle)] ?? config.borderCharacters.solid ?? [];
    const top = border[0] ?? { v: "", l: "", j: "", h: "", r: "" };
    const middle = border[1] ?? top;
    const bottom = border[2] ?? middle;
    const margin = " ".repeat(config.marginLeft);
    const horizontal = (b) => margin + b.l + widths.map((w) => b.h.repeat(Math.max(0, w - 1))).join(b.j) + b.r;
    const renderRow = (row, type, rowIndex) => {
      const cells = widths.map((width, i) => {
        const col = { ...config.columnSettings[i] ?? {} };
        const raw = type === "header" ? valueFromCell(header[i]) : valueFromCell(row[i]);
        const value = type === "body" ? applyFormatter(raw ?? (config.errorOnNull ? config.defaultErrorValue : config.defaultValue), col, rowIndex, i, row, input) : raw ?? "";
        if (value == null) return formatCell(config.errorOnNull ? config.defaultErrorValue : config.defaultValue, width, col, type === "header" ? config.headerAlign : config.align);
        const colored = colorizeCell(value, { ...config, ...col }, type);
        return formatCell(colored, width, col, type === "header" ? col.headerAlign ?? config.headerAlign : type === "footer" ? config.footerAlign : col.align ?? config.align);
      });
      const height = Math.max(1, ...cells.map((c) => c.length));
      return Array.from({ length: height }, (_, line) => margin + middle.v + cells.map((c, i) => c[line] ?? " ".repeat(widths[i] ?? 0)).join(middle.v) + middle.v);
    };
    const sections = [];
    const showHeader = config.showHeader !== false && (config.showHeader === true || header.some((h) => h && typeof h === "object" && (h.value || h.alias)));
    if (showHeader) sections.push(...renderRow(header, "header", 0));
    rows.forEach((row, i) => sections.push(...renderRow(row, "body", i)));
    if (footer.length) sections.push(...renderRow(footer, "footer", 0));
    const lines = [horizontal(top)];
    sections.forEach((line, index) => {
      lines.push(line);
      const last = index === sections.length - 1;
      if (!last && !(config.compact && index >= (showHeader ? renderRow(header, "header", 0).length : 0))) lines.push(horizontal(middle));
    });
    lines.push(horizontal(bottom));
    const output = "\n".repeat(config.marginTop) + lines.join("\n");
    config.height = output.split(/\r?\n/).length;
    return { output, height: config.height };
  };

  // src/index.ts
  var counter = 0;
  var Table = class extends Array {
    constructor(header = [], rows = [], footer = [], options = {}) {
      super(...rows);
      __publicField(this, "options");
      __publicField(this, "header");
      __publicField(this, "footer");
      __publicField(this, "height", 0);
      this.header = header;
      this.footer = footer;
      this.options = options;
      counter++;
    }
    render() {
      const result = renderTable(this.header, this.slice(), this.footer, this.options);
      this.height = result.height;
      return result.output;
    }
  };
  var factory = function(...args) {
    let header = [];
    let rows = [];
    let footer = [];
    let options = {};
    if (args.length === 1 && Array.isArray(args[0])) rows = args[0];
    else if (args.length === 2 && Array.isArray(args[0]) && Array.isArray(args[1])) {
      header = args[0];
      rows = args[1];
    } else if (args.length === 2 && Array.isArray(args[0]) && args[1] && typeof args[1] === "object") {
      rows = args[0];
      options = args[1];
    } else if (args.length >= 3) {
      header = args[0] ?? [];
      rows = args[1] ?? [];
      if (Array.isArray(args[2])) footer = args[2];
      else if (args[2] && typeof args[2] === "object") options = args[2];
      if (args[3] && typeof args[3] === "object") options = args[3];
    }
    return new Table(header, rows, footer, options);
  };
  factory.style = styleEachChar;
  factory.styleEachChar = styleEachChar;
  factory.resetStyle = resetStyle;
  var src_default = factory;
  return __toCommonJS(browser_exports);
})();
//# sourceMappingURL=tty-table.global.js.map