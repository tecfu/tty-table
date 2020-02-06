const tickers = [
  ["AAPL", 138],
  ["IBM", 120],
  ["WMT", 68],
  ["ABX", 13],
  ["MSFT", 35]
]

const cycle = (iterator, tickers) => {

  //change ticker values
  tickers = tickers.map( value => {
    let sign = (Math.random()) < .5 ? -1 : 1
    let increment = Math.random()
    let newVal = (value[1]+sign*increment).toFixed(2)*1
    return [value[0], newVal]
  })

  console.log(JSON.stringify(tickers))
  iterator++

  setTimeout(function() {
    cycle(iterator, tickers)
  }, 500)
}

process.stdout.on("error", () => {
  process.exit(1)
})

cycle(1, tickers)
