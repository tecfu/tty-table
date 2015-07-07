var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var fs = require('fs');

//Test 1
describe('Testing example-1.js',function(){
	it('Should match saved output.',function(deferred){

		var exec = require('child_process').exec, child;

		child = exec('node ./examples/example-1.js --color=always',
		function (error, stdout, stderr) {
			//console.log('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				grunt.log.error('Exec error: ' + error);
			}
			
			/* Comparison code generated with:
			node examples/example-1.js --color=always > examples/out-1.txt
			*/
			var expected1 = fs.readFileSync('./examples/out-1.txt',{encoding : 'utf-8'}); 
			stdout.should.equal(expected1);
			deferred();
		});
	});
});

