module.exports = (function(){
	
	//get arguments
	var argv = require('minimist')(process.argv.slice(2));	

	//note that this is the first run
	var alreadyRendered = false;

	//check format of input data
	var dataFormat = 'csv' //default

	if(argv.format){
		dataFormat = argv.format
	}

	switch(true){
		case(dataFormat==='json'):
			break;
		default:
			var csv = require('csv');
	}

	//because diffent dataFormats 
	var runTable = function(input){
		
		var header = [], 
		body = input, 
		//footer = [], 
		options = {};

		var Table = require('./public.js');
		var t1 = Table.setup(header,body,options);
		
		//wipe existing if already rendered
		if(alreadyRendered){
			//delete to end of terminal
			console.log('\u001b[0J');

			//move cursor up number of spaces equal to table height + 1
			console.log('\u001b['+(input.length+7)+'A');
		}
		else{
			alreadyRendered = true;
		}
		console.log(t1.render());
	};

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {

		//handle dataFormats
		switch(true){
			case(dataFormat==='json'):	
				var data = JSON.parse(chunk);
				if(data === null){
					console.error("JSON parse error");
					process.exit();
				}
				runTable(data);
				break;
			default:
				csv.parse(chunk, function(err, data){
					//validate csv	
					if(typeof data === 'undefined'){
						console.error("CSV parse error");
						process.exit();
					}
					runTable(data);
				});
		}
	});

	process.stdin.on('end', function() {
		//nothing
	});
}())
