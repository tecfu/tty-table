const example = require("../test/example-utils.js")
const Table = require("../")

const baseRows = [[
    "aaa bbb ccc",
    "aaa bbb ccc ddd eee fff ggg hhh",
    "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt"
  ]],
  baseHeaders = [
    {alias: "Short", width: "20%"},
    {alias: "Medium Header", width: "30%"},
    {alias: "A Very, Very Long Header", width: "50%"}
  ],
  baseConfig = {
    marginLeft: 0
  }

function resizeTestCase (width, overrideConfig, customRows, customHeaders) {
  let config = Object.assign({}, baseConfig, overrideConfig),
    rows = (!customRows) ? baseRows : customRows,
    headers = (!customHeaders) ? baseHeaders : customHeaders

  console.log("")
  example.init(`Test-w=${width}-${JSON.stringify(overrideConfig)}`, width, config)

  let table = new Table(headers, rows, config)
  let output = table.render()
  let widest = example.getMaxLineWidth(output)

  if (widest > width) {
    example.error(`Table Too Wide: target=${width} widest-line=${widest}`)
  }
  console.log(output)
  return output
}

const NONE = undefined,
  DEFAULT_WIDTH = "25-125",
  DEFAULT_TRUNCATE = [NONE],
  DEFAULT_RESIZE = [NONE],
  DEFAULT_MIN_WIDTH = [NONE]

let program = require("commander").description("test resizing fonctionality")
  .option("--color", "")
  .option("-w, --width <width>", "simulated console width (csv/ranges)", DEFAULT_WIDTH)
  .option("-t, --truncate <bool-or-string>", "truncation config (csv/ranges)", DEFAULT_TRUNCATE)
  .option("-r, --resize <resize>", "resize config (csv/ranges)", DEFAULT_RESIZE)
  .option("-m, --min-col-width <number>", "resize config (csv/ranges)", DEFAULT_MIN_WIDTH)
  .parse(process.argv)


for (let width of example.parseNumericList(program.width)) {
  for (let truncate of example.parseList(program.truncate)) {
    for (let resize of example.parseList(program.resize)) {
      for (let minColWidth of example.parseList(program.minColWidth)) {

        let config = {}
        example.setOption(config, "truncate", truncate)
        example.setOption(config, "resize", resize)
        example.setOption(config, "minColWidth", minColWidth)
        resizeTestCase(width, config, null, null)
      }
    }
  }
}

example.dumpMessages()
