#!/usr/bin/env node
var yargs = require('yargs');
yargs.epilog('Copyight github.com/tecfu 2017');
yargs.option('csv-delimiter',{
	describe:'Set the field delimiter. One character only.', 
	default:','
});
yargs.option('csv-escape',{
	describe:'Set the escape character. One character only.',
	default:'"'
});
yargs.option('csv-rowDelimiter',{
	describe:'String used to delimit record rows or a special constant; special constants are "auto","unix","max","windows","unicode".',
	default:"'"
});
yargs.option('format',{
	describe:'Set input data format',
	choices:['json','csv'],
	default:'csv'
});
yargs.version(function(){
	var fs = require('fs');
	var path =__dirname+'/../package.json';
	var contents = fs.readFileSync(path,'utf-8');
	var json = JSON.parse(contents);
	return json.version;
});

var Chalk = require('chalk');
var sendError = function(msg){
	msg = '\ntty-table error: ' + msg + '\n';
	console.log(msg);
	process.exit(1);
};

//note that this is the first run
var alreadyRendered = false;
var previousHeight = 0;

var dataFormat = 'csv';
switch(true){
	case(yargs.argv.format.toString().match(/json/i) !== null):
		dataFormat = 'json';
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
				var msg = Chalk.bgRed.white(msg);
				msg = msg + "\n\nPlease check to make sure that your input data consists of JSON or specify a different format with the --format flag.";
				sendError(msg);
			}
			runTable(data);
			break;
		default:
			var formatterOptions = {};
			Object.keys(yargs.argv).forEach(function(key){
				if(key.slice(0,4) === 'csv-'){
					formatterOptions[key.slice(4)] = yargs.argv[key];
				}
			});
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

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function () {
  //graceful shutdown
  process.exit();
});

process.on('exit', function() {
	//show cursor
	console.log('\u001b[?25h');
});

//run help only at the end
yargs.argv = yargs.help('h').argv;
