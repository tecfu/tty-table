var tickers = [
	["AAPL",138],
	["IBM",120],
	["WMT",68],
	["ABX",13],
	["MSFT",35]
];

//http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
var makeTicker = function(){
	var text = [];
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var length = 25;

	for(var i=0;i<length;i++){
		var char = possible.charAt(Math.floor(Math.random()*possible.length));
		text.push(char);
	}

	return [text.join(""),Math.floor(Math.random(3)*100)];
}

var cycle = function(iterator,tickers){
	
	//remove or add a random ticker to test auto resizing
	if(iterator % 6 === 0){
		tickers.pop();
	}
	else if(iterator % 3 === 0){
		tickers.push(makeTicker());
	}

	//change ticker values
	tickers = tickers.map(function(value){
		var sign = (Math.random()) < .5 ? -1 : 1;
		var increment = Math.random();
		var newVal = (value[1]+sign*increment).toFixed(2)*1;
		return [value[0],newVal];
	})

	console.log(JSON.stringify(tickers));
	iterator++;

	setTimeout(function(){
		cycle(iterator,tickers)
	},500);
}

process.stdout.on('error',function(){
	process.exit(1);
});

cycle(1,tickers);
