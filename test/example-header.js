module.exports = function(columns, showMeasure) {
  let w

  if (w = (process.argv[2] && parseInt(process.argv[2]) || columns || process.env.COLUMNS )) {
    process.stdout.columns = w
  }

  w = process.stdout.columns * 1

  if (showMeasure || process.env.SHOW_MEASURE ) {
    console.log(`\n${`=== width=${w} ${new Array(w).fill("=").join("")}`.substr(0, w - 1) }|`)
  }
}
