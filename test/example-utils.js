const chalk = require("chalk"),
  stripAnsi = require("strip-ansi"),
  wcwidth = require("wcwidth"),
  util = require("util")

const messageLog = {
  info: [],
  warnings: [],
  errors: []
}

const library = {
  /**
   * one-liner example initialization, allows arguments/env for console width, env for ruler display
   *   COLUMNS or first argument - console width
   *   SHOW_MEASURE - display console width ruler
   * @param {number} [columns] set explicit viewport width (COLUMNS env var)
   * @param {boolean} [showMeasure] show ruler (SHOW_MEASURE env var)
   * @param {string} [truncate] to display in ruler (TRUNCATE env var)
   */
  quickInit: function (columns, showMeasure, truncate) {
    let w = process.argv[2] && parseInt(process.argv[2]) || columns || process.env.COLUMNS

    if (w) {
      library.setViewportWidth(typeof w === "string" ? parseInt(w) : w)
    }

    if (showMeasure || process.env.SHOW_MEASURE) {
      library.showRuler(truncate || process.env.TRUNCATE)
    }
  },

  /**
   * convenience function for test cases
   * @param {string} name
   * @param {number} columns
   * @param {object} [config] - tty-table config options
   * @
   */
  init: function (name, columns, config) {
    library.setViewportWidth(columns)
    library.showRuler(config && config.truncate)
  },

  /**
   * explicitly override/set viewport width
   * @param {number} columns
   */
  setViewportWidth: function (columns) {
    process.stdout.columns = columns
  },

  /**
   * get current viewport width
   * @return {number}
   */
  getViewportWidth: function () {
    return process.stdout.columns
  },

  /**
   * display ruler with config info
   * @param {string|boolean} [truncate] truncate value for display
   */
  showRuler: function (truncate) {
    if (process.stdout && typeof process.stdout.columns === "number") {
      let columns = process.stdout.columns,
        trunc = truncate === "" || truncate ? `/${truncate === "" || truncate === true ? "\"\"" : truncate} ` : " ",
        config = `${columns > 20 ? "width" : "w"}=${columns}${trunc}`
      console.log(`${`╠═ ${config}${new Array(columns).fill("═").join("")}`.substr(0, columns - 1)}╣`)
    }
  },

  /**
   * parse an argument into a list of test values
   * @param {string} arg - section char or comma delimited list of values
   * @param {any} [defaultValue] - string to be parsed instead or any other value to be returned
   * @return {Array<string>|any}
   */
  parseList: function (arg, defaultValue) {
    // to include comma or section, quote with section like §comma,is,part,of,string§
    arg = typeof arg === "undefined" ? defaultValue : arg
    if (typeof arg !== "string") {
      return typeof arg === "undefined" ? [] : arg
    }
    if (/^§.*§$/.test(arg)) {
      return arg.substr(1, arg.length - 2)
    }
    return arg.includes("§") ? arg.split("§") : arg.split(",")
  },

  /**
   * parse an argument into a list of numeric test values
   * @param {string} arg - comma delimited list of values or ranges, e.g. 10,20,30-40,50-90:5
   * @param {any} [defaultValue] - string to be parsed instead or any other value to be returned
   * @return {Array<string>|any}
   */
  parseNumericList: function (arg, defaultValue) {
    let list = library.parseList(arg, defaultValue)
    return list.reduce((list, each) => {
      let range = /^(\d+)-(\d+)(?::(-?\d+))?$/.exec(each)
      if (range) {
        let start = parseInt(range[1]),
          end = parseInt(range[2]),
          step = range[3] ? parseInt(range[3]) : (start > end ? -1 : 1)
        for (let value = start; step > 0 ? value <= end : value >= end; value += step) {
          list.push(value)
        }
      } else {
        list.push(each)
      }
      return list
    }, [])
  },

  /**
   * return the width of string in console columns correctly treating ANSI sequences, emoji and double wide chars
   * @param {string} str - a string
   * @return {number}
   */
  getStringWidth: function (str) {
    return wcwidth(stripAnsi(str))
  },

  /**
   * return the width of the widest line in console columns correctly treating ANSI sequences, emoji and double wide chars
   * @param {Array<string>|string} text - a string wth zero or more embedded linefeeds or array of strings
   * @return {number}
   */
  getMaxLineWidth: function (text) {
    let lines = typeof text === "string" ? text.split("\n") : text,
      widest =  Math.max(...lines.map(library.getStringWidth))
    return widest
  },

  /**
   * set or remove an property in a POJSO
   * @param {object} optionObject - object to be mutated
   * @param {string} optionName - property name
   * @param {any|undefined} [optionValue] - property value or undefined to delete option
   */
  setOption: function (optionObject, optionName, optionValue) {
    if (optionValue === undefined) {
      delete optionObject[optionName]
    } else {
      optionObject[optionName] = optionValue
    }
  },

  /**
   * log info message with printf-like arguments
   * @param {...any} args - printf style arguments, format string and values
   */
  info: function (...args) {
    let str = util.format.apply(util, args)
    messageLog.info.push(str)
    console.log(chalk.cyan(str))
  },

  /**
   * log warning message with printf-like arguments
   * @param {...any} args - printf style arguments, format string and values
   */
  warning: function (...args) {
    let str = util.format.apply(util, args)
    messageLog.warnings.push(str)
    console.log(chalk.magenta(str))
  },

  /**
   * log error message with printf-like arguments
   * @param {...any} args - printf style arguments, format string and values
   */
  error: function (...args) {
    let str = util.format.apply(util, args)
    messageLog.errors.push(str)
    console.log(chalk.red(str))
  },

  /**
   * dump message log to console
   * @param {boolean} skipInfo - true to suppress dumping info level messages
   * @param {boolean} skipWarnings - true to suppress dumping warning level messages
   * @param {boolean} skipErrors - true to suppress dumping error level messages
   * @param {boolean} reset - true to clear message log
   */
  dumpMessages: function (skipInfo, skipWarnings, skipErrors, reset) {
    if (!skipInfo) {
      for (let info of messageLog.info) {
        console.log(chalk.cyan(info))
      }
    }
    if (!skipWarnings) {
      for (let warning of messageLog.warnings) {
        console.log(chalk.magenta(warning))
      }
    }
    if (!skipErrors) {
      for (let error of messageLog.errors) {
        console.log(chalk.red(error))
      }
    }
    if (reset) {
      for (let name of Object.keys(messageLog)) {
        messageLog[name].splice(0, messageLog[name].length)
      }
    }
  }
}

module.exports = library
