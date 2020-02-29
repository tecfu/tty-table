const tickers = [
  ["AAPL", 138],
  ["IBM", 120],
  ["WMT", 68],
  ["ABX", 13],
  ["MSFT", 35]
]

const cycle = (iterator, tickers) => {
  // change ticker values
  tickers = tickers.map(value => {
    const sign = (Math.random()) < 0.5 ? -1 : 1
    const increment = Math.random()
    const newVal = (value[1] + sign * increment).toFixed(2) * 1
    return [value[0], newVal]
  })

  console.log(JSON.stringify(tickers))
  iterator++

  setTimeout(function () {
    cycle(iterator, tickers)
  }, 500)
}

process.stdout.on("error", () => {
  process.exit(1)
})

cycle(1, tickers)
