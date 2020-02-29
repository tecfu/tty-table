const example = require("../test/example-utils.js")
const Table = require("../")

const baseRows = [[
  "aaa bbb ccc",
  "aaa bbb ccc ddd eee fff ggg hhh",
  "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt"
]]
const baseHeaders = [
  { alias: "Short", width: "20%" },
  { alias: "Medium Header", width: "30%" },
  { alias: "A Very, Very Long Header", width: "50%" }
]
const baseConfig = {
  marginLeft: 0
}

function resizeTestCase (width, overrideConfig, customRows, customHeaders) {
  const config = Object.assign({}, baseConfig, overrideConfig)
  const rows = (!customRows) ? baseRows : customRows
  const headers = (!customHeaders) ? baseHeaders : customHeaders

  console.log("")
  example.init(`Test-w=${width}-${JSON.stringify(overrideConfig)}`, width, config)

  const table = new Table(headers, rows, config)
  const output = table.render()
  const widest = example.getMaxLineWidth(output)

  if (widest > width) {
    example.error(`Table Too Wide: target=${width} widest-line=${widest}`)
  }
  console.log(output)
  return output
}

const NONE = undefined
const DEFAULT_WIDTH = "25-125"
const DEFAULT_TRUNCATE = [NONE]
const DEFAULT_RESIZE = [NONE]
const DEFAULT_MIN_WIDTH = [NONE]

const program = require("commander").description("test resizing fonctionality")
  .option("--color", "")
  .option("-w, --width <width>", "simulated console width (csv/ranges)", DEFAULT_WIDTH)
  .option("-t, --truncate <bool-or-string>", "truncation config (csv/ranges)", DEFAULT_TRUNCATE)
  .option("-r, --resize <resize>", "resize config (csv/ranges)", DEFAULT_RESIZE)
  .option("-m, --min-col-width <number>", "resize config (csv/ranges)", DEFAULT_MIN_WIDTH)
  .parse(process.argv)

for (const width of example.parseNumericList(program.width)) {
  for (const truncate of example.parseList(program.truncate)) {
    for (const resize of example.parseList(program.resize)) {
      for (const minColWidth of example.parseList(program.minColWidth)) {
        const config = {}
        example.setOption(config, "truncate", truncate)
        example.setOption(config, "resize", resize)
        example.setOption(config, "minColWidth", minColWidth)
        resizeTestCase(width, config, null, null)
      }
    }
  }
}

example.dumpMessages()
