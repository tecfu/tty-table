const header = ["SYMBOL","LAST"]
let baseline = {
  "aapl": 92,
  "ibm": 120.72,
  "wmt": 68.93,
  "abx": 13.36,
  "msft": 35.26
}

setInterval(function() {

  //  //Add imaginary ticker
  //  let newTicker = Math.random().toString(36).substring(7);
  //  baseline[newTicker] = Math.random();
  //
  //  //Remove a random ticker
  //  let keys = Object.keys(baseline);
  //  let random =   Math.floor(Math.random() * keys.length) + 0;
  //  delete baseline[keys[random]];

  let array = [header]

  for(let i in baseline) {
    //give each symbol a 30% chance of changing
    if(Math.random() >= .7) {
      baseline[i] = (baseline[i] + ((Math.random() > .5) ? .01 : -.01)).toFixed(2)*1
    }
    array.push([i,`$ ${  baseline[i].toFixed(2)}`])
  }

  let string = JSON.stringify(array)
  console.log(string)
},500)

process.stdout.on("error",function() {
  process.exit(1)
})
