#!/usr/bin/env node
let Csv = require('csv');
let Chalk = require('chalk');
let Yargs = require('yargs');

Yargs.epilog('Copyright github.com/tecfu 2018');

Yargs.option('csv-delimiter',{
  describe:'Set the field delimiter. One character only.',
  default:','
});

Yargs.option('csv-escape',{
  describe:'Set the escape character. One character only.'
});

Yargs.option('csv-rowDelimiter',{
  describe:'String used to delimit record rows. You can also use a special constant: "auto","unix","max","windows","unicode".',
  default: '\n'
});

Yargs.option('format',{
  describe:'Set input data format',
  choices:['json','csv'],
  default:'csv'
});

Yargs.option('options\u2010\u002A',{
  describe:'Specify an optional setting where * is the setting name. See README.md for a complete list.'
});

//run help only at the end
Yargs = Yargs.help('h').argv;

let sendError = function(msg){
  msg = '\ntty-table error: ' + msg + '\n';
  console.log(msg);
  process.exit(1);
};

//note that this is the first run
let alreadyRendered = false;
let previousHeight = 0;

let dataFormat = 'csv';
switch(true){
  case(typeof Yargs.format === 'undefined'):
    break;
  case(Yargs.format.toString().match(/json/i) !== null):
    dataFormat = 'json';
    break;
  default:
}

//look for options-* 
let options = {};
Object.keys(Yargs).forEach(function(key){
  let keyParts = key.split('-');
  if(keyParts[0]==='options'){
    options[keyParts[1]]=Yargs[key];
  }
});

//look for header-n-*
//Object.keys(Yargs).forEach(function(key){
//  let keyParts = key.split('-');
//  if(keyParts[0] === 'header'){
//    //find out which column we're setting an option on
//    let column = keyParts[1];
//    if(typeof header[column] === 'undefined'){
//      header[column] = {}
//    }
//    header[column][keyParts[2]] = Yargs[key];
//  }
//});

//if header is specified, we'll need to have a size on it


//because different dataFormats 
let runTable = function(input){
  
  let header = [], 
  body = input; 
  //footer = [], 
  let Table = require('../src/factory.js');
  options.terminalAdapter = true;
  let t1 = Table(header,body,options);
  
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
      let data,msg;
      try {
        data = JSON.parse(chunk);
      }
      catch(e){
        msg = Chalk.bgRed.white(msg);
        msg = msg + "\n\nPlease check to make sure that your input data consists of JSON or specify a different format with the --format flag.";
        sendError(msg);
      }
      runTable(data);
      break;
    default:
      let formatterOptions = {};
      Object.keys(Yargs).forEach(function(key){
        if(key.slice(0,4) === 'csv-' && typeof(Yargs[key]) !== 'undefined'){
          formatterOptions[key.slice(4)] = Yargs[key];
        }
      });
      
      Csv.parse(chunk,formatterOptions,function(err, data){
        //validate csv  
        if(typeof data === 'undefined'){
          let msg = "CSV parse error.";
          msg = Chalk.bgRed.white(msg);
          msg = msg + '\n\n' + err;
          msg = msg + '\n\n' + 'Please check to make sure that your input data consists of valid comma separated values or specify a different format with the --format flag.';
          sendError(msg);
        }
        runTable(data);
      });
  }
});

if (process.platform === "win32") {
  let rl = require("readline").createInterface({
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
