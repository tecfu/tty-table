#!/usr/bin/env node

var Chalk = require('chalk');
var sendError = function(msg){
	msg = '\ntty-table says: ' + msg + '\n';
	console.log(msg);
	process.exit(1);
};

//get arguments
var argv = require('minimist')(process.argv.slice(2));	

//check if help called
if(argv.help){
	var msg = '\n';
			msg += Chalk.bgBlack.green('OPTIONS')+'\n';
			msg += '-------\n\n'; 
			msg += '--format (JSON,csv)\n';
	console.log(msg);
	process.exit();
}

//note that this is the first run
var alreadyRendered = false;
var previousHeight = 0;

//check format of input data
var dataFormat = 'csv' //default

if(argv.format){
	dataFormat = argv.format
}

switch(true){
	case(dataFormat.toString().match(/json/i) !== null):
		dataFormat = 'json';
		break;
	default:
		var csv = require('csv');
}

//sometimes users need to speciy delimiter or special options
var formatterOptions = {};
if(dataFormat === 'csv'){
	Object.keys(argv).forEach(function(key){
		if(key.substr(0,3)==='csv'){
			formatterOptions[key.substr(4,key.length)] = argv[key]	
		}
	});
}

//because diffent dataFormats 
var runTable = function(input){
	
	var header = [], 
	body = input, 
	//footer = [], 
	options = {};

	var Table = require('./public.js');
	var t1 = Table.setup(header,body,options);
	
	//hide cursor
	console.log('\u001b[?25l');
	
	//wipe existing if already rendered
	if(alreadyRendered){

		//move cursor up number to the top of the previous print
		//before deleting
		console.log('\u001b['+(previousHeight+3)+'A');
		
		//delete to end of terminal
		console.log('\u001b[0J');
	}
	else{
		alreadyRendered = true;
	}
	
	console.log(t1.render());
	
	//reset the previous height to the height of this output
	//for when we next clear the print
	previousHeight = t1.height;

};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {

	//handle dataFormats
	switch(true){
		case(dataFormat==='json'):	
			try {
				var data = JSON.parse(chunk);
			}
			catch(e){
				var msg = "JSON parse error.";
				msg = Chalk.bgRed.white(msg);
				msg = msg + "\n\nPlease check to make sure that your input data consists of JSON or specify a different format with the --format flag.";
				sendError(msg);
			}
			runTable(data);
			break;
		default:
			csv.parse(chunk,formatterOptions,function(err, data){
				//validate csv	
				if(typeof data === 'undefined'){
					var msg = "CSV parse error.";
					msg = Chalk.bgRed.white(msg);
					msg = msg + "\n\nPlease check to make sure that your input data consists of comma separated values or specify a different format with the --format flag.";
					sendError(msg);
				}
				runTable(data);
			});
	}
});

process.stdin.on('end', function() {
	//nothing
});

