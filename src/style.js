const kleur = require("kleur")
const stripAnsi = require("strip-ansi")


module.exports.style = (str, ...colors) => {
  let out = colors.reduce(function(input, color) {
    return kleur[color](input)
  }, str)
  return out
}


module.exports.styleEachChar = (str, ...colors) => {
  // strip existing ansi chars so we dont loop them
  // @ TODO create a really clever workaround so that you can accrete styles
  let chars = [...stripAnsi(str)]

  // style each character
  let out = chars.reduce((prev, current) => {
    let coded = colors.reduce((input, color) => {
      return kleur[color](input)
    }, current)
    return prev + coded
  }, "")

  return out
}


module.exports.resetStyle = (str) => {
  return stripAnsi(str)
}


module.exports.colorizeCell = (str, cellOptions, rowType) => {

  let color = false // false will keep terminal default

  switch(true) {
    case(rowType === "body"):
      color = cellOptions.color || color
      break

    case(rowType === "header"):
      color = cellOptions.headerColor || color
      break

    default:
      color = cellOptions.footerColor || color
  }

  if (color) {
    str = exports.style(str, color)
  }

  return str
}
