#!/usr/bin/env node
let csv = require('csv');
let yargs = require('yargs');
yargs.epilog('Copyight github.com/tecfu 2017');
yargs.option('csv-delimiter',{
  describe:'Set the field delimiter. One character only.',
  default:','
});
yargs.option('csv-escape',{
  describe:'Set the escape character. One character only.'
});
yargs.option('csv-rowDelimiter',{
  describe:'String used to delimit record rows. You can also use a special constant: "auto","unix","max","windows","unicode".',
  default: '\n'
});
yargs.option('format',{
  describe:'Set input data format',
  choices:['json','csv'],
  default:'csv'
});
yargs.option('options\u2010\u002A',{
  describe:'Specify an optional setting where * is the setting name. See README.md for a complete list.'
});
yargs.version(function(){
  let fs = require('fs');
  let path =__dirname+'/../package.json';
  let contents = fs.readFileSync(path,'utf-8');
  let json = JSON.parse(contents);
  return json.version;
});

let Chalk = require('chalk');
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
  case(typeof yargs.argv.format === 'undefined'):
    break;
  case(yargs.argv.format.toString().match(/json/i) !== null):
    dataFormat = 'json';
    break;
  default:
}

//look for options-* 
let options = {};
Object.keys(yargs.argv).forEach(function(key){
  let keyParts = key.split('-');
  if(keyParts[0]==='options'){
    options[keyParts[1]]=yargs.argv[key];
  }
});

//look for header-n-*
//Object.keys(yargs.argv).forEach(function(key){
//  let keyParts = key.split('-');
//  if(keyParts[0] === 'header'){
//    //find out which column we're setting an option on
//    let column = keyParts[1];
//    if(typeof header[column] === 'undefined'){
//      header[column] = {}
//    }
//    header[column][keyParts[2]] = yargs.argv[key];
//  }
//});

//if header is specified, we'll need to have a size on it


//because diffent dataFormats 
let runTable = function(input){
  
  let header = [], 
  body = input; 
  //footer = [], 

  let Table = require('./public.js');
  let t1 = Table.setup(header,body,options);
  
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
      Object.keys(yargs.argv).forEach(function(key){
        if(key.slice(0,4) === 'csv-' && typeof(yargs.argv[key]) !== 'undefined'){
          formatterOptions[key.slice(4)] = yargs.argv[key];
        }
      });
      
      csv.parse(chunk,formatterOptions,function(err, data){
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

//run help only at the end
yargs.argv = yargs.help('h').argv;
