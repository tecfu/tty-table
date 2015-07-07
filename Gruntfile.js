/**
 * To debug gruntfile:
 * node-debug $(which grunt) task
 */

module.exports = function(grunt) {
	
	global.grunt = grunt;

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			test: {
				options: {
					ui : 'bdd',
					reporter: 'spec',
				},
				//We require all our tests in the conf file, so we
				//can do some pre-test functions before they are run.
				src: ['./test/mocha.conf.js']
			}
		}
	});

	grunt.registerTask('doc','Documentation generation task',function(){
		var gruntDeferred = this.async(), 
				Orgy = require('orgy'),
				deferred1 = Orgy.deferred(),
				deferred2 = Orgy.deferred(),
				queue = Orgy.queue([deferred1,deferred2]).done(function(){
					gruntDeferred();
				}),
				fs = require('fs');
		
		//Get README
		var readme = fs.readFileSync("./README.md",{
			encoding : "utf-8"
		});	
		
		//Inject example usage into README
		var example1 = fs.readFileSync('./examples/example-1.js',{
			encoding : 'utf-8'
		});
		example1 = example1.replace('../','tec-table');
		example1 = '```\n' + example1 + '\n```';	
		readme = readme.replace(/<!--EXAMPLE-USAGE-->((?:.|[\r\n])*)<!--END-EXAMPLE-USAGE-->/m,
				'<!--EXAMPLE-USAGE-->\n'+example1+'\n<!--END-EXAMPLE-USAGE-->');
		deferred1.resolve();
	
		//Inject public API reference	
		var exec = require('child_process').exec, child;
		child = exec('jsdoc2md "src/*.js"', function (error, stdout, stderr) {
			//console.log('stdout: ' + stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				grunt.log.error('Exec error: ' + error);
			}

			//Reformat documentation to reflect correct method naming.
			var str = stdout.replace(/new /g,'')
											.replace(/_public\./g,'');


			readme = readme.replace(/<!--API-REF-->((?:.|[\r\n])*)<!--END-API-REF-->/m,
				'<!--API-REF-->\n'+str+'\n<!--END-API-REF-->');

			fs.writeFileSync("./README.md",readme);

			deferred2.resolve();
		});
	});

	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', [
		'mochaTest:test'
	]);
	
	grunt.registerTask('t', [
		'mochaTest:test'
	]);

	grunt.registerTask('test-travis', [
		'mochaTest:test'
	]);

	grunt.registerTask('default', [
		'doc'
	]);
};
