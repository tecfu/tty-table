var header = ['SYMBOL','LAST']
var baseline = {
  "aapl" : 92,
  "ibm" : 120.72,
  "wmt" : 68.93,
  "abx" : 13.36,
  "msft" : 35.26
};

var last = {};

setInterval(function(){

//  //Add imaginary ticker
//  var newTicker = Math.random().toString(36).substring(7); 
//  baseline[newTicker] = Math.random();
//  
//  //Remove a random ticker
//  var keys = Object.keys(baseline);
//  var random =   Math.floor(Math.random() * keys.length) + 0;
//  delete baseline[keys[random]];

  var array = [header];

  for(var i in baseline){
    //give each symbol a 30% chance of changing
    if(Math.random() >= .7){
      baseline[i] = (baseline[i] + ((Math.random() > .5) ? .01 : -.01)).toFixed(2)*1;  
    }
    else {
      baseline[i] = baseline[i];
    }
    array.push([i,'$ ' + baseline[i].toFixed(2)])
  }

  var string = JSON.stringify(array);
  console.log(string);
},500)  

process.stdout.on('error',function(){
  process.exit(1);
});

