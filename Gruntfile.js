/**
 * To debug gruntfile:
 * node-debug $(which grunt) task
 */	


module.exports = function(grunt) {

	//Modules for browserify to ignore
	var _ignore = '--ignore=path --ignore=request --ignore=http --ignore=fs --ignore=vm --ignore=process --ignore=lodash';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		options : {
			timestamp : (function(){
				//A FORMATTED TIMESTAMP STRING FOR BACKUP NAMING
				var d = new Date(),dstr = '';
				dstr = ('0' + d.getHours()).slice(-2)
				+ ':' + ('0' + d.getMinutes()).slice(-2)
				+ ':' + ('0' + d.getSeconds()).slice(-2);
				return dstr;
			}())
		},
		
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
		},
		
		uglify: {
			"min": {
				options: {
					banner: '/** \n<%= pkg.name %>: <%= pkg.description %> \nVersion: <%= pkg.version %> \nBuilt: <%= grunt.template.today("yyyy-mm-dd") %> <%= options.timestamp %>\nAuthor: <%= pkg.author %>  \n*/\n'
					,mangle : true
					,compress : true
					,drop_debugger : false
					,wrap : true
				}
				,files: {
					'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js',
				}
			},
			"bundle-min": {
				options: {
					banner: '/** \n<%= pkg.name %>: <%= pkg.description %> \nVersion: <%= pkg.version %> \nBuilt: <%= grunt.template.today("yyyy-mm-dd") %> <%= options.timestamp %>\nAuthor: <%= pkg.author %>  \n*/\n'
					,mangle : true
					,compress : true
					,drop_debugger : false
					,wrap : true
				}
				,files: {
					'dist/<%= pkg.name %>.bundle.min.js': 'dist/<%= pkg.name %>.bundle.js',
				}
			}
		},
	
		shell: {
			"generate-vim-tags-file": {
				command: function (){
					var cmd = 'find . -name "*.js" -path "./src/*" | xargs jsctags {} -f | sed "/^$/d" | sort > tags'; 
					return cmd;
				}
			},
			"browserify-prod-standalone": {
				command: function () {
					var cmd = 'browserify --debug --standalone=TtyTable '+_ignore+' -r ./src/main.js > ./dist/<%= pkg.name %>.js';
					return cmd;
				}
			},
			"browserify-devel-standalone": {
				command: function () {
					var cmd = 'browserify --debug --standalone=TtyTable '+_ignore+' -r ./src/main.js > ./dist/<%= pkg.name %>.devel.js';
					return cmd;
				}
			},
			"browserify-prod-bundle": {
				command: function () {
					var cmd = 'browserify '+_ignore+' -r ./src/main.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.js';
					return cmd;
				}
			},
			"browserify-devel-bundle": {
				command: function () {
					var cmd = 'browserify --debug '+_ignore+' -r ./src/main.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.devel.js';
					return cmd;
				}
			},
			"cleanup" : {
				command: function(){
					return "rm ./dist/<%= pkg.name %>.js ./dist/<%= pkg.name %>.bundle.js";
				}
			}	
		},
	
		//regenerate tags file on file save
		watch: {
			scripts: {
				files: ['**/*.js'],
				tasks: ['shell:generate-vim-tags-file'],
				options: {
					spawn: true,
					reload: false
				}
			}
		}	
	});

	grunt.registerTask('save-test-outputs','Saves the ouptuts of all unit tests to file.',function(){
	
		var glob = require('glob');
		var exec = require('child_process').exec, child;
		var gruntDeferred = this.async();
		var jobQueue = [];
		var Orgy = require('orgy');
		var fs = require('fs');	

		//Get list of all test scripts
		var list = glob.sync('examples/*.js'); 
		list.forEach(function(element,index,array){
			
			//Create a deferred for each run, which is pushed into a queue.
			var deferred = Orgy.deferred();
			jobQueue.push(deferred);

			child = exec('node ./'+element+' --color=always',
			function (error, stdout, stderr) {
				if (error !== null) {
					grunt.log.error('Exec error: ' + error);
				}
				var subname = element.split('.')[0];
				filename = subname + '-output.txt';
				fs.writeFileSync(filename,stdout);
				grunt.log.write('Wrote output to text file: ' + filename + '\n');
				deferred.resolve();
			});
		});

		//Resolve grunt deferred only after jobQueue is complete.
		Orgy.queue(jobQueue,[{
			timeout : 1000	
		}])
		.done(function(){
			gruntDeferred();
		});

	});

	grunt.registerTask('doc','Documentation generation task',function(){
		var gruntDeferred = this.async(), 
				Orgy = require('orgy'),
				deferred1 = Orgy.deferred({timeout : 20000}),
				deferred2 = Orgy.deferred({timeout : 20000}),
				queue = Orgy.queue([deferred1,deferred2],{
									timeout : 20000
								})
								.done(function(){
									gruntDeferred();
								}),
				fs = require('fs');
		
		//Get README
		var readme = fs.readFileSync("./README.md",{
			encoding : "utf-8"
		});	
		
		//Inject example usage into README
		var example1 = fs.readFileSync('./examples/node-example.js',{
			encoding : 'utf-8'
		});
		example1 = example1.replace('../','tty-table');
		example1 = '\n```\n' + example1 + '\n```';	
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
				'<!--API-REF-->\n\n'+str+'\n<!--END-API-REF-->');

			fs.writeFileSync("./README.md",readme);

			deferred2.resolve();
		});
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('tags', [
		'shell:generate-vim-tags-file',
	]);

	grunt.registerTask('test', [
		'mochaTest:test'
	]);

	grunt.registerTask('t', [
		'mochaTest:test'
	]);

	grunt.registerTask('st',[
		'save-test-outputs'
	]);

	grunt.registerTask('test-travis', [
		'mochaTest:test'
	]);

	grunt.registerTask('default', [
		'shell:browserify-prod-standalone',
		'shell:browserify-devel-standalone',
		'shell:browserify-prod-bundle',
		'shell:browserify-devel-bundle',
		'uglify',
		'shell:cleanup',
		'doc'
	]);
};
