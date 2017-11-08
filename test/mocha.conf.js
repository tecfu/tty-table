var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var fs = require('fs');
var glob = require('glob');
var grunt = require('grunt');
var savedTestDir = __dirname + '/saved_test_outputs';

//Test all example scripts against their saved output
var exampleScripts = glob.sync(__dirname + '/../examples/*.js');

exampleScripts.forEach(function(element,index,array){
 
  let fileName = element.split('/').pop();
  let savedTestPath = savedTestDir + '/' + fileName + '-output.txt';
  
  describe(element,function(){
    it('Should match ' + savedTestPath, function(deferred){
      var exec = require('child_process').exec, child;
      child = exec('node '+element+' --color=always',
        function (error, stdout, stderr) {
          //console.log('stdout: ' + stdout);
          //console.log('stderr: ' + stderr);
          if (error !== null) {
            grunt.log.error('Exec error: ' + error);
          }
          var subname = fileName.split('.')[0];
          var expected1 = fs.readFileSync(savedTestDir + '/' + subname + '-output.txt',{encoding : 'utf-8'});

          //example result should match saved output
          stdout.should.equal(expected1);
          deferred();
      });
    });
  });
});
