var baseline = {
	"aapl" : 92,
	"ibm" : 120,
	"wmt" : 68,
	"abx" : 13,
	"msft" : 35
};

var last = {};

setInterval(function(){

//	//Add imaginary ticker
//	var newTicker = Math.random().toString(36).substring(7); 
//	baseline[newTicker] = Math.random();
//	
//	//Remove a random ticker
//	var keys = Object.keys(baseline);
//	var random = 	Math.floor(Math.random() * keys.length) + 0;
//	delete baseline[keys[random]];

	var array = [];

	for(var i in baseline){
		baseline[i] = (baseline[i] + ((Math.random() > .5) ? .01 : -.01)).toFixed(2)*1;	
		array.push([i,baseline[i]])
	}

	var string = JSON.stringify(array);
	console.log(string);
},500)	

process.stdout.on('error',function(){
	process.exit(1);
});

