/**
 * To debug gruntfile:
 * node-debug $(which grunt) task
 */  
module.exports = function(grunt) {

  //Modules for browserify to ignore
  var _ignore = '--exclude=path --exclude=request --exclude=http --exclude=fs --exclude=vm --exclude=process --exclude=lodash --exclude=yargs';

  var banner = '/** \n<%= pkg.name %>: <%= pkg.description %> \nVersion: <%= pkg.version %> \nBuilt: <%= grunt.template.today("yyyy-mm-dd") %> <%= options.timestamp %>\nAuthor: <%= pkg.author %>  \n*/\n';

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
    
    shell: {
      "browserify-prod-standalone": {
        command: function () {
          var cmd = 'browserify --standalone=TtyTable '+_ignore+' -r ./src/default-adapter.js > ./dist/<%= pkg.name %>.js -t [ babelify --presets [ es2015 babili] ] -p [ browserify-banner --template "'+banner+'"]';
          return cmd;
        }
      },
      "browserify-devel-standalone": {
        command: function () {
          var cmd = 'browserify --debug --standalone=TtyTable '+_ignore+' -r ./src/default-adapter.js > ./dist/<%= pkg.name %>.devel.js -t [ babelify --presets [ es2015 babili] ]';
          return cmd;
        }
      },
      "browserify-prod-bundle": {
         command: function () {
          var cmd = 'browserify '+_ignore+' -r ./src/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.js -t [ babelify --presets [ es2015 babili] ]';
            return cmd;
          }
         },
      "browserify-devel-bundle": {
        command: function () {
          var cmd = 'browserify --debug '+_ignore+' -r ./src/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.devel.js -t [ babelify --presets [ es2015 babili] ]';
          return cmd;
        }
      },

      //"cleanup" : {
      //  command: function(){
      //    return "rm ./dist/<%= pkg.name %>.js ./dist/<%= pkg.name %>.bundle.js";
      //  }
      //},
      "generate-vim-tags-file": {
        command: function (){
          var cmd = 'find . -name "*.js" -path "./src/*" | xargs jsctags {} -f | sed "/^$/d" | sort > tags'; 
          return cmd;
        }
      },
      "get-node-version": {
        command: function (){
          var cmd = 'echo "Fetching node version...\n" && node --version'; 
          return cmd;
        }
      },  
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
    var orgy = require('orgy');
    var fs = require('fs');  

    //Get list of all example scripts
    var list = glob.sync('examples/*.js'); 
    list.forEach(function(element){
      
      //Create a deferred for each run, which is pushed into a queue.
      var deferred = orgy.deferred();
      jobQueue.push(deferred);

      child = exec('node ./'+element+' --color=always',
      function (error, stdout, stderr) {
        if (error !== null) {
          grunt.log.error('Exec error: ' + error);
        }
        var subname = element.split('.')[0];
        var filename = subname + '-output.txt';
        fs.writeFileSync(filename,stdout);
        grunt.log.write('Wrote output to text file: ' + filename + '\n');
        deferred.resolve();
      });
    });

    //Resolve grunt deferred only after jobQueue is complete.
    orgy.queue(jobQueue,[{
      timeout : 1000  
    }])
    .done(function(){
      gruntDeferred();
    });

  });

  grunt.registerTask('doc','Documentation generation task',function(){
    var gruntDeferred = this.async(), 
        orgy = require('orgy'),
        deferred1 = orgy.deferred({timeout : 20000}),
        deferred2 = orgy.deferred({timeout : 20000}),
        fs = require('fs');
        orgy.queue([deferred1,deferred2],{
          timeout : 20000
        })
        .done(function(){
          gruntDeferred();
        });
    
    //Get README
    var readme = fs.readFileSync("./README.md",{
      encoding : "utf-8"
    });  
    
    //Inject example usage into README
    var example1 = fs.readFileSync('./examples/styles-and-formatting.js',{
      encoding : 'utf-8'
    });
    example1 = example1.replace('../','tty-table');
    example1 = '\n```js\n' + example1 + '\n```';  
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
    'shell:get-node-version',
    'shell:browserify-prod-standalone',
    'shell:browserify-devel-standalone',
    'shell:browserify-prod-bundle',
    'shell:browserify-devel-bundle',
    //'shell:cleanup',
    //'doc'
  ]);
};
