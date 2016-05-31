var baseline = {
	"aapl" : 92,
	"ibm" : 120
};
var last = {};
setInterval(function(){
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

