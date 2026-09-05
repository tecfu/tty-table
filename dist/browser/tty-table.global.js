"use strict";
var TtyTable = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __glob = (map) => (path) => {
    var fn = map[path];
    if (fn) return fn();
    throw new Error("Module not found in bundle: " + path);
  };
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
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
    "adapters/automattic-cli-table.js"(exports, module) {
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
      module.exports = Table;
    }
  });

  // adapters/default-adapter.js
  var require_default_adapter = __commonJS({
    "adapters/default-adapter.js"(exports, module) {
      "use strict";
      var Factory2 = require_factory();
      module.exports = Factory2;
    }
  });

  // node_modules/csv/dist/cjs/index.cjs
  var require_cjs = __commonJS({
    "node_modules/csv/dist/cjs/index.cjs"(exports) {
      "use strict";
      var stream = __require("stream");
      var util = __require("util");
      var init_state$1 = (options) => {
        return {
          start_time: options.duration ? Date.now() : null,
          fixed_size_buffer: "",
          count_written: 0,
          count_created: 0
        };
      };
      var random = function(options = {}) {
        if (options.seed) {
          return options.seed = options.seed * Math.PI * 100 % 100 / 100;
        } else {
          return Math.random();
        }
      };
      var types = {
        // Generate an ASCII value.
        ascii: function({ options }) {
          const column = [];
          const nb_chars = Math.ceil(random(options) * options.maxWordLength);
          for (let i = 0; i < nb_chars; i++) {
            const char = Math.floor(random(options) * 32);
            column.push(String.fromCharCode(char + (char < 16 ? 65 : 97 - 16)));
          }
          return column.join("");
        },
        // Generate an integer value.
        int: function({ options }) {
          return Math.floor(random(options) * Math.pow(2, 52));
        },
        // Generate an boolean value.
        bool: function({ options }) {
          return Math.floor(random(options) * 2);
        }
      };
      var camelize = function(str) {
        return str.replace(/_([a-z])/gi, function(_, match) {
          return match.toUpperCase();
        });
      };
      var normalize_options$2 = (opts) => {
        if (opts.object_mode) {
          opts.objectMode = opts.object_mode;
        }
        if (opts.high_water_mark) {
          opts.highWaterMark = opts.high_water_mark;
        }
        const options = {};
        for (const k in opts) {
          options[camelize(k)] = opts[k];
        }
        const dft = {
          columns: 8,
          delimiter: ",",
          duration: null,
          encoding: null,
          end: null,
          eof: false,
          fixedSize: false,
          length: -1,
          maxWordLength: 16,
          rowDelimiter: "\n",
          seed: false,
          sleep: 0
        };
        for (const k in dft) {
          if (options[k] === void 0) {
            options[k] = dft[k];
          }
        }
        if (options.eof === true) {
          options.eof = options.rowDelimiter;
        }
        if (typeof options.columns === "number") {
          options.columns = new Array(options.columns);
        }
        const accepted_header_types = Object.keys(types).filter(
          (t) => !["super_", "camelize"].includes(t)
        );
        for (let i = 0; i < options.columns.length; i++) {
          const v = options.columns[i] || "ascii";
          if (typeof v === "string") {
            if (!accepted_header_types.includes(v)) {
              throw Error(
                `Invalid column type: got "${v}", default values are ${JSON.stringify(accepted_header_types)}`
              );
            }
            options.columns[i] = types[v];
          }
        }
        return options;
      };
      var read = (options, state, size, push, close) => {
        const data = [];
        let recordsLength = 0;
        if (options.fixedSize) {
          recordsLength = state.fixed_size_buffer.length;
          if (recordsLength !== 0) {
            data.push(state.fixed_size_buffer);
          }
        }
        while (true) {
          if (state.count_created === options.length || options.end && Date.now() > options.end || options.duration && Date.now() > state.start_time + options.duration) {
            if (data.length) {
              if (options.objectMode) {
                for (const record2 of data) {
                  push(record2);
                }
              } else {
                push(data.join("") + (options.eof ? options.eof : ""));
              }
              state.end = true;
            } else {
              close();
            }
            return;
          }
          let record = [];
          let recordLength;
          for (const fn of options.columns) {
            const result2 = fn({ options, state });
            const type = typeof result2;
            if (result2 !== null && type !== "string" && type !== "number") {
              close(
                Error(
                  [
                    "INVALID_VALUE:",
                    "values returned by column function must be",
                    "a string, a number or null,",
                    `got ${JSON.stringify(result2)}`
                  ].join(" ")
                )
              );
              return;
            }
            record.push(result2);
          }
          if (options.objectMode) {
            recordLength = 0;
            for (const column of record) {
              recordLength += column.length;
            }
          } else {
            record = (state.count_created === 0 ? "" : options.rowDelimiter) + record.join(options.delimiter);
            recordLength = record.length;
          }
          state.count_created++;
          if (recordsLength + recordLength > size) {
            if (options.objectMode) {
              data.push(record);
              for (const record2 of data) {
                push(record2);
              }
            } else {
              if (options.fixedSize) {
                state.fixed_size_buffer = record.substr(size - recordsLength);
                data.push(record.substr(0, size - recordsLength));
              } else {
                data.push(record);
              }
              push(data.join(""));
            }
            return;
          }
          recordsLength += recordLength;
          data.push(record);
        }
      };
      var Generator = function(options = {}) {
        this.options = normalize_options$2(options);
        stream.Readable.call(this, this.options);
        this.state = init_state$1(this.options);
        return this;
      };
      util.inherits(Generator, stream.Readable);
      Generator.prototype.end = function() {
        this.push(null);
      };
      Generator.prototype._read = function(size) {
        setImmediate(() => {
          this.__read(size);
        });
      };
      Generator.prototype.__read = function(size) {
        read(
          this.options,
          this.state,
          size,
          (chunk) => {
            this.__push(chunk);
          },
          (err) => {
            if (err) {
              this.destroy(err);
            } else {
              this.push(null);
            }
          }
        );
      };
      Generator.prototype.__push = function(record) {
        const push = () => {
          this.state.count_written++;
          this.push(record);
          if (this.state.end === true) {
            return this.push(null);
          }
        };
        if (this.options.sleep > 0) setTimeout(push, this.options.sleep);
        else push();
      };
      var generate = function() {
        let options;
        let callback;
        if (arguments.length === 2) {
          options = arguments[0];
          callback = arguments[1];
        } else if (arguments.length === 1) {
          if (typeof arguments[0] === "function") {
            options = {};
            callback = arguments[0];
          } else {
            options = arguments[0];
          }
        } else if (arguments.length === 0) {
          options = {};
        }
        const generator = new Generator(options);
        if (callback) {
          const data = [];
          generator.on("readable", function() {
            let d;
            while ((d = generator.read()) !== null) {
              data.push(d);
            }
          });
          generator.on("error", callback);
          generator.on("end", function() {
            if (generator.options.objectMode) {
              callback(null, data);
            } else {
              if (generator.options.encoding) {
                callback(null, data.join(""));
              } else {
                callback(null, Buffer.concat(data));
              }
            }
          });
        }
        return generator;
      };
      var is_object$1 = function(obj) {
        return typeof obj === "object" && obj !== null && !Array.isArray(obj);
      };
      var CsvError$1 = class CsvError2 extends Error {
        constructor(code, message, options, ...contexts) {
          if (Array.isArray(message)) message = message.join(" ").trim();
          super(message);
          if (Error.captureStackTrace !== void 0) {
            Error.captureStackTrace(this, CsvError2);
          }
          this.code = code;
          for (const context of contexts) {
            for (const key in context) {
              const value = context[key];
              this[key] = Buffer.isBuffer(value) ? value.toString(options.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
            }
          }
        }
      };
      var normalize_columns_array = function(columns) {
        const normalizedColumns = [];
        for (let i = 0, l = columns.length; i < l; i++) {
          const column = columns[i];
          if (column === void 0 || column === null || column === false) {
            normalizedColumns[i] = { disabled: true };
          } else if (typeof column === "string" || typeof column === "number") {
            normalizedColumns[i] = { name: `${column}` };
          } else if (is_object$1(column)) {
            if (typeof column.name !== "string") {
              throw new CsvError$1("CSV_OPTION_COLUMNS_MISSING_NAME", [
                "Option columns missing name:",
                `property "name" is required at position ${i}`,
                "when column is an object literal"
              ]);
            }
            normalizedColumns[i] = column;
          } else {
            throw new CsvError$1("CSV_INVALID_COLUMN_DEFINITION", [
              "Invalid column definition:",
              "expect a string or a literal object,",
              `got ${JSON.stringify(column)} at position ${i}`
            ]);
          }
        }
        return normalizedColumns;
      };
      var ResizeableBuffer = class {
        constructor(size = 100) {
          this.size = size;
          this.length = 0;
          this.buf = Buffer.allocUnsafe(size);
        }
        prepend(val) {
          if (Buffer.isBuffer(val)) {
            const length = this.length + val.length;
            if (length >= this.size) {
              this.resize();
              if (length >= this.size) {
                throw Error("INVALID_BUFFER_STATE");
              }
            }
            const buf = this.buf;
            this.buf = Buffer.allocUnsafe(this.size);
            val.copy(this.buf, 0);
            buf.copy(this.buf, val.length);
            this.length += val.length;
          } else {
            const length = this.length++;
            if (length === this.size) {
              this.resize();
            }
            const buf = this.clone();
            this.buf[0] = val;
            buf.copy(this.buf, 1, 0, length);
          }
        }
        append(val) {
          const length = this.length++;
          if (length === this.size) {
            this.resize();
          }
          this.buf[length] = val;
        }
        clone() {
          return Buffer.from(this.buf.slice(0, this.length));
        }
        resize() {
          const length = this.length;
          this.size = this.size * 2;
          const buf = Buffer.allocUnsafe(this.size);
          this.buf.copy(buf, 0, 0, length);
          this.buf = buf;
        }
        toString(encoding) {
          if (encoding) {
            return this.buf.toString(encoding, 0, this.length);
          } else {
            return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
          }
        }
        toJSON() {
          return this.toString("utf8");
        }
        reset() {
          this.length = 0;
        }
      };
      var init_state = function(options) {
        const timchars = [
          // Basic Latin
          32,
          // [Space](https://www.fileformat.info/info/unicode/char/0020/index.htm)
          9,
          // [CHARACTER TABULATION (HT)](https://www.fileformat.info/info/unicode/char/0009/index.htm)
          10,
          // [LINE FEED (LF)](https://www.fileformat.info/info/unicode/char/000a/index.htm)
          13,
          // [CARRIAGE RETURN (CR)](https://www.fileformat.info/info/unicode/char/000d/index.htm)
          12,
          // [FORM FEED (FF)](https://www.fileformat.info/info/unicode/char/000c/index.htm)
          11,
          // [LINE TABULATION (VT)](https://www.fileformat.info/info/unicode/char/000b/index.htm)
          // Latin-1 Supplement
          160,
          // [NO-BREAK SPACE (NBSP)](https://www.fileformat.info/info/unicode/char/00a0/index.htm)
          // Ogham
          5760,
          // [OGHAM SPACE MARK](https://www.fileformat.info/info/unicode/char/1680/index.htm)
          // General Punctuation
          8192,
          // [EN QUAD](https://www.fileformat.info/info/unicode/char/2000/index.htm)
          8193,
          // [EM QUAD](https://www.fileformat.info/info/unicode/char/2001/index.htm)
          8194,
          // [EN SPACE](https://www.fileformat.info/info/unicode/char/2002/index.htm)
          8195,
          // [EM SPACE](https://www.fileformat.info/info/unicode/char/2003/index.htm)
          8196,
          // [THREE-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2004/index.htm)
          8197,
          // [FOUR-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2005/index.htm)
          8198,
          // [SIX-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2006/index.htm)
          8199,
          // [FIGURE SPACE](https://www.fileformat.info/info/unicode/char/2007/index.htm)
          8200,
          // [PUNCTUATION SPACE](https://www.fileformat.info/info/unicode/char/2008/index.htm)
          8201,
          // [THIN SPACE](https://www.fileformat.info/info/unicode/char/2009/index.htm)
          8202,
          // [HAIR SPACE](https://www.fileformat.info/info/unicode/char/200a/index.htm)
          8232,
          // [LINE SEPARATOR](https://www.fileformat.info/info/unicode/char/2028/index.htm)
          8233,
          // [PARAGRAPH SEPARATOR](https://www.fileformat.info/info/unicode/char/2029/index.htm)
          8239,
          // [NARROW NO-BREAK SPACE (NNBSP)](https://www.fileformat.info/info/unicode/char/202f/index.htm)
          8287,
          // [MEDIUM MATHEMATICAL SPACE (MMSP)](https://www.fileformat.info/info/unicode/char/205f/index.htm)
          12288,
          // [IDEOGRAPHIC SPACE](https://www.fileformat.info/info/unicode/char/3000/index.htm)
          65279
          // [ZERO WIDTH NO-BREAK SPACE (BOM)](https://www.fileformat.info/info/unicode/char/feff/index.htm)
        ].reduce((acc, codepoint) => {
          const encoded = Buffer.from(
            String.fromCharCode(codepoint),
            options.encoding
          );
          if (codepoint !== 63 && encoded.length === 1 && encoded[0] === 63) {
            return acc;
          }
          acc.push(encoded);
          return acc;
        }, []);
        const timcharFirstBytes = new Uint8Array(256);
        for (const t of timchars) timcharFirstBytes[t[0]] = 1;
        return {
          bomSkipped: false,
          bufBytesStart: 0,
          castField: options.cast_function,
          commenting: false,
          delimiterBufPrevious: void 0,
          delimiterDiscovered: false,
          // Current error encountered by a record
          error: void 0,
          enabled: options.from_line === 1,
          escaping: false,
          escapeIsQuote: Buffer.isBuffer(options.escape) && Buffer.isBuffer(options.quote) && Buffer.compare(options.escape, options.quote) === 0,
          // columns can be `false`, `true`, `Array`
          expectedRecordLength: Array.isArray(options.columns) ? options.columns.length : void 0,
          field: new ResizeableBuffer(20),
          firstLineToHeaders: options.cast_first_line_to_header,
          needMoreDataSize: Math.max(
            // Skip if the remaining buffer smaller than comment
            options.comment !== null ? options.comment.length : 0,
            ...options.delimiter ? options.delimiter.map((delimiter) => delimiter.length) : [],
            // Auto discovery of delimiter is limited to 1 character
            options.delimiter_auto ? 1 : 0,
            // Skip if the remaining buffer can be escape sequence
            options.quote !== null ? options.quote.length : 0,
            ...timchars.map((t) => t.length)
          ),
          previousBuf: void 0,
          quoting: false,
          stop: false,
          rawBuffer: new ResizeableBuffer(100),
          record: [],
          recordHasError: false,
          record_length: 0,
          recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 0 : Math.max(...options.record_delimiter.map((v) => v.length)),
          trimChars: [
            Buffer.from(" ", options.encoding)[0],
            Buffer.from("	", options.encoding)[0]
          ],
          wasQuoting: false,
          wasRowDelimiter: false,
          timchars,
          timcharFirstBytes
        };
      };
      var underscore$1 = function(str) {
        return str.replace(/([A-Z])/g, function(_, match) {
          return "_" + match.toLowerCase();
        });
      };
      var normalize_options$1 = function(opts) {
        const options = {};
        for (const opt in opts) {
          options[underscore$1(opt)] = opts[opt];
        }
        if (options.encoding === void 0 || options.encoding === true) {
          options.encoding = "utf8";
        } else if (options.encoding === null || options.encoding === false) {
          options.encoding = null;
        } else if (typeof options.encoding !== "string" && options.encoding !== null) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_ENCODING",
            [
              "Invalid option encoding:",
              "encoding must be a string or null to return a buffer,",
              `got ${JSON.stringify(options.encoding)}`
            ],
            options
          );
        }
        if (options.bom === void 0 || options.bom === null || options.bom === false) {
          options.bom = false;
        } else if (options.bom !== true) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_BOM",
            [
              "Invalid option bom:",
              "bom must be true,",
              `got ${JSON.stringify(options.bom)}`
            ],
            options
          );
        }
        options.cast_function = null;
        if (options.cast === void 0 || options.cast === null || options.cast === false || options.cast === "") {
          options.cast = void 0;
        } else if (typeof options.cast === "function") {
          options.cast_function = options.cast;
          options.cast = true;
        } else if (options.cast !== true) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_CAST",
            [
              "Invalid option cast:",
              "cast must be true or a function,",
              `got ${JSON.stringify(options.cast)}`
            ],
            options
          );
        }
        if (options.cast_date === void 0 || options.cast_date === null || options.cast_date === false || options.cast_date === "") {
          options.cast_date = false;
        } else if (options.cast_date === true) {
          options.cast_date = function(value) {
            const date = Date.parse(value);
            return !isNaN(date) ? new Date(date) : value;
          };
        } else if (typeof options.cast_date !== "function") {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_CAST_DATE",
            [
              "Invalid option cast_date:",
              "cast_date must be true or a function,",
              `got ${JSON.stringify(options.cast_date)}`
            ],
            options
          );
        }
        options.cast_first_line_to_header = void 0;
        if (options.columns === true) {
          options.cast_first_line_to_header = void 0;
        } else if (typeof options.columns === "function") {
          options.cast_first_line_to_header = options.columns;
          options.columns = true;
        } else if (Array.isArray(options.columns)) {
          options.columns = normalize_columns_array(options.columns);
        } else if (options.columns === void 0 || options.columns === null || options.columns === false) {
          options.columns = false;
        } else {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_COLUMNS",
            [
              "Invalid option columns:",
              "expect an array, a function or true,",
              `got ${JSON.stringify(options.columns)}`
            ],
            options
          );
        }
        if (options.group_columns_by_name === void 0 || options.group_columns_by_name === null || options.group_columns_by_name === false) {
          options.group_columns_by_name = false;
        } else if (options.group_columns_by_name !== true) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
            [
              "Invalid option group_columns_by_name:",
              "expect an boolean,",
              `got ${JSON.stringify(options.group_columns_by_name)}`
            ],
            options
          );
        } else if (options.columns === false) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
            [
              "Invalid option group_columns_by_name:",
              "the `columns` mode must be activated."
            ],
            options
          );
        }
        if (options.comment === void 0 || options.comment === null || options.comment === false || options.comment === "") {
          options.comment = null;
        } else {
          if (typeof options.comment === "string") {
            options.comment = Buffer.from(options.comment, options.encoding);
          }
          if (!Buffer.isBuffer(options.comment)) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_COMMENT",
              [
                "Invalid option comment:",
                "comment must be a buffer or a string,",
                `got ${JSON.stringify(options.comment)}`
              ],
              options
            );
          }
        }
        if (options.comment_no_infix === void 0 || options.comment_no_infix === null || options.comment_no_infix === false) {
          options.comment_no_infix = false;
        } else if (options.comment_no_infix !== true) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_COMMENT",
            [
              "Invalid option comment_no_infix:",
              "value must be a boolean,",
              `got ${JSON.stringify(options.comment_no_infix)}`
            ],
            options
          );
        }
        if (options.delimiter_auto === void 0 || options.delimiter_auto === null || options.delimiter_auto === false) {
          options.delimiter_auto = false;
        } else if (options.delimiter_auto === true) {
          options.delimiter_auto = {};
        } else if (!is_object$1(options.delimiter_auto)) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_DELIMITER_AUTO",
            [
              "Invalid option delimiter_auto:",
              "delimiter_auto must be a boolean or a configuration object,",
              `got ${JSON.stringify(options.delimiter_auto)}`
            ],
            options
          );
        }
        if (options.delimiter_auto) {
          if (options.delimiter_auto.preferred === void 0)
            options.delimiter_auto.preferred = {
              [",".charCodeAt(0)]: 1.8,
              ["	".charCodeAt(0)]: 1.8,
              [";".charCodeAt(0)]: 1.6,
              [" ".charCodeAt(0)]: 1.6,
              [":".charCodeAt(0)]: 1.5,
              [".".charCodeAt(0)]: 1.4,
              ["/".charCodeAt(0)]: 1.4
            };
          else if (!is_object$1(options.delimiter_auto.preferred)) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_DELIMITER_AUTO",
              [
                "Invalid option delimiter_auto:",
                "preferred must be an object,",
                `got ${JSON.stringify(options.delimiter_auto.preferred)}`
              ],
              options
            );
          }
          if (options.delimiter_auto.score === void 0)
            options.delimiter_auto.score = (info, options2) => {
              return (info.total - info.std) * (options2.preferred[info.char_code] || 1);
            };
          else if (typeof options.delimiter_auto.score !== "function") {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_DELIMITER_AUTO",
              [
                "Invalid option delimiter_auto:",
                "score must be a function,",
                `got ${JSON.stringify(options.delimiter_auto.score)}`
              ],
              options
            );
          }
          if (options.delimiter_auto.size === void 0)
            options.delimiter_auto.size = 2048;
          else if (typeof options.delimiter_auto.size !== "number") {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_DELIMITER_AUTO",
              [
                "Invalid option delimiter_auto:",
                "size must be a number,",
                `got ${JSON.stringify(options.delimiter_auto.size)}`
              ],
              options
            );
          }
        }
        const delimiter_json = JSON.stringify(options.delimiter);
        if (options.delimiter_auto !== false) {
          options.delimiter = [];
        }
        if (!Array.isArray(options.delimiter)) {
          if (options.delimiter === void 0 || options.delimiter === null || options.delimiter === false) {
            options.delimiter = Buffer.from(",", options.encoding);
          }
          options.delimiter = [options.delimiter];
        }
        options.delimiter = options.delimiter.map(function(delimiter) {
          if (typeof delimiter === "string") {
            delimiter = Buffer.from(delimiter, options.encoding);
          }
          if (!Buffer.isBuffer(delimiter) || delimiter.length === 0) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_DELIMITER",
              [
                "Invalid option delimiter:",
                "delimiter must be a non empty string or buffer or array of string|buffer,",
                `got ${delimiter_json}`
              ],
              options
            );
          }
          return delimiter;
        });
        if (options.escape === void 0 || options.escape === true) {
          options.escape = Buffer.from('"', options.encoding);
        } else if (typeof options.escape === "string") {
          options.escape = Buffer.from(options.escape, options.encoding);
        } else if (options.escape === null || options.escape === false) {
          options.escape = null;
        }
        if (options.escape !== null) {
          if (!Buffer.isBuffer(options.escape)) {
            throw new Error(
              `Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`
            );
          }
        }
        if (options.from === void 0 || options.from === null) {
          options.from = 1;
        } else {
          if (typeof options.from === "string" && /\d+/.test(options.from)) {
            options.from = parseInt(options.from);
          }
          if (Number.isInteger(options.from)) {
            if (options.from < 0) {
              throw new Error(
                `Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`
              );
            }
          } else {
            throw new Error(
              `Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`
            );
          }
        }
        if (options.from_line === void 0 || options.from_line === null) {
          options.from_line = 1;
        } else {
          if (typeof options.from_line === "string" && /\d+/.test(options.from_line)) {
            options.from_line = parseInt(options.from_line);
          }
          if (Number.isInteger(options.from_line)) {
            if (options.from_line <= 0) {
              throw new Error(
                `Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`
              );
            }
          } else {
            throw new Error(
              `Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`
            );
          }
        }
        if (options.ignore_last_delimiters === void 0 || options.ignore_last_delimiters === null) {
          options.ignore_last_delimiters = false;
        } else if (typeof options.ignore_last_delimiters === "number") {
          options.ignore_last_delimiters = Math.floor(options.ignore_last_delimiters);
          if (options.ignore_last_delimiters === 0) {
            options.ignore_last_delimiters = false;
          }
        } else if (typeof options.ignore_last_delimiters !== "boolean") {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS",
            [
              "Invalid option `ignore_last_delimiters`:",
              "the value must be a boolean value or an integer,",
              `got ${JSON.stringify(options.ignore_last_delimiters)}`
            ],
            options
          );
        }
        if (options.ignore_last_delimiters === true && options.columns === false) {
          throw new CsvError$1(
            "CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS",
            [
              "The option `ignore_last_delimiters`",
              "requires the activation of the `columns` option"
            ],
            options
          );
        }
        if (options.info === void 0 || options.info === null || options.info === false) {
          options.info = false;
        } else if (options.info !== true) {
          throw new Error(
            `Invalid Option: info must be true, got ${JSON.stringify(options.info)}`
          );
        }
        if (options.max_record_size === void 0 || options.max_record_size === null || options.max_record_size === false) {
          options.max_record_size = 0;
        } else if (Number.isInteger(options.max_record_size) && options.max_record_size >= 0) ;
        else if (typeof options.max_record_size === "string" && /\d+/.test(options.max_record_size)) {
          options.max_record_size = parseInt(options.max_record_size);
        } else {
          throw new Error(
            `Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`
          );
        }
        if (options.objname === void 0 || options.objname === null || options.objname === false) {
          options.objname = void 0;
        } else if (Buffer.isBuffer(options.objname)) {
          if (options.objname.length === 0) {
            throw new Error(`Invalid Option: objname must be a non empty buffer`);
          }
          if (options.encoding === null) ;
          else {
            options.objname = options.objname.toString(options.encoding);
          }
        } else if (typeof options.objname === "string") {
          if (options.objname.length === 0) {
            throw new Error(`Invalid Option: objname must be a non empty string`);
          }
        } else if (typeof options.objname === "number") ;
        else {
          throw new Error(
            `Invalid Option: objname must be a string or a buffer, got ${options.objname}`
          );
        }
        if (options.objname !== void 0) {
          if (typeof options.objname === "number") {
            if (options.columns !== false) {
              throw Error(
                "Invalid Option: objname index cannot be combined with columns or be defined as a field"
              );
            }
          } else {
            if (options.columns === false) {
              throw Error(
                "Invalid Option: objname field must be combined with columns or be defined as an index"
              );
            }
          }
        }
        if (options.on_record === void 0 || options.on_record === null) {
          options.on_record = void 0;
        } else if (typeof options.on_record !== "function") {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_ON_RECORD",
            [
              "Invalid option `on_record`:",
              "expect a function,",
              `got ${JSON.stringify(options.on_record)}`
            ],
            options
          );
        }
        if (options.on_skip !== void 0 && options.on_skip !== null && typeof options.on_skip !== "function") {
          throw new Error(
            `Invalid Option: on_skip must be a function, got ${JSON.stringify(options.on_skip)}`
          );
        }
        if (options.quote === null || options.quote === false || options.quote === "") {
          options.quote = null;
        } else {
          if (options.quote === void 0 || options.quote === true) {
            options.quote = Buffer.from('"', options.encoding);
          } else if (typeof options.quote === "string") {
            options.quote = Buffer.from(options.quote, options.encoding);
          }
          if (!Buffer.isBuffer(options.quote)) {
            throw new Error(
              `Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`
            );
          }
        }
        if (options.raw === void 0 || options.raw === null || options.raw === false) {
          options.raw = false;
        } else if (options.raw !== true) {
          throw new Error(
            `Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`
          );
        }
        if (options.record_delimiter === void 0) {
          options.record_delimiter = [];
        } else if (typeof options.record_delimiter === "string" || Buffer.isBuffer(options.record_delimiter)) {
          if (options.record_delimiter.length === 0) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_RECORD_DELIMITER",
              [
                "Invalid option `record_delimiter`:",
                "value must be a non empty string or buffer,",
                `got ${JSON.stringify(options.record_delimiter)}`
              ],
              options
            );
          }
          options.record_delimiter = [options.record_delimiter];
        } else if (!Array.isArray(options.record_delimiter)) {
          throw new CsvError$1(
            "CSV_INVALID_OPTION_RECORD_DELIMITER",
            [
              "Invalid option `record_delimiter`:",
              "value must be a string, a buffer or array of string|buffer,",
              `got ${JSON.stringify(options.record_delimiter)}`
            ],
            options
          );
        }
        options.record_delimiter = options.record_delimiter.map(function(rd, i) {
          if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_RECORD_DELIMITER",
              [
                "Invalid option `record_delimiter`:",
                "value must be a string, a buffer or array of string|buffer",
                `at index ${i},`,
                `got ${JSON.stringify(rd)}`
              ],
              options
            );
          } else if (rd.length === 0) {
            throw new CsvError$1(
              "CSV_INVALID_OPTION_RECORD_DELIMITER",
              [
                "Invalid option `record_delimiter`:",
                "value must be a non empty string or buffer",
                `at index ${i},`,
                `got ${JSON.stringify(rd)}`
              ],
              options
            );
          }
          if (typeof rd === "string") {
            rd = Buffer.from(rd, options.encoding);
          }
          return rd;
        });
        if (typeof options.relax_column_count === "boolean") ;
        else if (options.relax_column_count === void 0 || options.relax_column_count === null) {
          options.relax_column_count = false;
        } else {
          throw new Error(
            `Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`
          );
        }
        if (typeof options.relax_column_count_less === "boolean") ;
        else if (options.relax_column_count_less === void 0 || options.relax_column_count_less === null) {
          options.relax_column_count_less = false;
        } else {
          throw new Error(
            `Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`
          );
        }
        if (typeof options.relax_column_count_more === "boolean") ;
        else if (options.relax_column_count_more === void 0 || options.relax_column_count_more === null) {
          options.relax_column_count_more = false;
        } else {
          throw new Error(
            `Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`
          );
        }
        if (typeof options.relax_quotes === "boolean") ;
        else if (options.relax_quotes === void 0 || options.relax_quotes === null) {
          options.relax_quotes = false;
        } else {
          throw new Error(
            `Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options.relax_quotes)}`
          );
        }
        if (typeof options.skip_empty_lines === "boolean") ;
        else if (options.skip_empty_lines === void 0 || options.skip_empty_lines === null) {
          options.skip_empty_lines = false;
        } else {
          throw new Error(
            `Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`
          );
        }
        if (typeof options.skip_records_with_empty_values === "boolean") ;
        else if (options.skip_records_with_empty_values === void 0 || options.skip_records_with_empty_values === null) {
          options.skip_records_with_empty_values = false;
        } else {
          throw new Error(
            `Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_records_with_empty_values)}`
          );
        }
        if (typeof options.skip_records_with_error === "boolean") ;
        else if (options.skip_records_with_error === void 0 || options.skip_records_with_error === null) {
          options.skip_records_with_error = false;
        } else {
          throw new Error(
            `Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options.skip_records_with_error)}`
          );
        }
        if (options.rtrim === void 0 || options.rtrim === null || options.rtrim === false) {
          options.rtrim = false;
        } else if (options.rtrim !== true) {
          throw new Error(
            `Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`
          );
        }
        if (options.ltrim === void 0 || options.ltrim === null || options.ltrim === false) {
          options.ltrim = false;
        } else if (options.ltrim !== true) {
          throw new Error(
            `Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`
          );
        }
        if (options.trim === void 0 || options.trim === null || options.trim === false) {
          options.trim = false;
        } else if (options.trim !== true) {
          throw new Error(
            `Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`
          );
        }
        if (options.trim === true && opts.ltrim !== false) {
          options.ltrim = true;
        } else if (options.ltrim !== true) {
          options.ltrim = false;
        }
        if (options.trim === true && opts.rtrim !== false) {
          options.rtrim = true;
        } else if (options.rtrim !== true) {
          options.rtrim = false;
        }
        if (options.to === void 0 || options.to === null) {
          options.to = -1;
        } else if (options.to !== -1) {
          if (typeof options.to === "string" && /\d+/.test(options.to)) {
            options.to = parseInt(options.to);
          }
          if (Number.isInteger(options.to)) {
            if (options.to <= 0) {
              throw new Error(
                `Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`
              );
            }
          } else {
            throw new Error(
              `Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`
            );
          }
        }
        if (options.to_line === void 0 || options.to_line === null) {
          options.to_line = -1;
        } else if (options.to_line !== -1) {
          if (typeof options.to_line === "string" && /\d+/.test(options.to_line)) {
            options.to_line = parseInt(options.to_line);
          }
          if (Number.isInteger(options.to_line)) {
            if (options.to_line <= 0) {
              throw new Error(
                `Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`
              );
            }
          } else {
            throw new Error(
              `Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`
            );
          }
        }
        return options;
      };
      var delimiter_discover = function(records, options) {
        if (!options) {
          ({ delimiter_auto: options } = normalize_options$1({ delimiter_auto: true }));
        }
        if (typeof records === "string") {
          records = Buffer.from(records);
        }
        if (Buffer.isBuffer(records)) {
          records = ((data) => {
            const records2 = [];
            const parser = transform$1({ delimiter: [] });
            const push = (record) => records2.push(record);
            const close = () => {
            };
            const error = parser.parse(data, true, push, close);
            if (error !== void 0) throw error;
            return records2;
          })(records);
        }
        const info = Array(127).fill().map(() => ({ lines: [] }));
        records.map(([record], line) => {
          for (let i = 0, l = record.length; i < l; i++) {
            const code = record.charCodeAt(i);
            if (info[code].lines[line] === void 0) info[code].lines[line] = 0;
            info[code].lines[line]++;
          }
        });
        info.map((info2, i) => {
          info2.char_code = i;
          info2.std = std(info2.lines);
          info2.total = info2.lines.reduce((acc, val) => acc + val, 0);
          info2.preferred = !!options.preferred[i];
          info2.score = options.score(info2, options);
        });
        const result2 = info.reduce(
          (acc, info2) => acc.score > info2.score ? acc : info2,
          {}
        );
        return String.fromCharCode(result2.char_code);
      };
      var std = function(array) {
        const n = array.length;
        if (n === 0) return 0;
        const mean = array.reduce((a, b) => a + b) / n;
        return Math.sqrt(
          array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
        );
      };
      var isRecordEmpty = function(record) {
        return record.every(
          (field) => field == null || field.toString && field.toString().trim() === ""
        );
      };
      var cr = 13;
      var nl = 10;
      var boms = {
        // Note, the following are equals:
        // Buffer.from("\ufeff")
        // Buffer.from([239, 187, 191])
        // Buffer.from('EFBBBF', 'hex')
        utf8: Buffer.from([239, 187, 191]),
        // Note, the following are equals:
        // Buffer.from "\ufeff", 'utf16le
        // Buffer.from([255, 254])
        utf16le: Buffer.from([255, 254])
      };
      var transform$1 = function(original_options = {}) {
        const info = {
          bytes: 0,
          bytes_records: 0,
          comment_lines: 0,
          empty_lines: 0,
          invalid_field_length: 0,
          lines: 1,
          records: 0
        };
        const options = normalize_options$1(original_options);
        return {
          info,
          original_options,
          options,
          state: init_state(options),
          __needMoreData: function(i, bufLen, end) {
            if (end) return false;
            const { encoding, escape, quote } = this.options;
            const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
            const numOfCharLeft = bufLen - i - 1;
            const requiredLength = Math.max(
              needMoreDataSize,
              // Skip if the remaining buffer smaller than record delimiter
              // If "record_delimiter" is yet to be discovered:
              // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
              // 2. We set the length to windows line ending in the current encoding
              // Note, that encoding is known from user or bom discovery at that point
              // recordDelimiterMaxLength,
              recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
              // Skip if remaining buffer can be an escaped quote
              quoting ? (escape === null ? 0 : escape.length) + quote.length : 0,
              // Skip if remaining buffer can be record delimiter following the closing quote
              quoting ? quote.length + recordDelimiterMaxLength : 0
            );
            return numOfCharLeft < requiredLength;
          },
          // Central parser implementation
          parse: function(nextBuf, end, push, close) {
            const {
              bom,
              comment_no_infix,
              delimiter_auto,
              encoding,
              from_line,
              ltrim,
              max_record_size,
              raw,
              relax_quotes,
              rtrim,
              skip_empty_lines,
              to,
              to_line
            } = this.options;
            let { comment, escape, quote, record_delimiter } = this.options;
            const {
              bomSkipped,
              delimiterDiscovered,
              delimiterBufPrevious,
              rawBuffer,
              escapeIsQuote
            } = this.state;
            if (!delimiterDiscovered && delimiter_auto) {
              let delimiterBuf;
              if (delimiterBufPrevious === void 0) {
                delimiterBuf = nextBuf;
              } else if (delimiterBufPrevious !== void 0 && nextBuf === void 0) {
                delimiterBuf = delimiterBufPrevious;
              } else {
                delimiterBuf = Buffer.concat([delimiterBufPrevious, nextBuf]);
              }
              nextBuf = void 0;
              if (end || delimiterBuf.length > delimiter_auto.size) {
                this.options.delimiter = [
                  Buffer.from(
                    delimiter_discover(delimiterBuf, this.options.delimiter_auto)
                  )
                ];
                this.state.previousBuf = delimiterBuf;
                this.state.delimiterBufPrevious = void 0;
                this.state.delimiterDiscovered = true;
              } else {
                this.state.delimiterBufPrevious = delimiterBuf;
                return;
              }
            }
            const { previousBuf } = this.state;
            let buf;
            if (previousBuf === void 0) {
              if (nextBuf === void 0) {
                close();
                return;
              } else {
                buf = nextBuf;
              }
            } else if (previousBuf !== void 0 && nextBuf === void 0) {
              buf = previousBuf;
            } else {
              buf = Buffer.concat([previousBuf, nextBuf]);
            }
            if (bomSkipped === false) {
              if (bom === false) {
                this.state.bomSkipped = true;
              } else if (buf.length < 3) {
                if (end === false) {
                  this.state.previousBuf = buf;
                  return;
                }
              } else {
                for (const encoding2 in boms) {
                  if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
                    const bomLength = boms[encoding2].length;
                    this.state.bufBytesStart += bomLength;
                    buf = buf.slice(bomLength);
                    const options2 = normalize_options$1({
                      ...this.original_options,
                      encoding: encoding2
                    });
                    for (const key in options2) {
                      this.options[key] = options2[key];
                    }
                    ({ comment, escape, quote } = this.options);
                    break;
                  }
                }
                this.state.bomSkipped = true;
              }
            }
            const bufLen = buf.length;
            let pos;
            for (pos = 0; pos < bufLen; pos++) {
              if (this.__needMoreData(pos, bufLen, end)) {
                break;
              }
              if (this.state.wasRowDelimiter === true) {
                this.info.lines++;
                this.state.wasRowDelimiter = false;
              }
              if (to_line !== -1 && this.info.lines > to_line) {
                this.state.stop = true;
                close();
                return;
              }
              if (this.state.quoting === false && record_delimiter.length === 0) {
                const record_delimiterCount = this.__autoDiscoverRecordDelimiter(
                  buf,
                  pos
                );
                if (record_delimiterCount) {
                  record_delimiter = this.options.record_delimiter;
                }
              }
              const chr = buf[pos];
              if (raw === true) {
                rawBuffer.append(chr);
              }
              if ((chr === cr || chr === nl) && this.state.wasRowDelimiter === false) {
                this.state.wasRowDelimiter = true;
              }
              if (this.state.escaping === true) {
                this.state.escaping = false;
              } else {
                if (escape !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape.length < bufLen) {
                  if (escapeIsQuote) {
                    if (this.__isQuote(buf, pos + escape.length)) {
                      this.state.escaping = true;
                      pos += escape.length - 1;
                      continue;
                    }
                  } else {
                    this.state.escaping = true;
                    pos += escape.length - 1;
                    continue;
                  }
                }
                if (this.state.commenting === false && this.__isQuote(buf, pos)) {
                  if (this.state.quoting === true) {
                    const nextChr = buf[pos + quote.length];
                    const isNextChrTrimable = rtrim && this.__isCharTrimable(buf, pos + quote.length);
                    const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
                    const isNextChrDelimiter = this.__isDelimiter(
                      buf,
                      pos + quote.length,
                      nextChr
                    );
                    const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
                    if (escape !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape.length)) {
                      pos += escape.length - 1;
                    } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                      this.state.quoting = false;
                      this.state.wasQuoting = true;
                      pos += quote.length - 1;
                      continue;
                    } else if (relax_quotes === false) {
                      const err = this.__error(
                        new CsvError$1(
                          "CSV_INVALID_CLOSING_QUOTE",
                          [
                            "Invalid Closing Quote:",
                            `got "${String.fromCharCode(nextChr)}"`,
                            `at line ${this.info.lines}`,
                            "instead of delimiter, record delimiter, trimable character",
                            "(if activated) or comment"
                          ],
                          this.options,
                          this.__infoField()
                        )
                      );
                      if (err !== void 0) return err;
                    } else {
                      this.state.quoting = false;
                      this.state.wasQuoting = true;
                      this.state.field.prepend(quote);
                      pos += quote.length - 1;
                    }
                  } else {
                    if (this.state.field.length !== 0) {
                      if (relax_quotes === false) {
                        const info2 = this.__infoField();
                        const bom2 = Object.keys(boms).map(
                          (b) => boms[b].equals(this.state.field.toString()) ? b : false
                        ).filter(Boolean)[0];
                        const err = this.__error(
                          new CsvError$1(
                            "INVALID_OPENING_QUOTE",
                            [
                              "Invalid Opening Quote:",
                              `a quote is found on field ${JSON.stringify(info2.column)} at line ${info2.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                              bom2 ? `(${bom2} bom)` : void 0
                            ],
                            this.options,
                            info2,
                            {
                              field: this.state.field
                            }
                          )
                        );
                        if (err !== void 0) return err;
                      }
                    } else {
                      this.state.quoting = true;
                      pos += quote.length - 1;
                      continue;
                    }
                  }
                }
                if (this.state.quoting === false) {
                  const recordDelimiterLength = this.__isRecordDelimiter(
                    chr,
                    buf,
                    pos
                  );
                  if (recordDelimiterLength !== 0) {
                    const skipCommentLine = this.state.commenting && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0;
                    if (skipCommentLine) {
                      this.info.comment_lines++;
                    } else {
                      if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                        this.state.enabled = true;
                        this.__resetField();
                        this.__resetRecord();
                        pos += recordDelimiterLength - 1;
                        continue;
                      }
                      if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                        this.info.empty_lines++;
                        pos += recordDelimiterLength - 1;
                        continue;
                      }
                      this.info.bytes = this.state.bufBytesStart + pos;
                      const errField = this.__onField();
                      if (errField !== void 0) return errField;
                      this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                      const errRecord = this.__onRecord(push);
                      if (errRecord !== void 0) return errRecord;
                      if (to !== -1 && this.info.records >= to) {
                        this.state.stop = true;
                        close();
                        return;
                      }
                    }
                    this.state.commenting = false;
                    pos += recordDelimiterLength - 1;
                    continue;
                  }
                  if (this.state.commenting) {
                    continue;
                  }
                  if (comment !== null && (comment_no_infix === false || this.state.record.length === 0 && this.state.field.length === 0)) {
                    const commentCount = this.__compareBytes(comment, buf, pos, chr);
                    if (commentCount !== 0) {
                      this.state.commenting = true;
                      continue;
                    }
                  }
                  const delimiterLength = this.__isDelimiter(buf, pos, chr);
                  if (delimiterLength !== 0) {
                    this.info.bytes = this.state.bufBytesStart + pos;
                    const errField = this.__onField();
                    if (errField !== void 0) return errField;
                    pos += delimiterLength - 1;
                    continue;
                  }
                }
              }
              if (this.state.commenting === false) {
                if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
                  return this.__error(
                    new CsvError$1(
                      "CSV_MAX_RECORD_SIZE",
                      [
                        "Max Record Size:",
                        "record exceed the maximum number of tolerated bytes",
                        `of ${max_record_size}`,
                        `at line ${this.info.lines}`
                      ],
                      this.options,
                      this.__infoField()
                    )
                  );
                }
              }
              const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
              const rappend = rtrim === false || this.state.wasQuoting === false;
              if (lappend === true && rappend === true) {
                this.state.field.append(chr);
              } else if (rtrim === true && !this.__isCharTrimable(buf, pos)) {
                return this.__error(
                  new CsvError$1(
                    "CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE",
                    [
                      "Invalid Closing Quote:",
                      "found non trimable byte after quote",
                      `at line ${this.info.lines}`
                    ],
                    this.options,
                    this.__infoField()
                  )
                );
              } else {
                if (lappend === false) {
                  pos += this.__isCharTrimable(buf, pos) - 1;
                }
                continue;
              }
            }
            if (end === true) {
              if (this.state.quoting === true) {
                const err = this.__error(
                  new CsvError$1(
                    "CSV_QUOTE_NOT_CLOSED",
                    [
                      "Quote Not Closed:",
                      `the parsing is finished with an opening quote at line ${this.info.lines}`
                    ],
                    this.options,
                    this.__infoField()
                  )
                );
                if (err !== void 0) return err;
              } else {
                if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
                  this.info.bytes = this.state.bufBytesStart + pos;
                  const errField = this.__onField();
                  if (errField !== void 0) return errField;
                  const errRecord = this.__onRecord(push);
                  if (errRecord !== void 0) return errRecord;
                } else if (this.state.wasRowDelimiter === true) {
                  this.info.empty_lines++;
                } else if (this.state.commenting === true) {
                  this.info.comment_lines++;
                }
              }
            } else {
              this.state.bufBytesStart += pos;
              this.state.previousBuf = buf.slice(pos);
            }
            if (this.state.wasRowDelimiter === true) {
              this.info.lines++;
              this.state.wasRowDelimiter = false;
            }
          },
          __onRecord: function(push) {
            const {
              columns,
              group_columns_by_name,
              encoding,
              info: info2,
              from,
              relax_column_count,
              relax_column_count_less,
              relax_column_count_more,
              raw,
              skip_records_with_empty_values
            } = this.options;
            const { enabled, record } = this.state;
            if (enabled === false) {
              return this.__resetRecord();
            }
            const recordLength = record.length;
            if (columns === true) {
              if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
                this.__resetRecord();
                return;
              }
              return this.__firstLineToColumns(record);
            }
            if (columns === false && this.info.records === 0) {
              this.state.expectedRecordLength = recordLength;
            }
            if (recordLength !== this.state.expectedRecordLength) {
              const err = columns === false ? new CsvError$1(
                "CSV_RECORD_INCONSISTENT_FIELDS_LENGTH",
                [
                  "Invalid Record Length:",
                  `expect ${this.state.expectedRecordLength},`,
                  `got ${recordLength} on line ${this.info.lines}`
                ],
                this.options,
                this.__infoField(),
                {
                  record
                }
              ) : new CsvError$1(
                "CSV_RECORD_INCONSISTENT_COLUMNS",
                [
                  "Invalid Record Length:",
                  `columns length is ${columns.length},`,
                  // rename columns
                  `got ${recordLength} on line ${this.info.lines}`
                ],
                this.options,
                this.__infoField(),
                {
                  record
                }
              );
              if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
                this.info.invalid_field_length++;
                this.state.error = err;
              } else {
                const finalErr = this.__error(err);
                if (finalErr) return finalErr;
              }
            }
            if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
              this.__resetRecord();
              return;
            }
            if (this.state.recordHasError === true) {
              this.__resetRecord();
              this.state.recordHasError = false;
              return;
            }
            this.info.records++;
            if (from === 1 || this.info.records >= from) {
              const { objname } = this.options;
              if (columns !== false) {
                const obj = {};
                for (let i = 0, l = record.length; i < l; i++) {
                  if (columns[i] === void 0 || columns[i].disabled) continue;
                  if (group_columns_by_name === true && Object.hasOwn(obj, columns[i].name)) {
                    if (Array.isArray(obj[columns[i].name])) {
                      obj[columns[i].name] = obj[columns[i].name].concat(record[i]);
                    } else {
                      obj[columns[i].name] = [obj[columns[i].name], record[i]];
                    }
                  } else {
                    Object.defineProperty(obj, columns[i].name, {
                      value: record[i],
                      enumerable: true,
                      writable: true,
                      configurable: true
                    });
                  }
                }
                if (raw === true || info2 === true) {
                  const extRecord = Object.assign(
                    { record: obj },
                    raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
                    info2 === true ? { info: this.__infoRecord() } : {}
                  );
                  const err = this.__push(
                    objname === void 0 ? extRecord : [obj[objname], extRecord],
                    push
                  );
                  if (err) {
                    return err;
                  }
                } else {
                  const err = this.__push(
                    objname === void 0 ? obj : [obj[objname], obj],
                    push
                  );
                  if (err) {
                    return err;
                  }
                }
              } else {
                if (raw === true || info2 === true) {
                  const extRecord = Object.assign(
                    { record },
                    raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
                    info2 === true ? { info: this.__infoRecord() } : {}
                  );
                  const err = this.__push(
                    objname === void 0 ? extRecord : [record[objname], extRecord],
                    push
                  );
                  if (err) {
                    return err;
                  }
                } else {
                  const err = this.__push(
                    objname === void 0 ? record : [record[objname], record],
                    push
                  );
                  if (err) {
                    return err;
                  }
                }
              }
            }
            this.__resetRecord();
          },
          __firstLineToColumns: function(record) {
            const { firstLineToHeaders } = this.state;
            try {
              const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
              if (!Array.isArray(headers)) {
                return this.__error(
                  new CsvError$1(
                    "CSV_INVALID_COLUMN_MAPPING",
                    [
                      "Invalid Column Mapping:",
                      "expect an array from column function,",
                      `got ${JSON.stringify(headers)}`
                    ],
                    this.options,
                    this.__infoField(),
                    {
                      headers
                    }
                  )
                );
              }
              const normalizedHeaders = normalize_columns_array(headers);
              this.state.expectedRecordLength = normalizedHeaders.length;
              this.options.columns = normalizedHeaders;
              this.__resetRecord();
              return;
            } catch (err) {
              return err;
            }
          },
          __resetRecord: function() {
            if (this.options.raw === true) {
              this.state.rawBuffer.reset();
            }
            this.state.error = void 0;
            this.state.record = [];
            this.state.record_length = 0;
          },
          __onField: function() {
            const { cast, encoding, rtrim, max_record_size } = this.options;
            const { enabled, wasQuoting } = this.state;
            if (enabled === false) {
              return this.__resetField();
            }
            let field = this.state.field.toString(encoding);
            if (rtrim === true && wasQuoting === false) {
              field = field.trimRight();
            }
            if (cast === true) {
              const [err, f] = this.__cast(field);
              if (err !== void 0) return err;
              field = f;
            }
            this.state.record.push(field);
            if (max_record_size !== 0 && typeof field === "string") {
              this.state.record_length += field.length;
            }
            this.__resetField();
          },
          __resetField: function() {
            this.state.field.reset();
            this.state.wasQuoting = false;
          },
          __push: function(record, push) {
            const { on_record } = this.options;
            if (on_record !== void 0) {
              const info2 = this.__infoRecord();
              try {
                record = on_record.call(null, record, info2);
              } catch (err) {
                return err;
              }
              if (record === void 0 || record === null) {
                return;
              }
            }
            this.info.bytes_records += this.info.bytes;
            push(record);
          },
          // Return a tuple with the error and the casted value
          __cast: function(field) {
            const { columns, relax_column_count } = this.options;
            const isColumns = Array.isArray(columns);
            if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
              return [void 0, void 0];
            }
            if (this.state.castField !== null) {
              try {
                const info2 = this.__infoField();
                return [void 0, this.state.castField.call(null, field, info2)];
              } catch (err) {
                return [err];
              }
            }
            if (this.__isFloat(field)) {
              return [void 0, parseFloat(field)];
            } else if (this.options.cast_date !== false) {
              const info2 = this.__infoField();
              return [void 0, this.options.cast_date.call(null, field, info2)];
            }
            return [void 0, field];
          },
          __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
            if (sourceBuf[0] !== firstByte) return 0;
            const sourceLength = sourceBuf.length;
            for (let i = 1; i < sourceLength; i++) {
              if (sourceBuf[i] !== targetBuf[targetPos + i]) return 0;
            }
            return sourceLength;
          },
          // Helper to test if a character is trimable
          __isCharTrimable: function(buf, pos) {
            const { timchars, timcharFirstBytes } = this.state;
            const first = buf[pos];
            if (first === void 0 || timcharFirstBytes[first] === 0) return 0;
            loop1: for (let i = 0; i < timchars.length; i++) {
              const timchar = timchars[i];
              for (let j = 0; j < timchar.length; j++) {
                if (timchar[j] !== buf[pos + j]) continue loop1;
              }
              return timchar.length;
            }
            return 0;
          },
          __isDelimiter: function(buf, pos, chr) {
            const { delimiter, ignore_last_delimiters } = this.options;
            if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
              return 0;
            } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
              return 0;
            }
            loop1: for (let i = 0; i < delimiter.length; i++) {
              const del = delimiter[i];
              if (del[0] === chr) {
                for (let j = 1; j < del.length; j++) {
                  if (del[j] !== buf[pos + j]) continue loop1;
                }
                return del.length;
              }
            }
            return 0;
          },
          __isEscape: function(buf, pos, chr) {
            const { escape } = this.options;
            if (escape === null) return false;
            const l = escape.length;
            if (escape[0] === chr) {
              for (let i = 0; i < l; i++) {
                if (escape[i] !== buf[pos + i]) {
                  return false;
                }
              }
              return true;
            }
            return false;
          },
          __isFloat: function(value) {
            return value - parseFloat(value) + 1 >= 0;
          },
          // Keep it in case we implement the `cast_int` option
          // __isInt(value){
          //   // return Number.isInteger(parseInt(value))
          //   // return !isNaN( parseInt( obj ) );
          //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
          // }
          __isQuote: function(buf, pos) {
            const { quote } = this.options;
            if (quote === null) return false;
            const l = quote.length;
            for (let i = 0; i < l; i++) {
              if (quote[i] !== buf[pos + i]) {
                return false;
              }
            }
            return true;
          },
          __isRecordDelimiter: function(chr, buf, pos) {
            const { record_delimiter } = this.options;
            const recordDelimiterLength = record_delimiter.length;
            loop1: for (let i = 0; i < recordDelimiterLength; i++) {
              const rd = record_delimiter[i];
              const rdLength = rd.length;
              if (rd[0] !== chr) {
                continue;
              }
              for (let j = 1; j < rdLength; j++) {
                if (rd[j] !== buf[pos + j]) {
                  continue loop1;
                }
              }
              return rd.length;
            }
            return 0;
          },
          __autoDiscoverRecordDelimiter: function(buf, pos) {
            const { encoding } = this.options;
            const rds = [
              // Important, the windows line ending must be before mac os 9
              Buffer.from("\r\n", encoding),
              Buffer.from("\n", encoding),
              Buffer.from("\r", encoding)
            ];
            loop: for (let i = 0; i < rds.length; i++) {
              const l = rds[i].length;
              for (let j = 0; j < l; j++) {
                if (rds[i][j] !== buf[pos + j]) {
                  continue loop;
                }
              }
              this.options.record_delimiter.push(rds[i]);
              this.state.recordDelimiterMaxLength = rds[i].length;
              return rds[i].length;
            }
            return 0;
          },
          __error: function(msg) {
            const { encoding, raw, skip_records_with_error } = this.options;
            const err = typeof msg === "string" ? new Error(msg) : msg;
            if (skip_records_with_error) {
              this.state.recordHasError = true;
              if (this.options.on_skip !== void 0) {
                try {
                  this.options.on_skip(
                    err,
                    raw ? this.state.rawBuffer.toString(encoding) : void 0
                  );
                } catch (err2) {
                  return err2;
                }
              }
              return void 0;
            } else {
              return err;
            }
          },
          __infoDataSet: function() {
            return {
              ...this.info,
              columns: this.options.columns
            };
          },
          __infoRecord: function() {
            const { columns, raw, encoding } = this.options;
            return {
              ...this.__infoDataSet(),
              bytes_records: this.info.bytes,
              error: this.state.error,
              header: columns === true,
              index: this.state.record.length,
              raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
            };
          },
          __infoField: function() {
            const { columns } = this.options;
            const isColumns = Array.isArray(columns);
            const bytes_records = this.info.bytes_records;
            return {
              ...this.__infoRecord(),
              bytes_records,
              column: isColumns === true ? columns.length > this.state.record.length ? columns[this.state.record.length].name : null : this.state.record.length,
              quoting: this.state.wasQuoting
            };
          }
        };
      };
      var Parser = class extends stream.Transform {
        constructor(opts = {}) {
          super({ ...{ readableObjectMode: true }, ...opts, encoding: null });
          this.api = transform$1({
            on_skip: (err, chunk) => {
              this.emit("skip", err, chunk);
            },
            ...opts
          });
          this.state = this.api.state;
          this.options = this.api.options;
          this.info = this.api.info;
        }
        // Implementation of `Transform._transform`
        _transform(buf, _, callback) {
          if (this.state.stop === true) {
            return;
          }
          const err = this.api.parse(
            buf,
            false,
            (record) => {
              this.push(record);
            },
            () => {
              this.push(null);
              this.end();
              this.on("end", this.destroy);
            }
          );
          if (err !== void 0) {
            this.state.stop = true;
          }
          callback(err);
        }
        // Implementation of `Transform._flush`
        _flush(callback) {
          if (this.state.stop === true) {
            return;
          }
          const err = this.api.parse(
            void 0,
            true,
            (record) => {
              this.push(record);
            },
            () => {
              this.push(null);
              this.on("end", this.destroy);
            }
          );
          callback(err);
        }
      };
      var parse = function() {
        let data, options, callback;
        for (const i in arguments) {
          const argument = arguments[i];
          const type = typeof argument;
          if (data === void 0 && (typeof argument === "string" || Buffer.isBuffer(argument))) {
            data = argument;
          } else if (options === void 0 && is_object$1(argument)) {
            options = argument;
          } else if (callback === void 0 && type === "function") {
            callback = argument;
          } else {
            throw new CsvError$1(
              "CSV_INVALID_ARGUMENT",
              ["Invalid argument:", `got ${JSON.stringify(argument)} at index ${i}`],
              options || {}
            );
          }
        }
        const parser = new Parser(options);
        if (callback) {
          const records = options === void 0 || options.objname === void 0 ? [] : /* @__PURE__ */ Object.create(null);
          parser.on("readable", function() {
            let record;
            while ((record = this.read()) !== null) {
              if (options === void 0 || options.objname === void 0) {
                records.push(record);
              } else {
                Object.assign(records, {
                  [record[0]]: record[1]
                  // writable: true,
                  // enumerable: true,
                  // configurable: true
                });
              }
            }
          });
          parser.on("error", function(err) {
            callback(err, void 0, parser.api.__infoDataSet());
          });
          parser.on("end", function() {
            callback(void 0, records, parser.api.__infoDataSet());
          });
        }
        if (data !== void 0) {
          const writer = function() {
            parser.write(data);
            parser.end();
          };
          if (typeof setImmediate === "function") {
            setImmediate(writer);
          } else {
            setTimeout(writer, 0);
          }
        }
        return parser;
      };
      var CsvError = class _CsvError extends Error {
        constructor(code, message, ...contexts) {
          if (Array.isArray(message)) message = message.join(" ");
          super(message);
          if (Error.captureStackTrace !== void 0) {
            Error.captureStackTrace(this, _CsvError);
          }
          this.code = code;
          for (const context of contexts) {
            for (const key in context) {
              const value = context[key];
              this[key] = Buffer.isBuffer(value) ? value.toString() : value == null ? value : JSON.parse(JSON.stringify(value));
            }
          }
        }
      };
      var is_object = function(obj) {
        return typeof obj === "object" && obj !== null && !Array.isArray(obj);
      };
      var charCodeOfDot = ".".charCodeAt(0);
      var reEscapeChar = /\\(\\)?/g;
      var rePropName = RegExp(
        // Match anything that isn't a dot or bracket.
        `[^.[\\]]+|\\[(?:([^"'][^[]*)|(["'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2)\\]|(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))`,
        "g"
      );
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var reIsPlainProp = /^\w*$/;
      var getTag = function(value) {
        return Object.prototype.toString.call(value);
      };
      var isSymbol = function(value) {
        const type = typeof value;
        return type === "symbol" || type === "object" && value && getTag(value) === "[object Symbol]";
      };
      var isKey = function(value, object) {
        if (Array.isArray(value)) {
          return false;
        }
        const type = typeof value;
        if (type === "number" || type === "symbol" || type === "boolean" || !value || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      };
      var stringToPath = function(string) {
        const result2 = [];
        if (string.charCodeAt(0) === charCodeOfDot) {
          result2.push("");
        }
        string.replace(rePropName, function(match, expression, quote, subString) {
          let key = match;
          if (quote) {
            key = subString.replace(reEscapeChar, "$1");
          } else if (expression) {
            key = expression.trim();
          }
          result2.push(key);
        });
        return result2;
      };
      var castPath = function(value, object) {
        if (Array.isArray(value)) {
          return value;
        } else {
          return isKey(value, object) ? [value] : stringToPath(value);
        }
      };
      var toKey = function(value) {
        if (typeof value === "string" || isSymbol(value)) return value;
        const result2 = `${value}`;
        return result2 == "0" && 1 / value == -Infinity ? "-0" : result2;
      };
      var get = function(object, path) {
        path = castPath(path, object);
        let index = 0;
        const length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index === length ? object : void 0;
      };
      var normalize_columns = function(columns) {
        if (columns === void 0 || columns === null) {
          return [void 0, void 0];
        }
        if (typeof columns !== "object") {
          return [Error('Invalid option "columns": expect an array or an object')];
        }
        if (!Array.isArray(columns)) {
          const newcolumns = [];
          for (const k in columns) {
            newcolumns.push({
              key: k,
              header: columns[k]
            });
          }
          columns = newcolumns;
        } else {
          const newcolumns = [];
          for (const column of columns) {
            if (typeof column === "string") {
              newcolumns.push({
                key: column,
                header: column
              });
            } else if (typeof column === "object" && column !== null && !Array.isArray(column)) {
              if (!column.key) {
                return [
                  Error('Invalid column definition: property "key" is required')
                ];
              }
              if (column.header === void 0) {
                column.header = column.key;
              }
              newcolumns.push(column);
            } else {
              return [
                Error("Invalid column definition: expect a string or an object")
              ];
            }
          }
          columns = newcolumns;
        }
        return [void 0, columns];
      };
      var underscore = function(str) {
        return str.replace(/([A-Z])/g, function(_, match) {
          return "_" + match.toLowerCase();
        });
      };
      var normalize_options = function(opts) {
        const options = {};
        for (const opt in opts) {
          options[underscore(opt)] = opts[opt];
        }
        if (options.bom === void 0 || options.bom === null || options.bom === false) {
          options.bom = false;
        } else if (options.bom !== true) {
          return [
            new CsvError("CSV_OPTION_BOOLEAN_INVALID_TYPE", [
              "option `bom` is optional and must be a boolean value,",
              `got ${JSON.stringify(options.bom)}`
            ])
          ];
        }
        if (options.delimiter === void 0 || options.delimiter === null) {
          options.delimiter = ",";
        } else if (Buffer.isBuffer(options.delimiter)) {
          options.delimiter = options.delimiter.toString();
        } else if (typeof options.delimiter !== "string") {
          return [
            new CsvError("CSV_OPTION_DELIMITER_INVALID_TYPE", [
              "option `delimiter` must be a buffer or a string,",
              `got ${JSON.stringify(options.delimiter)}`
            ])
          ];
        }
        if (options.quote === void 0 || options.quote === null) {
          options.quote = '"';
        } else if (options.quote === true) {
          options.quote = '"';
        } else if (options.quote === false) {
          options.quote = "";
        } else if (Buffer.isBuffer(options.quote)) {
          options.quote = options.quote.toString();
        } else if (typeof options.quote !== "string") {
          return [
            new CsvError("CSV_OPTION_QUOTE_INVALID_TYPE", [
              "option `quote` must be a boolean, a buffer or a string,",
              `got ${JSON.stringify(options.quote)}`
            ])
          ];
        }
        if (options.quoted === void 0 || options.quoted === null) {
          options.quoted = false;
        }
        if (options.escape_formulas === void 0 || options.escape_formulas === null) {
          options.escape_formulas = false;
        } else if (typeof options.escape_formulas !== "boolean") {
          return [
            new CsvError("CSV_OPTION_ESCAPE_FORMULAS_INVALID_TYPE", [
              "option `escape_formulas` must be a boolean,",
              `got ${JSON.stringify(options.escape_formulas)}`
            ])
          ];
        }
        if (options.quoted_empty === void 0 || options.quoted_empty === null) {
          options.quoted_empty = void 0;
        }
        if (options.quoted_match === void 0 || options.quoted_match === null || options.quoted_match === false) {
          options.quoted_match = null;
        } else if (!Array.isArray(options.quoted_match)) {
          options.quoted_match = [options.quoted_match];
        }
        if (options.quoted_match) {
          for (const quoted_match of options.quoted_match) {
            const isString = typeof quoted_match === "string";
            const isRegExp = quoted_match instanceof RegExp;
            if (!isString && !isRegExp) {
              return [
                new CsvError("CSV_OPTION_QUOTED_MATCH", [
                  "option `quoted_match` must be a string or a regex,",
                  `got ${JSON.stringify(options.quoted_match)}`
                ])
              ];
            }
          }
        }
        if (options.quoted_string === void 0 || options.quoted_string === null) {
          options.quoted_string = false;
        }
        if (options.eof === void 0 || options.eof === null) {
          options.eof = true;
        }
        if (options.escape === void 0 || options.escape === null) {
          options.escape = '"';
        } else if (Buffer.isBuffer(options.escape)) {
          options.escape = options.escape.toString();
        } else if (typeof options.escape !== "string") {
          return [
            Error(
              `Invalid Option: escape must be a buffer or a string, got ${JSON.stringify(options.escape)}`
            )
          ];
        }
        if (options.escape.length > 1) {
          return [
            Error(
              `Invalid Option: escape must be one character, got ${options.escape.length} characters`
            )
          ];
        }
        if (options.header === void 0 || options.header === null || options.header === false) {
          options.header = false;
        } else if (options.header !== true) {
          throw new CsvError(
            "CSV_INVALID_OPTION_HEADER",
            [
              "option `header` is expected to be a boolean,",
              `got ${JSON.stringify(options.header)}`
            ],
            options
          );
        }
        if (options.header_as_comment === void 0 || options.header_as_comment === null || options.header_as_comment === false) {
          options.header_as_comment = false;
        } else if (options.header_as_comment === true) {
          options.header_as_comment = "#";
        } else if (Buffer.isBuffer(options.header_as_comment)) {
          options.header_as_comment = options.header_as_comment.toString();
        } else if (typeof options.header_as_comment !== "string") {
          throw new CsvError(
            "CSV_INVALID_OPTION_HEADER_AS_COMMENT",
            [
              "option `header_as_comment` must be a boolean, a string or a buffer,",
              `got ${JSON.stringify(options.header_as_comment)}`
            ],
            options
          );
        }
        const [errColumns, columns] = normalize_columns(options.columns);
        if (errColumns !== void 0) return [errColumns];
        options.columns = columns;
        if (options.quoted === void 0 || options.quoted === null) {
          options.quoted = false;
        }
        if (options.cast === void 0 || options.cast === null) {
          options.cast = {};
        }
        if (options.cast.bigint === void 0 || options.cast.bigint === null) {
          options.cast.bigint = (value) => "" + value;
        }
        if (options.cast.boolean === void 0 || options.cast.boolean === null) {
          options.cast.boolean = (value) => value ? "1" : "";
        }
        if (options.cast.date === void 0 || options.cast.date === null) {
          options.cast.date = (value) => "" + value.getTime();
        }
        if (options.cast.number === void 0 || options.cast.number === null) {
          options.cast.number = (value) => "" + value;
        }
        if (options.cast.object === void 0 || options.cast.object === null) {
          options.cast.object = (value) => JSON.stringify(value);
        }
        if (options.cast.string === void 0 || options.cast.string === null) {
          options.cast.string = function(value) {
            return value;
          };
        }
        if (options.on_record !== void 0 && typeof options.on_record !== "function") {
          return [Error(`Invalid Option: "on_record" must be a function.`)];
        }
        if (options.record_delimiter === void 0 || options.record_delimiter === null) {
          options.record_delimiter = "\n";
        } else if (Buffer.isBuffer(options.record_delimiter)) {
          options.record_delimiter = options.record_delimiter.toString();
        } else if (typeof options.record_delimiter !== "string") {
          return [
            Error(
              `Invalid Option: record_delimiter must be a buffer or a string, got ${JSON.stringify(options.record_delimiter)}`
            )
          ];
        }
        switch (options.record_delimiter) {
          case "unix":
            options.record_delimiter = "\n";
            break;
          case "mac":
            options.record_delimiter = "\r";
            break;
          case "windows":
            options.record_delimiter = "\r\n";
            break;
          case "ascii":
            options.record_delimiter = "";
            break;
          case "unicode":
            options.record_delimiter = "\u2028";
            break;
        }
        return [void 0, options];
      };
      var bom_utf8 = Buffer.from([239, 187, 191]);
      var emits_separator = function(value, separator) {
        return separator.length !== 0 && (value.indexOf(separator) !== -1 || separator.length > 1 && (value + separator).indexOf(separator) < value.length);
      };
      var matches_quoted_match = function(value, quoted_match) {
        if (!quoted_match) return false;
        return quoted_match.some(
          (pattern) => typeof pattern === "string" ? value.indexOf(pattern) !== -1 : value.search(pattern) !== -1
        );
      };
      var stringifier = function(options, state, info) {
        return {
          options,
          state,
          info,
          __transform: function(chunk, push) {
            if (!Array.isArray(chunk) && typeof chunk !== "object") {
              return Error(
                `Invalid Record: expect an array or an object, got ${JSON.stringify(chunk)}`
              );
            }
            if (this.info.records === 0) {
              if (Array.isArray(chunk)) {
                if (this.options.header === true && this.options.columns === void 0) {
                  return Error(
                    "Undiscoverable Columns: header option requires column option or object records"
                  );
                }
              } else if (this.options.columns === void 0) {
                const [err2, columns] = normalize_columns(Object.keys(chunk));
                if (err2) return;
                this.options.columns = columns;
              }
            }
            if (this.info.records === 0) {
              this.bom(push);
              const err2 = this.headers(push);
              if (err2) return err2;
            }
            try {
              if (this.options.on_record) {
                this.options.on_record(chunk, this.info.records);
              }
            } catch (err2) {
              return err2;
            }
            let err, chunk_string;
            if (this.options.eof) {
              [err, chunk_string] = this.stringify(chunk);
              if (err) return err;
              if (chunk_string === void 0) {
                return;
              } else {
                chunk_string = chunk_string + this.options.record_delimiter;
              }
            } else {
              [err, chunk_string] = this.stringify(chunk);
              if (err) return err;
              if (chunk_string === void 0) {
                return;
              } else {
                if (this.options.header || this.info.records) {
                  chunk_string = this.options.record_delimiter + chunk_string;
                }
              }
            }
            this.info.records++;
            push(chunk_string);
          },
          stringify: function(chunk, chunkIsHeader = false) {
            if (typeof chunk !== "object") {
              return [void 0, chunk];
            }
            const { columns } = this.options;
            const record = [];
            if (Array.isArray(chunk)) {
              if (columns) {
                chunk.splice(columns.length);
              }
              for (let i = 0; i < chunk.length; i++) {
                const field = chunk[i];
                const [err, value] = this.__cast(field, {
                  index: i,
                  column: i,
                  records: this.info.records,
                  header: chunkIsHeader
                });
                if (err) return [err];
                record[i] = [value, field];
              }
            } else {
              for (let i = 0; i < columns.length; i++) {
                const field = get(chunk, columns[i].key);
                const [err, value] = this.__cast(field, {
                  index: i,
                  column: columns[i].key,
                  records: this.info.records,
                  header: chunkIsHeader
                });
                if (err) return [err];
                record[i] = [value, field];
              }
            }
            let csvrecord = "";
            for (let i = 0; i < record.length; i++) {
              let options2, err;
              let [value, field] = record[i];
              if (typeof value === "string") {
                options2 = this.options;
              } else if (is_object(value)) {
                options2 = value;
                value = options2.value;
                delete options2.value;
                if (typeof value !== "string" && value !== void 0 && value !== null) {
                  if (err)
                    return [
                      Error(
                        `Invalid Casting Value: returned value must return a string, null or undefined, got ${JSON.stringify(value)}`
                      )
                    ];
                }
                options2 = { ...this.options, ...options2 };
                [err, options2] = normalize_options(options2);
                if (err !== void 0) {
                  return [err];
                }
              } else if (value === void 0 || value === null) {
                options2 = this.options;
              } else {
                return [
                  Error(
                    `Invalid Casting Value: returned value must return a string, an object, null or undefined, got ${JSON.stringify(value)}`
                  )
                ];
              }
              const {
                delimiter,
                escape,
                quote,
                quoted,
                quoted_empty,
                quoted_string,
                quoted_match,
                record_delimiter,
                escape_formulas
              } = options2;
              if ("" === value && "" === field) {
                const quotedMatch = matches_quoted_match(value, quoted_match);
                const shouldQuote = quotedMatch || true === quoted_empty || true === quoted_string && false !== quoted_empty;
                if (shouldQuote === true) {
                  value = quote + value + quote;
                }
                csvrecord += value;
              } else if (value) {
                if (typeof value !== "string") {
                  return [
                    Error(
                      `Formatter must return a string, null or undefined, got ${JSON.stringify(value)}`
                    )
                  ];
                }
                const containsdelimiter = emits_separator(value, delimiter);
                const containsQuote = quote !== "" && value.indexOf(quote) >= 0;
                const containsEscape = value.indexOf(escape) >= 0 && escape !== quote;
                const containsRecordDelimiter = emits_separator(
                  value,
                  record_delimiter
                );
                const quotedString = quoted_string && typeof field === "string";
                const quotedMatch = matches_quoted_match(value, quoted_match);
                if (escape_formulas) {
                  switch (value[0]) {
                    case "=":
                    case "+":
                    case "-":
                    case "@":
                    case "	":
                    case "\r":
                    case "\uFF1D":
                    // Unicode '='
                    case "\uFF0B":
                    // Unicode '+'
                    case "\uFF0D":
                    // Unicode '-'
                    case "\uFF20":
                      value = `'${value}`;
                      break;
                  }
                }
                const shouldQuote = containsQuote === true || containsdelimiter || containsRecordDelimiter || quoted || quotedString || quotedMatch;
                if (shouldQuote === true && containsEscape === true) {
                  value = value.replaceAll(escape, () => escape + escape);
                }
                if (containsQuote === true) {
                  value = value.replaceAll(quote, () => escape + quote);
                }
                if (shouldQuote === true) {
                  value = quote + value + quote;
                }
                csvrecord += value;
              } else if (quoted_empty === true || field === "" && quoted_string === true && quoted_empty !== false) {
                csvrecord += quote + quote;
              }
              if (i !== record.length - 1) {
                csvrecord += delimiter;
              }
            }
            return [void 0, csvrecord];
          },
          bom: function(push) {
            if (this.options.bom !== true) {
              return;
            }
            push(bom_utf8);
          },
          headers: function(push) {
            if (this.options.header === false) {
              return;
            }
            if (this.options.columns === void 0) {
              return;
            }
            let err;
            let headers = this.options.columns.map((column) => column.header);
            if (this.options.eof) {
              [err, headers] = this.stringify(headers, true);
              headers += this.options.record_delimiter;
            } else {
              [err, headers] = this.stringify(headers);
            }
            if (err) return err;
            if (this.options.header_as_comment) {
              headers = this.options.header_as_comment + " " + headers;
            }
            push(headers);
          },
          __cast: function(value, context) {
            const type = typeof value;
            try {
              if (type === "string") {
                return [void 0, this.options.cast.string(value, context)];
              } else if (type === "bigint") {
                return [void 0, this.options.cast.bigint(value, context)];
              } else if (type === "number") {
                return [void 0, this.options.cast.number(value, context)];
              } else if (type === "boolean") {
                return [void 0, this.options.cast.boolean(value, context)];
              } else if (value instanceof Date) {
                return [void 0, this.options.cast.date(value, context)];
              } else if (type === "object" && value !== null) {
                return [void 0, this.options.cast.object(value, context)];
              } else if (value === null && this.options.cast.null !== void 0) {
                return [void 0, this.options.cast.null(value, context)];
              } else if (value === void 0 && this.options.cast.undefined !== void 0) {
                return [void 0, this.options.cast.undefined(value, context)];
              } else {
                return [void 0, value];
              }
            } catch (err) {
              return [err];
            }
          }
        };
      };
      var Stringifier = class extends stream.Transform {
        constructor(opts = {}) {
          super({ ...{ writableObjectMode: true }, ...opts });
          const [err, options] = normalize_options(opts);
          if (err !== void 0) throw err;
          this.options = options;
          this.state = {
            stop: false
          };
          this.info = {
            records: 0
          };
          this.api = stringifier(this.options, this.state, this.info);
          this.api.options.on_record = (...args) => {
            this.emit("record", ...args);
          };
        }
        _transform(chunk, encoding, callback) {
          if (this.state.stop === true) {
            return;
          }
          const err = this.api.__transform(chunk, this.push.bind(this));
          if (err !== void 0) {
            this.state.stop = true;
          }
          callback(err);
        }
        _flush(callback) {
          if (this.state.stop === true) {
            return;
          }
          if (this.info.records === 0) {
            this.api.bom(this.push.bind(this));
            const err = this.api.headers(this.push.bind(this));
            if (err) callback(err);
          }
          callback();
        }
      };
      var stringify = function() {
        let data, options, callback;
        for (const i in arguments) {
          const argument = arguments[i];
          const type = typeof argument;
          if (data === void 0 && Array.isArray(argument)) {
            data = argument;
          } else if (options === void 0 && is_object(argument)) {
            options = argument;
          } else if (callback === void 0 && type === "function") {
            callback = argument;
          } else {
            throw new CsvError("CSV_INVALID_ARGUMENT", [
              "Invalid argument:",
              `got ${JSON.stringify(argument)} at index ${i}`
            ]);
          }
        }
        const stringifier2 = new Stringifier(options);
        if (callback) {
          const chunks = [];
          stringifier2.on("readable", function() {
            let chunk;
            while ((chunk = this.read()) !== null) {
              chunks.push(chunk);
            }
          });
          stringifier2.on("error", function(err) {
            callback(err);
          });
          stringifier2.on("end", function() {
            try {
              callback(void 0, chunks.join(""));
            } catch (err) {
              callback(err);
              return;
            }
          });
        }
        if (data !== void 0) {
          const writer = function() {
            for (const record of data) {
              stringifier2.write(record);
            }
            stringifier2.end();
          };
          if (typeof setImmediate === "function") {
            setImmediate(writer);
          } else {
            setTimeout(writer, 0);
          }
        }
        return stringifier2;
      };
      var Transformer = function(options = {}, handler) {
        this.options = options;
        if (options.consume === void 0 || options.consume === null) {
          this.options.consume = false;
        }
        this.options.objectMode = true;
        if (options.parallel === void 0 || options.parallel === null) {
          this.options.parallel = 100;
        }
        if (options.params === void 0 || options.params === null) {
          options.params = null;
        }
        this.handler = handler;
        stream.Transform.call(this, this.options);
        this.state = {
          running: 0,
          started: 0,
          finished: 0,
          paused: false
        };
        return this;
      };
      util.inherits(Transformer, stream.Transform);
      Transformer.prototype._transform = function(chunk, _, cb) {
        this.state.started++;
        this.state.running++;
        if (!this.state.paused && this.state.running < this.options.parallel) {
          cb();
          cb = null;
        }
        try {
          let l = this.handler.length;
          if (this.options.params !== null) {
            l--;
          }
          if (l === 1) {
            const result2 = this.handler.call(this, chunk, this.options.params);
            if (result2 && result2.then) {
              result2.then((result3) => {
                this.__done(null, [result3], cb);
              });
              result2.catch((err) => {
                this.__done(err);
              });
            } else {
              this.__done(null, [result2], cb);
            }
          } else if (l === 2) {
            const callback = (err, ...chunks) => this.__done(err, chunks, cb);
            this.handler.call(this, chunk, callback, this.options.params);
          } else {
            throw Error("Invalid handler arguments");
          }
          return false;
        } catch (err) {
          this.__done(err);
        }
      };
      Transformer.prototype._flush = function(cb) {
        if (this.state.running === 0) {
          cb();
        } else {
          this._ending = function() {
            cb();
          };
        }
      };
      Transformer.prototype.__done = function(err, chunks, cb) {
        this.state.running--;
        if (err) {
          return this.destroy(err);
        }
        this.state.finished++;
        for (let chunk of chunks) {
          if (typeof chunk === "number") {
            chunk = `${chunk}`;
          }
          if (chunk !== void 0 && chunk !== null && chunk !== "") {
            this.state.paused = !this.push(chunk);
          }
        }
        if (cb) {
          cb();
        }
        if (this._ending && this.state.running === 0) {
          this._ending();
        }
      };
      var transform = function() {
        let options = {};
        let callback, handler, records;
        for (let i = 0; i < arguments.length; i++) {
          const argument = arguments[i];
          let type = typeof argument;
          if (argument === null) {
            type = "null";
          } else if (type === "object" && Array.isArray(argument)) {
            type = "array";
          }
          if (type === "array") {
            records = argument;
          } else if (type === "object") {
            options = { ...argument };
          } else if (type === "function") {
            if (handler && i === arguments.length - 1) {
              callback = argument;
            } else {
              handler = argument;
            }
          } else if (type !== "null") {
            throw new Error(
              `Invalid Arguments: got ${JSON.stringify(argument)} at position ${i}`
            );
          }
        }
        const transformer = new Transformer(options, handler);
        let error = false;
        if (records) {
          const writer = function() {
            for (const record of records) {
              if (error) break;
              transformer.write(record);
            }
            transformer.end();
          };
          if (typeof setImmediate === "function") {
            setImmediate(writer);
          } else {
            setTimeout(writer, 0);
          }
        }
        if (callback || options.consume) {
          const result2 = [];
          transformer.on("readable", function() {
            let record;
            while ((record = transformer.read()) !== null) {
              if (callback) {
                result2.push(record);
              }
            }
          });
          transformer.on("error", function(err) {
            error = true;
            if (callback) callback(err);
          });
          transformer.on("end", function() {
            if (callback && !error) callback(null, result2);
          });
        }
        return transformer;
      };
      exports.generate = generate;
      exports.parse = parse;
      exports.stringify = stringify;
      exports.transform = transform;
    }
  });

  // node_modules/color-name/index.js
  var require_color_name = __commonJS({
    "node_modules/color-name/index.js"(exports, module) {
      "use strict";
      module.exports = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
      };
    }
  });

  // node_modules/color-convert/conversions.js
  var require_conversions = __commonJS({
    "node_modules/color-convert/conversions.js"(exports, module) {
      "use strict";
      var cssKeywords = require_color_name();
      var reverseKeywords = {};
      for (const key of Object.keys(cssKeywords)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
      var convert = {
        rgb: { channels: 3, labels: "rgb" },
        hsl: { channels: 3, labels: "hsl" },
        hsv: { channels: 3, labels: "hsv" },
        hwb: { channels: 3, labels: "hwb" },
        cmyk: { channels: 4, labels: "cmyk" },
        xyz: { channels: 3, labels: "xyz" },
        lab: { channels: 3, labels: "lab" },
        lch: { channels: 3, labels: "lch" },
        hex: { channels: 1, labels: ["hex"] },
        keyword: { channels: 1, labels: ["keyword"] },
        ansi16: { channels: 1, labels: ["ansi16"] },
        ansi256: { channels: 1, labels: ["ansi256"] },
        hcg: { channels: 3, labels: ["h", "c", "g"] },
        apple: { channels: 3, labels: ["r16", "g16", "b16"] },
        gray: { channels: 1, labels: ["gray"] }
      };
      module.exports = convert;
      for (const model of Object.keys(convert)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        const { channels, labels } = convert[model];
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
      convert.rgb.hsl = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        let h;
        let s;
        if (max === min) {
          h = 0;
        } else if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else if (b === max) {
          h = 4 + (r - g) / delta;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) {
          h += 360;
        }
        const l = (min + max) / 2;
        if (max === min) {
          s = 0;
        } else if (l <= 0.5) {
          s = delta / (max + min);
        } else {
          s = delta / (2 - max - min);
        }
        return [h, s * 100, l * 100];
      };
      convert.rgb.hsv = function(rgb) {
        let rdif;
        let gdif;
        let bdif;
        let h;
        let s;
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);
        const diffc = function(c) {
          return (v - c) / 6 / diff + 1 / 2;
        };
        if (diff === 0) {
          h = 0;
          s = 0;
        } else {
          s = diff / v;
          rdif = diffc(r);
          gdif = diffc(g);
          bdif = diffc(b);
          if (r === v) {
            h = bdif - gdif;
          } else if (g === v) {
            h = 1 / 3 + rdif - bdif;
          } else if (b === v) {
            h = 2 / 3 + gdif - rdif;
          }
          if (h < 0) {
            h += 1;
          } else if (h > 1) {
            h -= 1;
          }
        }
        return [
          h * 360,
          s * 100,
          v * 100
        ];
      };
      convert.rgb.hwb = function(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        let b = rgb[2];
        const h = convert.rgb.hsl(rgb)[0];
        const w = 1 / 255 * Math.min(r, Math.min(g, b));
        b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
        return [h, w * 100, b * 100];
      };
      convert.rgb.cmyk = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const k = Math.min(1 - r, 1 - g, 1 - b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;
        return [c * 100, m * 100, y * 100, k * 100];
      };
      function comparativeDistance(x, y) {
        return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
      }
      convert.rgb.keyword = function(rgb) {
        const reversed = reverseKeywords[rgb];
        if (reversed) {
          return reversed;
        }
        let currentClosestDistance = Infinity;
        let currentClosestKeyword;
        for (const keyword of Object.keys(cssKeywords)) {
          const value = cssKeywords[keyword];
          const distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
        return currentClosestKeyword;
      };
      convert.keyword.rgb = function(keyword) {
        return cssKeywords[keyword];
      };
      convert.rgb.xyz = function(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
        g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
        b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
        const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
        return [x * 100, y * 100, z * 100];
      };
      convert.rgb.lab = function(rgb) {
        const xyz = convert.rgb.xyz(rgb);
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.hsl.rgb = function(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        let t2;
        let t3;
        let val;
        if (s === 0) {
          val = l * 255;
          return [val, val, val];
        }
        if (l < 0.5) {
          t2 = l * (1 + s);
        } else {
          t2 = l + s - l * s;
        }
        const t1 = 2 * l - t2;
        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          t3 = h + 1 / 3 * -(i - 1);
          if (t3 < 0) {
            t3++;
          }
          if (t3 > 1) {
            t3--;
          }
          if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
          } else if (2 * t3 < 1) {
            val = t2;
          } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
          } else {
            val = t1;
          }
          rgb[i] = val * 255;
        }
        return rgb;
      };
      convert.hsl.hsv = function(hsl) {
        const h = hsl[0];
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;
        let smin = s;
        const lmin = Math.max(l, 0.01);
        l *= 2;
        s *= l <= 1 ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        const v = (l + s) / 2;
        const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
        return [h, sv * 100, v * 100];
      };
      convert.hsv.rgb = function(hsv) {
        const h = hsv[0] / 60;
        const s = hsv[1] / 100;
        let v = hsv[2] / 100;
        const hi = Math.floor(h) % 6;
        const f = h - Math.floor(h);
        const p = 255 * v * (1 - s);
        const q = 255 * v * (1 - s * f);
        const t = 255 * v * (1 - s * (1 - f));
        v *= 255;
        switch (hi) {
          case 0:
            return [v, t, p];
          case 1:
            return [q, v, p];
          case 2:
            return [p, v, t];
          case 3:
            return [p, q, v];
          case 4:
            return [t, p, v];
          case 5:
            return [v, p, q];
        }
      };
      convert.hsv.hsl = function(hsv) {
        const h = hsv[0];
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const vmin = Math.max(v, 0.01);
        let sl;
        let l;
        l = (2 - s) * v;
        const lmin = (2 - s) * vmin;
        sl = s * vmin;
        sl /= lmin <= 1 ? lmin : 2 - lmin;
        sl = sl || 0;
        l /= 2;
        return [h, sl * 100, l * 100];
      };
      convert.hwb.rgb = function(hwb) {
        const h = hwb[0] / 360;
        let wh = hwb[1] / 100;
        let bl = hwb[2] / 100;
        const ratio = wh + bl;
        let f;
        if (ratio > 1) {
          wh /= ratio;
          bl /= ratio;
        }
        const i = Math.floor(6 * h);
        const v = 1 - bl;
        f = 6 * h - i;
        if ((i & 1) !== 0) {
          f = 1 - f;
        }
        const n = wh + f * (v - wh);
        let r;
        let g;
        let b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;
          case 1:
            r = n;
            g = v;
            b = wh;
            break;
          case 2:
            r = wh;
            g = v;
            b = n;
            break;
          case 3:
            r = wh;
            g = n;
            b = v;
            break;
          case 4:
            r = n;
            g = wh;
            b = v;
            break;
          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }
        return [r * 255, g * 255, b * 255];
      };
      convert.cmyk.rgb = function(cmyk) {
        const c = cmyk[0] / 100;
        const m = cmyk[1] / 100;
        const y = cmyk[2] / 100;
        const k = cmyk[3] / 100;
        const r = 1 - Math.min(1, c * (1 - k) + k);
        const g = 1 - Math.min(1, m * (1 - k) + k);
        const b = 1 - Math.min(1, y * (1 - k) + k);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.rgb = function(xyz) {
        const x = xyz[0] / 100;
        const y = xyz[1] / 100;
        const z = xyz[2] / 100;
        let r;
        let g;
        let b;
        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.204 + z * 1.057;
        r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
        g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
        b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.lab = function(xyz) {
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.lab.xyz = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let x;
        let y;
        let z;
        y = (l + 16) / 116;
        x = a / 500 + y;
        z = y - b / 200;
        const y2 = y ** 3;
        const x2 = x ** 3;
        const z2 = z ** 3;
        y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
        x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
        z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
        x *= 95.047;
        y *= 100;
        z *= 108.883;
        return [x, y, z];
      };
      convert.lab.lch = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let h;
        const hr = Math.atan2(b, a);
        h = hr * 360 / 2 / Math.PI;
        if (h < 0) {
          h += 360;
        }
        const c = Math.sqrt(a * a + b * b);
        return [l, c, h];
      };
      convert.lch.lab = function(lch) {
        const l = lch[0];
        const c = lch[1];
        const h = lch[2];
        const hr = h / 360 * 2 * Math.PI;
        const a = c * Math.cos(hr);
        const b = c * Math.sin(hr);
        return [l, a, b];
      };
      convert.rgb.ansi16 = function(args, saturation = null) {
        const [r, g, b] = args;
        let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
        value = Math.round(value / 50);
        if (value === 0) {
          return 30;
        }
        let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
        if (value === 2) {
          ansi += 60;
        }
        return ansi;
      };
      convert.hsv.ansi16 = function(args) {
        return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
      };
      convert.rgb.ansi256 = function(args) {
        const r = args[0];
        const g = args[1];
        const b = args[2];
        if (r === g && g === b) {
          if (r < 8) {
            return 16;
          }
          if (r > 248) {
            return 231;
          }
          return Math.round((r - 8) / 247 * 24) + 232;
        }
        const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
        return ansi;
      };
      convert.ansi16.rgb = function(args) {
        let color = args % 10;
        if (color === 0 || color === 7) {
          if (args > 50) {
            color += 3.5;
          }
          color = color / 10.5 * 255;
          return [color, color, color];
        }
        const mult = (~~(args > 50) + 1) * 0.5;
        const r = (color & 1) * mult * 255;
        const g = (color >> 1 & 1) * mult * 255;
        const b = (color >> 2 & 1) * mult * 255;
        return [r, g, b];
      };
      convert.ansi256.rgb = function(args) {
        if (args >= 232) {
          const c = (args - 232) * 10 + 8;
          return [c, c, c];
        }
        args -= 16;
        let rem;
        const r = Math.floor(args / 36) / 5 * 255;
        const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
        const b = rem % 6 / 5 * 255;
        return [r, g, b];
      };
      convert.rgb.hex = function(args) {
        const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.hex.rgb = function(args) {
        const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
        if (!match) {
          return [0, 0, 0];
        }
        let colorString = match[0];
        if (match[0].length === 3) {
          colorString = colorString.split("").map((char) => {
            return char + char;
          }).join("");
        }
        const integer = parseInt(colorString, 16);
        const r = integer >> 16 & 255;
        const g = integer >> 8 & 255;
        const b = integer & 255;
        return [r, g, b];
      };
      convert.rgb.hcg = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const max = Math.max(Math.max(r, g), b);
        const min = Math.min(Math.min(r, g), b);
        const chroma = max - min;
        let grayscale;
        let hue;
        if (chroma < 1) {
          grayscale = min / (1 - chroma);
        } else {
          grayscale = 0;
        }
        if (chroma <= 0) {
          hue = 0;
        } else if (max === r) {
          hue = (g - b) / chroma % 6;
        } else if (max === g) {
          hue = 2 + (b - r) / chroma;
        } else {
          hue = 4 + (r - g) / chroma;
        }
        hue /= 6;
        hue %= 1;
        return [hue * 360, chroma * 100, grayscale * 100];
      };
      convert.hsl.hcg = function(hsl) {
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
        let f = 0;
        if (c < 1) {
          f = (l - 0.5 * c) / (1 - c);
        }
        return [hsl[0], c * 100, f * 100];
      };
      convert.hsv.hcg = function(hsv) {
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const c = s * v;
        let f = 0;
        if (c < 1) {
          f = (v - c) / (1 - c);
        }
        return [hsv[0], c * 100, f * 100];
      };
      convert.hcg.rgb = function(hcg) {
        const h = hcg[0] / 360;
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        if (c === 0) {
          return [g * 255, g * 255, g * 255];
        }
        const pure = [0, 0, 0];
        const hi = h % 1 * 6;
        const v = hi % 1;
        const w = 1 - v;
        let mg = 0;
        switch (Math.floor(hi)) {
          case 0:
            pure[0] = 1;
            pure[1] = v;
            pure[2] = 0;
            break;
          case 1:
            pure[0] = w;
            pure[1] = 1;
            pure[2] = 0;
            break;
          case 2:
            pure[0] = 0;
            pure[1] = 1;
            pure[2] = v;
            break;
          case 3:
            pure[0] = 0;
            pure[1] = w;
            pure[2] = 1;
            break;
          case 4:
            pure[0] = v;
            pure[1] = 0;
            pure[2] = 1;
            break;
          default:
            pure[0] = 1;
            pure[1] = 0;
            pure[2] = w;
        }
        mg = (1 - c) * g;
        return [
          (c * pure[0] + mg) * 255,
          (c * pure[1] + mg) * 255,
          (c * pure[2] + mg) * 255
        ];
      };
      convert.hcg.hsv = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        let f = 0;
        if (v > 0) {
          f = c / v;
        }
        return [hcg[0], f * 100, v * 100];
      };
      convert.hcg.hsl = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const l = g * (1 - c) + 0.5 * c;
        let s = 0;
        if (l > 0 && l < 0.5) {
          s = c / (2 * l);
        } else if (l >= 0.5 && l < 1) {
          s = c / (2 * (1 - l));
        }
        return [hcg[0], s * 100, l * 100];
      };
      convert.hcg.hwb = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        return [hcg[0], (v - c) * 100, (1 - v) * 100];
      };
      convert.hwb.hcg = function(hwb) {
        const w = hwb[1] / 100;
        const b = hwb[2] / 100;
        const v = 1 - b;
        const c = v - w;
        let g = 0;
        if (c < 1) {
          g = (v - c) / (1 - c);
        }
        return [hwb[0], c * 100, g * 100];
      };
      convert.apple.rgb = function(apple) {
        return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
      };
      convert.rgb.apple = function(rgb) {
        return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
      };
      convert.gray.rgb = function(args) {
        return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
      };
      convert.gray.hsl = function(args) {
        return [0, 0, args[0]];
      };
      convert.gray.hsv = convert.gray.hsl;
      convert.gray.hwb = function(gray) {
        return [0, 100, gray[0]];
      };
      convert.gray.cmyk = function(gray) {
        return [0, 0, 0, gray[0]];
      };
      convert.gray.lab = function(gray) {
        return [gray[0], 0, 0];
      };
      convert.gray.hex = function(gray) {
        const val = Math.round(gray[0] / 100 * 255) & 255;
        const integer = (val << 16) + (val << 8) + val;
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.rgb.gray = function(rgb) {
        const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
        return [val / 255 * 100];
      };
    }
  });

  // node_modules/color-convert/route.js
  var require_route = __commonJS({
    "node_modules/color-convert/route.js"(exports, module) {
      "use strict";
      var conversions = require_conversions();
      function buildGraph() {
        const graph = {};
        const models = Object.keys(conversions);
        for (let len = models.length, i = 0; i < len; i++) {
          graph[models[i]] = {
            // http://jsperf.com/1-vs-infinity
            // micro-opt, but this is simple.
            distance: -1,
            parent: null
          };
        }
        return graph;
      }
      function deriveBFS(fromModel) {
        const graph = buildGraph();
        const queue = [fromModel];
        graph[fromModel].distance = 0;
        while (queue.length) {
          const current = queue.pop();
          const adjacents = Object.keys(conversions[current]);
          for (let len = adjacents.length, i = 0; i < len; i++) {
            const adjacent = adjacents[i];
            const node = graph[adjacent];
            if (node.distance === -1) {
              node.distance = graph[current].distance + 1;
              node.parent = current;
              queue.unshift(adjacent);
            }
          }
        }
        return graph;
      }
      function link(from, to) {
        return function(args) {
          return to(from(args));
        };
      }
      function wrapConversion(toModel, graph) {
        const path = [graph[toModel].parent, toModel];
        let fn = conversions[graph[toModel].parent][toModel];
        let cur = graph[toModel].parent;
        while (graph[cur].parent) {
          path.unshift(graph[cur].parent);
          fn = link(conversions[graph[cur].parent][cur], fn);
          cur = graph[cur].parent;
        }
        fn.conversion = path;
        return fn;
      }
      module.exports = function(fromModel) {
        const graph = deriveBFS(fromModel);
        const conversion = {};
        const models = Object.keys(graph);
        for (let len = models.length, i = 0; i < len; i++) {
          const toModel = models[i];
          const node = graph[toModel];
          if (node.parent === null) {
            continue;
          }
          conversion[toModel] = wrapConversion(toModel, graph);
        }
        return conversion;
      };
    }
  });

  // node_modules/color-convert/index.js
  var require_color_convert = __commonJS({
    "node_modules/color-convert/index.js"(exports, module) {
      "use strict";
      var conversions = require_conversions();
      var route = require_route();
      var convert = {};
      var models = Object.keys(conversions);
      function wrapRaw(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          return fn(args);
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      function wrapRounded(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          const result2 = fn(args);
          if (typeof result2 === "object") {
            for (let len = result2.length, i = 0; i < len; i++) {
              result2[i] = Math.round(result2[i]);
            }
          }
          return result2;
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      models.forEach((fromModel) => {
        convert[fromModel] = {};
        Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
        Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
        const routes = route(fromModel);
        const routeModels = Object.keys(routes);
        routeModels.forEach((toModel) => {
          const fn = routes[toModel];
          convert[fromModel][toModel] = wrapRounded(fn);
          convert[fromModel][toModel].raw = wrapRaw(fn);
        });
      });
      module.exports = convert;
    }
  });

  // node_modules/ansi-styles/index.js
  var require_ansi_styles = __commonJS({
    "node_modules/ansi-styles/index.js"(exports, module) {
      "use strict";
      var wrapAnsi16 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `\x1B[${code + offset}m`;
      };
      var wrapAnsi256 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `\x1B[${38 + offset};5;${code}m`;
      };
      var wrapAnsi16m = (fn, offset) => (...args) => {
        const rgb = fn(...args);
        return `\x1B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
      };
      var ansi2ansi = (n) => n;
      var rgb2rgb = (r, g, b) => [r, g, b];
      var setLazyProperty = (object, property, get) => {
        Object.defineProperty(object, property, {
          get: () => {
            const value = get();
            Object.defineProperty(object, property, {
              value,
              enumerable: true,
              configurable: true
            });
            return value;
          },
          enumerable: true,
          configurable: true
        });
      };
      var colorConvert;
      var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
        if (colorConvert === void 0) {
          colorConvert = require_color_convert();
        }
        const offset = isBackground ? 10 : 0;
        const styles = {};
        for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
          const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
          if (sourceSpace === targetSpace) {
            styles[name] = wrap(identity, offset);
          } else if (typeof suite === "object") {
            styles[name] = wrap(suite[targetSpace], offset);
          }
        }
        return styles;
      };
      function assembleStyles() {
        const codes = /* @__PURE__ */ new Map();
        const styles = {
          modifier: {
            reset: [0, 0],
            // 21 isn't widely supported and 22 does the same thing
            bold: [1, 22],
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29]
          },
          color: {
            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            // Bright color
            blackBright: [90, 39],
            redBright: [91, 39],
            greenBright: [92, 39],
            yellowBright: [93, 39],
            blueBright: [94, 39],
            magentaBright: [95, 39],
            cyanBright: [96, 39],
            whiteBright: [97, 39]
          },
          bgColor: {
            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49],
            // Bright color
            bgBlackBright: [100, 49],
            bgRedBright: [101, 49],
            bgGreenBright: [102, 49],
            bgYellowBright: [103, 49],
            bgBlueBright: [104, 49],
            bgMagentaBright: [105, 49],
            bgCyanBright: [106, 49],
            bgWhiteBright: [107, 49]
          }
        };
        styles.color.gray = styles.color.blackBright;
        styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
        styles.color.grey = styles.color.blackBright;
        styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
        for (const [groupName, group] of Object.entries(styles)) {
          for (const [styleName, style] of Object.entries(group)) {
            styles[styleName] = {
              open: `\x1B[${style[0]}m`,
              close: `\x1B[${style[1]}m`
            };
            group[styleName] = styles[styleName];
            codes.set(style[0], style[1]);
          }
          Object.defineProperty(styles, groupName, {
            value: group,
            enumerable: false
          });
        }
        Object.defineProperty(styles, "codes", {
          value: codes,
          enumerable: false
        });
        styles.color.close = "\x1B[39m";
        styles.bgColor.close = "\x1B[49m";
        setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
        setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
        return styles;
      }
      Object.defineProperty(module, "exports", {
        enumerable: true,
        get: assembleStyles
      });
    }
  });

  // node_modules/has-flag/index.js
  var require_has_flag = __commonJS({
    "node_modules/has-flag/index.js"(exports, module) {
      "use strict";
      module.exports = (flag, argv = process.argv) => {
        const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
        const position = argv.indexOf(prefix + flag);
        const terminatorPosition = argv.indexOf("--");
        return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
      };
    }
  });

  // node_modules/chalk/node_modules/supports-color/index.js
  var require_supports_color = __commonJS({
    "node_modules/chalk/node_modules/supports-color/index.js"(exports, module) {
      "use strict";
      var os = __require("os");
      var tty = __require("tty");
      var hasFlag = require_has_flag();
      var { env } = process;
      var forceColor;
      if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
        forceColor = 0;
      } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
        forceColor = 1;
      }
      if ("FORCE_COLOR" in env) {
        if (env.FORCE_COLOR === "true") {
          forceColor = 1;
        } else if (env.FORCE_COLOR === "false") {
          forceColor = 0;
        } else {
          forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
        }
      }
      function translateLevel(level) {
        if (level === 0) {
          return false;
        }
        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3
        };
      }
      function supportsColor(haveStream, streamIsTTY) {
        if (forceColor === 0) {
          return 0;
        }
        if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
          return 3;
        }
        if (hasFlag("color=256")) {
          return 2;
        }
        if (haveStream && !streamIsTTY && forceColor === void 0) {
          return 0;
        }
        const min = forceColor || 0;
        if (env.TERM === "dumb") {
          return min;
        }
        if (process.platform === "win32") {
          const osRelease = os.release().split(".");
          if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }
          return 1;
        }
        if ("CI" in env) {
          if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
            return 1;
          }
          return min;
        }
        if ("TEAMCITY_VERSION" in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
        }
        if (env.COLORTERM === "truecolor") {
          return 3;
        }
        if ("TERM_PROGRAM" in env) {
          const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (env.TERM_PROGRAM) {
            case "iTerm.app":
              return version >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }
        if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
          return 1;
        }
        if ("COLORTERM" in env) {
          return 1;
        }
        return min;
      }
      function getSupportLevel(stream) {
        const level = supportsColor(stream, stream && stream.isTTY);
        return translateLevel(level);
      }
      module.exports = {
        supportsColor: getSupportLevel,
        stdout: translateLevel(supportsColor(true, tty.isatty(1))),
        stderr: translateLevel(supportsColor(true, tty.isatty(2)))
      };
    }
  });

  // node_modules/chalk/source/util.js
  var require_util = __commonJS({
    "node_modules/chalk/source/util.js"(exports, module) {
      "use strict";
      var stringReplaceAll = (string, substring, replacer) => {
        let index = string.indexOf(substring);
        if (index === -1) {
          return string;
        }
        const substringLength = substring.length;
        let endIndex = 0;
        let returnValue = "";
        do {
          returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
          endIndex = index + substringLength;
          index = string.indexOf(substring, endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      var stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
        let endIndex = 0;
        let returnValue = "";
        do {
          const gotCR = string[index - 1] === "\r";
          returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
          endIndex = index + 1;
          index = string.indexOf("\n", endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      module.exports = {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      };
    }
  });

  // node_modules/chalk/source/templates.js
  var require_templates = __commonJS({
    "node_modules/chalk/source/templates.js"(exports, module) {
      "use strict";
      var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
      var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
      var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
      var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
      var ESCAPES = /* @__PURE__ */ new Map([
        ["n", "\n"],
        ["r", "\r"],
        ["t", "	"],
        ["b", "\b"],
        ["f", "\f"],
        ["v", "\v"],
        ["0", "\0"],
        ["\\", "\\"],
        ["e", "\x1B"],
        ["a", "\x07"]
      ]);
      function unescape(c) {
        const u = c[0] === "u";
        const bracket = c[1] === "{";
        if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
          return String.fromCharCode(parseInt(c.slice(1), 16));
        }
        if (u && bracket) {
          return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
        }
        return ESCAPES.get(c) || c;
      }
      function parseArguments(name, arguments_) {
        const results = [];
        const chunks = arguments_.trim().split(/\s*,\s*/g);
        let matches;
        for (const chunk of chunks) {
          const number = Number(chunk);
          if (!Number.isNaN(number)) {
            results.push(number);
          } else if (matches = chunk.match(STRING_REGEX)) {
            results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
          } else {
            throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
          }
        }
        return results;
      }
      function parseStyle(style) {
        STYLE_REGEX.lastIndex = 0;
        const results = [];
        let matches;
        while ((matches = STYLE_REGEX.exec(style)) !== null) {
          const name = matches[1];
          if (matches[2]) {
            const args = parseArguments(name, matches[2]);
            results.push([name].concat(args));
          } else {
            results.push([name]);
          }
        }
        return results;
      }
      function buildStyle(chalk, styles) {
        const enabled = {};
        for (const layer of styles) {
          for (const style of layer.styles) {
            enabled[style[0]] = layer.inverse ? null : style.slice(1);
          }
        }
        let current = chalk;
        for (const [styleName, styles2] of Object.entries(enabled)) {
          if (!Array.isArray(styles2)) {
            continue;
          }
          if (!(styleName in current)) {
            throw new Error(`Unknown Chalk style: ${styleName}`);
          }
          current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
        }
        return current;
      }
      module.exports = (chalk, temporary) => {
        const styles = [];
        const chunks = [];
        let chunk = [];
        temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
          if (escapeCharacter) {
            chunk.push(unescape(escapeCharacter));
          } else if (style) {
            const string = chunk.join("");
            chunk = [];
            chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
            styles.push({ inverse, styles: parseStyle(style) });
          } else if (close) {
            if (styles.length === 0) {
              throw new Error("Found extraneous } in Chalk template literal");
            }
            chunks.push(buildStyle(chalk, styles)(chunk.join("")));
            chunk = [];
            styles.pop();
          } else {
            chunk.push(character);
          }
        });
        chunks.push(chunk.join(""));
        if (styles.length > 0) {
          const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
          throw new Error(errMessage);
        }
        return chunks.join("");
      };
    }
  });

  // node_modules/chalk/source/index.js
  var require_source = __commonJS({
    "node_modules/chalk/source/index.js"(exports, module) {
      "use strict";
      var ansiStyles = require_ansi_styles();
      var { stdout: stdoutColor, stderr: stderrColor } = require_supports_color();
      var {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      } = require_util();
      var { isArray } = Array;
      var levelMapping = [
        "ansi",
        "ansi",
        "ansi256",
        "ansi16m"
      ];
      var styles = /* @__PURE__ */ Object.create(null);
      var applyOptions = (object, options = {}) => {
        if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
          throw new Error("The `level` option should be an integer from 0 to 3");
        }
        const colorLevel = stdoutColor ? stdoutColor.level : 0;
        object.level = options.level === void 0 ? colorLevel : options.level;
      };
      var ChalkClass = class {
        constructor(options) {
          return chalkFactory(options);
        }
      };
      var chalkFactory = (options) => {
        const chalk2 = {};
        applyOptions(chalk2, options);
        chalk2.template = (...arguments_) => chalkTag(chalk2.template, ...arguments_);
        Object.setPrototypeOf(chalk2, Chalk.prototype);
        Object.setPrototypeOf(chalk2.template, chalk2);
        chalk2.template.constructor = () => {
          throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
        };
        chalk2.template.Instance = ChalkClass;
        return chalk2.template;
      };
      function Chalk(options) {
        return chalkFactory(options);
      }
      for (const [styleName, style] of Object.entries(ansiStyles)) {
        styles[styleName] = {
          get() {
            const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
            Object.defineProperty(this, styleName, { value: builder });
            return builder;
          }
        };
      }
      styles.visible = {
        get() {
          const builder = createBuilder(this, this._styler, true);
          Object.defineProperty(this, "visible", { value: builder });
          return builder;
        }
      };
      var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
      for (const model of usedModels) {
        styles[model] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      for (const model of usedModels) {
        const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
        styles[bgModel] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      var proto = Object.defineProperties(() => {
      }, {
        ...styles,
        level: {
          enumerable: true,
          get() {
            return this._generator.level;
          },
          set(level) {
            this._generator.level = level;
          }
        }
      });
      var createStyler = (open, close, parent) => {
        let openAll;
        let closeAll;
        if (parent === void 0) {
          openAll = open;
          closeAll = close;
        } else {
          openAll = parent.openAll + open;
          closeAll = close + parent.closeAll;
        }
        return {
          open,
          close,
          openAll,
          closeAll,
          parent
        };
      };
      var createBuilder = (self, _styler, _isEmpty) => {
        const builder = (...arguments_) => {
          if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
            return applyStyle(builder, chalkTag(builder, ...arguments_));
          }
          return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
        };
        Object.setPrototypeOf(builder, proto);
        builder._generator = self;
        builder._styler = _styler;
        builder._isEmpty = _isEmpty;
        return builder;
      };
      var applyStyle = (self, string) => {
        if (self.level <= 0 || !string) {
          return self._isEmpty ? "" : string;
        }
        let styler = self._styler;
        if (styler === void 0) {
          return string;
        }
        const { openAll, closeAll } = styler;
        if (string.indexOf("\x1B") !== -1) {
          while (styler !== void 0) {
            string = stringReplaceAll(string, styler.close, styler.open);
            styler = styler.parent;
          }
        }
        const lfIndex = string.indexOf("\n");
        if (lfIndex !== -1) {
          string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
        }
        return openAll + string + closeAll;
      };
      var template;
      var chalkTag = (chalk2, ...strings) => {
        const [firstString] = strings;
        if (!isArray(firstString) || !isArray(firstString.raw)) {
          return strings.join(" ");
        }
        const arguments_ = strings.slice(1);
        const parts = [firstString.raw[0]];
        for (let i = 1; i < firstString.length; i++) {
          parts.push(
            String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"),
            String(firstString.raw[i])
          );
        }
        if (template === void 0) {
          template = require_templates();
        }
        return template(chalk2, parts.join(""));
      };
      Object.defineProperties(Chalk.prototype, styles);
      var chalk = Chalk();
      chalk.supportsColor = stdoutColor;
      chalk.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
      chalk.stderr.supportsColor = stderrColor;
      module.exports = chalk;
    }
  });

  // node_modules/kleur/index.js
  var require_kleur = __commonJS({
    "node_modules/kleur/index.js"(exports, module) {
      "use strict";
      var FORCE_COLOR;
      var NODE_DISABLE_COLORS;
      var NO_COLOR;
      var TERM;
      var isTTY = true;
      if (typeof process !== "undefined") {
        ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
        isTTY = process.stdout && process.stdout.isTTY;
      }
      var $ = {
        enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY),
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
        let i = 0, tmp, beg = "", end = "";
        for (; i < arr.length; i++) {
          tmp = arr[i];
          beg += tmp.open;
          end += tmp.close;
          if (!!~str.indexOf(tmp.close)) {
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
          open: `\x1B[${open}m`,
          close: `\x1B[${close}m`,
          rgx: new RegExp(`\\x1b\\[${close}m`, "g")
        };
        return function(txt) {
          if (this !== void 0 && this.has !== void 0) {
            !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
            return txt === void 0 ? this : $.enabled ? run(this.keys, txt + "") : txt + "";
          }
          return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + "") : txt + "";
        };
      }
      module.exports = $;
    }
  });

  // node_modules/ansi-regex/index.js
  var require_ansi_regex = __commonJS({
    "node_modules/ansi-regex/index.js"(exports, module) {
      "use strict";
      module.exports = ({ onlyFirst = false } = {}) => {
        const pattern = [
          "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
          "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
        ].join("|");
        return new RegExp(pattern, onlyFirst ? void 0 : "g");
      };
    }
  });

  // node_modules/strip-ansi/index.js
  var require_strip_ansi = __commonJS({
    "node_modules/strip-ansi/index.js"(exports, module) {
      "use strict";
      var ansiRegex = require_ansi_regex();
      module.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
    }
  });

  // src/style.js
  var require_style = __commonJS({
    "src/style.js"(exports, module) {
      "use strict";
      var chalk = require_source();
      var kleur = require_kleur();
      var colorLib = process && process.stdout ? chalk : kleur;
      var stripAnsi = require_strip_ansi();
      module.exports.style = (str, ...colors) => {
        const out = colors.reduce(function(input, color) {
          return colorLib[color](input);
        }, str);
        return out;
      };
      module.exports.styleEachChar = (str, ...colors) => {
        const chars = [...stripAnsi(str)];
        const out = chars.reduce((prev, current) => {
          const coded = colors.reduce((input, color) => {
            return colorLib[color](input);
          }, current);
          return prev + coded;
        }, "");
        return out;
      };
      module.exports.resetStyle = function(str) {
        this.configure({ reset: true });
        return stripAnsi(str);
      };
      module.exports.colorizeCell = (str, cellOptions, rowType) => {
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
          str = exports.style(str, color);
        }
        return str;
      };
      module.exports.isColorEnabled = () => {
        return process && process.stdout ? colorLib.level > 0 : colorLib.enabled;
      };
    }
  });

  // node_modules/y18n/build/index.cjs
  var require_build = __commonJS({
    "node_modules/y18n/build/index.cjs"(exports, module) {
      "use strict";
      var fs = __require("fs");
      var util = __require("util");
      var path = __require("path");
      var shim;
      var Y18N = class {
        constructor(opts) {
          opts = opts || {};
          this.directory = opts.directory || "./locales";
          this.updateFiles = typeof opts.updateFiles === "boolean" ? opts.updateFiles : true;
          this.locale = opts.locale || "en";
          this.fallbackToLanguage = typeof opts.fallbackToLanguage === "boolean" ? opts.fallbackToLanguage : true;
          this.cache = /* @__PURE__ */ Object.create(null);
          this.writeQueue = [];
        }
        __(...args) {
          if (typeof arguments[0] !== "string") {
            return this._taggedLiteral(arguments[0], ...arguments);
          }
          const str = args.shift();
          let cb = function() {
          };
          if (typeof args[args.length - 1] === "function")
            cb = args.pop();
          cb = cb || function() {
          };
          if (!this.cache[this.locale])
            this._readLocaleFile();
          if (!this.cache[this.locale][str] && this.updateFiles) {
            this.cache[this.locale][str] = str;
            this._enqueueWrite({
              directory: this.directory,
              locale: this.locale,
              cb
            });
          } else {
            cb();
          }
          return shim.format.apply(shim.format, [this.cache[this.locale][str] || str].concat(args));
        }
        __n() {
          const args = Array.prototype.slice.call(arguments);
          const singular = args.shift();
          const plural = args.shift();
          const quantity = args.shift();
          let cb = function() {
          };
          if (typeof args[args.length - 1] === "function")
            cb = args.pop();
          if (!this.cache[this.locale])
            this._readLocaleFile();
          let str = quantity === 1 ? singular : plural;
          if (this.cache[this.locale][singular]) {
            const entry = this.cache[this.locale][singular];
            str = entry[quantity === 1 ? "one" : "other"];
          }
          if (!this.cache[this.locale][singular] && this.updateFiles) {
            this.cache[this.locale][singular] = {
              one: singular,
              other: plural
            };
            this._enqueueWrite({
              directory: this.directory,
              locale: this.locale,
              cb
            });
          } else {
            cb();
          }
          const values = [str];
          if (~str.indexOf("%d"))
            values.push(quantity);
          return shim.format.apply(shim.format, values.concat(args));
        }
        setLocale(locale) {
          this.locale = locale;
        }
        getLocale() {
          return this.locale;
        }
        updateLocale(obj) {
          if (!this.cache[this.locale])
            this._readLocaleFile();
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              this.cache[this.locale][key] = obj[key];
            }
          }
        }
        _taggedLiteral(parts, ...args) {
          let str = "";
          parts.forEach(function(part, i) {
            const arg = args[i + 1];
            str += part;
            if (typeof arg !== "undefined") {
              str += "%s";
            }
          });
          return this.__.apply(this, [str].concat([].slice.call(args, 1)));
        }
        _enqueueWrite(work) {
          this.writeQueue.push(work);
          if (this.writeQueue.length === 1)
            this._processWriteQueue();
        }
        _processWriteQueue() {
          const _this = this;
          const work = this.writeQueue[0];
          const directory = work.directory;
          const locale = work.locale;
          const cb = work.cb;
          const languageFile = this._resolveLocaleFile(directory, locale);
          const serializedLocale = JSON.stringify(this.cache[locale], null, 2);
          shim.fs.writeFile(languageFile, serializedLocale, "utf-8", function(err) {
            _this.writeQueue.shift();
            if (_this.writeQueue.length > 0)
              _this._processWriteQueue();
            cb(err);
          });
        }
        _readLocaleFile() {
          let localeLookup = {};
          const languageFile = this._resolveLocaleFile(this.directory, this.locale);
          try {
            if (shim.fs.readFileSync) {
              localeLookup = JSON.parse(shim.fs.readFileSync(languageFile, "utf-8"));
            }
          } catch (err) {
            if (err instanceof SyntaxError) {
              err.message = "syntax error in " + languageFile;
            }
            if (err.code === "ENOENT")
              localeLookup = {};
            else
              throw err;
          }
          this.cache[this.locale] = localeLookup;
        }
        _resolveLocaleFile(directory, locale) {
          let file = shim.resolve(directory, "./", locale + ".json");
          if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf("_")) {
            const languageFile = shim.resolve(directory, "./", locale.split("_")[0] + ".json");
            if (this._fileExistsSync(languageFile))
              file = languageFile;
          }
          return file;
        }
        _fileExistsSync(file) {
          return shim.exists(file);
        }
      };
      function y18n$1(opts, _shim) {
        shim = _shim;
        const y18n2 = new Y18N(opts);
        return {
          __: y18n2.__.bind(y18n2),
          __n: y18n2.__n.bind(y18n2),
          setLocale: y18n2.setLocale.bind(y18n2),
          getLocale: y18n2.getLocale.bind(y18n2),
          updateLocale: y18n2.updateLocale.bind(y18n2),
          locale: y18n2.locale
        };
      }
      var nodePlatformShim = {
        fs: {
          readFileSync: fs.readFileSync,
          writeFile: fs.writeFile
        },
        format: util.format,
        resolve: path.resolve,
        exists: (file) => {
          try {
            return fs.statSync(file).isFile();
          } catch (err) {
            return false;
          }
        }
      };
      var y18n = (opts) => {
        return y18n$1(opts, nodePlatformShim);
      };
      module.exports = y18n;
    }
  });

  // node_modules/yargs/node_modules/yargs-parser/build/index.cjs
  var require_build2 = __commonJS({
    "node_modules/yargs/node_modules/yargs-parser/build/index.cjs"(exports, module) {
      "use strict";
      var util = __require("util");
      var path = __require("path");
      var fs = __require("fs");
      function camelCase(str) {
        const isCamelCase = str !== str.toLowerCase() && str !== str.toUpperCase();
        if (!isCamelCase) {
          str = str.toLowerCase();
        }
        if (str.indexOf("-") === -1 && str.indexOf("_") === -1) {
          return str;
        } else {
          let camelcase = "";
          let nextChrUpper = false;
          const leadingHyphens = str.match(/^-+/);
          for (let i = leadingHyphens ? leadingHyphens[0].length : 0; i < str.length; i++) {
            let chr = str.charAt(i);
            if (nextChrUpper) {
              nextChrUpper = false;
              chr = chr.toUpperCase();
            }
            if (i !== 0 && (chr === "-" || chr === "_")) {
              nextChrUpper = true;
            } else if (chr !== "-" && chr !== "_") {
              camelcase += chr;
            }
          }
          return camelcase;
        }
      }
      function decamelize(str, joinString) {
        const lowercase = str.toLowerCase();
        joinString = joinString || "-";
        let notCamelcase = "";
        for (let i = 0; i < str.length; i++) {
          const chrLower = lowercase.charAt(i);
          const chrString = str.charAt(i);
          if (chrLower !== chrString && i > 0) {
            notCamelcase += `${joinString}${lowercase.charAt(i)}`;
          } else {
            notCamelcase += chrString;
          }
        }
        return notCamelcase;
      }
      function looksLikeNumber(x) {
        if (x === null || x === void 0)
          return false;
        if (typeof x === "number")
          return true;
        if (/^0x[0-9a-f]+$/i.test(x))
          return true;
        if (/^0[^.]/.test(x))
          return false;
        return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
      }
      function tokenizeArgString(argString) {
        if (Array.isArray(argString)) {
          return argString.map((e) => typeof e !== "string" ? e + "" : e);
        }
        argString = argString.trim();
        let i = 0;
        let prevC = null;
        let c = null;
        let opening = null;
        const args = [];
        for (let ii = 0; ii < argString.length; ii++) {
          prevC = c;
          c = argString.charAt(ii);
          if (c === " " && !opening) {
            if (!(prevC === " ")) {
              i++;
            }
            continue;
          }
          if (c === opening) {
            opening = null;
          } else if ((c === "'" || c === '"') && !opening) {
            opening = c;
          }
          if (!args[i])
            args[i] = "";
          args[i] += c;
        }
        return args;
      }
      var DefaultValuesForTypeKey;
      (function(DefaultValuesForTypeKey2) {
        DefaultValuesForTypeKey2["BOOLEAN"] = "boolean";
        DefaultValuesForTypeKey2["STRING"] = "string";
        DefaultValuesForTypeKey2["NUMBER"] = "number";
        DefaultValuesForTypeKey2["ARRAY"] = "array";
      })(DefaultValuesForTypeKey || (DefaultValuesForTypeKey = {}));
      var mixin;
      var YargsParser = class {
        constructor(_mixin) {
          mixin = _mixin;
        }
        parse(argsInput, options) {
          const opts = Object.assign({
            alias: void 0,
            array: void 0,
            boolean: void 0,
            config: void 0,
            configObjects: void 0,
            configuration: void 0,
            coerce: void 0,
            count: void 0,
            default: void 0,
            envPrefix: void 0,
            narg: void 0,
            normalize: void 0,
            string: void 0,
            number: void 0,
            __: void 0,
            key: void 0
          }, options);
          const args = tokenizeArgString(argsInput);
          const inputIsString = typeof argsInput === "string";
          const aliases = combineAliases(Object.assign(/* @__PURE__ */ Object.create(null), opts.alias));
          const configuration = Object.assign({
            "boolean-negation": true,
            "camel-case-expansion": true,
            "combine-arrays": false,
            "dot-notation": true,
            "duplicate-arguments-array": true,
            "flatten-duplicate-arrays": true,
            "greedy-arrays": true,
            "halt-at-non-option": false,
            "nargs-eats-options": false,
            "negation-prefix": "no-",
            "parse-numbers": true,
            "parse-positional-numbers": true,
            "populate--": false,
            "set-placeholder-key": false,
            "short-option-groups": true,
            "strip-aliased": false,
            "strip-dashed": false,
            "unknown-options-as-args": false
          }, opts.configuration);
          const defaults = Object.assign(/* @__PURE__ */ Object.create(null), opts.default);
          const configObjects = opts.configObjects || [];
          const envPrefix = opts.envPrefix;
          const notFlagsOption = configuration["populate--"];
          const notFlagsArgv = notFlagsOption ? "--" : "_";
          const newAliases = /* @__PURE__ */ Object.create(null);
          const defaulted = /* @__PURE__ */ Object.create(null);
          const __ = opts.__ || mixin.format;
          const flags = {
            aliases: /* @__PURE__ */ Object.create(null),
            arrays: /* @__PURE__ */ Object.create(null),
            bools: /* @__PURE__ */ Object.create(null),
            strings: /* @__PURE__ */ Object.create(null),
            numbers: /* @__PURE__ */ Object.create(null),
            counts: /* @__PURE__ */ Object.create(null),
            normalize: /* @__PURE__ */ Object.create(null),
            configs: /* @__PURE__ */ Object.create(null),
            nargs: /* @__PURE__ */ Object.create(null),
            coercions: /* @__PURE__ */ Object.create(null),
            keys: []
          };
          const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
          const negatedBoolean = new RegExp("^--" + configuration["negation-prefix"] + "(.+)");
          [].concat(opts.array || []).filter(Boolean).forEach(function(opt) {
            const key = typeof opt === "object" ? opt.key : opt;
            const assignment = Object.keys(opt).map(function(key2) {
              const arrayFlagKeys = {
                boolean: "bools",
                string: "strings",
                number: "numbers"
              };
              return arrayFlagKeys[key2];
            }).filter(Boolean).pop();
            if (assignment) {
              flags[assignment][key] = true;
            }
            flags.arrays[key] = true;
            flags.keys.push(key);
          });
          [].concat(opts.boolean || []).filter(Boolean).forEach(function(key) {
            flags.bools[key] = true;
            flags.keys.push(key);
          });
          [].concat(opts.string || []).filter(Boolean).forEach(function(key) {
            flags.strings[key] = true;
            flags.keys.push(key);
          });
          [].concat(opts.number || []).filter(Boolean).forEach(function(key) {
            flags.numbers[key] = true;
            flags.keys.push(key);
          });
          [].concat(opts.count || []).filter(Boolean).forEach(function(key) {
            flags.counts[key] = true;
            flags.keys.push(key);
          });
          [].concat(opts.normalize || []).filter(Boolean).forEach(function(key) {
            flags.normalize[key] = true;
            flags.keys.push(key);
          });
          if (typeof opts.narg === "object") {
            Object.entries(opts.narg).forEach(([key, value]) => {
              if (typeof value === "number") {
                flags.nargs[key] = value;
                flags.keys.push(key);
              }
            });
          }
          if (typeof opts.coerce === "object") {
            Object.entries(opts.coerce).forEach(([key, value]) => {
              if (typeof value === "function") {
                flags.coercions[key] = value;
                flags.keys.push(key);
              }
            });
          }
          if (typeof opts.config !== "undefined") {
            if (Array.isArray(opts.config) || typeof opts.config === "string") {
              [].concat(opts.config).filter(Boolean).forEach(function(key) {
                flags.configs[key] = true;
              });
            } else if (typeof opts.config === "object") {
              Object.entries(opts.config).forEach(([key, value]) => {
                if (typeof value === "boolean" || typeof value === "function") {
                  flags.configs[key] = value;
                }
              });
            }
          }
          extendAliases(opts.key, aliases, opts.default, flags.arrays);
          Object.keys(defaults).forEach(function(key) {
            (flags.aliases[key] || []).forEach(function(alias) {
              defaults[alias] = defaults[key];
            });
          });
          let error = null;
          checkConfiguration();
          let notFlags = [];
          const argv = Object.assign(/* @__PURE__ */ Object.create(null), { _: [] });
          const argvReturn = {};
          for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const truncatedArg = arg.replace(/^-{3,}/, "---");
            let broken;
            let key;
            let letters;
            let m;
            let next;
            let value;
            if (arg !== "--" && /^-/.test(arg) && isUnknownOptionAsArg(arg)) {
              pushPositional(arg);
            } else if (truncatedArg.match(/^---+(=|$)/)) {
              pushPositional(arg);
              continue;
            } else if (arg.match(/^--.+=/) || !configuration["short-option-groups"] && arg.match(/^-.+=/)) {
              m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
              if (m !== null && Array.isArray(m) && m.length >= 3) {
                if (checkAllAliases(m[1], flags.arrays)) {
                  i = eatArray(i, m[1], args, m[2]);
                } else if (checkAllAliases(m[1], flags.nargs) !== false) {
                  i = eatNargs(i, m[1], args, m[2]);
                } else {
                  setArg(m[1], m[2], true);
                }
              }
            } else if (arg.match(negatedBoolean) && configuration["boolean-negation"]) {
              m = arg.match(negatedBoolean);
              if (m !== null && Array.isArray(m) && m.length >= 2) {
                key = m[1];
                setArg(key, checkAllAliases(key, flags.arrays) ? [false] : false);
              }
            } else if (arg.match(/^--.+/) || !configuration["short-option-groups"] && arg.match(/^-[^-]+/)) {
              m = arg.match(/^--?(.+)/);
              if (m !== null && Array.isArray(m) && m.length >= 2) {
                key = m[1];
                if (checkAllAliases(key, flags.arrays)) {
                  i = eatArray(i, key, args);
                } else if (checkAllAliases(key, flags.nargs) !== false) {
                  i = eatNargs(i, key, args);
                } else {
                  next = args[i + 1];
                  if (next !== void 0 && (!next.match(/^-/) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                    setArg(key, next);
                    i++;
                  } else if (/^(true|false)$/.test(next)) {
                    setArg(key, next);
                    i++;
                  } else {
                    setArg(key, defaultValue(key));
                  }
                }
              }
            } else if (arg.match(/^-.\..+=/)) {
              m = arg.match(/^-([^=]+)=([\s\S]*)$/);
              if (m !== null && Array.isArray(m) && m.length >= 3) {
                setArg(m[1], m[2]);
              }
            } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
              next = args[i + 1];
              m = arg.match(/^-(.\..+)/);
              if (m !== null && Array.isArray(m) && m.length >= 2) {
                key = m[1];
                if (next !== void 0 && !next.match(/^-/) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                  setArg(key, next);
                  i++;
                } else {
                  setArg(key, defaultValue(key));
                }
              }
            } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
              letters = arg.slice(1, -1).split("");
              broken = false;
              for (let j = 0; j < letters.length; j++) {
                next = arg.slice(j + 2);
                if (letters[j + 1] && letters[j + 1] === "=") {
                  value = arg.slice(j + 3);
                  key = letters[j];
                  if (checkAllAliases(key, flags.arrays)) {
                    i = eatArray(i, key, args, value);
                  } else if (checkAllAliases(key, flags.nargs) !== false) {
                    i = eatNargs(i, key, args, value);
                  } else {
                    setArg(key, value);
                  }
                  broken = true;
                  break;
                }
                if (next === "-") {
                  setArg(letters[j], next);
                  continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) && checkAllAliases(next, flags.bools) === false) {
                  setArg(letters[j], next);
                  broken = true;
                  break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                  setArg(letters[j], next);
                  broken = true;
                  break;
                } else {
                  setArg(letters[j], defaultValue(letters[j]));
                }
              }
              key = arg.slice(-1)[0];
              if (!broken && key !== "-") {
                if (checkAllAliases(key, flags.arrays)) {
                  i = eatArray(i, key, args);
                } else if (checkAllAliases(key, flags.nargs) !== false) {
                  i = eatNargs(i, key, args);
                } else {
                  next = args[i + 1];
                  if (next !== void 0 && (!/^(-|--)[^-]/.test(next) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                    setArg(key, next);
                    i++;
                  } else if (/^(true|false)$/.test(next)) {
                    setArg(key, next);
                    i++;
                  } else {
                    setArg(key, defaultValue(key));
                  }
                }
              }
            } else if (arg.match(/^-[0-9]$/) && arg.match(negative) && checkAllAliases(arg.slice(1), flags.bools)) {
              key = arg.slice(1);
              setArg(key, defaultValue(key));
            } else if (arg === "--") {
              notFlags = args.slice(i + 1);
              break;
            } else if (configuration["halt-at-non-option"]) {
              notFlags = args.slice(i);
              break;
            } else {
              pushPositional(arg);
            }
          }
          applyEnvVars(argv, true);
          applyEnvVars(argv, false);
          setConfig(argv);
          setConfigObjects();
          applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
          applyCoercions(argv);
          if (configuration["set-placeholder-key"])
            setPlaceholderKeys(argv);
          Object.keys(flags.counts).forEach(function(key) {
            if (!hasKey(argv, key.split(".")))
              setArg(key, 0);
          });
          if (notFlagsOption && notFlags.length)
            argv[notFlagsArgv] = [];
          notFlags.forEach(function(key) {
            argv[notFlagsArgv].push(key);
          });
          if (configuration["camel-case-expansion"] && configuration["strip-dashed"]) {
            Object.keys(argv).filter((key) => key !== "--" && key.includes("-")).forEach((key) => {
              delete argv[key];
            });
          }
          if (configuration["strip-aliased"]) {
            [].concat(...Object.keys(aliases).map((k) => aliases[k])).forEach((alias) => {
              if (configuration["camel-case-expansion"] && alias.includes("-")) {
                delete argv[alias.split(".").map((prop) => camelCase(prop)).join(".")];
              }
              delete argv[alias];
            });
          }
          function pushPositional(arg) {
            const maybeCoercedNumber = maybeCoerceNumber("_", arg);
            if (typeof maybeCoercedNumber === "string" || typeof maybeCoercedNumber === "number") {
              argv._.push(maybeCoercedNumber);
            }
          }
          function eatNargs(i, key, args2, argAfterEqualSign) {
            let ii;
            let toEat = checkAllAliases(key, flags.nargs);
            toEat = typeof toEat !== "number" || isNaN(toEat) ? 1 : toEat;
            if (toEat === 0) {
              if (!isUndefined(argAfterEqualSign)) {
                error = Error(__("Argument unexpected for: %s", key));
              }
              setArg(key, defaultValue(key));
              return i;
            }
            let available = isUndefined(argAfterEqualSign) ? 0 : 1;
            if (configuration["nargs-eats-options"]) {
              if (args2.length - (i + 1) + available < toEat) {
                error = Error(__("Not enough arguments following: %s", key));
              }
              available = toEat;
            } else {
              for (ii = i + 1; ii < args2.length; ii++) {
                if (!args2[ii].match(/^-[^0-9]/) || args2[ii].match(negative) || isUnknownOptionAsArg(args2[ii]))
                  available++;
                else
                  break;
              }
              if (available < toEat)
                error = Error(__("Not enough arguments following: %s", key));
            }
            let consumed = Math.min(available, toEat);
            if (!isUndefined(argAfterEqualSign) && consumed > 0) {
              setArg(key, argAfterEqualSign);
              consumed--;
            }
            for (ii = i + 1; ii < consumed + i + 1; ii++) {
              setArg(key, args2[ii]);
            }
            return i + consumed;
          }
          function eatArray(i, key, args2, argAfterEqualSign) {
            let argsToSet = [];
            let next = argAfterEqualSign || args2[i + 1];
            const nargsCount = checkAllAliases(key, flags.nargs);
            if (checkAllAliases(key, flags.bools) && !/^(true|false)$/.test(next)) {
              argsToSet.push(true);
            } else if (isUndefined(next) || isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) {
              if (defaults[key] !== void 0) {
                const defVal = defaults[key];
                argsToSet = Array.isArray(defVal) ? defVal : [defVal];
              }
            } else {
              if (!isUndefined(argAfterEqualSign)) {
                argsToSet.push(processValue(key, argAfterEqualSign, true));
              }
              for (let ii = i + 1; ii < args2.length; ii++) {
                if (!configuration["greedy-arrays"] && argsToSet.length > 0 || nargsCount && typeof nargsCount === "number" && argsToSet.length >= nargsCount)
                  break;
                next = args2[ii];
                if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next))
                  break;
                i = ii;
                argsToSet.push(processValue(key, next, inputIsString));
              }
            }
            if (typeof nargsCount === "number" && (nargsCount && argsToSet.length < nargsCount || isNaN(nargsCount) && argsToSet.length === 0)) {
              error = Error(__("Not enough arguments following: %s", key));
            }
            setArg(key, argsToSet);
            return i;
          }
          function setArg(key, val, shouldStripQuotes = inputIsString) {
            if (/-/.test(key) && configuration["camel-case-expansion"]) {
              const alias = key.split(".").map(function(prop) {
                return camelCase(prop);
              }).join(".");
              addNewAlias(key, alias);
            }
            const value = processValue(key, val, shouldStripQuotes);
            const splitKey = key.split(".");
            setKey(argv, splitKey, value);
            if (flags.aliases[key]) {
              flags.aliases[key].forEach(function(x) {
                const keyProperties = x.split(".");
                setKey(argv, keyProperties, value);
              });
            }
            if (splitKey.length > 1 && configuration["dot-notation"]) {
              (flags.aliases[splitKey[0]] || []).forEach(function(x) {
                let keyProperties = x.split(".");
                const a = [].concat(splitKey);
                a.shift();
                keyProperties = keyProperties.concat(a);
                if (!(flags.aliases[key] || []).includes(keyProperties.join("."))) {
                  setKey(argv, keyProperties, value);
                }
              });
            }
            if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
              const keys = [key].concat(flags.aliases[key] || []);
              keys.forEach(function(key2) {
                Object.defineProperty(argvReturn, key2, {
                  enumerable: true,
                  get() {
                    return val;
                  },
                  set(value2) {
                    val = typeof value2 === "string" ? mixin.normalize(value2) : value2;
                  }
                });
              });
            }
          }
          function addNewAlias(key, alias) {
            if (!(flags.aliases[key] && flags.aliases[key].length)) {
              flags.aliases[key] = [alias];
              newAliases[alias] = true;
            }
            if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
              addNewAlias(alias, key);
            }
          }
          function processValue(key, val, shouldStripQuotes) {
            if (shouldStripQuotes) {
              val = stripQuotes(val);
            }
            if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
              if (typeof val === "string")
                val = val === "true";
            }
            let value = Array.isArray(val) ? val.map(function(v) {
              return maybeCoerceNumber(key, v);
            }) : maybeCoerceNumber(key, val);
            if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === "boolean")) {
              value = increment();
            }
            if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
              if (Array.isArray(val))
                value = val.map((val2) => {
                  return mixin.normalize(val2);
                });
              else
                value = mixin.normalize(val);
            }
            return value;
          }
          function maybeCoerceNumber(key, value) {
            if (!configuration["parse-positional-numbers"] && key === "_")
              return value;
            if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
              const shouldCoerceNumber = looksLikeNumber(value) && configuration["parse-numbers"] && Number.isSafeInteger(Math.floor(parseFloat(`${value}`)));
              if (shouldCoerceNumber || !isUndefined(value) && checkAllAliases(key, flags.numbers)) {
                value = Number(value);
              }
            }
            return value;
          }
          function setConfig(argv2) {
            const configLookup = /* @__PURE__ */ Object.create(null);
            applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
            Object.keys(flags.configs).forEach(function(configKey) {
              const configPath = argv2[configKey] || configLookup[configKey];
              if (configPath) {
                try {
                  let config = null;
                  const resolvedConfigPath = mixin.resolve(mixin.cwd(), configPath);
                  const resolveConfig = flags.configs[configKey];
                  if (typeof resolveConfig === "function") {
                    try {
                      config = resolveConfig(resolvedConfigPath);
                    } catch (e) {
                      config = e;
                    }
                    if (config instanceof Error) {
                      error = config;
                      return;
                    }
                  } else {
                    config = mixin.require(resolvedConfigPath);
                  }
                  setConfigObject(config);
                } catch (ex) {
                  if (ex.name === "PermissionDenied")
                    error = ex;
                  else if (argv2[configKey])
                    error = Error(__("Invalid JSON config file: %s", configPath));
                }
              }
            });
          }
          function setConfigObject(config, prev) {
            Object.keys(config).forEach(function(key) {
              const value = config[key];
              const fullKey = prev ? prev + "." + key : key;
              if (typeof value === "object" && value !== null && !Array.isArray(value) && configuration["dot-notation"]) {
                setConfigObject(value, fullKey);
              } else {
                if (!hasKey(argv, fullKey.split(".")) || checkAllAliases(fullKey, flags.arrays) && configuration["combine-arrays"]) {
                  setArg(fullKey, value);
                }
              }
            });
          }
          function setConfigObjects() {
            if (typeof configObjects !== "undefined") {
              configObjects.forEach(function(configObject) {
                setConfigObject(configObject);
              });
            }
          }
          function applyEnvVars(argv2, configOnly) {
            if (typeof envPrefix === "undefined")
              return;
            const prefix = typeof envPrefix === "string" ? envPrefix : "";
            const env2 = mixin.env();
            Object.keys(env2).forEach(function(envVar) {
              if (prefix === "" || envVar.lastIndexOf(prefix, 0) === 0) {
                const keys = envVar.split("__").map(function(key, i) {
                  if (i === 0) {
                    key = key.substring(prefix.length);
                  }
                  return camelCase(key);
                });
                if ((configOnly && flags.configs[keys.join(".")] || !configOnly) && !hasKey(argv2, keys)) {
                  setArg(keys.join("."), env2[envVar]);
                }
              }
            });
          }
          function applyCoercions(argv2) {
            let coerce;
            const applied = /* @__PURE__ */ new Set();
            Object.keys(argv2).forEach(function(key) {
              if (!applied.has(key)) {
                coerce = checkAllAliases(key, flags.coercions);
                if (typeof coerce === "function") {
                  try {
                    const value = maybeCoerceNumber(key, coerce(argv2[key]));
                    [].concat(flags.aliases[key] || [], key).forEach((ali) => {
                      applied.add(ali);
                      argv2[ali] = value;
                    });
                  } catch (err) {
                    error = err;
                  }
                }
              }
            });
          }
          function setPlaceholderKeys(argv2) {
            flags.keys.forEach((key) => {
              if (~key.indexOf("."))
                return;
              if (typeof argv2[key] === "undefined")
                argv2[key] = void 0;
            });
            return argv2;
          }
          function applyDefaultsAndAliases(obj, aliases2, defaults2, canLog = false) {
            Object.keys(defaults2).forEach(function(key) {
              if (!hasKey(obj, key.split("."))) {
                setKey(obj, key.split("."), defaults2[key]);
                if (canLog)
                  defaulted[key] = true;
                (aliases2[key] || []).forEach(function(x) {
                  if (hasKey(obj, x.split(".")))
                    return;
                  setKey(obj, x.split("."), defaults2[key]);
                });
              }
            });
          }
          function hasKey(obj, keys) {
            let o = obj;
            if (!configuration["dot-notation"])
              keys = [keys.join(".")];
            keys.slice(0, -1).forEach(function(key2) {
              o = o[key2] || {};
            });
            const key = keys[keys.length - 1];
            if (typeof o !== "object")
              return false;
            else
              return key in o;
          }
          function setKey(obj, keys, value) {
            let o = obj;
            if (!configuration["dot-notation"])
              keys = [keys.join(".")];
            keys.slice(0, -1).forEach(function(key2) {
              key2 = sanitizeKey(key2);
              if (typeof o === "object" && o[key2] === void 0) {
                o[key2] = {};
              }
              if (typeof o[key2] !== "object" || Array.isArray(o[key2])) {
                if (Array.isArray(o[key2])) {
                  o[key2].push({});
                } else {
                  o[key2] = [o[key2], {}];
                }
                o = o[key2][o[key2].length - 1];
              } else {
                o = o[key2];
              }
            });
            const key = sanitizeKey(keys[keys.length - 1]);
            const isTypeArray = checkAllAliases(keys.join("."), flags.arrays);
            const isValueArray = Array.isArray(value);
            let duplicate = configuration["duplicate-arguments-array"];
            if (!duplicate && checkAllAliases(key, flags.nargs)) {
              duplicate = true;
              if (!isUndefined(o[key]) && flags.nargs[key] === 1 || Array.isArray(o[key]) && o[key].length === flags.nargs[key]) {
                o[key] = void 0;
              }
            }
            if (value === increment()) {
              o[key] = increment(o[key]);
            } else if (Array.isArray(o[key])) {
              if (duplicate && isTypeArray && isValueArray) {
                o[key] = configuration["flatten-duplicate-arrays"] ? o[key].concat(value) : (Array.isArray(o[key][0]) ? o[key] : [o[key]]).concat([value]);
              } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
                o[key] = value;
              } else {
                o[key] = o[key].concat([value]);
              }
            } else if (o[key] === void 0 && isTypeArray) {
              o[key] = isValueArray ? value : [value];
            } else if (duplicate && !(o[key] === void 0 || checkAllAliases(key, flags.counts) || checkAllAliases(key, flags.bools))) {
              o[key] = [o[key], value];
            } else {
              o[key] = value;
            }
          }
          function extendAliases(...args2) {
            args2.forEach(function(obj) {
              Object.keys(obj || {}).forEach(function(key) {
                if (flags.aliases[key])
                  return;
                flags.aliases[key] = [].concat(aliases[key] || []);
                flags.aliases[key].concat(key).forEach(function(x) {
                  if (/-/.test(x) && configuration["camel-case-expansion"]) {
                    const c = camelCase(x);
                    if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                      flags.aliases[key].push(c);
                      newAliases[c] = true;
                    }
                  }
                });
                flags.aliases[key].concat(key).forEach(function(x) {
                  if (x.length > 1 && /[A-Z]/.test(x) && configuration["camel-case-expansion"]) {
                    const c = decamelize(x, "-");
                    if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                      flags.aliases[key].push(c);
                      newAliases[c] = true;
                    }
                  }
                });
                flags.aliases[key].forEach(function(x) {
                  flags.aliases[x] = [key].concat(flags.aliases[key].filter(function(y) {
                    return x !== y;
                  }));
                });
              });
            });
          }
          function checkAllAliases(key, flag) {
            const toCheck = [].concat(flags.aliases[key] || [], key);
            const keys = Object.keys(flag);
            const setAlias = toCheck.find((key2) => keys.includes(key2));
            return setAlias ? flag[setAlias] : false;
          }
          function hasAnyFlag(key) {
            const flagsKeys = Object.keys(flags);
            const toCheck = [].concat(flagsKeys.map((k) => flags[k]));
            return toCheck.some(function(flag) {
              return Array.isArray(flag) ? flag.includes(key) : flag[key];
            });
          }
          function hasFlagsMatching(arg, ...patterns) {
            const toCheck = [].concat(...patterns);
            return toCheck.some(function(pattern) {
              const match = arg.match(pattern);
              return match && hasAnyFlag(match[1]);
            });
          }
          function hasAllShortFlags(arg) {
            if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
              return false;
            }
            let hasAllFlags = true;
            let next;
            const letters = arg.slice(1).split("");
            for (let j = 0; j < letters.length; j++) {
              next = arg.slice(j + 2);
              if (!hasAnyFlag(letters[j])) {
                hasAllFlags = false;
                break;
              }
              if (letters[j + 1] && letters[j + 1] === "=" || next === "-" || /[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) || letters[j + 1] && letters[j + 1].match(/\W/)) {
                break;
              }
            }
            return hasAllFlags;
          }
          function isUnknownOptionAsArg(arg) {
            return configuration["unknown-options-as-args"] && isUnknownOption(arg);
          }
          function isUnknownOption(arg) {
            arg = arg.replace(/^-{3,}/, "--");
            if (arg.match(negative)) {
              return false;
            }
            if (hasAllShortFlags(arg)) {
              return false;
            }
            const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
            const normalFlag = /^-+([^=]+?)$/;
            const flagEndingInHyphen = /^-+([^=]+?)-$/;
            const flagEndingInDigits = /^-+([^=]+?\d+)$/;
            const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
            return !hasFlagsMatching(arg, flagWithEquals, negatedBoolean, normalFlag, flagEndingInHyphen, flagEndingInDigits, flagEndingInNonWordCharacters);
          }
          function defaultValue(key) {
            if (!checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts) && `${key}` in defaults) {
              return defaults[key];
            } else {
              return defaultForType(guessType(key));
            }
          }
          function defaultForType(type) {
            const def = {
              [DefaultValuesForTypeKey.BOOLEAN]: true,
              [DefaultValuesForTypeKey.STRING]: "",
              [DefaultValuesForTypeKey.NUMBER]: void 0,
              [DefaultValuesForTypeKey.ARRAY]: []
            };
            return def[type];
          }
          function guessType(key) {
            let type = DefaultValuesForTypeKey.BOOLEAN;
            if (checkAllAliases(key, flags.strings))
              type = DefaultValuesForTypeKey.STRING;
            else if (checkAllAliases(key, flags.numbers))
              type = DefaultValuesForTypeKey.NUMBER;
            else if (checkAllAliases(key, flags.bools))
              type = DefaultValuesForTypeKey.BOOLEAN;
            else if (checkAllAliases(key, flags.arrays))
              type = DefaultValuesForTypeKey.ARRAY;
            return type;
          }
          function isUndefined(num) {
            return num === void 0;
          }
          function checkConfiguration() {
            Object.keys(flags.counts).find((key) => {
              if (checkAllAliases(key, flags.arrays)) {
                error = Error(__("Invalid configuration: %s, opts.count excludes opts.array.", key));
                return true;
              } else if (checkAllAliases(key, flags.nargs)) {
                error = Error(__("Invalid configuration: %s, opts.count excludes opts.narg.", key));
                return true;
              }
              return false;
            });
          }
          return {
            aliases: Object.assign({}, flags.aliases),
            argv: Object.assign(argvReturn, argv),
            configuration,
            defaulted: Object.assign({}, defaulted),
            error,
            newAliases: Object.assign({}, newAliases)
          };
        }
      };
      function combineAliases(aliases) {
        const aliasArrays = [];
        const combined = /* @__PURE__ */ Object.create(null);
        let change = true;
        Object.keys(aliases).forEach(function(key) {
          aliasArrays.push([].concat(aliases[key], key));
        });
        while (change) {
          change = false;
          for (let i = 0; i < aliasArrays.length; i++) {
            for (let ii = i + 1; ii < aliasArrays.length; ii++) {
              const intersect = aliasArrays[i].filter(function(v) {
                return aliasArrays[ii].indexOf(v) !== -1;
              });
              if (intersect.length) {
                aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
                aliasArrays.splice(ii, 1);
                change = true;
                break;
              }
            }
          }
        }
        aliasArrays.forEach(function(aliasArray) {
          aliasArray = aliasArray.filter(function(v, i, self) {
            return self.indexOf(v) === i;
          });
          const lastAlias = aliasArray.pop();
          if (lastAlias !== void 0 && typeof lastAlias === "string") {
            combined[lastAlias] = aliasArray;
          }
        });
        return combined;
      }
      function increment(orig) {
        return orig !== void 0 ? orig + 1 : 1;
      }
      function sanitizeKey(key) {
        if (key === "__proto__")
          return "___proto___";
        return key;
      }
      function stripQuotes(val) {
        return typeof val === "string" && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0] ? val.substring(1, val.length - 1) : val;
      }
      var _a;
      var _b;
      var _c;
      var minNodeVersion = process && process.env && process.env.YARGS_MIN_NODE_VERSION ? Number(process.env.YARGS_MIN_NODE_VERSION) : 12;
      var nodeVersion = (_b = (_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : (_c = process === null || process === void 0 ? void 0 : process.version) === null || _c === void 0 ? void 0 : _c.slice(1);
      if (nodeVersion) {
        const major = Number(nodeVersion.match(/^([^.]+)/)[1]);
        if (major < minNodeVersion) {
          throw Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`);
        }
      }
      var env = process ? process.env : {};
      var parser = new YargsParser({
        cwd: process.cwd,
        env: () => {
          return env;
        },
        format: util.format,
        normalize: path.normalize,
        resolve: path.resolve,
        require: (path2) => {
          if (typeof __require !== "undefined") {
            return __require(path2);
          } else if (path2.match(/\.json$/)) {
            return JSON.parse(fs.readFileSync(path2, "utf8"));
          } else {
            throw Error("only .json config files are supported in ESM");
          }
        }
      });
      var yargsParser = function Parser(args, opts) {
        const result2 = parser.parse(args.slice(), opts);
        return result2.argv;
      };
      yargsParser.detailed = function(args, opts) {
        return parser.parse(args.slice(), opts);
      };
      yargsParser.camelCase = camelCase;
      yargsParser.decamelize = decamelize;
      yargsParser.looksLikeNumber = looksLikeNumber;
      module.exports = yargsParser;
    }
  });

  // node_modules/is-fullwidth-code-point/index.js
  var require_is_fullwidth_code_point = __commonJS({
    "node_modules/is-fullwidth-code-point/index.js"(exports, module) {
      "use strict";
      var isFullwidthCodePoint = (codePoint) => {
        if (Number.isNaN(codePoint)) {
          return false;
        }
        if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
        codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
        codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
        // CJK Radicals Supplement .. Enclosed CJK Letters and Months
        11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
        12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
        19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
        43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
        44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
        63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
        65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
        65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
        65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
        110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
        127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
        131072 <= codePoint && codePoint <= 262141)) {
          return true;
        }
        return false;
      };
      module.exports = isFullwidthCodePoint;
      module.exports.default = isFullwidthCodePoint;
    }
  });

  // node_modules/emoji-regex/index.js
  var require_emoji_regex = __commonJS({
    "node_modules/emoji-regex/index.js"(exports, module) {
      "use strict";
      module.exports = function() {
        return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
      };
    }
  });

  // node_modules/string-width/index.js
  var require_string_width = __commonJS({
    "node_modules/string-width/index.js"(exports, module) {
      "use strict";
      var stripAnsi = require_strip_ansi();
      var isFullwidthCodePoint = require_is_fullwidth_code_point();
      var emojiRegex = require_emoji_regex();
      var stringWidth = (string) => {
        if (typeof string !== "string" || string.length === 0) {
          return 0;
        }
        string = stripAnsi(string);
        if (string.length === 0) {
          return 0;
        }
        string = string.replace(emojiRegex(), "  ");
        let width = 0;
        for (let i = 0; i < string.length; i++) {
          const code = string.codePointAt(i);
          if (code <= 31 || code >= 127 && code <= 159) {
            continue;
          }
          if (code >= 768 && code <= 879) {
            continue;
          }
          if (code > 65535) {
            i++;
          }
          width += isFullwidthCodePoint(code) ? 2 : 1;
        }
        return width;
      };
      module.exports = stringWidth;
      module.exports.default = stringWidth;
    }
  });

  // node_modules/wrap-ansi/index.js
  var require_wrap_ansi = __commonJS({
    "node_modules/wrap-ansi/index.js"(exports, module) {
      "use strict";
      var stringWidth = require_string_width();
      var stripAnsi = require_strip_ansi();
      var ansiStyles = require_ansi_styles();
      var ESCAPES = /* @__PURE__ */ new Set([
        "\x1B",
        "\x9B"
      ]);
      var END_CODE = 39;
      var ANSI_ESCAPE_BELL = "\x07";
      var ANSI_CSI = "[";
      var ANSI_OSC = "]";
      var ANSI_SGR_TERMINATOR = "m";
      var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
      var wrapAnsi = (code) => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
      var wrapAnsiHyperlink = (uri) => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;
      var wordLengths = (string) => string.split(" ").map((character) => stringWidth(character));
      var wrapWord = (rows, word, columns) => {
        const characters = [...word];
        let isInsideEscape = false;
        let isInsideLinkEscape = false;
        let visible = stringWidth(stripAnsi(rows[rows.length - 1]));
        for (const [index, character] of characters.entries()) {
          const characterLength = stringWidth(character);
          if (visible + characterLength <= columns) {
            rows[rows.length - 1] += character;
          } else {
            rows.push(character);
            visible = 0;
          }
          if (ESCAPES.has(character)) {
            isInsideEscape = true;
            isInsideLinkEscape = characters.slice(index + 1).join("").startsWith(ANSI_ESCAPE_LINK);
          }
          if (isInsideEscape) {
            if (isInsideLinkEscape) {
              if (character === ANSI_ESCAPE_BELL) {
                isInsideEscape = false;
                isInsideLinkEscape = false;
              }
            } else if (character === ANSI_SGR_TERMINATOR) {
              isInsideEscape = false;
            }
            continue;
          }
          visible += characterLength;
          if (visible === columns && index < characters.length - 1) {
            rows.push("");
            visible = 0;
          }
        }
        if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
          rows[rows.length - 2] += rows.pop();
        }
      };
      var stringVisibleTrimSpacesRight = (string) => {
        const words = string.split(" ");
        let last = words.length;
        while (last > 0) {
          if (stringWidth(words[last - 1]) > 0) {
            break;
          }
          last--;
        }
        if (last === words.length) {
          return string;
        }
        return words.slice(0, last).join(" ") + words.slice(last).join("");
      };
      var exec = (string, columns, options = {}) => {
        if (options.trim !== false && string.trim() === "") {
          return "";
        }
        let returnValue = "";
        let escapeCode;
        let escapeUrl;
        const lengths = wordLengths(string);
        let rows = [""];
        for (const [index, word] of string.split(" ").entries()) {
          if (options.trim !== false) {
            rows[rows.length - 1] = rows[rows.length - 1].trimStart();
          }
          let rowLength = stringWidth(rows[rows.length - 1]);
          if (index !== 0) {
            if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
              rows.push("");
              rowLength = 0;
            }
            if (rowLength > 0 || options.trim === false) {
              rows[rows.length - 1] += " ";
              rowLength++;
            }
          }
          if (options.hard && lengths[index] > columns) {
            const remainingColumns = columns - rowLength;
            const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
            const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
            if (breaksStartingNextLine < breaksStartingThisLine) {
              rows.push("");
            }
            wrapWord(rows, word, columns);
            continue;
          }
          if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
            if (options.wordWrap === false && rowLength < columns) {
              wrapWord(rows, word, columns);
              continue;
            }
            rows.push("");
          }
          if (rowLength + lengths[index] > columns && options.wordWrap === false) {
            wrapWord(rows, word, columns);
            continue;
          }
          rows[rows.length - 1] += word;
        }
        if (options.trim !== false) {
          rows = rows.map(stringVisibleTrimSpacesRight);
        }
        const pre = [...rows.join("\n")];
        for (const [index, character] of pre.entries()) {
          returnValue += character;
          if (ESCAPES.has(character)) {
            const { groups } = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index).join("")) || { groups: {} };
            if (groups.code !== void 0) {
              const code2 = Number.parseFloat(groups.code);
              escapeCode = code2 === END_CODE ? void 0 : code2;
            } else if (groups.uri !== void 0) {
              escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
            }
          }
          const code = ansiStyles.codes.get(Number(escapeCode));
          if (pre[index + 1] === "\n") {
            if (escapeUrl) {
              returnValue += wrapAnsiHyperlink("");
            }
            if (escapeCode && code) {
              returnValue += wrapAnsi(code);
            }
          } else if (character === "\n") {
            if (escapeCode && code) {
              returnValue += wrapAnsi(escapeCode);
            }
            if (escapeUrl) {
              returnValue += wrapAnsiHyperlink(escapeUrl);
            }
          }
        }
        return returnValue;
      };
      module.exports = (string, columns, options) => {
        return String(string).normalize().replace(/\r\n/g, "\n").split("\n").map((line) => exec(line, columns, options)).join("\n");
      };
    }
  });

  // node_modules/cliui/build/index.cjs
  var require_build3 = __commonJS({
    "node_modules/cliui/build/index.cjs"(exports, module) {
      "use strict";
      var align = {
        right: alignRight,
        center: alignCenter
      };
      var top = 0;
      var right = 1;
      var bottom = 2;
      var left = 3;
      var UI = class {
        constructor(opts) {
          var _a;
          this.width = opts.width;
          this.wrap = (_a = opts.wrap) !== null && _a !== void 0 ? _a : true;
          this.rows = [];
        }
        span(...args) {
          const cols = this.div(...args);
          cols.span = true;
        }
        resetOutput() {
          this.rows = [];
        }
        div(...args) {
          if (args.length === 0) {
            this.div("");
          }
          if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === "string") {
            return this.applyLayoutDSL(args[0]);
          }
          const cols = args.map((arg) => {
            if (typeof arg === "string") {
              return this.colFromString(arg);
            }
            return arg;
          });
          this.rows.push(cols);
          return cols;
        }
        shouldApplyLayoutDSL(...args) {
          return args.length === 1 && typeof args[0] === "string" && /[\t\n]/.test(args[0]);
        }
        applyLayoutDSL(str) {
          const rows = str.split("\n").map((row) => row.split("	"));
          let leftColumnWidth = 0;
          rows.forEach((columns) => {
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > leftColumnWidth) {
              leftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
          });
          rows.forEach((columns) => {
            this.div(...columns.map((r, i) => {
              return {
                text: r.trim(),
                padding: this.measurePadding(r),
                width: i === 0 && columns.length > 1 ? leftColumnWidth : void 0
              };
            }));
          });
          return this.rows[this.rows.length - 1];
        }
        colFromString(text) {
          return {
            text,
            padding: this.measurePadding(text)
          };
        }
        measurePadding(str) {
          const noAnsi = mixin.stripAnsi(str);
          return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length];
        }
        toString() {
          const lines = [];
          this.rows.forEach((row) => {
            this.rowToString(row, lines);
          });
          return lines.filter((line) => !line.hidden).map((line) => line.text).join("\n");
        }
        rowToString(row, lines) {
          this.rasterize(row).forEach((rrow, r) => {
            let str = "";
            rrow.forEach((col, c) => {
              const { width } = row[c];
              const wrapWidth = this.negatePadding(row[c]);
              let ts = col;
              if (wrapWidth > mixin.stringWidth(col)) {
                ts += " ".repeat(wrapWidth - mixin.stringWidth(col));
              }
              if (row[c].align && row[c].align !== "left" && this.wrap) {
                const fn = align[row[c].align];
                ts = fn(ts, wrapWidth);
                if (mixin.stringWidth(ts) < wrapWidth) {
                  ts += " ".repeat((width || 0) - mixin.stringWidth(ts) - 1);
                }
              }
              const padding = row[c].padding || [0, 0, 0, 0];
              if (padding[left]) {
                str += " ".repeat(padding[left]);
              }
              str += addBorder(row[c], ts, "| ");
              str += ts;
              str += addBorder(row[c], ts, " |");
              if (padding[right]) {
                str += " ".repeat(padding[right]);
              }
              if (r === 0 && lines.length > 0) {
                str = this.renderInline(str, lines[lines.length - 1]);
              }
            });
            lines.push({
              text: str.replace(/ +$/, ""),
              span: row.span
            });
          });
          return lines;
        }
        // if the full 'source' can render in
        // the target line, do so.
        renderInline(source, previousLine) {
          const match = source.match(/^ */);
          const leadingWhitespace = match ? match[0].length : 0;
          const target = previousLine.text;
          const targetTextWidth = mixin.stringWidth(target.trimRight());
          if (!previousLine.span) {
            return source;
          }
          if (!this.wrap) {
            previousLine.hidden = true;
            return target + source;
          }
          if (leadingWhitespace < targetTextWidth) {
            return source;
          }
          previousLine.hidden = true;
          return target.trimRight() + " ".repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
        }
        rasterize(row) {
          const rrows = [];
          const widths = this.columnWidths(row);
          let wrapped;
          row.forEach((col, c) => {
            col.width = widths[c];
            if (this.wrap) {
              wrapped = mixin.wrap(col.text, this.negatePadding(col), { hard: true }).split("\n");
            } else {
              wrapped = col.text.split("\n");
            }
            if (col.border) {
              wrapped.unshift("." + "-".repeat(this.negatePadding(col) + 2) + ".");
              wrapped.push("'" + "-".repeat(this.negatePadding(col) + 2) + "'");
            }
            if (col.padding) {
              wrapped.unshift(...new Array(col.padding[top] || 0).fill(""));
              wrapped.push(...new Array(col.padding[bottom] || 0).fill(""));
            }
            wrapped.forEach((str, r) => {
              if (!rrows[r]) {
                rrows.push([]);
              }
              const rrow = rrows[r];
              for (let i = 0; i < c; i++) {
                if (rrow[i] === void 0) {
                  rrow.push("");
                }
              }
              rrow.push(str);
            });
          });
          return rrows;
        }
        negatePadding(col) {
          let wrapWidth = col.width || 0;
          if (col.padding) {
            wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
          }
          if (col.border) {
            wrapWidth -= 4;
          }
          return wrapWidth;
        }
        columnWidths(row) {
          if (!this.wrap) {
            return row.map((col) => {
              return col.width || mixin.stringWidth(col.text);
            });
          }
          let unset = row.length;
          let remainingWidth = this.width;
          const widths = row.map((col) => {
            if (col.width) {
              unset--;
              remainingWidth -= col.width;
              return col.width;
            }
            return void 0;
          });
          const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0;
          return widths.map((w, i) => {
            if (w === void 0) {
              return Math.max(unsetWidth, _minWidth(row[i]));
            }
            return w;
          });
        }
      };
      function addBorder(col, ts, style) {
        if (col.border) {
          if (/[.']-+[.']/.test(ts)) {
            return "";
          }
          if (ts.trim().length !== 0) {
            return style;
          }
          return "  ";
        }
        return "";
      }
      function _minWidth(col) {
        const padding = col.padding || [];
        const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
        if (col.border) {
          return minWidth + 4;
        }
        return minWidth;
      }
      function getWindowWidth() {
        if (typeof process === "object" && process.stdout && process.stdout.columns) {
          return process.stdout.columns;
        }
        return 80;
      }
      function alignRight(str, width) {
        str = str.trim();
        const strWidth = mixin.stringWidth(str);
        if (strWidth < width) {
          return " ".repeat(width - strWidth) + str;
        }
        return str;
      }
      function alignCenter(str, width) {
        str = str.trim();
        const strWidth = mixin.stringWidth(str);
        if (strWidth >= width) {
          return str;
        }
        return " ".repeat(width - strWidth >> 1) + str;
      }
      var mixin;
      function cliui(opts, _mixin) {
        mixin = _mixin;
        return new UI({
          width: (opts === null || opts === void 0 ? void 0 : opts.width) || getWindowWidth(),
          wrap: opts === null || opts === void 0 ? void 0 : opts.wrap
        });
      }
      var stringWidth = require_string_width();
      var stripAnsi = require_strip_ansi();
      var wrap = require_wrap_ansi();
      function ui(opts) {
        return cliui(opts, {
          stringWidth,
          stripAnsi,
          wrap
        });
      }
      module.exports = ui;
    }
  });

  // node_modules/escalade/sync/index.js
  var require_sync = __commonJS({
    "node_modules/escalade/sync/index.js"(exports, module) {
      "use strict";
      var { dirname, resolve } = __require("path");
      var { readdirSync, statSync } = __require("fs");
      module.exports = function(start, callback) {
        let dir = resolve(".", start);
        let tmp, stats = statSync(dir);
        if (!stats.isDirectory()) {
          dir = dirname(dir);
        }
        while (true) {
          tmp = callback(dir, readdirSync(dir));
          if (tmp) return resolve(dir, tmp);
          dir = dirname(tmp = dir);
          if (tmp === dir) break;
        }
      };
    }
  });

  // node_modules/get-caller-file/index.js
  var require_get_caller_file = __commonJS({
    "node_modules/get-caller-file/index.js"(exports, module) {
      "use strict";
      module.exports = function getCallerFile(position) {
        if (position === void 0) {
          position = 2;
        }
        if (position >= Error.stackTraceLimit) {
          throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" + position + "` and Error.stackTraceLimit was: `" + Error.stackTraceLimit + "`");
        }
        var oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack2) {
          return stack2;
        };
        var stack = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;
        if (stack !== null && typeof stack === "object") {
          return stack[position] ? stack[position].getFileName() : void 0;
        }
      };
    }
  });

  // node_modules/require-directory/index.js
  var require_require_directory = __commonJS({
    "node_modules/require-directory/index.js"(exports, module) {
      "use strict";
      var fs = __require("fs");
      var join = __require("path").join;
      var resolve = __require("path").resolve;
      var dirname = __require("path").dirname;
      var defaultOptions = {
        extensions: ["js", "json", "coffee"],
        recurse: true,
        rename: function(name) {
          return name;
        },
        visit: function(obj) {
          return obj;
        }
      };
      function checkFileInclusion(path, filename, options) {
        return (
          // verify file has valid extension
          new RegExp("\\.(" + options.extensions.join("|") + ")$", "i").test(filename) && // if options.include is a RegExp, evaluate it and make sure the path passes
          !(options.include && options.include instanceof RegExp && !options.include.test(path)) && // if options.include is a function, evaluate it and make sure the path passes
          !(options.include && typeof options.include === "function" && !options.include(path, filename)) && // if options.exclude is a RegExp, evaluate it and make sure the path doesn't pass
          !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(path)) && // if options.exclude is a function, evaluate it and make sure the path doesn't pass
          !(options.exclude && typeof options.exclude === "function" && options.exclude(path, filename))
        );
      }
      function requireDirectory(m, path, options) {
        var retval = {};
        if (path && !options && typeof path !== "string") {
          options = path;
          path = null;
        }
        options = options || {};
        for (var prop in defaultOptions) {
          if (typeof options[prop] === "undefined") {
            options[prop] = defaultOptions[prop];
          }
        }
        path = !path ? dirname(m.filename) : resolve(dirname(m.filename), path);
        fs.readdirSync(path).forEach(function(filename) {
          var joined = join(path, filename), files, key, obj;
          if (fs.statSync(joined).isDirectory() && options.recurse) {
            files = requireDirectory(m, joined, options);
            if (Object.keys(files).length) {
              retval[options.rename(filename, joined, filename)] = files;
            }
          } else {
            if (joined !== m.filename && checkFileInclusion(joined, filename, options)) {
              key = filename.substring(0, filename.lastIndexOf("."));
              obj = m.require(joined);
              retval[options.rename(key, joined, filename)] = options.visit(obj, joined, filename) || obj;
            }
          }
        });
        return retval;
      }
      module.exports = requireDirectory;
      module.exports.defaults = defaultOptions;
    }
  });

  // node_modules/yargs/build/index.cjs
  var require_build4 = __commonJS({
    "node_modules/yargs/build/index.cjs"(exports, module) {
      "use strict";
      var t = __require("assert");
      var e = class _e extends Error {
        constructor(t2) {
          super(t2 || "yargs error"), this.name = "YError", Error.captureStackTrace && Error.captureStackTrace(this, _e);
        }
      };
      var s;
      var i = [];
      function n(t2, o2, a2, h2) {
        s = h2;
        let l2 = {};
        if (Object.prototype.hasOwnProperty.call(t2, "extends")) {
          if ("string" != typeof t2.extends) return l2;
          const r2 = /\.json|\..*rc$/.test(t2.extends);
          let h3 = null;
          if (r2) h3 = (function(t3, e2) {
            return s.path.resolve(t3, e2);
          })(o2, t2.extends);
          else try {
            h3 = __require.resolve(t2.extends);
          } catch (e2) {
            return t2;
          }
          !(function(t3) {
            if (i.indexOf(t3) > -1) throw new e(`Circular extended configurations: '${t3}'.`);
          })(h3), i.push(h3), l2 = r2 ? JSON.parse(s.readFileSync(h3, "utf8")) : __require(t2.extends), delete t2.extends, l2 = n(l2, s.path.dirname(h3), a2, s);
        }
        return i = [], a2 ? r(l2, t2) : Object.assign({}, l2, t2);
      }
      function r(t2, e2) {
        const s2 = {};
        function i2(t3) {
          return t3 && "object" == typeof t3 && !Array.isArray(t3);
        }
        Object.assign(s2, t2);
        for (const n2 of Object.keys(e2)) i2(e2[n2]) && i2(s2[n2]) ? s2[n2] = r(t2[n2], e2[n2]) : s2[n2] = e2[n2];
        return s2;
      }
      function o(t2) {
        const e2 = t2.replace(/\s{2,}/g, " ").split(/\s+(?![^[]*]|[^<]*>)/), s2 = /\.*[\][<>]/g, i2 = e2.shift();
        if (!i2) throw new Error(`No command found in: ${t2}`);
        const n2 = { cmd: i2.replace(s2, ""), demanded: [], optional: [] };
        return e2.forEach((t3, i3) => {
          let r2 = false;
          t3 = t3.replace(/\s/g, ""), /\.+[\]>]/.test(t3) && i3 === e2.length - 1 && (r2 = true), /^\[/.test(t3) ? n2.optional.push({ cmd: t3.replace(s2, "").split("|"), variadic: r2 }) : n2.demanded.push({ cmd: t3.replace(s2, "").split("|"), variadic: r2 });
        }), n2;
      }
      var a = ["first", "second", "third", "fourth", "fifth", "sixth"];
      function h(t2, s2, i2) {
        try {
          let n2 = 0;
          const [r2, a2, h2] = "object" == typeof t2 ? [{ demanded: [], optional: [] }, t2, s2] : [o(`cmd ${t2}`), s2, i2], f2 = [].slice.call(a2);
          for (; f2.length && void 0 === f2[f2.length - 1]; ) f2.pop();
          const d2 = h2 || f2.length;
          if (d2 < r2.demanded.length) throw new e(`Not enough arguments provided. Expected ${r2.demanded.length} but received ${f2.length}.`);
          const u2 = r2.demanded.length + r2.optional.length;
          if (d2 > u2) throw new e(`Too many arguments provided. Expected max ${u2} but received ${d2}.`);
          r2.demanded.forEach((t3) => {
            const e2 = l(f2.shift());
            0 === t3.cmd.filter((t4) => t4 === e2 || "*" === t4).length && c(e2, t3.cmd, n2), n2 += 1;
          }), r2.optional.forEach((t3) => {
            if (0 === f2.length) return;
            const e2 = l(f2.shift());
            0 === t3.cmd.filter((t4) => t4 === e2 || "*" === t4).length && c(e2, t3.cmd, n2), n2 += 1;
          });
        } catch (t3) {
          console.warn(t3.stack);
        }
      }
      function l(t2) {
        return Array.isArray(t2) ? "array" : null === t2 ? "null" : typeof t2;
      }
      function c(t2, s2, i2) {
        throw new e(`Invalid ${a[i2] || "manyith"} argument. Expected ${s2.join(" or ")} but received ${t2}.`);
      }
      function f(t2) {
        return !!t2 && !!t2.then && "function" == typeof t2.then;
      }
      function d(t2, e2, s2, i2) {
        s2.assert.notStrictEqual(t2, e2, i2);
      }
      function u(t2, e2) {
        e2.assert.strictEqual(typeof t2, "string");
      }
      function p(t2) {
        return Object.keys(t2);
      }
      function g(t2 = {}, e2 = () => true) {
        const s2 = {};
        return p(t2).forEach((i2) => {
          e2(i2, t2[i2]) && (s2[i2] = t2[i2]);
        }), s2;
      }
      function m() {
        return process.versions.electron && !process.defaultApp ? 0 : 1;
      }
      function y() {
        return process.argv[m()];
      }
      var b = Object.freeze({ __proto__: null, hideBin: function(t2) {
        return t2.slice(m() + 1);
      }, getProcessArgvBin: y });
      function v(t2, e2, s2, i2) {
        if ("a" === s2 && !i2) throw new TypeError("Private accessor was defined without a getter");
        if ("function" == typeof e2 ? t2 !== e2 || !i2 : !e2.has(t2)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === s2 ? i2 : "a" === s2 ? i2.call(t2) : i2 ? i2.value : e2.get(t2);
      }
      function O(t2, e2, s2, i2, n2) {
        if ("m" === i2) throw new TypeError("Private method is not writable");
        if ("a" === i2 && !n2) throw new TypeError("Private accessor was defined without a setter");
        if ("function" == typeof e2 ? t2 !== e2 || !n2 : !e2.has(t2)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === i2 ? n2.call(t2, s2) : n2 ? n2.value = s2 : e2.set(t2, s2), s2;
      }
      var w = class {
        constructor(t2) {
          this.globalMiddleware = [], this.frozens = [], this.yargs = t2;
        }
        addMiddleware(t2, e2, s2 = true, i2 = false) {
          if (h("<array|function> [boolean] [boolean] [boolean]", [t2, e2, s2], arguments.length), Array.isArray(t2)) {
            for (let i3 = 0; i3 < t2.length; i3++) {
              if ("function" != typeof t2[i3]) throw Error("middleware must be a function");
              const n2 = t2[i3];
              n2.applyBeforeValidation = e2, n2.global = s2;
            }
            Array.prototype.push.apply(this.globalMiddleware, t2);
          } else if ("function" == typeof t2) {
            const n2 = t2;
            n2.applyBeforeValidation = e2, n2.global = s2, n2.mutates = i2, this.globalMiddleware.push(t2);
          }
          return this.yargs;
        }
        addCoerceMiddleware(t2, e2) {
          const s2 = this.yargs.getAliases();
          return this.globalMiddleware = this.globalMiddleware.filter((t3) => {
            const i2 = [...s2[e2] || [], e2];
            return !t3.option || !i2.includes(t3.option);
          }), t2.option = e2, this.addMiddleware(t2, true, true, true);
        }
        getMiddleware() {
          return this.globalMiddleware;
        }
        freeze() {
          this.frozens.push([...this.globalMiddleware]);
        }
        unfreeze() {
          const t2 = this.frozens.pop();
          void 0 !== t2 && (this.globalMiddleware = t2);
        }
        reset() {
          this.globalMiddleware = this.globalMiddleware.filter((t2) => t2.global);
        }
      };
      function C(t2, e2, s2, i2) {
        return s2.reduce((t3, s3) => {
          if (s3.applyBeforeValidation !== i2) return t3;
          if (s3.mutates) {
            if (s3.applied) return t3;
            s3.applied = true;
          }
          if (f(t3)) return t3.then((t4) => Promise.all([t4, s3(t4, e2)])).then(([t4, e3]) => Object.assign(t4, e3));
          {
            const i3 = s3(t3, e2);
            return f(i3) ? i3.then((e3) => Object.assign(t3, e3)) : Object.assign(t3, i3);
          }
        }, t2);
      }
      function j(t2, e2, s2 = (t3) => {
        throw t3;
      }) {
        try {
          const s3 = "function" == typeof t2 ? t2() : t2;
          return f(s3) ? s3.then((t3) => e2(t3)) : e2(s3);
        } catch (t3) {
          return s2(t3);
        }
      }
      var M = /(^\*)|(^\$0)/;
      var _ = class {
        constructor(t2, e2, s2, i2) {
          this.requireCache = /* @__PURE__ */ new Set(), this.handlers = {}, this.aliasMap = {}, this.frozens = [], this.shim = i2, this.usage = t2, this.globalMiddleware = s2, this.validation = e2;
        }
        addDirectory(t2, e2, s2, i2) {
          "boolean" != typeof (i2 = i2 || {}).recurse && (i2.recurse = false), Array.isArray(i2.extensions) || (i2.extensions = ["js"]);
          const n2 = "function" == typeof i2.visit ? i2.visit : (t3) => t3;
          i2.visit = (t3, e3, s3) => {
            const i3 = n2(t3, e3, s3);
            if (i3) {
              if (this.requireCache.has(e3)) return i3;
              this.requireCache.add(e3), this.addHandler(i3);
            }
            return i3;
          }, this.shim.requireDirectory({ require: e2, filename: s2 }, t2, i2);
        }
        addHandler(t2, e2, s2, i2, n2, r2) {
          let a2 = [];
          const h2 = (function(t3) {
            return t3 ? t3.map((t4) => (t4.applyBeforeValidation = false, t4)) : [];
          })(n2);
          if (i2 = i2 || (() => {
          }), Array.isArray(t2)) if ((function(t3) {
            return t3.every((t4) => "string" == typeof t4);
          })(t2)) [t2, ...a2] = t2;
          else for (const e3 of t2) this.addHandler(e3);
          else {
            if ((function(t3) {
              return "object" == typeof t3 && !Array.isArray(t3);
            })(t2)) {
              let e3 = Array.isArray(t2.command) || "string" == typeof t2.command ? t2.command : this.moduleName(t2);
              return t2.aliases && (e3 = [].concat(e3).concat(t2.aliases)), void this.addHandler(e3, this.extractDesc(t2), t2.builder, t2.handler, t2.middlewares, t2.deprecated);
            }
            if (k(s2)) return void this.addHandler([t2].concat(a2), e2, s2.builder, s2.handler, s2.middlewares, s2.deprecated);
          }
          if ("string" == typeof t2) {
            const n3 = o(t2);
            a2 = a2.map((t3) => o(t3).cmd);
            let l2 = false;
            const c2 = [n3.cmd].concat(a2).filter((t3) => !M.test(t3) || (l2 = true, false));
            0 === c2.length && l2 && c2.push("$0"), l2 && (n3.cmd = c2[0], a2 = c2.slice(1), t2 = t2.replace(M, n3.cmd)), a2.forEach((t3) => {
              this.aliasMap[t3] = n3.cmd;
            }), false !== e2 && this.usage.command(t2, e2, l2, a2, r2), this.handlers[n3.cmd] = { original: t2, description: e2, handler: i2, builder: s2 || {}, middlewares: h2, deprecated: r2, demanded: n3.demanded, optional: n3.optional }, l2 && (this.defaultCommand = this.handlers[n3.cmd]);
          }
        }
        getCommandHandlers() {
          return this.handlers;
        }
        getCommands() {
          return Object.keys(this.handlers).concat(Object.keys(this.aliasMap));
        }
        hasDefaultCommand() {
          return !!this.defaultCommand;
        }
        runCommand(t2, e2, s2, i2, n2, r2) {
          const o2 = this.handlers[t2] || this.handlers[this.aliasMap[t2]] || this.defaultCommand, a2 = e2.getInternalMethods().getContext(), h2 = a2.commands.slice(), l2 = !t2;
          t2 && (a2.commands.push(t2), a2.fullCommands.push(o2.original));
          const c2 = this.applyBuilderUpdateUsageAndParse(l2, o2, e2, s2.aliases, h2, i2, n2, r2);
          return f(c2) ? c2.then((t3) => this.applyMiddlewareAndGetResult(l2, o2, t3.innerArgv, a2, n2, t3.aliases, e2)) : this.applyMiddlewareAndGetResult(l2, o2, c2.innerArgv, a2, n2, c2.aliases, e2);
        }
        applyBuilderUpdateUsageAndParse(t2, e2, s2, i2, n2, r2, o2, a2) {
          const h2 = e2.builder;
          let l2 = s2;
          if (E(h2)) {
            s2.getInternalMethods().getUsageInstance().freeze();
            const c2 = h2(s2.getInternalMethods().reset(i2), a2);
            if (f(c2)) return c2.then((i3) => {
              var a3;
              return l2 = (a3 = i3) && "function" == typeof a3.getInternalMethods ? i3 : s2, this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2);
            });
          } else /* @__PURE__ */ (function(t3) {
            return "object" == typeof t3;
          })(h2) && (s2.getInternalMethods().getUsageInstance().freeze(), l2 = s2.getInternalMethods().reset(i2), Object.keys(e2.builder).forEach((t3) => {
            l2.option(t3, h2[t3]);
          }));
          return this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2);
        }
        parseAndUpdateUsage(t2, e2, s2, i2, n2, r2) {
          t2 && s2.getInternalMethods().getUsageInstance().unfreeze(true), this.shouldUpdateUsage(s2) && s2.getInternalMethods().getUsageInstance().usage(this.usageFromParentCommandsCommandHandler(i2, e2), e2.description);
          const o2 = s2.getInternalMethods().runYargsParserAndExecuteCommands(null, void 0, true, n2, r2);
          return f(o2) ? o2.then((t3) => ({ aliases: s2.parsed.aliases, innerArgv: t3 })) : { aliases: s2.parsed.aliases, innerArgv: o2 };
        }
        shouldUpdateUsage(t2) {
          return !t2.getInternalMethods().getUsageInstance().getUsageDisabled() && 0 === t2.getInternalMethods().getUsageInstance().getUsage().length;
        }
        usageFromParentCommandsCommandHandler(t2, e2) {
          const s2 = M.test(e2.original) ? e2.original.replace(M, "").trim() : e2.original, i2 = t2.filter((t3) => !M.test(t3));
          return i2.push(s2), `$0 ${i2.join(" ")}`;
        }
        handleValidationAndGetResult(t2, e2, s2, i2, n2, r2, o2, a2) {
          if (!r2.getInternalMethods().getHasOutput()) {
            const e3 = r2.getInternalMethods().runValidation(n2, a2, r2.parsed.error, t2);
            s2 = j(s2, (t3) => (e3(t3), t3));
          }
          if (e2.handler && !r2.getInternalMethods().getHasOutput()) {
            r2.getInternalMethods().setHasOutput();
            const i3 = !!r2.getOptions().configuration["populate--"];
            r2.getInternalMethods().postProcess(s2, i3, false, false), s2 = j(s2 = C(s2, r2, o2, false), (t3) => {
              const s3 = e2.handler(t3);
              return f(s3) ? s3.then(() => t3) : t3;
            }), t2 || r2.getInternalMethods().getUsageInstance().cacheHelpMessage(), f(s2) && !r2.getInternalMethods().hasParseCallback() && s2.catch((t3) => {
              try {
                r2.getInternalMethods().getUsageInstance().fail(null, t3);
              } catch (t4) {
              }
            });
          }
          return t2 || (i2.commands.pop(), i2.fullCommands.pop()), s2;
        }
        applyMiddlewareAndGetResult(t2, e2, s2, i2, n2, r2, o2) {
          let a2 = {};
          if (n2) return s2;
          o2.getInternalMethods().getHasOutput() || (a2 = this.populatePositionals(e2, s2, i2, o2));
          const h2 = this.globalMiddleware.getMiddleware().slice(0).concat(e2.middlewares), l2 = C(s2, o2, h2, true);
          return f(l2) ? l2.then((s3) => this.handleValidationAndGetResult(t2, e2, s3, i2, r2, o2, h2, a2)) : this.handleValidationAndGetResult(t2, e2, l2, i2, r2, o2, h2, a2);
        }
        populatePositionals(t2, e2, s2, i2) {
          e2._ = e2._.slice(s2.commands.length);
          const n2 = t2.demanded.slice(0), r2 = t2.optional.slice(0), o2 = {};
          for (this.validation.positionalCount(n2.length, e2._.length); n2.length; ) {
            const t3 = n2.shift();
            this.populatePositional(t3, e2, o2);
          }
          for (; r2.length; ) {
            const t3 = r2.shift();
            this.populatePositional(t3, e2, o2);
          }
          return e2._ = s2.commands.concat(e2._.map((t3) => "" + t3)), this.postProcessPositionals(e2, o2, this.cmdToParseOptions(t2.original), i2), o2;
        }
        populatePositional(t2, e2, s2) {
          const i2 = t2.cmd[0];
          t2.variadic ? s2[i2] = e2._.splice(0).map(String) : e2._.length && (s2[i2] = [String(e2._.shift())]);
        }
        cmdToParseOptions(t2) {
          const e2 = { array: [], default: {}, alias: {}, demand: {} }, s2 = o(t2);
          return s2.demanded.forEach((t3) => {
            const [s3, ...i2] = t3.cmd;
            t3.variadic && (e2.array.push(s3), e2.default[s3] = []), e2.alias[s3] = i2, e2.demand[s3] = true;
          }), s2.optional.forEach((t3) => {
            const [s3, ...i2] = t3.cmd;
            t3.variadic && (e2.array.push(s3), e2.default[s3] = []), e2.alias[s3] = i2;
          }), e2;
        }
        postProcessPositionals(t2, e2, s2, i2) {
          const n2 = Object.assign({}, i2.getOptions());
          n2.default = Object.assign(s2.default, n2.default);
          for (const t3 of Object.keys(s2.alias)) n2.alias[t3] = (n2.alias[t3] || []).concat(s2.alias[t3]);
          n2.array = n2.array.concat(s2.array), n2.config = {};
          const r2 = [];
          if (Object.keys(e2).forEach((t3) => {
            e2[t3].map((e3) => {
              n2.configuration["unknown-options-as-args"] && (n2.key[t3] = true), r2.push(`--${t3}`), r2.push(e3);
            });
          }), !r2.length) return;
          const o2 = Object.assign({}, n2.configuration, { "populate--": false }), a2 = this.shim.Parser.detailed(r2, Object.assign({}, n2, { configuration: o2 }));
          if (a2.error) i2.getInternalMethods().getUsageInstance().fail(a2.error.message, a2.error);
          else {
            const s3 = Object.keys(e2);
            Object.keys(e2).forEach((t3) => {
              s3.push(...a2.aliases[t3]);
            }), Object.keys(a2.argv).forEach((n3) => {
              s3.includes(n3) && (e2[n3] || (e2[n3] = a2.argv[n3]), !this.isInConfigs(i2, n3) && !this.isDefaulted(i2, n3) && Object.prototype.hasOwnProperty.call(t2, n3) && Object.prototype.hasOwnProperty.call(a2.argv, n3) && (Array.isArray(t2[n3]) || Array.isArray(a2.argv[n3])) ? t2[n3] = [].concat(t2[n3], a2.argv[n3]) : t2[n3] = a2.argv[n3]);
            });
          }
        }
        isDefaulted(t2, e2) {
          const { default: s2 } = t2.getOptions();
          return Object.prototype.hasOwnProperty.call(s2, e2) || Object.prototype.hasOwnProperty.call(s2, this.shim.Parser.camelCase(e2));
        }
        isInConfigs(t2, e2) {
          const { configObjects: s2 } = t2.getOptions();
          return s2.some((t3) => Object.prototype.hasOwnProperty.call(t3, e2)) || s2.some((t3) => Object.prototype.hasOwnProperty.call(t3, this.shim.Parser.camelCase(e2)));
        }
        runDefaultBuilderOn(t2) {
          if (!this.defaultCommand) return;
          if (this.shouldUpdateUsage(t2)) {
            const e3 = M.test(this.defaultCommand.original) ? this.defaultCommand.original : this.defaultCommand.original.replace(/^[^[\]<>]*/, "$0 ");
            t2.getInternalMethods().getUsageInstance().usage(e3, this.defaultCommand.description);
          }
          const e2 = this.defaultCommand.builder;
          if (E(e2)) return e2(t2, true);
          k(e2) || Object.keys(e2).forEach((s2) => {
            t2.option(s2, e2[s2]);
          });
        }
        moduleName(t2) {
          const e2 = (function(t3) {
            if ("undefined" == typeof __require) return null;
            for (let e3, s2 = 0, i2 = Object.keys(__require.cache); s2 < i2.length; s2++) if (e3 = __require.cache[i2[s2]], e3.exports === t3) return e3;
            return null;
          })(t2);
          if (!e2) throw new Error(`No command name given for module: ${this.shim.inspect(t2)}`);
          return this.commandFromFilename(e2.filename);
        }
        commandFromFilename(t2) {
          return this.shim.path.basename(t2, this.shim.path.extname(t2));
        }
        extractDesc({ describe: t2, description: e2, desc: s2 }) {
          for (const i2 of [t2, e2, s2]) {
            if ("string" == typeof i2 || false === i2) return i2;
            d(i2, true, this.shim);
          }
          return false;
        }
        freeze() {
          this.frozens.push({ handlers: this.handlers, aliasMap: this.aliasMap, defaultCommand: this.defaultCommand });
        }
        unfreeze() {
          const t2 = this.frozens.pop();
          d(t2, void 0, this.shim), { handlers: this.handlers, aliasMap: this.aliasMap, defaultCommand: this.defaultCommand } = t2;
        }
        reset() {
          return this.handlers = {}, this.aliasMap = {}, this.defaultCommand = void 0, this.requireCache = /* @__PURE__ */ new Set(), this;
        }
      };
      function k(t2) {
        return "object" == typeof t2 && !!t2.builder && "function" == typeof t2.handler;
      }
      function E(t2) {
        return "function" == typeof t2;
      }
      function x(t2) {
        "undefined" != typeof process && [process.stdout, process.stderr].forEach((e2) => {
          const s2 = e2;
          s2._handle && s2.isTTY && "function" == typeof s2._handle.setBlocking && s2._handle.setBlocking(t2);
        });
      }
      function A(t2) {
        return "boolean" == typeof t2;
      }
      function P(t2, s2) {
        const i2 = s2.y18n.__, n2 = {}, r2 = [];
        n2.failFn = function(t3) {
          r2.push(t3);
        };
        let o2 = null, a2 = null, h2 = true;
        n2.showHelpOnFail = function(e2 = true, s3) {
          const [i3, r3] = "string" == typeof e2 ? [true, e2] : [e2, s3];
          return t2.getInternalMethods().isGlobalContext() && (a2 = r3), o2 = r3, h2 = i3, n2;
        };
        let l2 = false;
        n2.fail = function(s3, i3) {
          const c3 = t2.getInternalMethods().getLoggerInstance();
          if (!r2.length) {
            if (t2.getExitProcess() && x(true), !l2) {
              l2 = true, h2 && (t2.showHelp("error"), c3.error()), (s3 || i3) && c3.error(s3 || i3);
              const e2 = o2 || a2;
              e2 && ((s3 || i3) && c3.error(""), c3.error(e2));
            }
            if (i3 = i3 || new e(s3), t2.getExitProcess()) return t2.exit(1);
            if (t2.getInternalMethods().hasParseCallback()) return t2.exit(1, i3);
            throw i3;
          }
          for (let t3 = r2.length - 1; t3 >= 0; --t3) {
            const e2 = r2[t3];
            if (A(e2)) {
              if (i3) throw i3;
              if (s3) throw Error(s3);
            } else e2(s3, i3, n2);
          }
        };
        let c2 = [], f2 = false;
        n2.usage = (t3, e2) => null === t3 ? (f2 = true, c2 = [], n2) : (f2 = false, c2.push([t3, e2 || ""]), n2), n2.getUsage = () => c2, n2.getUsageDisabled = () => f2, n2.getPositionalGroupName = () => i2("Positionals:");
        let d2 = [];
        n2.example = (t3, e2) => {
          d2.push([t3, e2 || ""]);
        };
        let u2 = [];
        n2.command = function(t3, e2, s3, i3, n3 = false) {
          s3 && (u2 = u2.map((t4) => (t4[2] = false, t4))), u2.push([t3, e2 || "", s3, i3, n3]);
        }, n2.getCommands = () => u2;
        let p2 = {};
        n2.describe = function(t3, e2) {
          Array.isArray(t3) ? t3.forEach((t4) => {
            n2.describe(t4, e2);
          }) : "object" == typeof t3 ? Object.keys(t3).forEach((e3) => {
            n2.describe(e3, t3[e3]);
          }) : p2[t3] = e2;
        }, n2.getDescriptions = () => p2;
        let m2 = [];
        n2.epilog = (t3) => {
          m2.push(t3);
        };
        let y2, b2 = false;
        n2.wrap = (t3) => {
          b2 = true, y2 = t3;
        }, n2.getWrap = () => s2.getEnv("YARGS_DISABLE_WRAP") ? null : (b2 || (y2 = (function() {
          const t3 = 80;
          return s2.process.stdColumns ? Math.min(t3, s2.process.stdColumns) : t3;
        })(), b2 = true), y2);
        const v2 = "__yargsString__:";
        function O2(t3, e2, i3) {
          let n3 = 0;
          return Array.isArray(t3) || (t3 = Object.values(t3).map((t4) => [t4])), t3.forEach((t4) => {
            n3 = Math.max(s2.stringWidth(i3 ? `${i3} ${I(t4[0])}` : I(t4[0])) + $(t4[0]), n3);
          }), e2 && (n3 = Math.min(n3, parseInt((0.5 * e2).toString(), 10))), n3;
        }
        let w2;
        function C2(e2) {
          return t2.getOptions().hiddenOptions.indexOf(e2) < 0 || t2.parsed.argv[t2.getOptions().showHiddenOpt];
        }
        function j2(t3, e2) {
          let s3 = `[${i2("default:")} `;
          if (void 0 === t3 && !e2) return null;
          if (e2) s3 += e2;
          else switch (typeof t3) {
            case "string":
              s3 += `"${t3}"`;
              break;
            case "object":
              s3 += JSON.stringify(t3);
              break;
            default:
              s3 += t3;
          }
          return `${s3}]`;
        }
        n2.deferY18nLookup = (t3) => v2 + t3, n2.help = function() {
          if (w2) return w2;
          !(function() {
            const e3 = t2.getDemandedOptions(), s3 = t2.getOptions();
            (Object.keys(s3.alias) || []).forEach((i3) => {
              s3.alias[i3].forEach((r4) => {
                p2[r4] && n2.describe(i3, p2[r4]), r4 in e3 && t2.demandOption(i3, e3[r4]), s3.boolean.includes(r4) && t2.boolean(i3), s3.count.includes(r4) && t2.count(i3), s3.string.includes(r4) && t2.string(i3), s3.normalize.includes(r4) && t2.normalize(i3), s3.array.includes(r4) && t2.array(i3), s3.number.includes(r4) && t2.number(i3);
              });
            });
          })();
          const e2 = t2.customScriptName ? t2.$0 : s2.path.basename(t2.$0), r3 = t2.getDemandedOptions(), o3 = t2.getDemandedCommands(), a3 = t2.getDeprecatedOptions(), h3 = t2.getGroups(), l3 = t2.getOptions();
          let g2 = [];
          g2 = g2.concat(Object.keys(p2)), g2 = g2.concat(Object.keys(r3)), g2 = g2.concat(Object.keys(o3)), g2 = g2.concat(Object.keys(l3.default)), g2 = g2.filter(C2), g2 = Object.keys(g2.reduce((t3, e3) => ("_" !== e3 && (t3[e3] = true), t3), {}));
          const y3 = n2.getWrap(), b3 = s2.cliui({ width: y3, wrap: !!y3 });
          if (!f2) {
            if (c2.length) c2.forEach((t3) => {
              b3.div({ text: `${t3[0].replace(/\$0/g, e2)}` }), t3[1] && b3.div({ text: `${t3[1]}`, padding: [1, 0, 0, 0] });
            }), b3.div();
            else if (u2.length) {
              let t3 = null;
              t3 = o3._ ? `${e2} <${i2("command")}>
` : `${e2} [${i2("command")}]
`, b3.div(`${t3}`);
            }
          }
          if (u2.length > 1 || 1 === u2.length && !u2[0][2]) {
            b3.div(i2("Commands:"));
            const s3 = t2.getInternalMethods().getContext(), n3 = s3.commands.length ? `${s3.commands.join(" ")} ` : "";
            true === t2.getInternalMethods().getParserConfiguration()["sort-commands"] && (u2 = u2.sort((t3, e3) => t3[0].localeCompare(e3[0])));
            const r4 = e2 ? `${e2} ` : "";
            u2.forEach((t3) => {
              const s4 = `${r4}${n3}${t3[0].replace(/^\$0 ?/, "")}`;
              b3.span({ text: s4, padding: [0, 2, 0, 2], width: O2(u2, y3, `${e2}${n3}`) + 4 }, { text: t3[1] });
              const o4 = [];
              t3[2] && o4.push(`[${i2("default")}]`), t3[3] && t3[3].length && o4.push(`[${i2("aliases:")} ${t3[3].join(", ")}]`), t3[4] && ("string" == typeof t3[4] ? o4.push(`[${i2("deprecated: %s", t3[4])}]`) : o4.push(`[${i2("deprecated")}]`)), o4.length ? b3.div({ text: o4.join(" "), padding: [0, 0, 0, 2], align: "right" }) : b3.div();
            }), b3.div();
          }
          const M3 = (Object.keys(l3.alias) || []).concat(Object.keys(t2.parsed.newAliases) || []);
          g2 = g2.filter((e3) => !t2.parsed.newAliases[e3] && M3.every((t3) => -1 === (l3.alias[t3] || []).indexOf(e3)));
          const _3 = i2("Options:");
          h3[_3] || (h3[_3] = []), (function(t3, e3, s3, i3) {
            let n3 = [], r4 = null;
            Object.keys(s3).forEach((t4) => {
              n3 = n3.concat(s3[t4]);
            }), t3.forEach((t4) => {
              r4 = [t4].concat(e3[t4]), r4.some((t5) => -1 !== n3.indexOf(t5)) || s3[i3].push(t4);
            });
          })(g2, l3.alias, h3, _3);
          const k2 = (t3) => /^--/.test(I(t3)), E2 = Object.keys(h3).filter((t3) => h3[t3].length > 0).map((t3) => ({ groupName: t3, normalizedKeys: h3[t3].filter(C2).map((t4) => {
            if (M3.includes(t4)) return t4;
            for (let e3, s3 = 0; void 0 !== (e3 = M3[s3]); s3++) if ((l3.alias[e3] || []).includes(t4)) return e3;
            return t4;
          }) })).filter(({ normalizedKeys: t3 }) => t3.length > 0).map(({ groupName: t3, normalizedKeys: e3 }) => {
            const s3 = e3.reduce((e4, s4) => (e4[s4] = [s4].concat(l3.alias[s4] || []).map((e5) => t3 === n2.getPositionalGroupName() ? e5 : (/^[0-9]$/.test(e5) ? l3.boolean.includes(s4) ? "-" : "--" : e5.length > 1 ? "--" : "-") + e5).sort((t4, e5) => k2(t4) === k2(e5) ? 0 : k2(t4) ? 1 : -1).join(", "), e4), {});
            return { groupName: t3, normalizedKeys: e3, switches: s3 };
          });
          if (E2.filter(({ groupName: t3 }) => t3 !== n2.getPositionalGroupName()).some(({ normalizedKeys: t3, switches: e3 }) => !t3.every((t4) => k2(e3[t4]))) && E2.filter(({ groupName: t3 }) => t3 !== n2.getPositionalGroupName()).forEach(({ normalizedKeys: t3, switches: e3 }) => {
            t3.forEach((t4) => {
              var s3, i3;
              k2(e3[t4]) && (e3[t4] = (s3 = e3[t4], i3 = 4, S(s3) ? { text: s3.text, indentation: s3.indentation + i3 } : { text: s3, indentation: i3 }));
            });
          }), E2.forEach(({ groupName: e3, normalizedKeys: s3, switches: o4 }) => {
            b3.div(e3), s3.forEach((e4) => {
              const s4 = o4[e4];
              let h4 = p2[e4] || "", c3 = null;
              h4.includes(v2) && (h4 = i2(h4.substring(16))), l3.boolean.includes(e4) && (c3 = `[${i2("boolean")}]`), l3.count.includes(e4) && (c3 = `[${i2("count")}]`), l3.string.includes(e4) && (c3 = `[${i2("string")}]`), l3.normalize.includes(e4) && (c3 = `[${i2("string")}]`), l3.array.includes(e4) && (c3 = `[${i2("array")}]`), l3.number.includes(e4) && (c3 = `[${i2("number")}]`);
              const f3 = [e4 in a3 ? (d3 = a3[e4], "string" == typeof d3 ? `[${i2("deprecated: %s", d3)}]` : `[${i2("deprecated")}]`) : null, c3, e4 in r3 ? `[${i2("required")}]` : null, l3.choices && l3.choices[e4] ? `[${i2("choices:")} ${n2.stringifiedValues(l3.choices[e4])}]` : null, j2(l3.default[e4], l3.defaultDescription[e4])].filter(Boolean).join(" ");
              var d3;
              b3.span({ text: I(s4), padding: [0, 2, 0, 2 + $(s4)], width: O2(o4, y3) + 4 }, h4);
              const u3 = true === t2.getInternalMethods().getUsageConfiguration()["hide-types"];
              f3 && !u3 ? b3.div({ text: f3, padding: [0, 0, 0, 2], align: "right" }) : b3.div();
            }), b3.div();
          }), d2.length && (b3.div(i2("Examples:")), d2.forEach((t3) => {
            t3[0] = t3[0].replace(/\$0/g, e2);
          }), d2.forEach((t3) => {
            "" === t3[1] ? b3.div({ text: t3[0], padding: [0, 2, 0, 2] }) : b3.div({ text: t3[0], padding: [0, 2, 0, 2], width: O2(d2, y3) + 4 }, { text: t3[1] });
          }), b3.div()), m2.length > 0) {
            const t3 = m2.map((t4) => t4.replace(/\$0/g, e2)).join("\n");
            b3.div(`${t3}
`);
          }
          return b3.toString().replace(/\s*$/, "");
        }, n2.cacheHelpMessage = function() {
          w2 = this.help();
        }, n2.clearCachedHelpMessage = function() {
          w2 = void 0;
        }, n2.hasCachedHelpMessage = function() {
          return !!w2;
        }, n2.showHelp = (e2) => {
          const s3 = t2.getInternalMethods().getLoggerInstance();
          e2 || (e2 = "error");
          ("function" == typeof e2 ? e2 : s3[e2])(n2.help());
        }, n2.functionDescription = (t3) => ["(", t3.name ? s2.Parser.decamelize(t3.name, "-") : i2("generated-value"), ")"].join(""), n2.stringifiedValues = function(t3, e2) {
          let s3 = "";
          const i3 = e2 || ", ", n3 = [].concat(t3);
          return t3 && n3.length ? (n3.forEach((t4) => {
            s3.length && (s3 += i3), s3 += JSON.stringify(t4);
          }), s3) : s3;
        };
        let M2 = null;
        n2.version = (t3) => {
          M2 = t3;
        }, n2.showVersion = (e2) => {
          const s3 = t2.getInternalMethods().getLoggerInstance();
          e2 || (e2 = "error");
          ("function" == typeof e2 ? e2 : s3[e2])(M2);
        }, n2.reset = function(t3) {
          return o2 = null, l2 = false, c2 = [], f2 = false, m2 = [], d2 = [], u2 = [], p2 = g(p2, (e2) => !t3[e2]), n2;
        };
        const _2 = [];
        return n2.freeze = function() {
          _2.push({ failMessage: o2, failureOutput: l2, usages: c2, usageDisabled: f2, epilogs: m2, examples: d2, commands: u2, descriptions: p2 });
        }, n2.unfreeze = function(t3 = false) {
          const e2 = _2.pop();
          e2 && (t3 ? (p2 = { ...e2.descriptions, ...p2 }, u2 = [...e2.commands, ...u2], c2 = [...e2.usages, ...c2], d2 = [...e2.examples, ...d2], m2 = [...e2.epilogs, ...m2]) : { failMessage: o2, failureOutput: l2, usages: c2, usageDisabled: f2, epilogs: m2, examples: d2, commands: u2, descriptions: p2 } = e2);
        }, n2;
      }
      function S(t2) {
        return "object" == typeof t2;
      }
      function $(t2) {
        return S(t2) ? t2.indentation : 0;
      }
      function I(t2) {
        return S(t2) ? t2.text : t2;
      }
      var D = class {
        constructor(t2, e2, s2, i2) {
          var n2, r2, o2;
          this.yargs = t2, this.usage = e2, this.command = s2, this.shim = i2, this.completionKey = "get-yargs-completions", this.aliases = null, this.customCompletionFunction = null, this.indexAfterLastReset = 0, this.zshShell = null !== (o2 = (null === (n2 = this.shim.getEnv("SHELL")) || void 0 === n2 ? void 0 : n2.includes("zsh")) || (null === (r2 = this.shim.getEnv("ZSH_NAME")) || void 0 === r2 ? void 0 : r2.includes("zsh"))) && void 0 !== o2 && o2;
        }
        defaultCompletion(t2, e2, s2, i2) {
          const n2 = this.command.getCommandHandlers();
          for (let e3 = 0, s3 = t2.length; e3 < s3; ++e3) if (n2[t2[e3]] && n2[t2[e3]].builder) {
            const s4 = n2[t2[e3]].builder;
            if (E(s4)) {
              this.indexAfterLastReset = e3 + 1;
              const t3 = this.yargs.getInternalMethods().reset();
              return s4(t3, true), t3.argv;
            }
          }
          const r2 = [];
          this.commandCompletions(r2, t2, s2), this.optionCompletions(r2, t2, e2, s2), this.choicesFromOptionsCompletions(r2, t2, e2, s2), this.choicesFromPositionalsCompletions(r2, t2, e2, s2), i2(null, r2);
        }
        commandCompletions(t2, e2, s2) {
          const i2 = this.yargs.getInternalMethods().getContext().commands;
          s2.match(/^-/) || i2[i2.length - 1] === s2 || this.previousArgHasChoices(e2) || this.usage.getCommands().forEach((s3) => {
            const i3 = o(s3[0]).cmd;
            if (-1 === e2.indexOf(i3)) if (this.zshShell) {
              const e3 = s3[1] || "";
              t2.push(i3.replace(/:/g, "\\:") + ":" + e3);
            } else t2.push(i3);
          });
        }
        optionCompletions(t2, e2, s2, i2) {
          if ((i2.match(/^-/) || "" === i2 && 0 === t2.length) && !this.previousArgHasChoices(e2)) {
            const s3 = this.yargs.getOptions(), n2 = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [];
            Object.keys(s3.key).forEach((r2) => {
              const o2 = !!s3.configuration["boolean-negation"] && s3.boolean.includes(r2);
              n2.includes(r2) || s3.hiddenOptions.includes(r2) || this.argsContainKey(e2, r2, o2) || this.completeOptionKey(r2, t2, i2, o2 && !!s3.default[r2]);
            });
          }
        }
        choicesFromOptionsCompletions(t2, e2, s2, i2) {
          if (this.previousArgHasChoices(e2)) {
            const s3 = this.getPreviousArgChoices(e2);
            s3 && s3.length > 0 && t2.push(...s3.map((t3) => t3.replace(/:/g, "\\:")));
          }
        }
        choicesFromPositionalsCompletions(t2, e2, s2, i2) {
          if ("" === i2 && t2.length > 0 && this.previousArgHasChoices(e2)) return;
          const n2 = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [], r2 = Math.max(this.indexAfterLastReset, this.yargs.getInternalMethods().getContext().commands.length + 1), o2 = n2[s2._.length - r2 - 1];
          if (!o2) return;
          const a2 = this.yargs.getOptions().choices[o2] || [];
          for (const e3 of a2) e3.startsWith(i2) && t2.push(e3.replace(/:/g, "\\:"));
        }
        getPreviousArgChoices(t2) {
          if (t2.length < 1) return;
          let e2 = t2[t2.length - 1], s2 = "";
          if (!e2.startsWith("-") && t2.length > 1 && (s2 = e2, e2 = t2[t2.length - 2]), !e2.startsWith("-")) return;
          const i2 = e2.replace(/^-+/, ""), n2 = this.yargs.getOptions(), r2 = [i2, ...this.yargs.getAliases()[i2] || []];
          let o2;
          for (const t3 of r2) if (Object.prototype.hasOwnProperty.call(n2.key, t3) && Array.isArray(n2.choices[t3])) {
            o2 = n2.choices[t3];
            break;
          }
          return o2 ? o2.filter((t3) => !s2 || t3.startsWith(s2)) : void 0;
        }
        previousArgHasChoices(t2) {
          const e2 = this.getPreviousArgChoices(t2);
          return void 0 !== e2 && e2.length > 0;
        }
        argsContainKey(t2, e2, s2) {
          const i2 = (e3) => -1 !== t2.indexOf((/^[^0-9]$/.test(e3) ? "-" : "--") + e3);
          if (i2(e2)) return true;
          if (s2 && i2(`no-${e2}`)) return true;
          if (this.aliases) {
            for (const t3 of this.aliases[e2]) if (i2(t3)) return true;
          }
          return false;
        }
        completeOptionKey(t2, e2, s2, i2) {
          var n2, r2, o2, a2;
          let h2 = t2;
          if (this.zshShell) {
            const e3 = this.usage.getDescriptions(), s3 = null === (r2 = null === (n2 = null == this ? void 0 : this.aliases) || void 0 === n2 ? void 0 : n2[t2]) || void 0 === r2 ? void 0 : r2.find((t3) => {
              const s4 = e3[t3];
              return "string" == typeof s4 && s4.length > 0;
            }), i3 = s3 ? e3[s3] : void 0, l3 = null !== (a2 = null !== (o2 = e3[t2]) && void 0 !== o2 ? o2 : i3) && void 0 !== a2 ? a2 : "";
            h2 = `${t2.replace(/:/g, "\\:")}:${l3.replace("__yargsString__:", "").replace(/(\r\n|\n|\r)/gm, " ")}`;
          }
          const l2 = !/^--/.test(s2) && ((t3) => /^[^0-9]$/.test(t3))(t2) ? "-" : "--";
          e2.push(l2 + h2), i2 && e2.push(l2 + "no-" + h2);
        }
        customCompletion(t2, e2, s2, i2) {
          if (d(this.customCompletionFunction, null, this.shim), this.customCompletionFunction.length < 3) {
            const t3 = this.customCompletionFunction(s2, e2);
            return f(t3) ? t3.then((t4) => {
              this.shim.process.nextTick(() => {
                i2(null, t4);
              });
            }).catch((t4) => {
              this.shim.process.nextTick(() => {
                i2(t4, void 0);
              });
            }) : i2(null, t3);
          }
          return (function(t3) {
            return t3.length > 3;
          })(this.customCompletionFunction) ? this.customCompletionFunction(s2, e2, (n2 = i2) => this.defaultCompletion(t2, e2, s2, n2), (t3) => {
            i2(null, t3);
          }) : this.customCompletionFunction(s2, e2, (t3) => {
            i2(null, t3);
          });
        }
        getCompletion(t2, e2) {
          const s2 = t2.length ? t2[t2.length - 1] : "", i2 = this.yargs.parse(t2, true), n2 = this.customCompletionFunction ? (i3) => this.customCompletion(t2, i3, s2, e2) : (i3) => this.defaultCompletion(t2, i3, s2, e2);
          return f(i2) ? i2.then(n2) : n2(i2);
        }
        generateCompletionScript(t2, e2) {
          let s2 = this.zshShell ? `#compdef {{app_name}}
###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
#    or {{app_path}} {{completion_command}} >> ~/.zprofile on OSX.
#
_{{app_name}}_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'
' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
` : '###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc\n#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.\n#\n_{{app_name}}_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word="${COMP_WORDS[COMP_CWORD]}"\n    args=("${COMP_WORDS[@]}")\n\n    # ask yargs to generate completions.\n    type_list=$({{app_path}} --get-yargs-completions "${args[@]}")\n\n    COMPREPLY=( $(compgen -W "${type_list}" -- ${cur_word}) )\n\n    # if no match was found, fall back to filename completion\n    if [ ${#COMPREPLY[@]} -eq 0 ]; then\n      COMPREPLY=()\n    fi\n\n    return 0\n}\ncomplete -o bashdefault -o default -F _{{app_name}}_yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n';
          const i2 = this.shim.path.basename(t2);
          return t2.match(/\.js$/) && (t2 = `./${t2}`), s2 = s2.replace(/{{app_name}}/g, i2), s2 = s2.replace(/{{completion_command}}/g, e2), s2.replace(/{{app_path}}/g, t2);
        }
        registerFunction(t2) {
          this.customCompletionFunction = t2;
        }
        setParsed(t2) {
          this.aliases = t2.aliases;
        }
      };
      function N(t2, e2) {
        if (0 === t2.length) return e2.length;
        if (0 === e2.length) return t2.length;
        const s2 = [];
        let i2, n2;
        for (i2 = 0; i2 <= e2.length; i2++) s2[i2] = [i2];
        for (n2 = 0; n2 <= t2.length; n2++) s2[0][n2] = n2;
        for (i2 = 1; i2 <= e2.length; i2++) for (n2 = 1; n2 <= t2.length; n2++) e2.charAt(i2 - 1) === t2.charAt(n2 - 1) ? s2[i2][n2] = s2[i2 - 1][n2 - 1] : i2 > 1 && n2 > 1 && e2.charAt(i2 - 2) === t2.charAt(n2 - 1) && e2.charAt(i2 - 1) === t2.charAt(n2 - 2) ? s2[i2][n2] = s2[i2 - 2][n2 - 2] + 1 : s2[i2][n2] = Math.min(s2[i2 - 1][n2 - 1] + 1, Math.min(s2[i2][n2 - 1] + 1, s2[i2 - 1][n2] + 1));
        return s2[e2.length][t2.length];
      }
      var H = ["$0", "--", "_"];
      var z;
      var W;
      var q;
      var U;
      var F;
      var L;
      var V;
      var G;
      var R;
      var T;
      var B;
      var Y;
      var K;
      var J;
      var Z;
      var X;
      var Q;
      var tt;
      var et;
      var st;
      var it;
      var nt;
      var rt;
      var ot;
      var at;
      var ht;
      var lt;
      var ct;
      var ft;
      var dt;
      var ut;
      var pt;
      var gt;
      var mt;
      var yt;
      var bt = /* @__PURE__ */ Symbol("copyDoubleDash");
      var vt = /* @__PURE__ */ Symbol("copyDoubleDash");
      var Ot = /* @__PURE__ */ Symbol("deleteFromParserHintObject");
      var wt = /* @__PURE__ */ Symbol("emitWarning");
      var Ct = /* @__PURE__ */ Symbol("freeze");
      var jt = /* @__PURE__ */ Symbol("getDollarZero");
      var Mt = /* @__PURE__ */ Symbol("getParserConfiguration");
      var _t = /* @__PURE__ */ Symbol("getUsageConfiguration");
      var kt = /* @__PURE__ */ Symbol("guessLocale");
      var Et = /* @__PURE__ */ Symbol("guessVersion");
      var xt = /* @__PURE__ */ Symbol("parsePositionalNumbers");
      var At = /* @__PURE__ */ Symbol("pkgUp");
      var Pt = /* @__PURE__ */ Symbol("populateParserHintArray");
      var St = /* @__PURE__ */ Symbol("populateParserHintSingleValueDictionary");
      var $t = /* @__PURE__ */ Symbol("populateParserHintArrayDictionary");
      var It = /* @__PURE__ */ Symbol("populateParserHintDictionary");
      var Dt = /* @__PURE__ */ Symbol("sanitizeKey");
      var Nt = /* @__PURE__ */ Symbol("setKey");
      var Ht = /* @__PURE__ */ Symbol("unfreeze");
      var zt = /* @__PURE__ */ Symbol("validateAsync");
      var Wt = /* @__PURE__ */ Symbol("getCommandInstance");
      var qt = /* @__PURE__ */ Symbol("getContext");
      var Ut = /* @__PURE__ */ Symbol("getHasOutput");
      var Ft = /* @__PURE__ */ Symbol("getLoggerInstance");
      var Lt = /* @__PURE__ */ Symbol("getParseContext");
      var Vt = /* @__PURE__ */ Symbol("getUsageInstance");
      var Gt = /* @__PURE__ */ Symbol("getValidationInstance");
      var Rt = /* @__PURE__ */ Symbol("hasParseCallback");
      var Tt = /* @__PURE__ */ Symbol("isGlobalContext");
      var Bt = /* @__PURE__ */ Symbol("postProcess");
      var Yt = /* @__PURE__ */ Symbol("rebase");
      var Kt = /* @__PURE__ */ Symbol("reset");
      var Jt = /* @__PURE__ */ Symbol("runYargsParserAndExecuteCommands");
      var Zt = /* @__PURE__ */ Symbol("runValidation");
      var Xt = /* @__PURE__ */ Symbol("setHasOutput");
      var Qt = /* @__PURE__ */ Symbol("kTrackManuallySetKeys");
      var te = class {
        constructor(t2 = [], e2, s2, i2) {
          this.customScriptName = false, this.parsed = false, z.set(this, void 0), W.set(this, void 0), q.set(this, { commands: [], fullCommands: [] }), U.set(this, null), F.set(this, null), L.set(this, "show-hidden"), V.set(this, null), G.set(this, true), R.set(this, {}), T.set(this, true), B.set(this, []), Y.set(this, void 0), K.set(this, {}), J.set(this, false), Z.set(this, null), X.set(this, true), Q.set(this, void 0), tt.set(this, ""), et.set(this, void 0), st.set(this, void 0), it.set(this, {}), nt.set(this, null), rt.set(this, null), ot.set(this, {}), at.set(this, {}), ht.set(this, void 0), lt.set(this, false), ct.set(this, void 0), ft.set(this, false), dt.set(this, false), ut.set(this, false), pt.set(this, void 0), gt.set(this, {}), mt.set(this, null), yt.set(this, void 0), O(this, ct, i2, "f"), O(this, ht, t2, "f"), O(this, W, e2, "f"), O(this, st, s2, "f"), O(this, Y, new w(this), "f"), this.$0 = this[jt](), this[Kt](), O(this, z, v(this, z, "f"), "f"), O(this, pt, v(this, pt, "f"), "f"), O(this, yt, v(this, yt, "f"), "f"), O(this, et, v(this, et, "f"), "f"), v(this, et, "f").showHiddenOpt = v(this, L, "f"), O(this, Q, this[vt](), "f");
        }
        addHelpOpt(t2, e2) {
          return h("[string|boolean] [string]", [t2, e2], arguments.length), v(this, Z, "f") && (this[Ot](v(this, Z, "f")), O(this, Z, null, "f")), false === t2 && void 0 === e2 || (O(this, Z, "string" == typeof t2 ? t2 : "help", "f"), this.boolean(v(this, Z, "f")), this.describe(v(this, Z, "f"), e2 || v(this, pt, "f").deferY18nLookup("Show help"))), this;
        }
        help(t2, e2) {
          return this.addHelpOpt(t2, e2);
        }
        addShowHiddenOpt(t2, e2) {
          if (h("[string|boolean] [string]", [t2, e2], arguments.length), false === t2 && void 0 === e2) return this;
          const s2 = "string" == typeof t2 ? t2 : v(this, L, "f");
          return this.boolean(s2), this.describe(s2, e2 || v(this, pt, "f").deferY18nLookup("Show hidden options")), v(this, et, "f").showHiddenOpt = s2, this;
        }
        showHidden(t2, e2) {
          return this.addShowHiddenOpt(t2, e2);
        }
        alias(t2, e2) {
          return h("<object|string|array> [string|array]", [t2, e2], arguments.length), this[$t](this.alias.bind(this), "alias", t2, e2), this;
        }
        array(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("array", t2), this[Qt](t2), this;
        }
        boolean(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("boolean", t2), this[Qt](t2), this;
        }
        check(t2, e2) {
          return h("<function> [boolean]", [t2, e2], arguments.length), this.middleware((e3, s2) => j(() => t2(e3, s2.getOptions()), (s3) => (s3 ? ("string" == typeof s3 || s3 instanceof Error) && v(this, pt, "f").fail(s3.toString(), s3) : v(this, pt, "f").fail(v(this, ct, "f").y18n.__("Argument check failed: %s", t2.toString())), e3), (t3) => (v(this, pt, "f").fail(t3.message ? t3.message : t3.toString(), t3), e3)), false, e2), this;
        }
        choices(t2, e2) {
          return h("<object|string|array> [string|array]", [t2, e2], arguments.length), this[$t](this.choices.bind(this), "choices", t2, e2), this;
        }
        coerce(t2, s2) {
          if (h("<object|string|array> [function]", [t2, s2], arguments.length), Array.isArray(t2)) {
            if (!s2) throw new e("coerce callback must be provided");
            for (const e2 of t2) this.coerce(e2, s2);
            return this;
          }
          if ("object" == typeof t2) {
            for (const e2 of Object.keys(t2)) this.coerce(e2, t2[e2]);
            return this;
          }
          if (!s2) throw new e("coerce callback must be provided");
          return v(this, et, "f").key[t2] = true, v(this, Y, "f").addCoerceMiddleware((i2, n2) => {
            let r2;
            return Object.prototype.hasOwnProperty.call(i2, t2) ? j(() => (r2 = n2.getAliases(), s2(i2[t2])), (e2) => {
              i2[t2] = e2;
              const s3 = n2.getInternalMethods().getParserConfiguration()["strip-aliased"];
              if (r2[t2] && true !== s3) for (const s4 of r2[t2]) i2[s4] = e2;
              return i2;
            }, (t3) => {
              throw new e(t3.message);
            }) : i2;
          }, t2), this;
        }
        conflicts(t2, e2) {
          return h("<string|object> [string|array]", [t2, e2], arguments.length), v(this, yt, "f").conflicts(t2, e2), this;
        }
        config(t2 = "config", e2, s2) {
          return h("[object|string] [string|function] [function]", [t2, e2, s2], arguments.length), "object" != typeof t2 || Array.isArray(t2) ? ("function" == typeof e2 && (s2 = e2, e2 = void 0), this.describe(t2, e2 || v(this, pt, "f").deferY18nLookup("Path to JSON config file")), (Array.isArray(t2) ? t2 : [t2]).forEach((t3) => {
            v(this, et, "f").config[t3] = s2 || true;
          }), this) : (t2 = n(t2, v(this, W, "f"), this[Mt]()["deep-merge-config"] || false, v(this, ct, "f")), v(this, et, "f").configObjects = (v(this, et, "f").configObjects || []).concat(t2), this);
        }
        completion(t2, e2, s2) {
          return h("[string] [string|boolean|function] [function]", [t2, e2, s2], arguments.length), "function" == typeof e2 && (s2 = e2, e2 = void 0), O(this, F, t2 || v(this, F, "f") || "completion", "f"), e2 || false === e2 || (e2 = "generate completion script"), this.command(v(this, F, "f"), e2), s2 && v(this, U, "f").registerFunction(s2), this;
        }
        command(t2, e2, s2, i2, n2, r2) {
          return h("<string|array|object> [string|boolean] [function|object] [function] [array] [boolean|string]", [t2, e2, s2, i2, n2, r2], arguments.length), v(this, z, "f").addHandler(t2, e2, s2, i2, n2, r2), this;
        }
        commands(t2, e2, s2, i2, n2, r2) {
          return this.command(t2, e2, s2, i2, n2, r2);
        }
        commandDir(t2, e2) {
          h("<string> [object]", [t2, e2], arguments.length);
          const s2 = v(this, st, "f") || v(this, ct, "f").require;
          return v(this, z, "f").addDirectory(t2, s2, v(this, ct, "f").getCallerFile(), e2), this;
        }
        count(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("count", t2), this[Qt](t2), this;
        }
        default(t2, e2, s2) {
          return h("<object|string|array> [*] [string]", [t2, e2, s2], arguments.length), s2 && (u(t2, v(this, ct, "f")), v(this, et, "f").defaultDescription[t2] = s2), "function" == typeof e2 && (u(t2, v(this, ct, "f")), v(this, et, "f").defaultDescription[t2] || (v(this, et, "f").defaultDescription[t2] = v(this, pt, "f").functionDescription(e2)), e2 = e2.call()), this[St](this.default.bind(this), "default", t2, e2), this;
        }
        defaults(t2, e2, s2) {
          return this.default(t2, e2, s2);
        }
        demandCommand(t2 = 1, e2, s2, i2) {
          return h("[number] [number|string] [string|null|undefined] [string|null|undefined]", [t2, e2, s2, i2], arguments.length), "number" != typeof e2 && (s2 = e2, e2 = 1 / 0), this.global("_", false), v(this, et, "f").demandedCommands._ = { min: t2, max: e2, minMsg: s2, maxMsg: i2 }, this;
        }
        demand(t2, e2, s2) {
          return Array.isArray(e2) ? (e2.forEach((t3) => {
            d(s2, true, v(this, ct, "f")), this.demandOption(t3, s2);
          }), e2 = 1 / 0) : "number" != typeof e2 && (s2 = e2, e2 = 1 / 0), "number" == typeof t2 ? (d(s2, true, v(this, ct, "f")), this.demandCommand(t2, e2, s2, s2)) : Array.isArray(t2) ? t2.forEach((t3) => {
            d(s2, true, v(this, ct, "f")), this.demandOption(t3, s2);
          }) : "string" == typeof s2 ? this.demandOption(t2, s2) : true !== s2 && void 0 !== s2 || this.demandOption(t2), this;
        }
        demandOption(t2, e2) {
          return h("<object|string|array> [string]", [t2, e2], arguments.length), this[St](this.demandOption.bind(this), "demandedOptions", t2, e2), this;
        }
        deprecateOption(t2, e2) {
          return h("<string> [string|boolean]", [t2, e2], arguments.length), v(this, et, "f").deprecatedOptions[t2] = e2, this;
        }
        describe(t2, e2) {
          return h("<object|string|array> [string]", [t2, e2], arguments.length), this[Nt](t2, true), v(this, pt, "f").describe(t2, e2), this;
        }
        detectLocale(t2) {
          return h("<boolean>", [t2], arguments.length), O(this, G, t2, "f"), this;
        }
        env(t2) {
          return h("[string|boolean]", [t2], arguments.length), false === t2 ? delete v(this, et, "f").envPrefix : v(this, et, "f").envPrefix = t2 || "", this;
        }
        epilogue(t2) {
          return h("<string>", [t2], arguments.length), v(this, pt, "f").epilog(t2), this;
        }
        epilog(t2) {
          return this.epilogue(t2);
        }
        example(t2, e2) {
          return h("<string|array> [string]", [t2, e2], arguments.length), Array.isArray(t2) ? t2.forEach((t3) => this.example(...t3)) : v(this, pt, "f").example(t2, e2), this;
        }
        exit(t2, e2) {
          O(this, J, true, "f"), O(this, V, e2, "f"), v(this, T, "f") && v(this, ct, "f").process.exit(t2);
        }
        exitProcess(t2 = true) {
          return h("[boolean]", [t2], arguments.length), O(this, T, t2, "f"), this;
        }
        fail(t2) {
          if (h("<function|boolean>", [t2], arguments.length), "boolean" == typeof t2 && false !== t2) throw new e("Invalid first argument. Expected function or boolean 'false'");
          return v(this, pt, "f").failFn(t2), this;
        }
        getAliases() {
          return this.parsed ? this.parsed.aliases : {};
        }
        async getCompletion(t2, e2) {
          return h("<array> [function]", [t2, e2], arguments.length), e2 ? v(this, U, "f").getCompletion(t2, e2) : new Promise((e3, s2) => {
            v(this, U, "f").getCompletion(t2, (t3, i2) => {
              t3 ? s2(t3) : e3(i2);
            });
          });
        }
        getDemandedOptions() {
          return h([], 0), v(this, et, "f").demandedOptions;
        }
        getDemandedCommands() {
          return h([], 0), v(this, et, "f").demandedCommands;
        }
        getDeprecatedOptions() {
          return h([], 0), v(this, et, "f").deprecatedOptions;
        }
        getDetectLocale() {
          return v(this, G, "f");
        }
        getExitProcess() {
          return v(this, T, "f");
        }
        getGroups() {
          return Object.assign({}, v(this, K, "f"), v(this, at, "f"));
        }
        getHelp() {
          if (O(this, J, true, "f"), !v(this, pt, "f").hasCachedHelpMessage()) {
            if (!this.parsed) {
              const t3 = this[Jt](v(this, ht, "f"), void 0, void 0, 0, true);
              if (f(t3)) return t3.then(() => v(this, pt, "f").help());
            }
            const t2 = v(this, z, "f").runDefaultBuilderOn(this);
            if (f(t2)) return t2.then(() => v(this, pt, "f").help());
          }
          return Promise.resolve(v(this, pt, "f").help());
        }
        getOptions() {
          return v(this, et, "f");
        }
        getStrict() {
          return v(this, ft, "f");
        }
        getStrictCommands() {
          return v(this, dt, "f");
        }
        getStrictOptions() {
          return v(this, ut, "f");
        }
        global(t2, e2) {
          return h("<string|array> [boolean]", [t2, e2], arguments.length), t2 = [].concat(t2), false !== e2 ? v(this, et, "f").local = v(this, et, "f").local.filter((e3) => -1 === t2.indexOf(e3)) : t2.forEach((t3) => {
            v(this, et, "f").local.includes(t3) || v(this, et, "f").local.push(t3);
          }), this;
        }
        group(t2, e2) {
          h("<string|array> <string>", [t2, e2], arguments.length);
          const s2 = v(this, at, "f")[e2] || v(this, K, "f")[e2];
          v(this, at, "f")[e2] && delete v(this, at, "f")[e2];
          const i2 = {};
          return v(this, K, "f")[e2] = (s2 || []).concat(t2).filter((t3) => !i2[t3] && (i2[t3] = true)), this;
        }
        hide(t2) {
          return h("<string>", [t2], arguments.length), v(this, et, "f").hiddenOptions.push(t2), this;
        }
        implies(t2, e2) {
          return h("<string|object> [number|string|array]", [t2, e2], arguments.length), v(this, yt, "f").implies(t2, e2), this;
        }
        locale(t2) {
          return h("[string]", [t2], arguments.length), void 0 === t2 ? (this[kt](), v(this, ct, "f").y18n.getLocale()) : (O(this, G, false, "f"), v(this, ct, "f").y18n.setLocale(t2), this);
        }
        middleware(t2, e2, s2) {
          return v(this, Y, "f").addMiddleware(t2, !!e2, s2);
        }
        nargs(t2, e2) {
          return h("<string|object|array> [number]", [t2, e2], arguments.length), this[St](this.nargs.bind(this), "narg", t2, e2), this;
        }
        normalize(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("normalize", t2), this;
        }
        number(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("number", t2), this[Qt](t2), this;
        }
        option(t2, e2) {
          if (h("<string|object> [object]", [t2, e2], arguments.length), "object" == typeof t2) Object.keys(t2).forEach((e3) => {
            this.options(e3, t2[e3]);
          });
          else {
            "object" != typeof e2 && (e2 = {}), this[Qt](t2), !v(this, mt, "f") || "version" !== t2 && "version" !== (null == e2 ? void 0 : e2.alias) || this[wt](['"version" is a reserved word.', "Please do one of the following:", '- Disable version with `yargs.version(false)` if using "version" as an option', "- Use the built-in `yargs.version` method instead (if applicable)", "- Use a different option key", "https://yargs.js.org/docs/#api-reference-version"].join("\n"), void 0, "versionWarning"), v(this, et, "f").key[t2] = true, e2.alias && this.alias(t2, e2.alias);
            const s2 = e2.deprecate || e2.deprecated;
            s2 && this.deprecateOption(t2, s2);
            const i2 = e2.demand || e2.required || e2.require;
            i2 && this.demand(t2, i2), e2.demandOption && this.demandOption(t2, "string" == typeof e2.demandOption ? e2.demandOption : void 0), e2.conflicts && this.conflicts(t2, e2.conflicts), "default" in e2 && this.default(t2, e2.default), void 0 !== e2.implies && this.implies(t2, e2.implies), void 0 !== e2.nargs && this.nargs(t2, e2.nargs), e2.config && this.config(t2, e2.configParser), e2.normalize && this.normalize(t2), e2.choices && this.choices(t2, e2.choices), e2.coerce && this.coerce(t2, e2.coerce), e2.group && this.group(t2, e2.group), (e2.boolean || "boolean" === e2.type) && (this.boolean(t2), e2.alias && this.boolean(e2.alias)), (e2.array || "array" === e2.type) && (this.array(t2), e2.alias && this.array(e2.alias)), (e2.number || "number" === e2.type) && (this.number(t2), e2.alias && this.number(e2.alias)), (e2.string || "string" === e2.type) && (this.string(t2), e2.alias && this.string(e2.alias)), (e2.count || "count" === e2.type) && this.count(t2), "boolean" == typeof e2.global && this.global(t2, e2.global), e2.defaultDescription && (v(this, et, "f").defaultDescription[t2] = e2.defaultDescription), e2.skipValidation && this.skipValidation(t2);
            const n2 = e2.describe || e2.description || e2.desc, r2 = v(this, pt, "f").getDescriptions();
            Object.prototype.hasOwnProperty.call(r2, t2) && "string" != typeof n2 || this.describe(t2, n2), e2.hidden && this.hide(t2), e2.requiresArg && this.requiresArg(t2);
          }
          return this;
        }
        options(t2, e2) {
          return this.option(t2, e2);
        }
        parse(t2, e2, s2) {
          h("[string|array] [function|boolean|object] [function]", [t2, e2, s2], arguments.length), this[Ct](), void 0 === t2 && (t2 = v(this, ht, "f")), "object" == typeof e2 && (O(this, rt, e2, "f"), e2 = s2), "function" == typeof e2 && (O(this, nt, e2, "f"), e2 = false), e2 || O(this, ht, t2, "f"), v(this, nt, "f") && O(this, T, false, "f");
          const i2 = this[Jt](t2, !!e2), n2 = this.parsed;
          return v(this, U, "f").setParsed(this.parsed), f(i2) ? i2.then((t3) => (v(this, nt, "f") && v(this, nt, "f").call(this, v(this, V, "f"), t3, v(this, tt, "f")), t3)).catch((t3) => {
            throw v(this, nt, "f") && v(this, nt, "f")(t3, this.parsed.argv, v(this, tt, "f")), t3;
          }).finally(() => {
            this[Ht](), this.parsed = n2;
          }) : (v(this, nt, "f") && v(this, nt, "f").call(this, v(this, V, "f"), i2, v(this, tt, "f")), this[Ht](), this.parsed = n2, i2);
        }
        parseAsync(t2, e2, s2) {
          const i2 = this.parse(t2, e2, s2);
          return f(i2) ? i2 : Promise.resolve(i2);
        }
        parseSync(t2, s2, i2) {
          const n2 = this.parse(t2, s2, i2);
          if (f(n2)) throw new e(".parseSync() must not be used with asynchronous builders, handlers, or middleware");
          return n2;
        }
        parserConfiguration(t2) {
          return h("<object>", [t2], arguments.length), O(this, it, t2, "f"), this;
        }
        pkgConf(t2, e2) {
          h("<string> [string]", [t2, e2], arguments.length);
          let s2 = null;
          const i2 = this[At](e2 || v(this, W, "f"));
          return i2[t2] && "object" == typeof i2[t2] && (s2 = n(i2[t2], e2 || v(this, W, "f"), this[Mt]()["deep-merge-config"] || false, v(this, ct, "f")), v(this, et, "f").configObjects = (v(this, et, "f").configObjects || []).concat(s2)), this;
        }
        positional(t2, e2) {
          h("<string> <object>", [t2, e2], arguments.length);
          const s2 = ["default", "defaultDescription", "implies", "normalize", "choices", "conflicts", "coerce", "type", "describe", "desc", "description", "alias"];
          e2 = g(e2, (t3, e3) => !("type" === t3 && !["string", "number", "boolean"].includes(e3)) && s2.includes(t3));
          const i2 = v(this, q, "f").fullCommands[v(this, q, "f").fullCommands.length - 1], n2 = i2 ? v(this, z, "f").cmdToParseOptions(i2) : { array: [], alias: {}, default: {}, demand: {} };
          return p(n2).forEach((s3) => {
            const i3 = n2[s3];
            Array.isArray(i3) ? -1 !== i3.indexOf(t2) && (e2[s3] = true) : i3[t2] && !(s3 in e2) && (e2[s3] = i3[t2]);
          }), this.group(t2, v(this, pt, "f").getPositionalGroupName()), this.option(t2, e2);
        }
        recommendCommands(t2 = true) {
          return h("[boolean]", [t2], arguments.length), O(this, lt, t2, "f"), this;
        }
        required(t2, e2, s2) {
          return this.demand(t2, e2, s2);
        }
        require(t2, e2, s2) {
          return this.demand(t2, e2, s2);
        }
        requiresArg(t2) {
          return h("<array|string|object> [number]", [t2], arguments.length), "string" == typeof t2 && v(this, et, "f").narg[t2] || this[St](this.requiresArg.bind(this), "narg", t2, NaN), this;
        }
        showCompletionScript(t2, e2) {
          return h("[string] [string]", [t2, e2], arguments.length), t2 = t2 || this.$0, v(this, Q, "f").log(v(this, U, "f").generateCompletionScript(t2, e2 || v(this, F, "f") || "completion")), this;
        }
        showHelp(t2) {
          if (h("[string|function]", [t2], arguments.length), O(this, J, true, "f"), !v(this, pt, "f").hasCachedHelpMessage()) {
            if (!this.parsed) {
              const e3 = this[Jt](v(this, ht, "f"), void 0, void 0, 0, true);
              if (f(e3)) return e3.then(() => {
                v(this, pt, "f").showHelp(t2);
              }), this;
            }
            const e2 = v(this, z, "f").runDefaultBuilderOn(this);
            if (f(e2)) return e2.then(() => {
              v(this, pt, "f").showHelp(t2);
            }), this;
          }
          return v(this, pt, "f").showHelp(t2), this;
        }
        scriptName(t2) {
          return this.customScriptName = true, this.$0 = t2, this;
        }
        showHelpOnFail(t2, e2) {
          return h("[boolean|string] [string]", [t2, e2], arguments.length), v(this, pt, "f").showHelpOnFail(t2, e2), this;
        }
        showVersion(t2) {
          return h("[string|function]", [t2], arguments.length), v(this, pt, "f").showVersion(t2), this;
        }
        skipValidation(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("skipValidation", t2), this;
        }
        strict(t2) {
          return h("[boolean]", [t2], arguments.length), O(this, ft, false !== t2, "f"), this;
        }
        strictCommands(t2) {
          return h("[boolean]", [t2], arguments.length), O(this, dt, false !== t2, "f"), this;
        }
        strictOptions(t2) {
          return h("[boolean]", [t2], arguments.length), O(this, ut, false !== t2, "f"), this;
        }
        string(t2) {
          return h("<array|string>", [t2], arguments.length), this[Pt]("string", t2), this[Qt](t2), this;
        }
        terminalWidth() {
          return h([], 0), v(this, ct, "f").process.stdColumns;
        }
        updateLocale(t2) {
          return this.updateStrings(t2);
        }
        updateStrings(t2) {
          return h("<object>", [t2], arguments.length), O(this, G, false, "f"), v(this, ct, "f").y18n.updateLocale(t2), this;
        }
        usage(t2, s2, i2, n2) {
          if (h("<string|null|undefined> [string|boolean] [function|object] [function]", [t2, s2, i2, n2], arguments.length), void 0 !== s2) {
            if (d(t2, null, v(this, ct, "f")), (t2 || "").match(/^\$0( |$)/)) return this.command(t2, s2, i2, n2);
            throw new e(".usage() description must start with $0 if being used as alias for .command()");
          }
          return v(this, pt, "f").usage(t2), this;
        }
        usageConfiguration(t2) {
          return h("<object>", [t2], arguments.length), O(this, gt, t2, "f"), this;
        }
        version(t2, e2, s2) {
          const i2 = "version";
          if (h("[boolean|string] [string] [string]", [t2, e2, s2], arguments.length), v(this, mt, "f") && (this[Ot](v(this, mt, "f")), v(this, pt, "f").version(void 0), O(this, mt, null, "f")), 0 === arguments.length) s2 = this[Et](), t2 = i2;
          else if (1 === arguments.length) {
            if (false === t2) return this;
            s2 = t2, t2 = i2;
          } else 2 === arguments.length && (s2 = e2, e2 = void 0);
          return O(this, mt, "string" == typeof t2 ? t2 : i2, "f"), e2 = e2 || v(this, pt, "f").deferY18nLookup("Show version number"), v(this, pt, "f").version(s2 || void 0), this.boolean(v(this, mt, "f")), this.describe(v(this, mt, "f"), e2), this;
        }
        wrap(t2) {
          return h("<number|null|undefined>", [t2], arguments.length), v(this, pt, "f").wrap(t2), this;
        }
        [(z = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), q = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), F = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap(), V = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ new WeakMap(), J = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), bt)](t2) {
          if (!t2._ || !t2["--"]) return t2;
          t2._.push.apply(t2._, t2["--"]);
          try {
            delete t2["--"];
          } catch (t3) {
          }
          return t2;
        }
        [vt]() {
          return { log: (...t2) => {
            this[Rt]() || console.log(...t2), O(this, J, true, "f"), v(this, tt, "f").length && O(this, tt, v(this, tt, "f") + "\n", "f"), O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
          }, error: (...t2) => {
            this[Rt]() || console.error(...t2), O(this, J, true, "f"), v(this, tt, "f").length && O(this, tt, v(this, tt, "f") + "\n", "f"), O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
          } };
        }
        [Ot](t2) {
          p(v(this, et, "f")).forEach((e2) => {
            if ("configObjects" === e2) return;
            const s2 = v(this, et, "f")[e2];
            Array.isArray(s2) ? s2.includes(t2) && s2.splice(s2.indexOf(t2), 1) : "object" == typeof s2 && delete s2[t2];
          }), delete v(this, pt, "f").getDescriptions()[t2];
        }
        [wt](t2, e2, s2) {
          v(this, R, "f")[s2] || (v(this, ct, "f").process.emitWarning(t2, e2), v(this, R, "f")[s2] = true);
        }
        [Ct]() {
          v(this, B, "f").push({ options: v(this, et, "f"), configObjects: v(this, et, "f").configObjects.slice(0), exitProcess: v(this, T, "f"), groups: v(this, K, "f"), strict: v(this, ft, "f"), strictCommands: v(this, dt, "f"), strictOptions: v(this, ut, "f"), completionCommand: v(this, F, "f"), output: v(this, tt, "f"), exitError: v(this, V, "f"), hasOutput: v(this, J, "f"), parsed: this.parsed, parseFn: v(this, nt, "f"), parseContext: v(this, rt, "f") }), v(this, pt, "f").freeze(), v(this, yt, "f").freeze(), v(this, z, "f").freeze(), v(this, Y, "f").freeze();
        }
        [jt]() {
          let t2, e2 = "";
          return t2 = /\b(node|iojs|electron)(\.exe)?$/.test(v(this, ct, "f").process.argv()[0]) ? v(this, ct, "f").process.argv().slice(1, 2) : v(this, ct, "f").process.argv().slice(0, 1), e2 = t2.map((t3) => {
            const e3 = this[Yt](v(this, W, "f"), t3);
            return t3.match(/^(\/|([a-zA-Z]:)?\\)/) && e3.length < t3.length ? e3 : t3;
          }).join(" ").trim(), v(this, ct, "f").getEnv("_") && v(this, ct, "f").getProcessArgvBin() === v(this, ct, "f").getEnv("_") && (e2 = v(this, ct, "f").getEnv("_").replace(`${v(this, ct, "f").path.dirname(v(this, ct, "f").process.execPath())}/`, "")), e2;
        }
        [Mt]() {
          return v(this, it, "f");
        }
        [_t]() {
          return v(this, gt, "f");
        }
        [kt]() {
          if (!v(this, G, "f")) return;
          const t2 = v(this, ct, "f").getEnv("LC_ALL") || v(this, ct, "f").getEnv("LC_MESSAGES") || v(this, ct, "f").getEnv("LANG") || v(this, ct, "f").getEnv("LANGUAGE") || "en_US";
          this.locale(t2.replace(/[.:].*/, ""));
        }
        [Et]() {
          return this[At]().version || "unknown";
        }
        [xt](t2) {
          const e2 = t2["--"] ? t2["--"] : t2._;
          for (let t3, s2 = 0; void 0 !== (t3 = e2[s2]); s2++) v(this, ct, "f").Parser.looksLikeNumber(t3) && Number.isSafeInteger(Math.floor(parseFloat(`${t3}`))) && (e2[s2] = Number(t3));
          return t2;
        }
        [At](t2) {
          const e2 = t2 || "*";
          if (v(this, ot, "f")[e2]) return v(this, ot, "f")[e2];
          let s2 = {};
          try {
            let e3 = t2 || v(this, ct, "f").mainFilename;
            !t2 && v(this, ct, "f").path.extname(e3) && (e3 = v(this, ct, "f").path.dirname(e3));
            const i2 = v(this, ct, "f").findUp(e3, (t3, e4) => e4.includes("package.json") ? "package.json" : void 0);
            d(i2, void 0, v(this, ct, "f")), s2 = JSON.parse(v(this, ct, "f").readFileSync(i2, "utf8"));
          } catch (t3) {
          }
          return v(this, ot, "f")[e2] = s2 || {}, v(this, ot, "f")[e2];
        }
        [Pt](t2, e2) {
          (e2 = [].concat(e2)).forEach((e3) => {
            e3 = this[Dt](e3), v(this, et, "f")[t2].push(e3);
          });
        }
        [St](t2, e2, s2, i2) {
          this[It](t2, e2, s2, i2, (t3, e3, s3) => {
            v(this, et, "f")[t3][e3] = s3;
          });
        }
        [$t](t2, e2, s2, i2) {
          this[It](t2, e2, s2, i2, (t3, e3, s3) => {
            v(this, et, "f")[t3][e3] = (v(this, et, "f")[t3][e3] || []).concat(s3);
          });
        }
        [It](t2, e2, s2, i2, n2) {
          if (Array.isArray(s2)) s2.forEach((e3) => {
            t2(e3, i2);
          });
          else if (/* @__PURE__ */ ((t3) => "object" == typeof t3)(s2)) for (const e3 of p(s2)) t2(e3, s2[e3]);
          else n2(e2, this[Dt](s2), i2);
        }
        [Dt](t2) {
          return "__proto__" === t2 ? "___proto___" : t2;
        }
        [Nt](t2, e2) {
          return this[St](this[Nt].bind(this), "key", t2, e2), this;
        }
        [Ht]() {
          var t2, e2, s2, i2, n2, r2, o2, a2, h2, l2, c2, f2;
          const u2 = v(this, B, "f").pop();
          let p2;
          d(u2, void 0, v(this, ct, "f")), t2 = this, e2 = this, s2 = this, i2 = this, n2 = this, r2 = this, o2 = this, a2 = this, h2 = this, l2 = this, c2 = this, f2 = this, { options: { set value(e3) {
            O(t2, et, e3, "f");
          } }.value, configObjects: p2, exitProcess: { set value(t3) {
            O(e2, T, t3, "f");
          } }.value, groups: { set value(t3) {
            O(s2, K, t3, "f");
          } }.value, output: { set value(t3) {
            O(i2, tt, t3, "f");
          } }.value, exitError: { set value(t3) {
            O(n2, V, t3, "f");
          } }.value, hasOutput: { set value(t3) {
            O(r2, J, t3, "f");
          } }.value, parsed: this.parsed, strict: { set value(t3) {
            O(o2, ft, t3, "f");
          } }.value, strictCommands: { set value(t3) {
            O(a2, dt, t3, "f");
          } }.value, strictOptions: { set value(t3) {
            O(h2, ut, t3, "f");
          } }.value, completionCommand: { set value(t3) {
            O(l2, F, t3, "f");
          } }.value, parseFn: { set value(t3) {
            O(c2, nt, t3, "f");
          } }.value, parseContext: { set value(t3) {
            O(f2, rt, t3, "f");
          } }.value } = u2, v(this, et, "f").configObjects = p2, v(this, pt, "f").unfreeze(), v(this, yt, "f").unfreeze(), v(this, z, "f").unfreeze(), v(this, Y, "f").unfreeze();
        }
        [zt](t2, e2) {
          return j(e2, (e3) => (t2(e3), e3));
        }
        getInternalMethods() {
          return { getCommandInstance: this[Wt].bind(this), getContext: this[qt].bind(this), getHasOutput: this[Ut].bind(this), getLoggerInstance: this[Ft].bind(this), getParseContext: this[Lt].bind(this), getParserConfiguration: this[Mt].bind(this), getUsageConfiguration: this[_t].bind(this), getUsageInstance: this[Vt].bind(this), getValidationInstance: this[Gt].bind(this), hasParseCallback: this[Rt].bind(this), isGlobalContext: this[Tt].bind(this), postProcess: this[Bt].bind(this), reset: this[Kt].bind(this), runValidation: this[Zt].bind(this), runYargsParserAndExecuteCommands: this[Jt].bind(this), setHasOutput: this[Xt].bind(this) };
        }
        [Wt]() {
          return v(this, z, "f");
        }
        [qt]() {
          return v(this, q, "f");
        }
        [Ut]() {
          return v(this, J, "f");
        }
        [Ft]() {
          return v(this, Q, "f");
        }
        [Lt]() {
          return v(this, rt, "f") || {};
        }
        [Vt]() {
          return v(this, pt, "f");
        }
        [Gt]() {
          return v(this, yt, "f");
        }
        [Rt]() {
          return !!v(this, nt, "f");
        }
        [Tt]() {
          return v(this, X, "f");
        }
        [Bt](t2, e2, s2, i2) {
          if (s2) return t2;
          if (f(t2)) return t2;
          e2 || (t2 = this[bt](t2));
          return (this[Mt]()["parse-positional-numbers"] || void 0 === this[Mt]()["parse-positional-numbers"]) && (t2 = this[xt](t2)), i2 && (t2 = C(t2, this, v(this, Y, "f").getMiddleware(), false)), t2;
        }
        [Kt](t2 = {}) {
          O(this, et, v(this, et, "f") || {}, "f");
          const e2 = {};
          e2.local = v(this, et, "f").local || [], e2.configObjects = v(this, et, "f").configObjects || [];
          const s2 = {};
          e2.local.forEach((e3) => {
            s2[e3] = true, (t2[e3] || []).forEach((t3) => {
              s2[t3] = true;
            });
          }), Object.assign(v(this, at, "f"), Object.keys(v(this, K, "f")).reduce((t3, e3) => {
            const i2 = v(this, K, "f")[e3].filter((t4) => !(t4 in s2));
            return i2.length > 0 && (t3[e3] = i2), t3;
          }, {})), O(this, K, {}, "f");
          return ["array", "boolean", "string", "skipValidation", "count", "normalize", "number", "hiddenOptions"].forEach((t3) => {
            e2[t3] = (v(this, et, "f")[t3] || []).filter((t4) => !s2[t4]);
          }), ["narg", "key", "alias", "default", "defaultDescription", "config", "choices", "demandedOptions", "demandedCommands", "deprecatedOptions"].forEach((t3) => {
            e2[t3] = g(v(this, et, "f")[t3], (t4) => !s2[t4]);
          }), e2.envPrefix = v(this, et, "f").envPrefix, O(this, et, e2, "f"), O(this, pt, v(this, pt, "f") ? v(this, pt, "f").reset(s2) : P(this, v(this, ct, "f")), "f"), O(this, yt, v(this, yt, "f") ? v(this, yt, "f").reset(s2) : (function(t3, e3, s3) {
            const i2 = s3.y18n.__, n2 = s3.y18n.__n, r2 = { nonOptionCount: function(s4) {
              const i3 = t3.getDemandedCommands(), r3 = s4._.length + (s4["--"] ? s4["--"].length : 0) - t3.getInternalMethods().getContext().commands.length;
              i3._ && (r3 < i3._.min || r3 > i3._.max) && (r3 < i3._.min ? void 0 !== i3._.minMsg ? e3.fail(i3._.minMsg ? i3._.minMsg.replace(/\$0/g, r3.toString()).replace(/\$1/, i3._.min.toString()) : null) : e3.fail(n2("Not enough non-option arguments: got %s, need at least %s", "Not enough non-option arguments: got %s, need at least %s", r3, r3.toString(), i3._.min.toString())) : r3 > i3._.max && (void 0 !== i3._.maxMsg ? e3.fail(i3._.maxMsg ? i3._.maxMsg.replace(/\$0/g, r3.toString()).replace(/\$1/, i3._.max.toString()) : null) : e3.fail(n2("Too many non-option arguments: got %s, maximum of %s", "Too many non-option arguments: got %s, maximum of %s", r3, r3.toString(), i3._.max.toString()))));
            }, positionalCount: function(t4, s4) {
              s4 < t4 && e3.fail(n2("Not enough non-option arguments: got %s, need at least %s", "Not enough non-option arguments: got %s, need at least %s", s4, s4 + "", t4 + ""));
            }, requiredArguments: function(t4, s4) {
              let i3 = null;
              for (const e4 of Object.keys(s4)) Object.prototype.hasOwnProperty.call(t4, e4) && void 0 !== t4[e4] || (i3 = i3 || {}, i3[e4] = s4[e4]);
              if (i3) {
                const t5 = [];
                for (const e4 of Object.keys(i3)) {
                  const s6 = i3[e4];
                  s6 && t5.indexOf(s6) < 0 && t5.push(s6);
                }
                const s5 = t5.length ? `
${t5.join("\n")}` : "";
                e3.fail(n2("Missing required argument: %s", "Missing required arguments: %s", Object.keys(i3).length, Object.keys(i3).join(", ") + s5));
              }
            }, unknownArguments: function(s4, i3, o3, a3, h2 = true) {
              var l3;
              const c3 = t3.getInternalMethods().getCommandInstance().getCommands(), f2 = [], d2 = t3.getInternalMethods().getContext();
              if (Object.keys(s4).forEach((e4) => {
                H.includes(e4) || Object.prototype.hasOwnProperty.call(o3, e4) || Object.prototype.hasOwnProperty.call(t3.getInternalMethods().getParseContext(), e4) || r2.isValidAndSomeAliasIsNotNew(e4, i3) || f2.push(e4);
              }), h2 && (d2.commands.length > 0 || c3.length > 0 || a3) && s4._.slice(d2.commands.length).forEach((t4) => {
                c3.includes("" + t4) || f2.push("" + t4);
              }), h2) {
                const e4 = (null === (l3 = t3.getDemandedCommands()._) || void 0 === l3 ? void 0 : l3.max) || 0, i4 = d2.commands.length + e4;
                i4 < s4._.length && s4._.slice(i4).forEach((t4) => {
                  t4 = String(t4), d2.commands.includes(t4) || f2.includes(t4) || f2.push(t4);
                });
              }
              f2.length && e3.fail(n2("Unknown argument: %s", "Unknown arguments: %s", f2.length, f2.map((t4) => t4.trim() ? t4 : `"${t4}"`).join(", ")));
            }, unknownCommands: function(s4) {
              const i3 = t3.getInternalMethods().getCommandInstance().getCommands(), r3 = [], o3 = t3.getInternalMethods().getContext();
              return (o3.commands.length > 0 || i3.length > 0) && s4._.slice(o3.commands.length).forEach((t4) => {
                i3.includes("" + t4) || r3.push("" + t4);
              }), r3.length > 0 && (e3.fail(n2("Unknown command: %s", "Unknown commands: %s", r3.length, r3.join(", "))), true);
            }, isValidAndSomeAliasIsNotNew: function(e4, s4) {
              if (!Object.prototype.hasOwnProperty.call(s4, e4)) return false;
              const i3 = t3.parsed.newAliases;
              return [e4, ...s4[e4]].some((t4) => !Object.prototype.hasOwnProperty.call(i3, t4) || !i3[e4]);
            }, limitedChoices: function(s4) {
              const n3 = t3.getOptions(), r3 = {};
              if (!Object.keys(n3.choices).length) return;
              Object.keys(s4).forEach((t4) => {
                -1 === H.indexOf(t4) && Object.prototype.hasOwnProperty.call(n3.choices, t4) && [].concat(s4[t4]).forEach((e4) => {
                  -1 === n3.choices[t4].indexOf(e4) && void 0 !== e4 && (r3[t4] = (r3[t4] || []).concat(e4));
                });
              });
              const o3 = Object.keys(r3);
              if (!o3.length) return;
              let a3 = i2("Invalid values:");
              o3.forEach((t4) => {
                a3 += `
  ${i2("Argument: %s, Given: %s, Choices: %s", t4, e3.stringifiedValues(r3[t4]), e3.stringifiedValues(n3.choices[t4]))}`;
              }), e3.fail(a3);
            } };
            let o2 = {};
            function a2(t4, e4) {
              const s4 = Number(e4);
              return "number" == typeof (e4 = isNaN(s4) ? e4 : s4) ? e4 = t4._.length >= e4 : e4.match(/^--no-.+/) ? (e4 = e4.match(/^--no-(.+)/)[1], e4 = !Object.prototype.hasOwnProperty.call(t4, e4)) : e4 = Object.prototype.hasOwnProperty.call(t4, e4), e4;
            }
            r2.implies = function(e4, i3) {
              h("<string|object> [array|number|string]", [e4, i3], arguments.length), "object" == typeof e4 ? Object.keys(e4).forEach((t4) => {
                r2.implies(t4, e4[t4]);
              }) : (t3.global(e4), o2[e4] || (o2[e4] = []), Array.isArray(i3) ? i3.forEach((t4) => r2.implies(e4, t4)) : (d(i3, void 0, s3), o2[e4].push(i3)));
            }, r2.getImplied = function() {
              return o2;
            }, r2.implications = function(t4) {
              const s4 = [];
              if (Object.keys(o2).forEach((e4) => {
                const i3 = e4;
                (o2[e4] || []).forEach((e5) => {
                  let n3 = i3;
                  const r3 = e5;
                  n3 = a2(t4, n3), e5 = a2(t4, e5), n3 && !e5 && s4.push(` ${i3} -> ${r3}`);
                });
              }), s4.length) {
                let t5 = `${i2("Implications failed:")}
`;
                s4.forEach((e4) => {
                  t5 += e4;
                }), e3.fail(t5);
              }
            };
            let l2 = {};
            r2.conflicts = function(e4, s4) {
              h("<string|object> [array|string]", [e4, s4], arguments.length), "object" == typeof e4 ? Object.keys(e4).forEach((t4) => {
                r2.conflicts(t4, e4[t4]);
              }) : (t3.global(e4), l2[e4] || (l2[e4] = []), Array.isArray(s4) ? s4.forEach((t4) => r2.conflicts(e4, t4)) : l2[e4].push(s4));
            }, r2.getConflicting = () => l2, r2.conflicting = function(n3) {
              Object.keys(n3).forEach((t4) => {
                l2[t4] && l2[t4].forEach((s4) => {
                  s4 && void 0 !== n3[t4] && void 0 !== n3[s4] && e3.fail(i2("Arguments %s and %s are mutually exclusive", t4, s4));
                });
              }), t3.getInternalMethods().getParserConfiguration()["strip-dashed"] && Object.keys(l2).forEach((t4) => {
                l2[t4].forEach((r3) => {
                  r3 && void 0 !== n3[s3.Parser.camelCase(t4)] && void 0 !== n3[s3.Parser.camelCase(r3)] && e3.fail(i2("Arguments %s and %s are mutually exclusive", t4, r3));
                });
              });
            }, r2.recommendCommands = function(t4, s4) {
              s4 = s4.sort((t5, e4) => e4.length - t5.length);
              let n3 = null, r3 = 1 / 0;
              for (let e4, i3 = 0; void 0 !== (e4 = s4[i3]); i3++) {
                const s5 = N(t4, e4);
                s5 <= 3 && s5 < r3 && (r3 = s5, n3 = e4);
              }
              n3 && e3.fail(i2("Did you mean %s?", n3));
            }, r2.reset = function(t4) {
              return o2 = g(o2, (e4) => !t4[e4]), l2 = g(l2, (e4) => !t4[e4]), r2;
            };
            const c2 = [];
            return r2.freeze = function() {
              c2.push({ implied: o2, conflicting: l2 });
            }, r2.unfreeze = function() {
              const t4 = c2.pop();
              d(t4, void 0, s3), { implied: o2, conflicting: l2 } = t4;
            }, r2;
          })(this, v(this, pt, "f"), v(this, ct, "f")), "f"), O(this, z, v(this, z, "f") ? v(this, z, "f").reset() : (function(t3, e3, s3, i2) {
            return new _(t3, e3, s3, i2);
          })(v(this, pt, "f"), v(this, yt, "f"), v(this, Y, "f"), v(this, ct, "f")), "f"), v(this, U, "f") || O(this, U, (function(t3, e3, s3, i2) {
            return new D(t3, e3, s3, i2);
          })(this, v(this, pt, "f"), v(this, z, "f"), v(this, ct, "f")), "f"), v(this, Y, "f").reset(), O(this, F, null, "f"), O(this, tt, "", "f"), O(this, V, null, "f"), O(this, J, false, "f"), this.parsed = false, this;
        }
        [Yt](t2, e2) {
          return v(this, ct, "f").path.relative(t2, e2);
        }
        [Jt](t2, s2, i2, n2 = 0, r2 = false) {
          let o2 = !!i2 || r2;
          t2 = t2 || v(this, ht, "f"), v(this, et, "f").__ = v(this, ct, "f").y18n.__, v(this, et, "f").configuration = this[Mt]();
          const a2 = !!v(this, et, "f").configuration["populate--"], h2 = Object.assign({}, v(this, et, "f").configuration, { "populate--": true }), l2 = v(this, ct, "f").Parser.detailed(t2, Object.assign({}, v(this, et, "f"), { configuration: { "parse-positional-numbers": false, ...h2 } })), c2 = Object.assign(l2.argv, v(this, rt, "f"));
          let d2;
          const u2 = l2.aliases;
          let p2 = false, g2 = false;
          Object.keys(c2).forEach((t3) => {
            t3 === v(this, Z, "f") && c2[t3] ? p2 = true : t3 === v(this, mt, "f") && c2[t3] && (g2 = true);
          }), c2.$0 = this.$0, this.parsed = l2, 0 === n2 && v(this, pt, "f").clearCachedHelpMessage();
          try {
            if (this[kt](), s2) return this[Bt](c2, a2, !!i2, false);
            if (v(this, Z, "f")) {
              [v(this, Z, "f")].concat(u2[v(this, Z, "f")] || []).filter((t3) => t3.length > 1).includes("" + c2._[c2._.length - 1]) && (c2._.pop(), p2 = true);
            }
            O(this, X, false, "f");
            const h3 = v(this, z, "f").getCommands(), m2 = v(this, U, "f").completionKey in c2, y2 = p2 || m2 || r2;
            if (c2._.length) {
              if (h3.length) {
                let t3;
                for (let e2, s3 = n2 || 0; void 0 !== c2._[s3]; s3++) {
                  if (e2 = String(c2._[s3]), h3.includes(e2) && e2 !== v(this, F, "f")) {
                    const t4 = v(this, z, "f").runCommand(e2, this, l2, s3 + 1, r2, p2 || g2 || r2);
                    return this[Bt](t4, a2, !!i2, false);
                  }
                  if (!t3 && e2 !== v(this, F, "f")) {
                    t3 = e2;
                    break;
                  }
                }
                !v(this, z, "f").hasDefaultCommand() && v(this, lt, "f") && t3 && !y2 && v(this, yt, "f").recommendCommands(t3, h3);
              }
              v(this, F, "f") && c2._.includes(v(this, F, "f")) && !m2 && (v(this, T, "f") && x(true), this.showCompletionScript(), this.exit(0));
            }
            if (v(this, z, "f").hasDefaultCommand() && !y2) {
              const t3 = v(this, z, "f").runCommand(null, this, l2, 0, r2, p2 || g2 || r2);
              return this[Bt](t3, a2, !!i2, false);
            }
            if (m2) {
              v(this, T, "f") && x(true);
              const s3 = (t2 = [].concat(t2)).slice(t2.indexOf(`--${v(this, U, "f").completionKey}`) + 1);
              return v(this, U, "f").getCompletion(s3, (t3, s4) => {
                if (t3) throw new e(t3.message);
                (s4 || []).forEach((t4) => {
                  v(this, Q, "f").log(t4);
                }), this.exit(0);
              }), this[Bt](c2, !a2, !!i2, false);
            }
            if (v(this, J, "f") || (p2 ? (v(this, T, "f") && x(true), o2 = true, this.showHelp("log"), this.exit(0)) : g2 && (v(this, T, "f") && x(true), o2 = true, v(this, pt, "f").showVersion("log"), this.exit(0))), !o2 && v(this, et, "f").skipValidation.length > 0 && (o2 = Object.keys(c2).some((t3) => v(this, et, "f").skipValidation.indexOf(t3) >= 0 && true === c2[t3])), !o2) {
              if (l2.error) throw new e(l2.error.message);
              if (!m2) {
                const t3 = this[Zt](u2, {}, l2.error);
                i2 || (d2 = C(c2, this, v(this, Y, "f").getMiddleware(), true)), d2 = this[zt](t3, null != d2 ? d2 : c2), f(d2) && !i2 && (d2 = d2.then(() => C(c2, this, v(this, Y, "f").getMiddleware(), false)));
              }
            }
          } catch (t3) {
            if (!(t3 instanceof e)) throw t3;
            v(this, pt, "f").fail(t3.message, t3);
          }
          return this[Bt](null != d2 ? d2 : c2, a2, !!i2, true);
        }
        [Zt](t2, s2, i2, n2) {
          const r2 = { ...this.getDemandedOptions() };
          return (o2) => {
            if (i2) throw new e(i2.message);
            v(this, yt, "f").nonOptionCount(o2), v(this, yt, "f").requiredArguments(o2, r2);
            let a2 = false;
            v(this, dt, "f") && (a2 = v(this, yt, "f").unknownCommands(o2)), v(this, ft, "f") && !a2 ? v(this, yt, "f").unknownArguments(o2, t2, s2, !!n2) : v(this, ut, "f") && v(this, yt, "f").unknownArguments(o2, t2, {}, false, false), v(this, yt, "f").limitedChoices(o2), v(this, yt, "f").implications(o2), v(this, yt, "f").conflicting(o2);
          };
        }
        [Xt]() {
          O(this, J, true, "f");
        }
        [Qt](t2) {
          if ("string" == typeof t2) v(this, et, "f").key[t2] = true;
          else for (const e2 of t2) v(this, et, "f").key[e2] = true;
        }
      };
      var ee;
      var se;
      var { readFileSync: ie } = __require("fs");
      var { inspect: ne } = __require("util");
      var { resolve: re } = __require("path");
      var oe = require_build();
      var ae = require_build2();
      var he;
      var le = { assert: { notStrictEqual: t.notStrictEqual, strictEqual: t.strictEqual }, cliui: require_build3(), findUp: require_sync(), getEnv: (t2) => process.env[t2], getCallerFile: require_get_caller_file(), getProcessArgvBin: y, inspect: ne, mainFilename: null !== (se = null === (ee = null === __require || void 0 === __require ? void 0 : __require.main) || void 0 === ee ? void 0 : ee.filename) && void 0 !== se ? se : process.cwd(), Parser: ae, path: __require("path"), process: { argv: () => process.argv, cwd: process.cwd, emitWarning: (t2, e2) => process.emitWarning(t2, e2), execPath: () => process.execPath, exit: (t2) => {
        process.exit(t2);
      }, nextTick: process.nextTick, stdColumns: void 0 !== process.stdout.columns ? process.stdout.columns : null }, readFileSync: ie, require: __require, requireDirectory: require_require_directory(), stringWidth: require_string_width(), y18n: oe({ directory: re(__dirname, "../locales"), updateFiles: false }) };
      var ce = (null === (he = null === process || void 0 === process ? void 0 : process.env) || void 0 === he ? void 0 : he.YARGS_MIN_NODE_VERSION) ? Number(process.env.YARGS_MIN_NODE_VERSION) : 12;
      if (process && process.version) {
        if (Number(process.version.match(/v([^.]+)/)[1]) < ce) throw Error(`yargs supports a minimum Node.js version of ${ce}. Read our version support policy: https://github.com/yargs/yargs#supported-nodejs-versions`);
      }
      var fe = require_build2();
      var de;
      var ue = { applyExtends: n, cjsPlatformShim: le, Yargs: (de = le, (t2 = [], e2 = de.process.cwd(), s2) => {
        const i2 = new te(t2, e2, s2, de);
        return Object.defineProperty(i2, "argv", { get: () => i2.parse(), enumerable: true }), i2.help(), i2.version(), i2;
      }), argsert: h, isPromise: f, objFilter: g, parseCommand: o, Parser: fe, processArgv: b, YError: e };
      module.exports = ue;
    }
  });

  // node_modules/yargs/index.cjs
  var require_yargs = __commonJS({
    "node_modules/yargs/index.cjs"(exports, module) {
      "use strict";
      var { Yargs, processArgv } = require_build4();
      Argv(processArgv.hideBin(process.argv));
      module.exports = Argv;
      function Argv(processArgs, cwd) {
        const argv = Yargs(processArgs, cwd, __require);
        singletonify(argv);
        return argv;
      }
      function defineGetter(obj, key, getter) {
        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          get: getter
        });
      }
      function lookupGetter(obj, key) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (typeof desc !== "undefined") {
          return desc.get;
        }
      }
      function singletonify(inst) {
        [
          ...Object.keys(inst),
          ...Object.getOwnPropertyNames(inst.constructor.prototype)
        ].forEach((key) => {
          if (key === "argv") {
            defineGetter(Argv, key, lookupGetter(inst, key));
          } else if (typeof inst[key] === "function") {
            Argv[key] = inst[key].bind(inst);
          } else {
            defineGetter(Argv, "$0", () => inst.$0);
            defineGetter(Argv, "parsed", () => inst.parsed);
          }
        });
      }
    }
  });

  // adapters/terminal-adapter.js
  var require_terminal_adapter = __commonJS({
    "adapters/terminal-adapter.js"() {
      "use strict";
      var path = __require("path");
      var fs = __require("fs");
      var csv = require_cjs();
      var style = require_style().style;
      var yargs = require_yargs();
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
        header = __require(path.resolve(yargs.header));
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
        const rl = __require("readline").createInterface({
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
    "src/defaults.js"(exports, module) {
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
      module.exports = defaults;
    }
  });

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
  var require_defaults2 = __commonJS({
    "node_modules/defaults/index.js"(exports, module) {
      "use strict";
      var clone = require_clone();
      module.exports = function(options, defaults) {
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
      var defaults = require_defaults2();
      var combining = require_combining();
      var DEFAULTS = {
        nul: 0,
        control: 0
      };
      module.exports = function wcwidth2(str) {
        return wcswidth(str, DEFAULTS);
      };
      module.exports.config = function(opts) {
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

  // node_modules/breakword/dist/main.js
  var require_main = __commonJS({
    "node_modules/breakword/dist/main.js"(exports, module) {
      "use strict";
      function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
          }
          return arr2;
        } else {
          return Array.from(arr);
        }
      }
      var wcwidth = require_wcwidth();
      module.exports = function(input, breakAtLength) {
        var str = input.toString();
        var charArr = [].concat(_toConsumableArray(str));
        var index = 0;
        var indexOfLastFitChar = 0;
        var fittableLength = 0;
        while (charArr.length > 0) {
          var char = charArr.shift();
          var currentLength = fittableLength + wcwidth(char);
          if (currentLength <= breakAtLength) {
            indexOfLastFitChar = index;
            fittableLength = currentLength;
            index++;
          } else {
            break;
          }
        }
        return indexOfLastFitChar;
      };
    }
  });

  // node_modules/object-keys/isArguments.js
  var require_isArguments = __commonJS({
    "node_modules/object-keys/isArguments.js"(exports, module) {
      "use strict";
      var toStr = Object.prototype.toString;
      module.exports = function isArguments(value) {
        var str = toStr.call(value);
        var isArgs = str === "[object Arguments]";
        if (!isArgs) {
          isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
        }
        return isArgs;
      };
    }
  });

  // node_modules/object-keys/implementation.js
  var require_implementation = __commonJS({
    "node_modules/object-keys/implementation.js"(exports, module) {
      "use strict";
      var keysShim;
      if (!Object.keys) {
        has = Object.prototype.hasOwnProperty;
        toStr = Object.prototype.toString;
        isArgs = require_isArguments();
        isEnumerable = Object.prototype.propertyIsEnumerable;
        hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
        hasProtoEnumBug = isEnumerable.call(function() {
        }, "prototype");
        dontEnums = [
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "constructor"
        ];
        equalsConstructorPrototype = function(o) {
          var ctor = o.constructor;
          return ctor && ctor.prototype === o;
        };
        excludedKeys = {
          $applicationCache: true,
          $console: true,
          $external: true,
          $frame: true,
          $frameElement: true,
          $frames: true,
          $innerHeight: true,
          $innerWidth: true,
          $onmozfullscreenchange: true,
          $onmozfullscreenerror: true,
          $outerHeight: true,
          $outerWidth: true,
          $pageXOffset: true,
          $pageYOffset: true,
          $parent: true,
          $scrollLeft: true,
          $scrollTop: true,
          $scrollX: true,
          $scrollY: true,
          $self: true,
          $webkitIndexedDB: true,
          $webkitStorageInfo: true,
          $window: true
        };
        hasAutomationEqualityBug = (function() {
          if (typeof window === "undefined") {
            return false;
          }
          for (var k in window) {
            try {
              if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
                try {
                  equalsConstructorPrototype(window[k]);
                } catch (e) {
                  return true;
                }
              }
            } catch (e) {
              return true;
            }
          }
          return false;
        })();
        equalsConstructorPrototypeIfNotBuggy = function(o) {
          if (typeof window === "undefined" || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(o);
          }
          try {
            return equalsConstructorPrototype(o);
          } catch (e) {
            return false;
          }
        };
        keysShim = function keys(object) {
          var isObject = object !== null && typeof object === "object";
          var isFunction = toStr.call(object) === "[object Function]";
          var isArguments = isArgs(object);
          var isString = isObject && toStr.call(object) === "[object String]";
          var theKeys = [];
          if (!isObject && !isFunction && !isArguments) {
            throw new TypeError("Object.keys called on a non-object");
          }
          var skipProto = hasProtoEnumBug && isFunction;
          if (isString && object.length > 0 && !has.call(object, 0)) {
            for (var i = 0; i < object.length; ++i) {
              theKeys.push(String(i));
            }
          }
          if (isArguments && object.length > 0) {
            for (var j = 0; j < object.length; ++j) {
              theKeys.push(String(j));
            }
          } else {
            for (var name in object) {
              if (!(skipProto && name === "prototype") && has.call(object, name)) {
                theKeys.push(String(name));
              }
            }
          }
          if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
            for (var k = 0; k < dontEnums.length; ++k) {
              if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
                theKeys.push(dontEnums[k]);
              }
            }
          }
          return theKeys;
        };
      }
      var has;
      var toStr;
      var isArgs;
      var isEnumerable;
      var hasDontEnumBug;
      var hasProtoEnumBug;
      var dontEnums;
      var equalsConstructorPrototype;
      var excludedKeys;
      var hasAutomationEqualityBug;
      var equalsConstructorPrototypeIfNotBuggy;
      module.exports = keysShim;
    }
  });

  // node_modules/object-keys/index.js
  var require_object_keys = __commonJS({
    "node_modules/object-keys/index.js"(exports, module) {
      "use strict";
      var slice = Array.prototype.slice;
      var isArgs = require_isArguments();
      var origKeys = Object.keys;
      var keysShim = origKeys ? function keys(o) {
        return origKeys(o);
      } : require_implementation();
      var originalKeys = Object.keys;
      keysShim.shim = function shimObjectKeys() {
        if (Object.keys) {
          var keysWorksWithArguments = (function() {
            var args = Object.keys(arguments);
            return args && args.length === arguments.length;
          })(1, 2);
          if (!keysWorksWithArguments) {
            Object.keys = function keys(object) {
              if (isArgs(object)) {
                return originalKeys(slice.call(object));
              }
              return originalKeys(object);
            };
          }
        } else {
          Object.keys = keysShim;
        }
        return Object.keys || keysShim;
      };
      module.exports = keysShim;
    }
  });

  // node_modules/es-define-property/index.js
  var require_es_define_property = __commonJS({
    "node_modules/es-define-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      module.exports = $defineProperty;
    }
  });

  // node_modules/es-errors/syntax.js
  var require_syntax = __commonJS({
    "node_modules/es-errors/syntax.js"(exports, module) {
      "use strict";
      module.exports = SyntaxError;
    }
  });

  // node_modules/es-errors/type.js
  var require_type = __commonJS({
    "node_modules/es-errors/type.js"(exports, module) {
      "use strict";
      module.exports = TypeError;
    }
  });

  // node_modules/gopd/gOPD.js
  var require_gOPD = __commonJS({
    "node_modules/gopd/gOPD.js"(exports, module) {
      "use strict";
      module.exports = Object.getOwnPropertyDescriptor;
    }
  });

  // node_modules/gopd/index.js
  var require_gopd = __commonJS({
    "node_modules/gopd/index.js"(exports, module) {
      "use strict";
      var $gOPD = require_gOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      module.exports = $gOPD;
    }
  });

  // node_modules/define-data-property/index.js
  var require_define_data_property = __commonJS({
    "node_modules/define-data-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = require_es_define_property();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var gopd = require_gopd();
      module.exports = function defineDataProperty(obj, property, value) {
        if (!obj || typeof obj !== "object" && typeof obj !== "function") {
          throw new $TypeError("`obj` must be an object or a function`");
        }
        if (typeof property !== "string" && typeof property !== "symbol") {
          throw new $TypeError("`property` must be a string or a symbol`");
        }
        if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
          throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
          throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
          throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
          throw new $TypeError("`loose`, if provided, must be a boolean");
        }
        var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
        var nonWritable = arguments.length > 4 ? arguments[4] : null;
        var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
        var loose = arguments.length > 6 ? arguments[6] : false;
        var desc = !!gopd && gopd(obj, property);
        if ($defineProperty) {
          $defineProperty(obj, property, {
            configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
            enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
            value,
            writable: nonWritable === null && desc ? desc.writable : !nonWritable
          });
        } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
          obj[property] = value;
        } else {
          throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
        }
      };
    }
  });

  // node_modules/has-property-descriptors/index.js
  var require_has_property_descriptors = __commonJS({
    "node_modules/has-property-descriptors/index.js"(exports, module) {
      "use strict";
      var $defineProperty = require_es_define_property();
      var hasPropertyDescriptors = function hasPropertyDescriptors2() {
        return !!$defineProperty;
      };
      hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
        if (!$defineProperty) {
          return null;
        }
        try {
          return $defineProperty([], "length", { value: 1 }).length !== 1;
        } catch (e) {
          return true;
        }
      };
      module.exports = hasPropertyDescriptors;
    }
  });

  // node_modules/define-properties/index.js
  var require_define_properties = __commonJS({
    "node_modules/define-properties/index.js"(exports, module) {
      "use strict";
      var keys = require_object_keys();
      var hasSymbols = typeof Symbol === "function" && typeof /* @__PURE__ */ Symbol("foo") === "symbol";
      var toStr = Object.prototype.toString;
      var concat = Array.prototype.concat;
      var defineDataProperty = require_define_data_property();
      var isFunction = function(fn) {
        return typeof fn === "function" && toStr.call(fn) === "[object Function]";
      };
      var supportsDescriptors = require_has_property_descriptors()();
      var defineProperty = function(object, name, value, predicate) {
        if (name in object) {
          if (predicate === true) {
            if (object[name] === value) {
              return;
            }
          } else if (!isFunction(predicate) || !predicate()) {
            return;
          }
        }
        if (supportsDescriptors) {
          defineDataProperty(object, name, value, true);
        } else {
          defineDataProperty(object, name, value);
        }
      };
      var defineProperties = function(object, map) {
        var predicates = arguments.length > 2 ? arguments[2] : {};
        var props = keys(map);
        if (hasSymbols) {
          props = concat.call(props, Object.getOwnPropertySymbols(map));
        }
        for (var i = 0; i < props.length; i += 1) {
          defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
        }
      };
      defineProperties.supportsDescriptors = !!supportsDescriptors;
      module.exports = defineProperties;
    }
  });

  // node_modules/es-object-atoms/index.js
  var require_es_object_atoms = __commonJS({
    "node_modules/es-object-atoms/index.js"(exports, module) {
      "use strict";
      module.exports = Object;
    }
  });

  // node_modules/es-errors/index.js
  var require_es_errors = __commonJS({
    "node_modules/es-errors/index.js"(exports, module) {
      "use strict";
      module.exports = Error;
    }
  });

  // node_modules/es-errors/eval.js
  var require_eval = __commonJS({
    "node_modules/es-errors/eval.js"(exports, module) {
      "use strict";
      module.exports = EvalError;
    }
  });

  // node_modules/es-errors/range.js
  var require_range = __commonJS({
    "node_modules/es-errors/range.js"(exports, module) {
      "use strict";
      module.exports = RangeError;
    }
  });

  // node_modules/es-errors/ref.js
  var require_ref = __commonJS({
    "node_modules/es-errors/ref.js"(exports, module) {
      "use strict";
      module.exports = ReferenceError;
    }
  });

  // node_modules/es-errors/uri.js
  var require_uri = __commonJS({
    "node_modules/es-errors/uri.js"(exports, module) {
      "use strict";
      module.exports = URIError;
    }
  });

  // node_modules/math-intrinsics/abs.js
  var require_abs = __commonJS({
    "node_modules/math-intrinsics/abs.js"(exports, module) {
      "use strict";
      module.exports = Math.abs;
    }
  });

  // node_modules/math-intrinsics/floor.js
  var require_floor = __commonJS({
    "node_modules/math-intrinsics/floor.js"(exports, module) {
      "use strict";
      module.exports = Math.floor;
    }
  });

  // node_modules/math-intrinsics/max.js
  var require_max = __commonJS({
    "node_modules/math-intrinsics/max.js"(exports, module) {
      "use strict";
      module.exports = Math.max;
    }
  });

  // node_modules/math-intrinsics/min.js
  var require_min = __commonJS({
    "node_modules/math-intrinsics/min.js"(exports, module) {
      "use strict";
      module.exports = Math.min;
    }
  });

  // node_modules/math-intrinsics/pow.js
  var require_pow = __commonJS({
    "node_modules/math-intrinsics/pow.js"(exports, module) {
      "use strict";
      module.exports = Math.pow;
    }
  });

  // node_modules/math-intrinsics/round.js
  var require_round = __commonJS({
    "node_modules/math-intrinsics/round.js"(exports, module) {
      "use strict";
      module.exports = Math.round;
    }
  });

  // node_modules/math-intrinsics/isNaN.js
  var require_isNaN = __commonJS({
    "node_modules/math-intrinsics/isNaN.js"(exports, module) {
      "use strict";
      module.exports = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
    }
  });

  // node_modules/math-intrinsics/sign.js
  var require_sign = __commonJS({
    "node_modules/math-intrinsics/sign.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function sign(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
    }
  });

  // node_modules/has-symbols/shams.js
  var require_shams = __commonJS({
    "node_modules/has-symbols/shams.js"(exports, module) {
      "use strict";
      module.exports = function hasSymbols() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = /* @__PURE__ */ Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _ in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
    }
  });

  // node_modules/has-symbols/index.js
  var require_has_symbols = __commonJS({
    "node_modules/has-symbols/index.js"(exports, module) {
      "use strict";
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = require_shams();
      module.exports = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
    }
  });

  // node_modules/get-proto/Reflect.getPrototypeOf.js
  var require_Reflect_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
    }
  });

  // node_modules/get-proto/Object.getPrototypeOf.js
  var require_Object_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      module.exports = $Object.getPrototypeOf || null;
    }
  });

  // node_modules/function-bind/implementation.js
  var require_implementation2 = __commonJS({
    "node_modules/function-bind/implementation.js"(exports, module) {
      "use strict";
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      module.exports = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result2 = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result2) === result2) {
              return result2;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
    }
  });

  // node_modules/function-bind/index.js
  var require_function_bind = __commonJS({
    "node_modules/function-bind/index.js"(exports, module) {
      "use strict";
      var implementation = require_implementation2();
      module.exports = Function.prototype.bind || implementation;
    }
  });

  // node_modules/call-bind-apply-helpers/functionCall.js
  var require_functionCall = __commonJS({
    "node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.call;
    }
  });

  // node_modules/call-bind-apply-helpers/functionApply.js
  var require_functionApply = __commonJS({
    "node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/reflectApply.js
  var require_reflectApply = __commonJS({
    "node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/actualApply.js
  var require_actualApply = __commonJS({
    "node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var $reflectApply = require_reflectApply();
      module.exports = $reflectApply || bind.call($call, $apply);
    }
  });

  // node_modules/call-bind-apply-helpers/index.js
  var require_call_bind_apply_helpers = __commonJS({
    "node_modules/call-bind-apply-helpers/index.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $TypeError = require_type();
      var $call = require_functionCall();
      var $actualApply = require_actualApply();
      module.exports = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
    }
  });

  // node_modules/dunder-proto/get.js
  var require_get = __commonJS({
    "node_modules/dunder-proto/get.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
    }
  });

  // node_modules/get-proto/index.js
  var require_get_proto = __commonJS({
    "node_modules/get-proto/index.js"(exports, module) {
      "use strict";
      var reflectGetProto = require_Reflect_getPrototypeOf();
      var originalGetProto = require_Object_getPrototypeOf();
      var getDunderProto = require_get();
      module.exports = reflectGetProto ? function getProto(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto(O) {
        return getDunderProto(O);
      } : null;
    }
  });

  // node_modules/hasown/index.js
  var require_hasown = __commonJS({
    "node_modules/hasown/index.js"(exports, module) {
      "use strict";
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = require_function_bind();
      module.exports = bind.call(call, $hasOwn);
    }
  });

  // node_modules/get-intrinsic/index.js
  var require_get_intrinsic = __commonJS({
    "node_modules/get-intrinsic/index.js"(exports, module) {
      "use strict";
      var undefined2;
      var $Object = require_es_object_atoms();
      var $Error = require_es_errors();
      var $EvalError = require_eval();
      var $RangeError = require_range();
      var $ReferenceError = require_ref();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var $URIError = require_uri();
      var abs = require_abs();
      var floor = require_floor();
      var max = require_max();
      var min = require_min();
      var pow = require_pow();
      var round = require_round();
      var sign = require_sign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = require_gopd();
      var $defineProperty = require_es_define_property();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? (function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      })() : throwTypeError;
      var hasSymbols = require_has_symbols()();
      var getProto = require_get_proto();
      var $ObjectGPO = require_Object_getPrototypeOf();
      var $ReflectGPO = require_Reflect_getPrototypeOf();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
        "%AsyncFromSyncIteratorPrototype%": undefined2,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
        "%JSON%": typeof JSON === "object" ? JSON : undefined2,
        "%Map%": typeof Map === "undefined" ? undefined2 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined2 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
        "%Symbol%": hasSymbols ? Symbol : undefined2,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs,
        "%Math.floor%": floor,
        "%Math.max%": max,
        "%Math.min%": min,
        "%Math.pow%": pow,
        "%Math.round%": round,
        "%Math.sign%": sign,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto) {
        try {
          null.error;
        } catch (e) {
          errorProto = getProto(getProto(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var errorProto;
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto) {
            value = getProto(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = require_function_bind();
      var hasOwn = require_hasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = function stringToPath2(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result2 = [];
        $replace(string, rePropName, function(match, number, quote, subString) {
          result2[result2.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
        });
        return result2;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      module.exports = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void undefined2;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
    }
  });

  // node_modules/set-function-length/index.js
  var require_set_function_length = __commonJS({
    "node_modules/set-function-length/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var define = require_define_data_property();
      var hasDescriptors = require_has_property_descriptors()();
      var gOPD = require_gopd();
      var $TypeError = require_type();
      var $floor = GetIntrinsic("%Math.floor%");
      module.exports = function setFunctionLength(fn, length) {
        if (typeof fn !== "function") {
          throw new $TypeError("`fn` is not a function");
        }
        if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
          throw new $TypeError("`length` must be a positive 32-bit integer");
        }
        var loose = arguments.length > 2 && !!arguments[2];
        var functionLengthIsConfigurable = true;
        var functionLengthIsWritable = true;
        if ("length" in fn && gOPD) {
          var desc = gOPD(fn, "length");
          if (desc && !desc.configurable) {
            functionLengthIsConfigurable = false;
          }
          if (desc && !desc.writable) {
            functionLengthIsWritable = false;
          }
        }
        if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
          if (hasDescriptors) {
            define(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length,
              true,
              true
            );
          } else {
            define(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length
            );
          }
        }
        return fn;
      };
    }
  });

  // node_modules/call-bind-apply-helpers/applyBind.js
  var require_applyBind = __commonJS({
    "node_modules/call-bind-apply-helpers/applyBind.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var actualApply = require_actualApply();
      module.exports = function applyBind() {
        return actualApply(bind, $apply, arguments);
      };
    }
  });

  // node_modules/call-bind/index.js
  var require_call_bind = __commonJS({
    "node_modules/call-bind/index.js"(exports, module) {
      "use strict";
      var setFunctionLength = require_set_function_length();
      var $defineProperty = require_es_define_property();
      var callBindBasic = require_call_bind_apply_helpers();
      var applyBind = require_applyBind();
      module.exports = function callBind(originalFunction) {
        var func = callBindBasic(arguments);
        var adjustedLength = 1 + originalFunction.length - (arguments.length - 1);
        return setFunctionLength(
          func,
          adjustedLength > 0 ? adjustedLength : 0,
          true
        );
      };
      if ($defineProperty) {
        $defineProperty(module.exports, "apply", { value: applyBind });
      } else {
        module.exports.apply = applyBind;
      }
    }
  });

  // node_modules/math-intrinsics/isFinite.js
  var require_isFinite = __commonJS({
    "node_modules/math-intrinsics/isFinite.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function isFinite2(x) {
        return (typeof x === "number" || typeof x === "bigint") && !$isNaN(x) && x !== Infinity && x !== -Infinity;
      };
    }
  });

  // node_modules/math-intrinsics/isInteger.js
  var require_isInteger = __commonJS({
    "node_modules/math-intrinsics/isInteger.js"(exports, module) {
      "use strict";
      var $abs = require_abs();
      var $floor = require_floor();
      var $isNaN = require_isNaN();
      var $isFinite = require_isFinite();
      module.exports = function isInteger(argument) {
        if (typeof argument !== "number" || $isNaN(argument) || !$isFinite(argument)) {
          return false;
        }
        var absValue = $abs(argument);
        return $floor(absValue) === absValue;
      };
    }
  });

  // node_modules/es-object-atoms/isObject.js
  var require_isObject = __commonJS({
    "node_modules/es-object-atoms/isObject.js"(exports, module) {
      "use strict";
      module.exports = function isObject(x) {
        return !!x && (typeof x === "function" || typeof x === "object");
      };
    }
  });

  // node_modules/math-intrinsics/constants/maxArrayLength.js
  var require_maxArrayLength = __commonJS({
    "node_modules/math-intrinsics/constants/maxArrayLength.js"(exports, module) {
      "use strict";
      module.exports = 4294967295;
    }
  });

  // node_modules/set-proto/Reflect.setPrototypeOf.js
  var require_Reflect_setPrototypeOf = __commonJS({
    "node_modules/set-proto/Reflect.setPrototypeOf.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect.setPrototypeOf || null;
    }
  });

  // node_modules/set-proto/Object.setPrototypeOf.js
  var require_Object_setPrototypeOf = __commonJS({
    "node_modules/set-proto/Object.setPrototypeOf.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      module.exports = $Object.setPrototypeOf || null;
    }
  });

  // node_modules/dunder-proto/set.js
  var require_set = __commonJS({
    "node_modules/dunder-proto/set.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var $TypeError = require_type();
      var obj = {};
      try {
        obj.__proto__ = null;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var hasProtoMutator = !("toString" in obj);
      var desc = gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      module.exports = hasProtoMutator && // eslint-disable-next-line no-extra-parens
      (!!desc && typeof desc.set === "function" && /** @type {import('./set')} */
      callBind([desc.set]) || /** @type {import('./set')} */
      function setDunder(object, proto) {
        if (object == null) {
          throw new $TypeError("set Object.prototype.__proto__ called on null or undefined");
        }
        object.__proto__ = proto;
        return proto;
      });
    }
  });

  // node_modules/set-proto/index.js
  var require_set_proto = __commonJS({
    "node_modules/set-proto/index.js"(exports, module) {
      "use strict";
      var reflectSetProto = require_Reflect_setPrototypeOf();
      var originalSetProto = require_Object_setPrototypeOf();
      var setDunderProto = require_set();
      var $TypeError = require_type();
      module.exports = reflectSetProto ? function setProto(O, proto) {
        if (reflectSetProto(O, proto)) {
          return O;
        }
        throw new $TypeError("Reflect.setPrototypeOf: failed to set [[Prototype]]");
      } : originalSetProto || (setDunderProto ? function setProto(O, proto) {
        setDunderProto(O, proto);
        return O;
      } : null);
    }
  });

  // node_modules/es-abstract/2024/ArrayCreate.js
  var require_ArrayCreate = __commonJS({
    "node_modules/es-abstract/2024/ArrayCreate.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $ArrayPrototype = GetIntrinsic("%Array.prototype%");
      var $RangeError = require_range();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var isInteger = require_isInteger();
      var MAX_ARRAY_LENGTH = require_maxArrayLength();
      var $setProto = require_set_proto();
      module.exports = function ArrayCreate(length) {
        if (!isInteger(length) || length < 0) {
          throw new $TypeError("Assertion failed: `length` must be an integer Number >= 0");
        }
        if (length > MAX_ARRAY_LENGTH) {
          throw new $RangeError("length is greater than (2**32 - 1)");
        }
        var proto = arguments.length > 1 ? arguments[1] : $ArrayPrototype;
        var A = [];
        if (proto !== $ArrayPrototype) {
          if (!$setProto) {
            throw new $SyntaxError("ArrayCreate: a `proto` argument that is not `Array.prototype` is not supported in an environment that does not support setting the [[Prototype]]");
          }
          $setProto(A, proto);
        }
        if (length !== 0) {
          A.length = length;
        }
        return A;
      };
    }
  });

  // node_modules/object-inspect/util.inspect.js
  var require_util_inspect = __commonJS({
    "node_modules/object-inspect/util.inspect.js"(exports, module) {
      "use strict";
      module.exports = __require("util").inspect;
    }
  });

  // node_modules/object-inspect/index.js
  var require_object_inspect = __commonJS({
    "node_modules/object-inspect/index.js"(exports, module) {
      "use strict";
      var hasMap = typeof Map === "function" && Map.prototype;
      var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
      var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
      var mapForEach = hasMap && Map.prototype.forEach;
      var hasSet = typeof Set === "function" && Set.prototype;
      var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
      var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
      var setForEach = hasSet && Set.prototype.forEach;
      var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
      var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
      var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
      var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
      var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
      var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
      var booleanValueOf = Boolean.prototype.valueOf;
      var objectToString = Object.prototype.toString;
      var functionToString = Function.prototype.toString;
      var $match = String.prototype.match;
      var $slice = String.prototype.slice;
      var $replace = String.prototype.replace;
      var $toUpperCase = String.prototype.toUpperCase;
      var $toLowerCase = String.prototype.toLowerCase;
      var $test = RegExp.prototype.test;
      var $concat = Array.prototype.concat;
      var $join = Array.prototype.join;
      var $arrSlice = Array.prototype.slice;
      var $floor = Math.floor;
      var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
      var gOPS = Object.getOwnPropertySymbols;
      var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
      var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
      var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
      var isEnumerable = Object.prototype.propertyIsEnumerable;
      var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
        return O.__proto__;
      } : null);
      function addNumericSeparator(num, str) {
        if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
          return str;
        }
        var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
        if (typeof num === "number") {
          var int = num < 0 ? -$floor(-num) : $floor(num);
          if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
          }
        }
        return $replace.call(str, sepRegex, "$&_");
      }
      var utilInspect = require_util_inspect();
      var inspectCustom = utilInspect.custom;
      var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
      var quotes = {
        __proto__: null,
        "double": '"',
        single: "'"
      };
      var quoteREs = {
        __proto__: null,
        "double": /(["\\])/g,
        single: /(['\\])/g
      };
      module.exports = function inspect_(obj, options, depth, seen) {
        var opts = options || {};
        if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
          throw new TypeError('option "quoteStyle" must be "single" or "double"');
        }
        if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
          throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
        }
        var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
        if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
          throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
        }
        if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
          throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
        }
        if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
          throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
        }
        var numericSeparator = opts.numericSeparator;
        if (typeof obj === "undefined") {
          return "undefined";
        }
        if (obj === null) {
          return "null";
        }
        if (typeof obj === "boolean") {
          return obj ? "true" : "false";
        }
        if (typeof obj === "string") {
          return inspectString(obj, opts);
        }
        if (typeof obj === "number") {
          if (obj === 0) {
            return Infinity / obj > 0 ? "0" : "-0";
          }
          var str = String(obj);
          return numericSeparator ? addNumericSeparator(obj, str) : str;
        }
        if (typeof obj === "bigint") {
          var bigIntStr = String(obj) + "n";
          return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
        }
        var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
        if (typeof depth === "undefined") {
          depth = 0;
        }
        if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
          return isArray(obj) ? "[Array]" : "[Object]";
        }
        var indent = getIndent(opts, depth);
        if (typeof seen === "undefined") {
          seen = [];
        } else if (indexOf(seen, obj) >= 0) {
          return "[Circular]";
        }
        function inspect(value, from, noIndent) {
          if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
          }
          if (noIndent) {
            var newOpts = {
              depth: opts.depth
            };
            if (has(opts, "quoteStyle")) {
              newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
          }
          return inspect_(value, opts, depth + 1, seen);
        }
        if (typeof obj === "function" && !isRegExp(obj)) {
          var name = nameOf(obj);
          var keys = arrObjKeys(obj, inspect);
          return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
        }
        if (isSymbol(obj)) {
          var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
          return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
        }
        if (isElement(obj)) {
          var s = "<" + $toLowerCase.call(String(obj.nodeName));
          var attrs = obj.attributes || [];
          for (var i = 0; i < attrs.length; i++) {
            s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
          }
          s += ">";
          if (obj.childNodes && obj.childNodes.length) {
            s += "...";
          }
          s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
          return s;
        }
        if (isArray(obj)) {
          if (obj.length === 0) {
            return "[]";
          }
          var xs = arrObjKeys(obj, inspect);
          if (indent && !singleLineValues(xs)) {
            return "[" + indentedJoin(xs, indent) + "]";
          }
          return "[ " + $join.call(xs, ", ") + " ]";
        }
        if (isError(obj)) {
          var parts = arrObjKeys(obj, inspect);
          if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
            return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
          }
          if (parts.length === 0) {
            return "[" + String(obj) + "]";
          }
          return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
        }
        if (typeof obj === "object" && customInspect) {
          if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
          } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
            return obj.inspect();
          }
        }
        if (isMap(obj)) {
          var mapParts = [];
          if (mapForEach) {
            mapForEach.call(obj, function(value, key) {
              mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
            });
          }
          return collectionOf("Map", mapSize.call(obj), mapParts, indent);
        }
        if (isSet(obj)) {
          var setParts = [];
          if (setForEach) {
            setForEach.call(obj, function(value) {
              setParts.push(inspect(value, obj));
            });
          }
          return collectionOf("Set", setSize.call(obj), setParts, indent);
        }
        if (isWeakMap(obj)) {
          return weakCollectionOf("WeakMap");
        }
        if (isWeakSet(obj)) {
          return weakCollectionOf("WeakSet");
        }
        if (isWeakRef(obj)) {
          return weakCollectionOf("WeakRef");
        }
        if (isNumber(obj)) {
          return markBoxed(inspect(Number(obj)));
        }
        if (isBigInt(obj)) {
          return markBoxed(inspect(bigIntValueOf.call(obj)));
        }
        if (isBoolean(obj)) {
          return markBoxed(booleanValueOf.call(obj));
        }
        if (isString(obj)) {
          return markBoxed(inspect(String(obj)));
        }
        if (typeof window !== "undefined" && obj === window) {
          return "{ [object Window] }";
        }
        if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
          return "{ [object globalThis] }";
        }
        if (!isDate(obj) && !isRegExp(obj)) {
          var ys = arrObjKeys(obj, inspect);
          var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
          var protoTag = obj instanceof Object ? "" : "null prototype";
          var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
          var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
          var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
          if (ys.length === 0) {
            return tag + "{}";
          }
          if (indent) {
            return tag + "{" + indentedJoin(ys, indent) + "}";
          }
          return tag + "{ " + $join.call(ys, ", ") + " }";
        }
        return String(obj);
      };
      function wrapQuotes(s, defaultStyle, opts) {
        var style = opts.quoteStyle || defaultStyle;
        var quoteChar = quotes[style];
        return quoteChar + s + quoteChar;
      }
      function quote(s) {
        return $replace.call(String(s), /"/g, "&quot;");
      }
      function canTrustToString(obj) {
        return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
      }
      function isArray(obj) {
        return toStr(obj) === "[object Array]" && canTrustToString(obj);
      }
      function isDate(obj) {
        return toStr(obj) === "[object Date]" && canTrustToString(obj);
      }
      function isRegExp(obj) {
        return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
      }
      function isError(obj) {
        return toStr(obj) === "[object Error]" && canTrustToString(obj);
      }
      function isString(obj) {
        return toStr(obj) === "[object String]" && canTrustToString(obj);
      }
      function isNumber(obj) {
        return toStr(obj) === "[object Number]" && canTrustToString(obj);
      }
      function isBoolean(obj) {
        return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
      }
      function isSymbol(obj) {
        if (hasShammedSymbols) {
          return obj && typeof obj === "object" && obj instanceof Symbol;
        }
        if (typeof obj === "symbol") {
          return true;
        }
        if (!obj || typeof obj !== "object" || !symToString) {
          return false;
        }
        try {
          symToString.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isBigInt(obj) {
        if (!obj || typeof obj !== "object" || !bigIntValueOf) {
          return false;
        }
        try {
          bigIntValueOf.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      var hasOwn = Object.prototype.hasOwnProperty || function(key) {
        return key in this;
      };
      function has(obj, key) {
        return hasOwn.call(obj, key);
      }
      function toStr(obj) {
        return objectToString.call(obj);
      }
      function nameOf(f) {
        if (f.name) {
          return f.name;
        }
        var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
        if (m) {
          return m[1];
        }
        return null;
      }
      function indexOf(xs, x) {
        if (xs.indexOf) {
          return xs.indexOf(x);
        }
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) {
            return i;
          }
        }
        return -1;
      }
      function isMap(x) {
        if (!mapSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          mapSize.call(x);
          try {
            setSize.call(x);
          } catch (s) {
            return true;
          }
          return x instanceof Map;
        } catch (e) {
        }
        return false;
      }
      function isWeakMap(x) {
        if (!weakMapHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakMapHas.call(x, weakMapHas);
          try {
            weakSetHas.call(x, weakSetHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakMap;
        } catch (e) {
        }
        return false;
      }
      function isWeakRef(x) {
        if (!weakRefDeref || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakRefDeref.call(x);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isSet(x) {
        if (!setSize || !x || typeof x !== "object") {
          return false;
        }
        try {
          setSize.call(x);
          try {
            mapSize.call(x);
          } catch (m) {
            return true;
          }
          return x instanceof Set;
        } catch (e) {
        }
        return false;
      }
      function isWeakSet(x) {
        if (!weakSetHas || !x || typeof x !== "object") {
          return false;
        }
        try {
          weakSetHas.call(x, weakSetHas);
          try {
            weakMapHas.call(x, weakMapHas);
          } catch (s) {
            return true;
          }
          return x instanceof WeakSet;
        } catch (e) {
        }
        return false;
      }
      function isElement(x) {
        if (!x || typeof x !== "object") {
          return false;
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
          return true;
        }
        return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
      }
      function inspectString(str, opts) {
        if (str.length > opts.maxStringLength) {
          var remaining = str.length - opts.maxStringLength;
          var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
          return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
        }
        var quoteRE = quoteREs[opts.quoteStyle || "single"];
        quoteRE.lastIndex = 0;
        var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
        return wrapQuotes(s, "single", opts);
      }
      function lowbyte(c) {
        var n = c.charCodeAt(0);
        var x = {
          8: "b",
          9: "t",
          10: "n",
          12: "f",
          13: "r"
        }[n];
        if (x) {
          return "\\" + x;
        }
        return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
      }
      function markBoxed(str) {
        return "Object(" + str + ")";
      }
      function weakCollectionOf(type) {
        return type + " { ? }";
      }
      function collectionOf(type, size, entries, indent) {
        var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
        return type + " (" + size + ") {" + joinedEntries + "}";
      }
      function singleLineValues(xs) {
        for (var i = 0; i < xs.length; i++) {
          if (indexOf(xs[i], "\n") >= 0) {
            return false;
          }
        }
        return true;
      }
      function getIndent(opts, depth) {
        var baseIndent;
        if (opts.indent === "	") {
          baseIndent = "	";
        } else if (typeof opts.indent === "number" && opts.indent > 0) {
          baseIndent = $join.call(Array(opts.indent + 1), " ");
        } else {
          return null;
        }
        return {
          base: baseIndent,
          prev: $join.call(Array(depth + 1), baseIndent)
        };
      }
      function indentedJoin(xs, indent) {
        if (xs.length === 0) {
          return "";
        }
        var lineJoiner = "\n" + indent.prev + indent.base;
        return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
      }
      function arrObjKeys(obj, inspect) {
        var isArr = isArray(obj);
        var xs = [];
        if (isArr) {
          xs.length = obj.length;
          for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
          }
        }
        var syms = typeof gOPS === "function" ? gOPS(obj) : [];
        var symMap;
        if (hasShammedSymbols) {
          symMap = {};
          for (var k = 0; k < syms.length; k++) {
            symMap["$" + syms[k]] = syms[k];
          }
        }
        for (var key in obj) {
          if (!has(obj, key)) {
            continue;
          }
          if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
          }
          if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
            continue;
          } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
          } else {
            xs.push(key + ": " + inspect(obj[key], obj));
          }
        }
        if (typeof gOPS === "function") {
          for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
              xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
            }
          }
        }
        return xs;
      }
    }
  });

  // node_modules/es-abstract/helpers/isPropertyKey.js
  var require_isPropertyKey = __commonJS({
    "node_modules/es-abstract/helpers/isPropertyKey.js"(exports, module) {
      "use strict";
      module.exports = function isPropertyKey(argument) {
        return typeof argument === "string" || typeof argument === "symbol";
      };
    }
  });

  // node_modules/es-abstract/2024/Get.js
  var require_Get = __commonJS({
    "node_modules/es-abstract/2024/Get.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var inspect = require_object_inspect();
      var isPropertyKey = require_isPropertyKey();
      var isObject = require_isObject();
      module.exports = function Get(O, P) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: Type(O) is not Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key, got " + inspect(P));
        }
        return O[P];
      };
    }
  });

  // node_modules/call-bound/index.js
  var require_call_bound = __commonJS({
    "node_modules/call-bound/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBindBasic = require_call_bind_apply_helpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
    }
  });

  // node_modules/es-abstract/helpers/IsArray.js
  var require_IsArray = __commonJS({
    "node_modules/es-abstract/helpers/IsArray.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $Array = GetIntrinsic("%Array%");
      var toStr = !$Array.isArray && require_call_bound()("Object.prototype.toString");
      module.exports = $Array.isArray || function IsArray(argument) {
        return toStr(argument) === "[object Array]";
      };
    }
  });

  // node_modules/es-abstract/2024/IsArray.js
  var require_IsArray2 = __commonJS({
    "node_modules/es-abstract/2024/IsArray.js"(exports, module) {
      "use strict";
      module.exports = require_IsArray();
    }
  });

  // node_modules/es-abstract/GetIntrinsic.js
  var require_GetIntrinsic = __commonJS({
    "node_modules/es-abstract/GetIntrinsic.js"(exports, module) {
      "use strict";
      module.exports = require_get_intrinsic();
    }
  });

  // node_modules/es-abstract/helpers/records/property-descriptor.js
  var require_property_descriptor = __commonJS({
    "node_modules/es-abstract/helpers/records/property-descriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var hasOwn = require_hasown();
      var allowed = {
        __proto__: null,
        "[[Configurable]]": true,
        "[[Enumerable]]": true,
        "[[Get]]": true,
        "[[Set]]": true,
        "[[Value]]": true,
        "[[Writable]]": true
      };
      module.exports = function isPropertyDescriptor(Desc) {
        if (!Desc || typeof Desc !== "object") {
          return false;
        }
        for (var key in Desc) {
          if (hasOwn(Desc, key) && !allowed[key]) {
            return false;
          }
        }
        var isData = hasOwn(Desc, "[[Value]]") || hasOwn(Desc, "[[Writable]]");
        var IsAccessor = hasOwn(Desc, "[[Get]]") || hasOwn(Desc, "[[Set]]");
        if (isData && IsAccessor) {
          throw new $TypeError("Property Descriptors may not be both accessor and data descriptors");
        }
        return true;
      };
    }
  });

  // node_modules/es-abstract/helpers/DefineOwnProperty.js
  var require_DefineOwnProperty = __commonJS({
    "node_modules/es-abstract/helpers/DefineOwnProperty.js"(exports, module) {
      "use strict";
      var hasPropertyDescriptors = require_has_property_descriptors();
      var $defineProperty = require_es_define_property();
      var hasArrayLengthDefineBug = hasPropertyDescriptors.hasArrayLengthDefineBug();
      var isArray = hasArrayLengthDefineBug && require_IsArray();
      var callBound = require_call_bound();
      var $isEnumerable = callBound("Object.prototype.propertyIsEnumerable");
      module.exports = function DefineOwnProperty(IsDataDescriptor, SameValue, FromPropertyDescriptor, O, P, desc) {
        if (!$defineProperty) {
          if (!IsDataDescriptor(desc)) {
            return false;
          }
          if (!desc["[[Configurable]]"] || !desc["[[Writable]]"]) {
            return false;
          }
          if (P in O && $isEnumerable(O, P) !== !!desc["[[Enumerable]]"]) {
            return false;
          }
          var V = desc["[[Value]]"];
          O[P] = V;
          return SameValue(O[P], V);
        }
        if (hasArrayLengthDefineBug && P === "length" && "[[Value]]" in desc && isArray(O) && O.length !== desc["[[Value]]"]) {
          O.length = desc["[[Value]]"];
          return O.length === desc["[[Value]]"];
        }
        $defineProperty(O, P, FromPropertyDescriptor(desc));
        return true;
      };
    }
  });

  // node_modules/es-abstract/helpers/fromPropertyDescriptor.js
  var require_fromPropertyDescriptor = __commonJS({
    "node_modules/es-abstract/helpers/fromPropertyDescriptor.js"(exports, module) {
      "use strict";
      module.exports = function fromPropertyDescriptor(Desc) {
        if (typeof Desc === "undefined") {
          return Desc;
        }
        var obj = {};
        if ("[[Value]]" in Desc) {
          obj.value = Desc["[[Value]]"];
        }
        if ("[[Writable]]" in Desc) {
          obj.writable = !!Desc["[[Writable]]"];
        }
        if ("[[Get]]" in Desc) {
          obj.get = Desc["[[Get]]"];
        }
        if ("[[Set]]" in Desc) {
          obj.set = Desc["[[Set]]"];
        }
        if ("[[Enumerable]]" in Desc) {
          obj.enumerable = !!Desc["[[Enumerable]]"];
        }
        if ("[[Configurable]]" in Desc) {
          obj.configurable = !!Desc["[[Configurable]]"];
        }
        return obj;
      };
    }
  });

  // node_modules/es-abstract/2024/FromPropertyDescriptor.js
  var require_FromPropertyDescriptor = __commonJS({
    "node_modules/es-abstract/2024/FromPropertyDescriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isPropertyDescriptor = require_property_descriptor();
      var fromPropertyDescriptor = require_fromPropertyDescriptor();
      module.exports = function FromPropertyDescriptor(Desc) {
        if (typeof Desc !== "undefined" && !isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: `Desc` must be a Property Descriptor");
        }
        return fromPropertyDescriptor(Desc);
      };
    }
  });

  // node_modules/es-abstract/2024/IsDataDescriptor.js
  var require_IsDataDescriptor = __commonJS({
    "node_modules/es-abstract/2024/IsDataDescriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var hasOwn = require_hasown();
      var isPropertyDescriptor = require_property_descriptor();
      module.exports = function IsDataDescriptor(Desc) {
        if (typeof Desc === "undefined") {
          return false;
        }
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: `Desc` must be a Property Descriptor");
        }
        if (!hasOwn(Desc, "[[Value]]") && !hasOwn(Desc, "[[Writable]]")) {
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/es-abstract/2024/SameValue.js
  var require_SameValue = __commonJS({
    "node_modules/es-abstract/2024/SameValue.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function SameValue(x, y) {
        if (x === y) {
          if (x === 0) {
            return 1 / x === 1 / y;
          }
          return true;
        }
        return $isNaN(x) && $isNaN(y);
      };
    }
  });

  // node_modules/is-callable/index.js
  var require_is_callable = __commonJS({
    "node_modules/is-callable/index.js"(exports, module) {
      "use strict";
      var fnToStr = Function.prototype.toString;
      var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
      var badArrayLike;
      var isCallableMarker;
      if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
        try {
          badArrayLike = Object.defineProperty({}, "length", {
            get: function() {
              throw isCallableMarker;
            }
          });
          isCallableMarker = {};
          reflectApply(function() {
            throw 42;
          }, null, badArrayLike);
        } catch (_) {
          if (_ !== isCallableMarker) {
            reflectApply = null;
          }
        }
      } else {
        reflectApply = null;
      }
      var constructorRegex = /^\s*class\b/;
      var isES6ClassFn = function isES6ClassFunction(value) {
        try {
          var fnStr = fnToStr.call(value);
          return constructorRegex.test(fnStr);
        } catch (e) {
          return false;
        }
      };
      var tryFunctionObject = function tryFunctionToStr(value) {
        try {
          if (isES6ClassFn(value)) {
            return false;
          }
          fnToStr.call(value);
          return true;
        } catch (e) {
          return false;
        }
      };
      var toStr = Object.prototype.toString;
      var objectClass = "[object Object]";
      var fnClass = "[object Function]";
      var genClass = "[object GeneratorFunction]";
      var ddaClass = "[object HTMLAllCollection]";
      var ddaClass2 = "[object HTML document.all class]";
      var ddaClass3 = "[object HTMLCollection]";
      var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
      var isIE68 = !(0 in [,]);
      var isDDA = function isDocumentDotAll() {
        return false;
      };
      if (typeof document === "object") {
        all = document.all;
        if (toStr.call(all) === toStr.call(document.all)) {
          isDDA = function isDocumentDotAll(value) {
            if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
              try {
                var str = toStr.call(value);
                return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
              } catch (e) {
              }
            }
            return false;
          };
        }
      }
      var all;
      module.exports = reflectApply ? function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        try {
          reflectApply(value, null, badArrayLike);
        } catch (e) {
          if (e !== isCallableMarker) {
            return false;
          }
        }
        return !isES6ClassFn(value) && tryFunctionObject(value);
      } : function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        if (hasToStringTag) {
          return tryFunctionObject(value);
        }
        if (isES6ClassFn(value)) {
          return false;
        }
        var strClass = toStr.call(value);
        if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
          return false;
        }
        return tryFunctionObject(value);
      };
    }
  });

  // node_modules/es-abstract/2024/IsCallable.js
  var require_IsCallable = __commonJS({
    "node_modules/es-abstract/2024/IsCallable.js"(exports, module) {
      "use strict";
      module.exports = require_is_callable();
    }
  });

  // node_modules/es-abstract/2024/ToBoolean.js
  var require_ToBoolean = __commonJS({
    "node_modules/es-abstract/2024/ToBoolean.js"(exports, module) {
      "use strict";
      module.exports = function ToBoolean(value) {
        return !!value;
      };
    }
  });

  // node_modules/es-abstract/2024/ToPropertyDescriptor.js
  var require_ToPropertyDescriptor = __commonJS({
    "node_modules/es-abstract/2024/ToPropertyDescriptor.js"(exports, module) {
      "use strict";
      var hasOwn = require_hasown();
      var $TypeError = require_type();
      var isObject = require_isObject();
      var IsCallable = require_IsCallable();
      var ToBoolean = require_ToBoolean();
      module.exports = function ToPropertyDescriptor(Obj) {
        if (!isObject(Obj)) {
          throw new $TypeError("ToPropertyDescriptor requires an object");
        }
        var desc = {};
        if (hasOwn(Obj, "enumerable")) {
          desc["[[Enumerable]]"] = ToBoolean(Obj.enumerable);
        }
        if (hasOwn(Obj, "configurable")) {
          desc["[[Configurable]]"] = ToBoolean(Obj.configurable);
        }
        if (hasOwn(Obj, "value")) {
          desc["[[Value]]"] = Obj.value;
        }
        if (hasOwn(Obj, "writable")) {
          desc["[[Writable]]"] = ToBoolean(Obj.writable);
        }
        if (hasOwn(Obj, "get")) {
          var getter = Obj.get;
          if (typeof getter !== "undefined" && !IsCallable(getter)) {
            throw new $TypeError("getter must be a function");
          }
          desc["[[Get]]"] = getter;
        }
        if (hasOwn(Obj, "set")) {
          var setter = Obj.set;
          if (typeof setter !== "undefined" && !IsCallable(setter)) {
            throw new $TypeError("setter must be a function");
          }
          desc["[[Set]]"] = setter;
        }
        if ((hasOwn(desc, "[[Get]]") || hasOwn(desc, "[[Set]]")) && (hasOwn(desc, "[[Value]]") || hasOwn(desc, "[[Writable]]"))) {
          throw new $TypeError("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute");
        }
        return desc;
      };
    }
  });

  // node_modules/es-abstract/2024/DefinePropertyOrThrow.js
  var require_DefinePropertyOrThrow = __commonJS({
    "node_modules/es-abstract/2024/DefinePropertyOrThrow.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var isPropertyDescriptor = require_property_descriptor();
      var DefineOwnProperty = require_DefineOwnProperty();
      var FromPropertyDescriptor = require_FromPropertyDescriptor();
      var IsDataDescriptor = require_IsDataDescriptor();
      var isPropertyKey = require_isPropertyKey();
      var SameValue = require_SameValue();
      var ToPropertyDescriptor = require_ToPropertyDescriptor();
      module.exports = function DefinePropertyOrThrow(O, P, desc) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: Type(O) is not Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key");
        }
        var Desc = isPropertyDescriptor(desc) ? desc : ToPropertyDescriptor(desc);
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: Desc is not a valid Property Descriptor");
        }
        return DefineOwnProperty(
          IsDataDescriptor,
          SameValue,
          FromPropertyDescriptor,
          O,
          P,
          Desc
        );
      };
    }
  });

  // node_modules/es-abstract/2024/IsConstructor.js
  var require_IsConstructor = __commonJS({
    "node_modules/es-abstract/2024/IsConstructor.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_GetIntrinsic();
      var $construct = GetIntrinsic("%Reflect.construct%", true);
      var DefinePropertyOrThrow = require_DefinePropertyOrThrow();
      try {
        DefinePropertyOrThrow({}, "", { "[[Get]]": function() {
        } });
      } catch (e) {
        DefinePropertyOrThrow = null;
      }
      if (DefinePropertyOrThrow && $construct) {
        isConstructorMarker = {};
        badArrayLike = {};
        DefinePropertyOrThrow(badArrayLike, "length", {
          "[[Get]]": function() {
            throw isConstructorMarker;
          },
          "[[Enumerable]]": true
        });
        module.exports = function IsConstructor(argument) {
          try {
            $construct(argument, badArrayLike);
          } catch (err) {
            return err === isConstructorMarker;
          }
        };
      } else {
        module.exports = function IsConstructor(argument) {
          return typeof argument === "function" && !!argument.prototype;
        };
      }
      var isConstructorMarker;
      var badArrayLike;
    }
  });

  // node_modules/es-abstract/2024/ArraySpeciesCreate.js
  var require_ArraySpeciesCreate = __commonJS({
    "node_modules/es-abstract/2024/ArraySpeciesCreate.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $species = GetIntrinsic("%Symbol.species%", true);
      var $TypeError = require_type();
      var isInteger = require_isInteger();
      var isObject = require_isObject();
      var ArrayCreate = require_ArrayCreate();
      var Get = require_Get();
      var IsArray = require_IsArray2();
      var IsConstructor = require_IsConstructor();
      module.exports = function ArraySpeciesCreate(originalArray, length) {
        if (!isInteger(length) || length < 0) {
          throw new $TypeError("Assertion failed: length must be an integer >= 0");
        }
        var isArray = IsArray(originalArray);
        if (!isArray) {
          return ArrayCreate(length);
        }
        var C = Get(originalArray, "constructor");
        if ($species && isObject(C)) {
          C = Get(C, $species);
          if (C === null) {
            C = void 0;
          }
        }
        if (typeof C === "undefined") {
          return ArrayCreate(length);
        }
        if (!IsConstructor(C)) {
          throw new $TypeError("C must be a constructor");
        }
        return new C(length);
      };
    }
  });

  // node_modules/math-intrinsics/constants/maxSafeInteger.js
  var require_maxSafeInteger = __commonJS({
    "node_modules/math-intrinsics/constants/maxSafeInteger.js"(exports, module) {
      "use strict";
      module.exports = /** @type {import('./maxSafeInteger')} */
      Number.MAX_SAFE_INTEGER || 9007199254740991;
    }
  });

  // node_modules/es-abstract/2024/Call.js
  var require_Call = __commonJS({
    "node_modules/es-abstract/2024/Call.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBound = require_call_bound();
      var $TypeError = require_type();
      var IsArray = require_IsArray2();
      var $apply = GetIntrinsic("%Reflect.apply%", true) || callBound("Function.prototype.apply");
      module.exports = function Call(F, V) {
        var argumentsList = arguments.length > 2 ? arguments[2] : [];
        if (!IsArray(argumentsList)) {
          throw new $TypeError("Assertion failed: optional `argumentsList`, if provided, must be a List");
        }
        return $apply(F, V, argumentsList);
      };
    }
  });

  // node_modules/es-abstract/2024/IsAccessorDescriptor.js
  var require_IsAccessorDescriptor = __commonJS({
    "node_modules/es-abstract/2024/IsAccessorDescriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var hasOwn = require_hasown();
      var isPropertyDescriptor = require_property_descriptor();
      module.exports = function IsAccessorDescriptor(Desc) {
        if (typeof Desc === "undefined") {
          return false;
        }
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: `Desc` must be a Property Descriptor");
        }
        if (!hasOwn(Desc, "[[Get]]") && !hasOwn(Desc, "[[Set]]")) {
          return false;
        }
        return true;
      };
    }
  });

  // node_modules/es-abstract/helpers/isPrimitive.js
  var require_isPrimitive = __commonJS({
    "node_modules/es-abstract/helpers/isPrimitive.js"(exports, module) {
      "use strict";
      module.exports = function isPrimitive(value) {
        return value === null || typeof value !== "function" && typeof value !== "object";
      };
    }
  });

  // node_modules/es-abstract/2024/IsExtensible.js
  var require_IsExtensible = __commonJS({
    "node_modules/es-abstract/2024/IsExtensible.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $preventExtensions = GetIntrinsic("%Object.preventExtensions%", true);
      var $isExtensible = GetIntrinsic("%Object.isExtensible%", true);
      var isPrimitive = require_isPrimitive();
      module.exports = $preventExtensions ? function IsExtensible(obj) {
        return !isPrimitive(obj) && $isExtensible(obj);
      } : function IsExtensible(obj) {
        return !isPrimitive(obj);
      };
    }
  });

  // node_modules/es-abstract/helpers/isFullyPopulatedPropertyDescriptor.js
  var require_isFullyPopulatedPropertyDescriptor = __commonJS({
    "node_modules/es-abstract/helpers/isFullyPopulatedPropertyDescriptor.js"(exports, module) {
      "use strict";
      var isPropertyDescriptor = require_property_descriptor();
      module.exports = function isFullyPopulatedPropertyDescriptor(ES, Desc) {
        return isPropertyDescriptor(Desc) && "[[Enumerable]]" in Desc && "[[Configurable]]" in Desc && (ES.IsAccessorDescriptor(Desc) || ES.IsDataDescriptor(Desc));
      };
    }
  });

  // node_modules/es-abstract/2024/IsGenericDescriptor.js
  var require_IsGenericDescriptor = __commonJS({
    "node_modules/es-abstract/2024/IsGenericDescriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var IsAccessorDescriptor = require_IsAccessorDescriptor();
      var IsDataDescriptor = require_IsDataDescriptor();
      var isPropertyDescriptor = require_property_descriptor();
      module.exports = function IsGenericDescriptor(Desc) {
        if (typeof Desc === "undefined") {
          return false;
        }
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: `Desc` must be a Property Descriptor");
        }
        if (!IsAccessorDescriptor(Desc) && !IsDataDescriptor(Desc)) {
          return true;
        }
        return false;
      };
    }
  });

  // node_modules/es-abstract/2024/ValidateAndApplyPropertyDescriptor.js
  var require_ValidateAndApplyPropertyDescriptor = __commonJS({
    "node_modules/es-abstract/2024/ValidateAndApplyPropertyDescriptor.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var DefineOwnProperty = require_DefineOwnProperty();
      var isFullyPopulatedPropertyDescriptor = require_isFullyPopulatedPropertyDescriptor();
      var isPropertyDescriptor = require_property_descriptor();
      var FromPropertyDescriptor = require_FromPropertyDescriptor();
      var IsAccessorDescriptor = require_IsAccessorDescriptor();
      var IsDataDescriptor = require_IsDataDescriptor();
      var IsGenericDescriptor = require_IsGenericDescriptor();
      var isPropertyKey = require_isPropertyKey();
      var SameValue = require_SameValue();
      module.exports = function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
        if (typeof O !== "undefined" && !isObject(O)) {
          throw new $TypeError("Assertion failed: O must be undefined or an Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P must be a Property Key");
        }
        if (typeof extensible !== "boolean") {
          throw new $TypeError("Assertion failed: extensible must be a Boolean");
        }
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: Desc must be a Property Descriptor");
        }
        if (typeof current !== "undefined" && !isPropertyDescriptor(current)) {
          throw new $TypeError("Assertion failed: current must be a Property Descriptor, or undefined");
        }
        if (typeof current === "undefined") {
          if (!extensible) {
            return false;
          }
          if (typeof O === "undefined") {
            return true;
          }
          if (IsAccessorDescriptor(Desc)) {
            return DefineOwnProperty(
              IsDataDescriptor,
              SameValue,
              FromPropertyDescriptor,
              O,
              P,
              Desc
            );
          }
          return DefineOwnProperty(
            IsDataDescriptor,
            SameValue,
            FromPropertyDescriptor,
            O,
            P,
            {
              "[[Configurable]]": !!Desc["[[Configurable]]"],
              "[[Enumerable]]": !!Desc["[[Enumerable]]"],
              "[[Value]]": Desc["[[Value]]"],
              "[[Writable]]": !!Desc["[[Writable]]"]
            }
          );
        }
        if (!isFullyPopulatedPropertyDescriptor(
          {
            IsAccessorDescriptor,
            IsDataDescriptor
          },
          current
        )) {
          throw new $TypeError("`current`, when present, must be a fully populated and valid Property Descriptor");
        }
        if (!current["[[Configurable]]"]) {
          if ("[[Configurable]]" in Desc && Desc["[[Configurable]]"]) {
            return false;
          }
          if ("[[Enumerable]]" in Desc && !SameValue(Desc["[[Enumerable]]"], current["[[Enumerable]]"])) {
            return false;
          }
          if (!IsGenericDescriptor(Desc) && !SameValue(IsAccessorDescriptor(Desc), IsAccessorDescriptor(current))) {
            return false;
          }
          if (IsAccessorDescriptor(current)) {
            if ("[[Get]]" in Desc && !SameValue(Desc["[[Get]]"], current["[[Get]]"])) {
              return false;
            }
            if ("[[Set]]" in Desc && !SameValue(Desc["[[Set]]"], current["[[Set]]"])) {
              return false;
            }
          } else if (!current["[[Writable]]"]) {
            if ("[[Writable]]" in Desc && Desc["[[Writable]]"]) {
              return false;
            }
            if ("[[Value]]" in Desc && !SameValue(Desc["[[Value]]"], current["[[Value]]"])) {
              return false;
            }
          }
        }
        if (typeof O !== "undefined") {
          var configurable;
          var enumerable;
          if (IsDataDescriptor(current) && IsAccessorDescriptor(Desc)) {
            configurable = ("[[Configurable]]" in Desc ? Desc : current)["[[Configurable]]"];
            enumerable = ("[[Enumerable]]" in Desc ? Desc : current)["[[Enumerable]]"];
            return DefineOwnProperty(
              IsDataDescriptor,
              SameValue,
              FromPropertyDescriptor,
              O,
              P,
              {
                "[[Configurable]]": !!configurable,
                "[[Enumerable]]": !!enumerable,
                "[[Get]]": ("[[Get]]" in Desc ? Desc : current)["[[Get]]"],
                "[[Set]]": ("[[Set]]" in Desc ? Desc : current)["[[Set]]"]
              }
            );
          } else if (IsAccessorDescriptor(current) && IsDataDescriptor(Desc)) {
            configurable = ("[[Configurable]]" in Desc ? Desc : current)["[[Configurable]]"];
            enumerable = ("[[Enumerable]]" in Desc ? Desc : current)["[[Enumerable]]"];
            return DefineOwnProperty(
              IsDataDescriptor,
              SameValue,
              FromPropertyDescriptor,
              O,
              P,
              {
                "[[Configurable]]": !!configurable,
                "[[Enumerable]]": !!enumerable,
                "[[Value]]": ("[[Value]]" in Desc ? Desc : current)["[[Value]]"],
                "[[Writable]]": !!("[[Writable]]" in Desc ? Desc : current)["[[Writable]]"]
              }
            );
          }
          return DefineOwnProperty(
            IsDataDescriptor,
            SameValue,
            FromPropertyDescriptor,
            O,
            P,
            Desc
          );
        }
        return true;
      };
    }
  });

  // node_modules/es-abstract/2024/OrdinaryDefineOwnProperty.js
  var require_OrdinaryDefineOwnProperty = __commonJS({
    "node_modules/es-abstract/2024/OrdinaryDefineOwnProperty.js"(exports, module) {
      "use strict";
      var $gOPD = require_gopd();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var isObject = require_isObject();
      var isPropertyDescriptor = require_property_descriptor();
      var IsAccessorDescriptor = require_IsAccessorDescriptor();
      var IsExtensible = require_IsExtensible();
      var isPropertyKey = require_isPropertyKey();
      var ToPropertyDescriptor = require_ToPropertyDescriptor();
      var SameValue = require_SameValue();
      var ValidateAndApplyPropertyDescriptor = require_ValidateAndApplyPropertyDescriptor();
      module.exports = function OrdinaryDefineOwnProperty(O, P, Desc) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: O must be an Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P must be a Property Key");
        }
        if (!isPropertyDescriptor(Desc)) {
          throw new $TypeError("Assertion failed: Desc must be a Property Descriptor");
        }
        if (!$gOPD) {
          if (IsAccessorDescriptor(Desc)) {
            throw new $SyntaxError("This environment does not support accessor property descriptors.");
          }
          var creatingNormalDataProperty = !(P in O) && Desc["[[Writable]]"] && Desc["[[Enumerable]]"] && Desc["[[Configurable]]"] && "[[Value]]" in Desc;
          var settingExistingDataProperty = P in O && (!("[[Configurable]]" in Desc) || Desc["[[Configurable]]"]) && (!("[[Enumerable]]" in Desc) || Desc["[[Enumerable]]"]) && (!("[[Writable]]" in Desc) || Desc["[[Writable]]"]) && "[[Value]]" in Desc;
          if (creatingNormalDataProperty || settingExistingDataProperty) {
            O[P] = Desc["[[Value]]"];
            return SameValue(O[P], Desc["[[Value]]"]);
          }
          throw new $SyntaxError("This environment does not support defining non-writable, non-enumerable, or non-configurable properties");
        }
        var desc = $gOPD(O, P);
        var current = desc && ToPropertyDescriptor(desc);
        var extensible = IsExtensible(O);
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
      };
    }
  });

  // node_modules/es-abstract/2024/CreateDataProperty.js
  var require_CreateDataProperty = __commonJS({
    "node_modules/es-abstract/2024/CreateDataProperty.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var isPropertyKey = require_isPropertyKey();
      var OrdinaryDefineOwnProperty = require_OrdinaryDefineOwnProperty();
      module.exports = function CreateDataProperty(O, P, V) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: Type(O) is not Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key");
        }
        var newDesc = {
          "[[Configurable]]": true,
          "[[Enumerable]]": true,
          "[[Value]]": V,
          "[[Writable]]": true
        };
        return OrdinaryDefineOwnProperty(O, P, newDesc);
      };
    }
  });

  // node_modules/es-abstract/2024/CreateDataPropertyOrThrow.js
  var require_CreateDataPropertyOrThrow = __commonJS({
    "node_modules/es-abstract/2024/CreateDataPropertyOrThrow.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var CreateDataProperty = require_CreateDataProperty();
      var isPropertyKey = require_isPropertyKey();
      module.exports = function CreateDataPropertyOrThrow(O, P, V) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: Type(O) is not Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key");
        }
        var success = CreateDataProperty(O, P, V);
        if (!success) {
          throw new $TypeError("unable to create data property");
        }
      };
    }
  });

  // node_modules/es-abstract/2024/HasProperty.js
  var require_HasProperty = __commonJS({
    "node_modules/es-abstract/2024/HasProperty.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var isPropertyKey = require_isPropertyKey();
      module.exports = function HasProperty(O, P) {
        if (!isObject(O)) {
          throw new $TypeError("Assertion failed: `O` must be an Object");
        }
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: `P` must be a Property Key");
        }
        return P in O;
      };
    }
  });

  // node_modules/has-tostringtag/shams.js
  var require_shams2 = __commonJS({
    "node_modules/has-tostringtag/shams.js"(exports, module) {
      "use strict";
      var hasSymbols = require_shams();
      module.exports = function hasToStringTagShams() {
        return hasSymbols() && !!Symbol.toStringTag;
      };
    }
  });

  // node_modules/is-date-object/index.js
  var require_is_date_object = __commonJS({
    "node_modules/is-date-object/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var getDay = callBound("Date.prototype.getDay");
      var tryDateObject = function tryDateGetDayCall(value) {
        try {
          getDay(value);
          return true;
        } catch (e) {
          return false;
        }
      };
      var toStr = callBound("Object.prototype.toString");
      var dateClass = "[object Date]";
      var hasToStringTag = require_shams2()();
      module.exports = function isDateObject(value) {
        if (typeof value !== "object" || value === null) {
          return false;
        }
        return hasToStringTag ? tryDateObject(value) : toStr(value) === dateClass;
      };
    }
  });

  // node_modules/is-regex/index.js
  var require_is_regex = __commonJS({
    "node_modules/is-regex/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var hasToStringTag = require_shams2()();
      var hasOwn = require_hasown();
      var gOPD = require_gopd();
      var fn;
      if (hasToStringTag) {
        $exec = callBound("RegExp.prototype.exec");
        isRegexMarker = {};
        throwRegexMarker = function() {
          throw isRegexMarker;
        };
        badStringifier = {
          toString: throwRegexMarker,
          valueOf: throwRegexMarker
        };
        if (typeof Symbol.toPrimitive === "symbol") {
          badStringifier[Symbol.toPrimitive] = throwRegexMarker;
        }
        fn = function isRegex(value) {
          if (!value || typeof value !== "object") {
            return false;
          }
          var descriptor = (
            /** @type {NonNullable<typeof gOPD>} */
            gOPD(
              /** @type {{ lastIndex?: unknown }} */
              value,
              "lastIndex"
            )
          );
          var hasLastIndexDataProperty = descriptor && hasOwn(descriptor, "value");
          if (!hasLastIndexDataProperty) {
            return false;
          }
          try {
            $exec(
              value,
              /** @type {string} */
              /** @type {unknown} */
              badStringifier
            );
          } catch (e) {
            return e === isRegexMarker;
          }
        };
      } else {
        $toString = callBound("Object.prototype.toString");
        regexClass = "[object RegExp]";
        fn = function isRegex(value) {
          if (!value || typeof value !== "object" && typeof value !== "function") {
            return false;
          }
          return $toString(value) === regexClass;
        };
      }
      var $exec;
      var isRegexMarker;
      var throwRegexMarker;
      var badStringifier;
      var $toString;
      var regexClass;
      module.exports = fn;
    }
  });

  // node_modules/safe-regex-test/index.js
  var require_safe_regex_test = __commonJS({
    "node_modules/safe-regex-test/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var isRegex = require_is_regex();
      var $exec = callBound("RegExp.prototype.exec");
      var $TypeError = require_type();
      module.exports = function regexTester(regex) {
        if (!isRegex(regex)) {
          throw new $TypeError("`regex` must be a RegExp");
        }
        return function test(s) {
          return $exec(regex, s) !== null;
        };
      };
    }
  });

  // node_modules/is-symbol/index.js
  var require_is_symbol = __commonJS({
    "node_modules/is-symbol/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var $toString = callBound("Object.prototype.toString");
      var hasSymbols = require_has_symbols()();
      var safeRegexTest = require_safe_regex_test();
      if (hasSymbols) {
        $symToStr = callBound("Symbol.prototype.toString");
        isSymString = safeRegexTest(/^Symbol\(.*\)$/);
        isSymbolObject = function isRealSymbolObject(value) {
          if (typeof value.valueOf() !== "symbol") {
            return false;
          }
          return isSymString($symToStr(value));
        };
        module.exports = function isSymbol(value) {
          if (typeof value === "symbol") {
            return true;
          }
          if (!value || typeof value !== "object" || $toString(value) !== "[object Symbol]") {
            return false;
          }
          try {
            return isSymbolObject(value);
          } catch (e) {
            return false;
          }
        };
      } else {
        module.exports = function isSymbol(value) {
          return false;
        };
      }
      var $symToStr;
      var isSymString;
      var isSymbolObject;
    }
  });

  // node_modules/es-to-primitive/helpers/isPrimitive.js
  var require_isPrimitive2 = __commonJS({
    "node_modules/es-to-primitive/helpers/isPrimitive.js"(exports, module) {
      "use strict";
      module.exports = function isPrimitive(value) {
        return value === null || typeof value !== "function" && typeof value !== "object";
      };
    }
  });

  // node_modules/es-abstract-get/isPropertyKey.js
  var require_isPropertyKey2 = __commonJS({
    "node_modules/es-abstract-get/isPropertyKey.js"(exports, module) {
      "use strict";
      module.exports = function isPropertyKey(argument) {
        return typeof argument === "string" || typeof argument === "symbol";
      };
    }
  });

  // node_modules/es-abstract-get/GetV.js
  var require_GetV = __commonJS({
    "node_modules/es-abstract-get/GetV.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var inspect = require_object_inspect();
      var isPropertyKey = require_isPropertyKey2();
      module.exports = function GetV(V, P) {
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key, got " + inspect(P));
        }
        return (
          /** @type {Record<typeof P, unknown>} */
          V[P]
        );
      };
    }
  });

  // node_modules/es-abstract-get/GetMethod.js
  var require_GetMethod = __commonJS({
    "node_modules/es-abstract-get/GetMethod.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isCallable = require_is_callable();
      var inspect = require_object_inspect();
      var GetV = require_GetV();
      var isPropertyKey = require_isPropertyKey2();
      module.exports = function GetMethod(O, P) {
        if (!isPropertyKey(P)) {
          throw new $TypeError("Assertion failed: P is not a Property Key");
        }
        var func = GetV(O, P);
        if (func == null) {
          return void 0;
        }
        if (!isCallable(func)) {
          throw new $TypeError(inspect(P) + " is not a function: " + inspect(func));
        }
        return func;
      };
    }
  });

  // node_modules/es-to-primitive/es2015.js
  var require_es2015 = __commonJS({
    "node_modules/es-to-primitive/es2015.js"(exports, module) {
      "use strict";
      var hasSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "symbol";
      var isCallable = require_is_callable();
      var isDate = require_is_date_object();
      var isSymbol = require_is_symbol();
      var $TypeError = require_type();
      var isPrimitive = require_isPrimitive2();
      function OrdinaryToPrimitive(O, hint) {
        if (typeof O === "undefined" || O === null) {
          throw new $TypeError("Cannot call method on " + O);
        }
        if (typeof hint !== "string" || hint !== "number" && hint !== "string") {
          throw new $TypeError('hint must be "string" or "number"');
        }
        var methodNames = hint === "string" ? ["toString", "valueOf"] : ["valueOf", "toString"];
        var method, result2, i;
        for (i = 0; i < methodNames.length; ++i) {
          method = O[methodNames[i]];
          if (isCallable(method)) {
            result2 = method.call(O);
            if (isPrimitive(result2)) {
              return (
                /** @type {primitiveES6} */
                result2
              );
            }
          }
        }
        throw new $TypeError("No default value");
      }
      var GetMethod = require_GetMethod();
      module.exports = function ToPrimitive(input) {
        if (isPrimitive(input)) {
          return (
            /** @type {primitiveES6} */
            input
          );
        }
        var hint = "default";
        if (arguments.length > 1) {
          if (arguments[1] === String) {
            hint = "string";
          } else if (arguments[1] === Number) {
            hint = "number";
          }
        }
        var exoticToPrim;
        if (hasSymbols) {
          if (Symbol.toPrimitive) {
            exoticToPrim = GetMethod(
              /** @type {{ [k in SymbolConstructor['toPrimitive']]?: Function }} */
              input,
              Symbol.toPrimitive
            );
          } else if (isSymbol(input)) {
            exoticToPrim = Symbol.prototype.valueOf;
          }
        }
        if (typeof exoticToPrim !== "undefined") {
          var result2 = exoticToPrim.call(input, hint);
          if (isPrimitive(result2)) {
            return (
              /** @type {primitiveES6} */
              result2
            );
          }
          throw new $TypeError("unable to convert exotic object to primitive");
        }
        if (hint === "default" && (isDate(input) || isSymbol(input))) {
          hint = /** @type {const} */
          "string";
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
      };
    }
  });

  // node_modules/es-abstract/2024/ToPrimitive.js
  var require_ToPrimitive = __commonJS({
    "node_modules/es-abstract/2024/ToPrimitive.js"(exports, module) {
      "use strict";
      var toPrimitive = require_es2015();
      module.exports = function ToPrimitive(input) {
        if (arguments.length > 1) {
          return toPrimitive(input, arguments[1]);
        }
        return toPrimitive(input);
      };
    }
  });

  // node_modules/es-object-atoms/RequireObjectCoercible.js
  var require_RequireObjectCoercible = __commonJS({
    "node_modules/es-object-atoms/RequireObjectCoercible.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      module.exports = function RequireObjectCoercible(value) {
        if (value == null) {
          throw new $TypeError(arguments.length > 0 && arguments[1] || "Cannot call method on " + value);
        }
        return value;
      };
    }
  });

  // node_modules/es-abstract/2025/ToString.js
  var require_ToString = __commonJS({
    "node_modules/es-abstract/2025/ToString.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $String = GetIntrinsic("%String%");
      var $TypeError = require_type();
      module.exports = function ToString(argument) {
        if (typeof argument === "symbol") {
          throw new $TypeError("Cannot convert a Symbol value to a string");
        }
        return $String(argument);
      };
    }
  });

  // node_modules/string.prototype.trim/implementation.js
  var require_implementation3 = __commonJS({
    "node_modules/string.prototype.trim/implementation.js"(exports, module) {
      "use strict";
      var RequireObjectCoercible = require_RequireObjectCoercible();
      var ToString = require_ToString();
      var callBound = require_call_bound();
      var safeRegexTester = require_safe_regex_test();
      var $replace = callBound("String.prototype.replace");
      var $charAt = callBound("String.prototype.charAt");
      var $slice = callBound("String.prototype.slice");
      var mvsIsWS = /^\s$/.test("\u180E");
      var leftWhitespace = mvsIsWS ? /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/ : /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
      var isWhitespace = safeRegexTester(mvsIsWS ? /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]$/ : /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]$/);
      module.exports = function trim() {
        var S = $replace(ToString(RequireObjectCoercible(this)), leftWhitespace, "");
        var end = S.length;
        while (end > 0 && isWhitespace($charAt(S, end - 1))) {
          end -= 1;
        }
        return $slice(S, 0, end);
      };
    }
  });

  // node_modules/string.prototype.trim/polyfill.js
  var require_polyfill = __commonJS({
    "node_modules/string.prototype.trim/polyfill.js"(exports, module) {
      "use strict";
      var implementation = require_implementation3();
      var zeroWidthSpace = "\u200B";
      var mongolianVowelSeparator = "\u180E";
      module.exports = function getPolyfill() {
        if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace && mongolianVowelSeparator.trim() === mongolianVowelSeparator && ("_" + mongolianVowelSeparator).trim() === "_" + mongolianVowelSeparator && (mongolianVowelSeparator + "_").trim() === mongolianVowelSeparator + "_") {
          return String.prototype.trim;
        }
        return implementation;
      };
    }
  });

  // node_modules/string.prototype.trim/shim.js
  var require_shim = __commonJS({
    "node_modules/string.prototype.trim/shim.js"(exports, module) {
      "use strict";
      var supportsDescriptors = require_has_property_descriptors()();
      var defineDataProperty = require_define_data_property();
      var getPolyfill = require_polyfill();
      module.exports = function shimStringTrim() {
        var polyfill = getPolyfill();
        if (String.prototype.trim !== polyfill) {
          if (supportsDescriptors) {
            defineDataProperty(String.prototype, "trim", polyfill, true);
          } else {
            defineDataProperty(String.prototype, "trim", polyfill);
          }
        }
        return polyfill;
      };
    }
  });

  // node_modules/string.prototype.trim/index.js
  var require_string_prototype = __commonJS({
    "node_modules/string.prototype.trim/index.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind();
      var define = require_define_properties();
      var RequireObjectCoercible = require_RequireObjectCoercible();
      var implementation = require_implementation3();
      var getPolyfill = require_polyfill();
      var shim = require_shim();
      var bound = callBind(getPolyfill());
      var boundMethod = function trim(receiver) {
        RequireObjectCoercible(receiver);
        return bound(receiver);
      };
      define(boundMethod, {
        getPolyfill,
        implementation,
        shim
      });
      module.exports = boundMethod;
    }
  });

  // node_modules/es-abstract/2024/StringToNumber.js
  var require_StringToNumber = __commonJS({
    "node_modules/es-abstract/2024/StringToNumber.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $RegExp = GetIntrinsic("%RegExp%");
      var $TypeError = require_type();
      var $parseInteger = GetIntrinsic("%parseInt%");
      var callBound = require_call_bound();
      var regexTester = require_safe_regex_test();
      var $strSlice = callBound("String.prototype.slice");
      var isBinary = regexTester(/^0b[01]+$/i);
      var isOctal = regexTester(/^0o[0-7]+$/i);
      var isInvalidHexLiteral = regexTester(/^[-+]0x[0-9a-f]+$/i);
      var nonWS = ["\x85", "\u200B", "\uFFFE"].join("");
      var nonWSregex = new $RegExp("[" + nonWS + "]", "g");
      var hasNonWS = regexTester(nonWSregex);
      var $trim = require_string_prototype();
      module.exports = function StringToNumber(argument) {
        if (typeof argument !== "string") {
          throw new $TypeError("Assertion failed: `argument` is not a String");
        }
        if (isBinary(argument)) {
          return +$parseInteger($strSlice(argument, 2), 2);
        }
        if (isOctal(argument)) {
          return +$parseInteger($strSlice(argument, 2), 8);
        }
        if (hasNonWS(argument) || isInvalidHexLiteral(argument)) {
          return NaN;
        }
        var trimmed = $trim(argument);
        if (trimmed !== argument) {
          return StringToNumber(trimmed);
        }
        return +argument;
      };
    }
  });

  // node_modules/es-abstract/2024/ToNumber.js
  var require_ToNumber = __commonJS({
    "node_modules/es-abstract/2024/ToNumber.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $TypeError = require_type();
      var $Number = GetIntrinsic("%Number%");
      var isPrimitive = require_isPrimitive();
      var ToPrimitive = require_ToPrimitive();
      var StringToNumber = require_StringToNumber();
      module.exports = function ToNumber(argument) {
        var value = isPrimitive(argument) ? argument : ToPrimitive(argument, $Number);
        if (typeof value === "symbol") {
          throw new $TypeError("Cannot convert a Symbol value to a number");
        }
        if (typeof value === "bigint") {
          throw new $TypeError("Conversion from 'BigInt' to 'number' is not allowed.");
        }
        if (typeof value === "string") {
          return StringToNumber(value);
        }
        return +value;
      };
    }
  });

  // node_modules/es-abstract/2024/floor.js
  var require_floor2 = __commonJS({
    "node_modules/es-abstract/2024/floor.js"(exports, module) {
      "use strict";
      var $floor = require_floor();
      module.exports = function floor(x) {
        if (typeof x === "bigint") {
          return x;
        }
        return $floor(x);
      };
    }
  });

  // node_modules/es-abstract/2024/truncate.js
  var require_truncate = __commonJS({
    "node_modules/es-abstract/2024/truncate.js"(exports, module) {
      "use strict";
      var floor = require_floor2();
      var $TypeError = require_type();
      module.exports = function truncate(x) {
        if (typeof x !== "number" && typeof x !== "bigint") {
          throw new $TypeError("argument must be a Number or a BigInt");
        }
        var result2 = x < 0 ? -floor(-x) : floor(x);
        return result2 === 0 ? 0 : result2;
      };
    }
  });

  // node_modules/es-abstract/2024/ToIntegerOrInfinity.js
  var require_ToIntegerOrInfinity = __commonJS({
    "node_modules/es-abstract/2024/ToIntegerOrInfinity.js"(exports, module) {
      "use strict";
      var ToNumber = require_ToNumber();
      var truncate = require_truncate();
      var $isNaN = require_isNaN();
      var $isFinite = require_isFinite();
      module.exports = function ToIntegerOrInfinity(value) {
        var number = ToNumber(value);
        if ($isNaN(number) || number === 0) {
          return 0;
        }
        if (!$isFinite(number)) {
          return number;
        }
        return truncate(number);
      };
    }
  });

  // node_modules/es-abstract/2024/ToLength.js
  var require_ToLength = __commonJS({
    "node_modules/es-abstract/2024/ToLength.js"(exports, module) {
      "use strict";
      var MAX_SAFE_INTEGER = require_maxSafeInteger();
      var ToIntegerOrInfinity = require_ToIntegerOrInfinity();
      module.exports = function ToLength(argument) {
        var len = ToIntegerOrInfinity(argument);
        if (len <= 0) {
          return 0;
        }
        if (len > MAX_SAFE_INTEGER) {
          return MAX_SAFE_INTEGER;
        }
        return len;
      };
    }
  });

  // node_modules/es-abstract/2024/LengthOfArrayLike.js
  var require_LengthOfArrayLike = __commonJS({
    "node_modules/es-abstract/2024/LengthOfArrayLike.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var isObject = require_isObject();
      var Get = require_Get();
      var ToLength = require_ToLength();
      module.exports = function LengthOfArrayLike(obj) {
        if (!isObject(obj)) {
          throw new $TypeError("Assertion failed: `obj` must be an Object");
        }
        return ToLength(Get(obj, "length"));
      };
    }
  });

  // node_modules/es-abstract/2024/ToString.js
  var require_ToString2 = __commonJS({
    "node_modules/es-abstract/2024/ToString.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var $String = GetIntrinsic("%String%");
      var $TypeError = require_type();
      module.exports = function ToString(argument) {
        if (typeof argument === "symbol") {
          throw new $TypeError("Cannot convert a Symbol value to a string");
        }
        return $String(argument);
      };
    }
  });

  // node_modules/es-abstract/2024/FlattenIntoArray.js
  var require_FlattenIntoArray = __commonJS({
    "node_modules/es-abstract/2024/FlattenIntoArray.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var MAX_SAFE_INTEGER = require_maxSafeInteger();
      var Call = require_Call();
      var CreateDataPropertyOrThrow = require_CreateDataPropertyOrThrow();
      var Get = require_Get();
      var HasProperty = require_HasProperty();
      var IsArray = require_IsArray2();
      var LengthOfArrayLike = require_LengthOfArrayLike();
      var ToString = require_ToString2();
      module.exports = function FlattenIntoArray(target, source, sourceLen, start, depth) {
        var mapperFunction;
        if (arguments.length > 5) {
          mapperFunction = arguments[5];
        }
        var targetIndex = start;
        var sourceIndex = 0;
        while (sourceIndex < sourceLen) {
          var P = ToString(sourceIndex);
          var exists = HasProperty(source, P);
          if (exists === true) {
            var element = Get(source, P);
            if (typeof mapperFunction !== "undefined") {
              if (arguments.length <= 6) {
                throw new $TypeError("Assertion failed: thisArg is required when mapperFunction is provided");
              }
              element = Call(mapperFunction, arguments[6], [element, sourceIndex, source]);
            }
            var shouldFlatten = false;
            if (depth > 0) {
              shouldFlatten = IsArray(element);
            }
            if (shouldFlatten) {
              var elementLen = LengthOfArrayLike(element);
              targetIndex = FlattenIntoArray(target, element, elementLen, targetIndex, depth - 1);
            } else {
              if (targetIndex >= MAX_SAFE_INTEGER) {
                throw new $TypeError("index too large");
              }
              CreateDataPropertyOrThrow(target, ToString(targetIndex), element);
              targetIndex += 1;
            }
          }
          sourceIndex += 1;
        }
        return targetIndex;
      };
    }
  });

  // node_modules/es-object-atoms/ToObject.js
  var require_ToObject = __commonJS({
    "node_modules/es-object-atoms/ToObject.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      var RequireObjectCoercible = require_RequireObjectCoercible();
      module.exports = function ToObject(value) {
        RequireObjectCoercible(value);
        return $Object(value);
      };
    }
  });

  // node_modules/es-abstract/2024/ToObject.js
  var require_ToObject2 = __commonJS({
    "node_modules/es-abstract/2024/ToObject.js"(exports, module) {
      "use strict";
      module.exports = require_ToObject();
    }
  });

  // node_modules/array.prototype.flat/implementation.js
  var require_implementation4 = __commonJS({
    "node_modules/array.prototype.flat/implementation.js"(exports, module) {
      "use strict";
      var ArraySpeciesCreate = require_ArraySpeciesCreate();
      var FlattenIntoArray = require_FlattenIntoArray();
      var Get = require_Get();
      var ToIntegerOrInfinity = require_ToIntegerOrInfinity();
      var ToLength = require_ToLength();
      var ToObject = require_ToObject2();
      module.exports = function flat() {
        var O = ToObject(this);
        var sourceLen = ToLength(Get(O, "length"));
        var depthNum = 1;
        if (arguments.length > 0 && typeof arguments[0] !== "undefined") {
          depthNum = ToIntegerOrInfinity(arguments[0]);
        }
        var A = ArraySpeciesCreate(O, 0);
        FlattenIntoArray(A, O, sourceLen, 0, depthNum);
        return A;
      };
    }
  });

  // node_modules/array.prototype.flat/polyfill.js
  var require_polyfill2 = __commonJS({
    "node_modules/array.prototype.flat/polyfill.js"(exports, module) {
      "use strict";
      var implementation = require_implementation4();
      module.exports = function getPolyfill() {
        return Array.prototype.flat || implementation;
      };
    }
  });

  // node_modules/es-shim-unscopables/index.js
  var require_es_shim_unscopables = __commonJS({
    "node_modules/es-shim-unscopables/index.js"(exports, module) {
      "use strict";
      var hasOwn = require_hasown();
      var hasUnscopables = typeof Symbol === "function" && typeof Symbol.unscopables === "symbol";
      var map = hasUnscopables && Array.prototype[Symbol.unscopables];
      var $TypeError = TypeError;
      module.exports = function shimUnscopables(method) {
        if (typeof method !== "string" || !method) {
          throw new $TypeError("method must be a non-empty string");
        }
        if (!hasOwn(Array.prototype, method)) {
          throw new $TypeError("method must be on Array.prototype");
        }
        if (hasUnscopables && map) {
          map[method] = true;
        }
      };
    }
  });

  // node_modules/array.prototype.flat/shim.js
  var require_shim2 = __commonJS({
    "node_modules/array.prototype.flat/shim.js"(exports, module) {
      "use strict";
      var define = require_define_properties();
      var shimUnscopables = require_es_shim_unscopables();
      var getPolyfill = require_polyfill2();
      module.exports = function shimFlat() {
        var polyfill = getPolyfill();
        define(
          Array.prototype,
          { flat: polyfill },
          { flat: function() {
            return Array.prototype.flat !== polyfill;
          } }
        );
        shimUnscopables("flat");
        return polyfill;
      };
    }
  });

  // node_modules/array.prototype.flat/index.js
  var require_array_prototype = __commonJS({
    "node_modules/array.prototype.flat/index.js"(exports, module) {
      "use strict";
      var define = require_define_properties();
      var callBind = require_call_bind();
      var implementation = require_implementation4();
      var getPolyfill = require_polyfill2();
      var polyfill = getPolyfill();
      var shim = require_shim2();
      var boundFlat = callBind(polyfill);
      define(boundFlat, {
        getPolyfill,
        implementation,
        shim
      });
      module.exports = boundFlat;
    }
  });

  // node_modules/smartwrap/src/main.js
  var require_main2 = __commonJS({
    "node_modules/smartwrap/src/main.js"(exports, module) {
      "use strict";
      var breakword = require_main();
      var stripansi = require_strip_ansi();
      var wcwidth = require_wcwidth();
      var flat = require_array_prototype();
      if (!Array.prototype.flat) flat.shim();
      var ANSIPattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
      ].join("|");
      var ANSIRegex = new RegExp(ANSIPattern, "g");
      var defaults = () => {
        let obj = {};
        obj.breakword = false;
        obj.input = [];
        obj.minWidth = 2;
        obj.paddingLeft = 0;
        obj.paddingRight = 0;
        obj.errorChar = "\uFFFD";
        obj.returnFormat = "string";
        obj.skipPadding = false;
        obj.splitAt = [" ", "	"];
        obj.trim = true;
        obj.width = 10;
        return obj;
      };
      var calculateSpaceRemaining = function(lineLength, spacesUsed, config) {
        return Math.max(lineLength - spacesUsed - config.paddingLeft - config.paddingRight, 0);
      };
      var validateInput = (text, options) => {
        let config = Object.assign({}, defaults(), options || {});
        if (config.errorChar) {
          config.errorChar = config.errorChar.split("")[0];
          if (wcwidth(config.errorChar) > 1)
            throw new Error(`Error character cannot be a wide character (${config.errorChar})`);
        }
        config.paddingLeft = Math.abs(config.paddingLeft);
        config.paddingRight = Math.abs(config.paddingRight);
        let lineLength = config.width - config.paddingLeft - config.paddingRight;
        if (lineLength < config.minWidth) {
          config.skipPadding = true;
          lineLength = config.minWidth;
        }
        if (config.trim) {
          text = text.trim();
        }
        return { text, config, lineLength };
      };
      var wrap = (input, options) => {
        let { text, config, lineLength } = validateInput(input, options);
        let words = [];
        if (!config.breakword) {
          if (config.splitAt.indexOf("	") !== -1) {
            words = text.split(/ |\t/i);
          } else {
            words = text.split(" ");
          }
        } else {
          words = [text];
        }
        words = words.filter((val) => {
          if (val.length > 0) {
            return true;
          }
        });
        let lines = [
          []
        ];
        let spaceRemaining, splitIndex, word;
        let currentLine = 0;
        let spacesUsed = 0;
        while (words.length > 0) {
          spaceRemaining = calculateSpaceRemaining(lineLength, spacesUsed, config);
          word = words.shift();
          let wordLength = wcwidth(word);
          switch (true) {
            // too long for an empty line and is a single character
            case (lineLength < wordLength && [...word].length === 1):
              words.unshift(config.errorChar);
              break;
            // too long for an empty line, must be broken between 2 lines
            case lineLength < wordLength:
              splitIndex = breakword(word, lineLength);
              let splitWord = [...word];
              words.unshift(splitWord.slice(0, splitIndex + 1).join(""));
              words.splice(1, 0, splitWord.slice(splitIndex + 1).join(""));
              break;
            // not enough space remaining in line, must be wrapped to next line
            case spaceRemaining < wordLength:
              lines.push([]);
              currentLine++;
              spacesUsed = 0;
            /* falls through */
            // fits on current line
            // eslint-disable-next-line
            default:
              lines[currentLine].push(word);
              spacesUsed += wordLength + 1;
          }
        }
        lines = lines.map((line) => {
          line = line.join(" ");
          if (!config.skipPadding) {
            line = Array(config.paddingLeft + 1).join(" ") + line + Array(config.paddingRight + 1).join(" ");
          }
          return line;
        });
        return lines.join("\n");
      };
      var splitAnsiInput = (text) => {
        let matches = [];
        let textArr = [...text];
        let textLength = textArr.length;
        while ((result = ANSIRegex.exec(text)) !== null) {
          matches.push({
            start: result.index,
            end: result.index + result[0].length,
            match: result[0],
            length: result[0].length
          });
        }
        if (matches.length < 1) return [];
        matches = matches.reduce((prev, curr) => {
          let prevEnd = prev[prev.length - 1];
          if (prevEnd.end < curr.start) {
            prev.push({
              start: prevEnd.end,
              end: curr.start,
              length: curr.start - prevEnd.end,
              expand: true
            }, curr);
          } else {
            prev.push(curr);
          }
          return prev;
        }, [{ start: 0, end: 0 }]).splice(1);
        let lastMatchEnd = matches[matches.length - 1].end;
        if (lastMatchEnd < textLength) {
          matches.push({
            start: lastMatchEnd,
            end: textLength,
            expand: true
          });
        }
        let savedArr = matches.map((match) => {
          let value = text.substring(match.start, match.end);
          return match.expand ? [...value] : [value];
        }).flat(2);
        return savedArr;
      };
      var restoreANSI = (savedArr, processedArr) => {
        return processedArr.map((char) => {
          let result2;
          if (char === "\n") {
            result2 = [char];
          } else {
            let splicePoint = savedArr.findIndex((element) => element === char) + 1;
            result2 = savedArr.splice(0, splicePoint);
          }
          const ANSIClosePattern = "^\\x1b\\[([0-9]+)*m";
          const ANSICloseRegex = new RegExp(ANSIClosePattern);
          const closeCodes = ["0", "21", "22", "23", "24", "25", "27", "28", "29", "39", "49", "54", "55"];
          let match;
          while (savedArr.length && (match = savedArr[0].match(ANSICloseRegex))) {
            if (!closeCodes.includes(match[1])) break;
            result2.push(savedArr.shift());
          }
          return result2.join("");
        }).concat(savedArr);
      };
      module.exports = (input, options) => {
        const processedLines = input.toString().split("\n").map((string) => {
          const savedANSI = splitAnsiInput(string);
          string = stripansi(string);
          string = wrap(string, options);
          let charArr = [...string];
          charArr = savedANSI.length > 0 ? restoreANSI(savedANSI, charArr) : charArr;
          let outArr = charArr.join("").split("\n");
          return outArr;
        });
        return processedLines.flat(2).join("\n");
      };
    }
  });

  // src/format.js
  var require_format = __commonJS({
    "src/format.js"(exports, module) {
      "use strict";
      var stripAnsi = require_strip_ansi();
      var smartwrap = require_main2();
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
      module.exports.getStringLength = (string) => {
        return wcwidth(stripAnsi(string));
      };
      module.exports.wrapCellText = (config, cellValue, columnIndex, cellOptions, rowType) => {
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
          string = exports.truncate(string, cellOptions, innerWidth);
        } else {
          string = exports.wrap(string, cellOptions, innerWidth);
        }
        const cell = string.split("\n").map((line) => {
          line = line.trim();
          const lineLength = exports.getStringLength(line);
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
      module.exports.truncate = (string, cellOptions, maxWidth) => {
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
      module.exports.wrap = (string, cellOptions, innerWidth) => {
        const outstring = smartwrap(string, {
          errorChar: cellOptions.defaultErrorValue,
          minWidth: 1,
          trim: true,
          width: innerWidth
        });
        return outstring;
      };
      module.exports.getColumnWidths = (config, rows) => {
        const availableWidth = getAvailableWidth(config);
        const iterable = config.table.header[0] && config.table.header[0].length > 0 ? config.table.header[0] : rows[0];
        let widths = iterable.map((column, columnIndex) => {
          let result2;
          switch (true) {
            // column width is a percentage of table width specified in column header
            case (typeof column === "object" && /^\d+%$/.test(column.width)):
              result2 = column.width.slice(0, -1) * 0.01 * availableWidth;
              result2 = addPadding(config, result2);
              break;
            // column width is specified in column header
            case (typeof column === "object" && /^\d+$/.test(column.width)):
              result2 = column.width;
              break;
            // 'auto' sets column width to its longest value in the initial data set
            default:
              const columnOptions = config.table.header[0][columnIndex] ? config.table.header[0][columnIndex] : {};
              const measurableRows = rows.length ? rows : config.table.header[0];
              result2 = getMaxLength(columnOptions, measurableRows, columnIndex);
              result2 = addPadding(config, result2);
          }
          result2 = result2 + config.GUTTER;
          return result2;
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
    "src/render.js"(exports, module) {
      "use strict";
      var Style = require_style();
      var Format = require_format();
      var stripAnsi = require_strip_ansi();
      module.exports.stringifyData = (config, inputData) => {
        const sections = {
          header: [],
          body: [],
          footer: []
        };
        const marginLeft = Array(config.marginLeft + 1).join(" ");
        const borderStyle = config.borderCharacters[config.borderStyle];
        const borders = [];
        const constructorType = exports.getConstructorGeometry(inputData[0] || [], config);
        const rows = exports.coerceConstructorGeometry(config, inputData, constructorType);
        if (!global.columnWidths) {
          global.columnWidths = {};
        }
        if (global.columnWidths[config.tableId]) {
          config.table.columnWidths = global.columnWidths[config.tableId];
        } else {
          const formattedRows = rows.map((row, rowIndex) => {
            return row.map((cell, cellIndex) => {
              return exports.buildCell(config, cell, cellIndex, "body", rowIndex, rows, inputData, true);
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
              return exports.buildRow(config, row, "header", null, rows, inputData);
            });
            break;
          default:
            sections.header = [];
        }
        sections.body = rows.map((row, rowIndex) => {
          return exports.buildRow(config, row, "body", rowIndex, rows, inputData);
        });
        sections.footer = config.table.footer instanceof Array && config.table.footer.length > 0 ? [config.table.footer] : [];
        sections.footer = sections.footer.map((row) => {
          return exports.buildRow(config, row, "footer", null, rows, inputData);
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
      module.exports.buildRow = (config, row, rowType, rowIndex, rowData, inputData) => {
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
          const cell = exports.buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData);
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
      module.exports.buildCell = (config, elem, columnIndex, rowType, rowIndex, rowData, inputData, dryRun = false) => {
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
      module.exports.getConstructorGeometry = (row, config) => {
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
      module.exports.coerceConstructorGeometry = (config, rows, constructorType) => {
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
    "src/factory.js"(exports, module) {
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
      module.exports = Table;
    }
  });

  // src/browser.ts
  var browser_exports = {};
  __export(browser_exports, {
    default: () => src_default
  });

  // src/index.ts
  var import_factory = __toESM(require_factory());
  var src_default = import_factory.default;
  return __toCommonJS(browser_exports);
})();
//# sourceMappingURL=tty-table.global.js.map