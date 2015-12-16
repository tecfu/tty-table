var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var fs = require('fs');
var glob = require('glob');

//Get list of all test scripts
var list = glob.sync('examples/*.js'); 

list.forEach(function(element,index,array){
	
	//Matching test
	describe(element,function(){
		it('Should match ' + element + '-output.txt',function(deferred){

			var exec = require('child_process').exec, child;

			child = exec('node ./'+element+' --color=always',
			function (error, stdout, stderr) {
				//console.log('stdout: ' + stdout);
				//console.log('stderr: ' + stderr);
				if (error !== null) {
					grunt.log.error('Exec error: ' + error);
				}
				var subname = element.split('.')[0];
				var expected1 = fs.readFileSync('./'+subname+'-output.txt',{encoding : 'utf-8'}); 
				stdout.should.equal(expected1);
				deferred();
			});
		});
	});
});
