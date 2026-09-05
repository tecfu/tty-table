import chalk from "chalk"
import kleur from "kleur"
import stripAnsi from "strip-ansi"

// use kleur if we are in the browser
const colorLib: any = (process && process.stdout) ? chalk : kleur

export const style = (str: any, ...colors: string[]): string => {
  const out = colors.reduce(function (input: any, color: string) {
    return colorLib[color](input)
  }, str)
  return out
}

export const styleEachChar = (str: any, ...colors: string[]): string => {
  // strip existing ansi chars so we dont loop them
  // @ TODO create a really clever workaround so that you can accrete styles
  const chars = [...stripAnsi(str)]

  // style each character
  const out = chars.reduce((prev: string, current: string) => {
    const coded = colors.reduce((input: string, color: string) => {
      return colorLib[color](input)
    }, current)
    return prev + coded
  }, "")

  return out
}

export const resetStyle = function (this: any, str: any) {
  this.configure({ reset: true })
  return stripAnsi(str)
}

export const colorizeCell = (str: any, cellOptions: any, rowType: string) => {
  let color: any = false // false will keep terminal default

  switch (true) {
    case (rowType === "body"):
      color = cellOptions.color || color
      break

    case (rowType === "header"):
      color = cellOptions.headerColor || color
      break

    default:
      color = cellOptions.footerColor || color
  }

  if (color) {
    str = style(str, color)
  }

  return str
}

export const isColorEnabled = () => {
  return (process && process.stdout) ? colorLib.level > 0 : colorLib.enabled
}
