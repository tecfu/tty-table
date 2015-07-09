var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var fs = require('fs');

//Basic test
describe('Basic test.',function(){
	it('Should match saved output.',function(deferred){

		var exec = require('child_process').exec, child;

		child = exec('node ./examples/node-example.js --color=always',
		function (error, stdout, stderr) {
			//console.log('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				grunt.log.error('Exec error: ' + error);
			}
			
			/* Comparison code generated with:
			node examples/node-example.js --color=always > examples/node-example-output.txt
			*/
			var expected1 = fs.readFileSync('./examples/node-example-output.txt',{encoding : 'utf-8'}); 
			stdout.should.equal(expected1);
			deferred();
		});
	});
});

//Null values test
describe('Testing null and undefined row values.',function(){
	it('Should match saved output.',function(deferred){

		var exec = require('child_process').exec, child;

		child = exec('node ./examples/null-undefined.js --color=always',
		function (error, stdout, stderr) {
			//console.log('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				grunt.log.error('Exec error: ' + error);
			}
			
			var expected1 = fs.readFileSync('./examples/null-undefined-output.txt',{encoding : 'utf-8'}); 
			stdout.should.equal(expected1);
			deferred();
		});
	});
});

