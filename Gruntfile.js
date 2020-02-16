/**
 * To debug gruntfile:
 * node-debug $(which grunt) task
 */
module.exports = function(grunt) {

  // Modules for browserify to ignore
  const _ignore = "--ignore=path --ignore=request --ignore=http --ignore=fs --ignore=vm --ignore=process --ignore=lodash --ignore=yargs",
    banner = "/** \n<%= pkg.name %>: <%= pkg.description %> \nVersion: <%= pkg.version %> \nBuilt: <%= grunt.template.today(\"yyyy-mm-dd\") %> <%= options.timestamp %>\nAuthor: <%= pkg.author %>  \n*/\n"

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    options: {
      timestamp: (function() {
        // A FORMATTED TIMESTAMP STRING FOR BACKUP NAMING
        return new Date().toISOString().replace(/.*T|\..*/g, "")
      }())
    },

    shell: {
      "browserify-prod-standalone": {
        command: function () {
          let cmd = `npx browserify --standalone=TtyTable ${_ignore} -r ./adapters/default-adapter.js > ./dist/<%= pkg.name %>.js -t [ babelify --presets [ es2015 babili] ] -p [ browserify-banner --template "${banner}"]`
          return cmd
        }
      },
      "browserify-devel-standalone": {
        command: function () {
          let cmd = `npx browserify --debug --standalone=TtyTable ${_ignore} -r ./adapters/default-adapter.js > ./dist/<%= pkg.name %>.devel.js -t [ babelify --presets [ es2015 babili] ]`
          return cmd
        }
      },
      "browserify-prod-bundle": {
        command: function () {
          let cmd = `npx browserify ${_ignore} -r ./adapters/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.js -t [ babelify --presets [ es2015 babili] ]`
          return cmd
        }
      },
      "browserify-devel-bundle": {
        command: function () {
          let cmd = `npx browserify --debug ${_ignore} -r ./adapters/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.bundle.devel.js -t [ babelify --presets [ es2015 babili] ]`
          return cmd
        }
      },

      // "cleanup" : {
      //  command: function(){
      //    return "rm ./dist/<%= pkg.name %>.js ./dist/<%= pkg.name %>.bundle.js";
      //  }
      // },
      "generate-vim-tags-file": {
        command: function () {
          let cmd = "find . -name \"*.js\" -path \"./src/*\" | xargs jsctags {} -f | sed \"/^$/d\" | sort > tags"
          return cmd
        }
      },
      "get-node-version": {
        command: function () {
          let cmd = "echo \"Fetching node version...\n\" && node --version"
          return cmd
        }
      },
    },

    // regenerate tags file on file save
    watch: {
      scripts: {
        files: ["**/*.js"],
        tasks: [
          "shell:generate-vim-tags-file",
          "mochaTest:test"
        ],
        options: {
          spawn: true,
          livereload: true // defaults to port 35729
        }
      }
    }
  })

  grunt.registerTask("save-test-outputs", "Saves the ouptuts of all unit tests to file.", function() {

    let glob = require("glob")
    let exec = require("child_process").exec
    let gruntDeferred = this.async()
    let jobQueue = []
    let orgy = require("orgy")
    let fs = require("fs")
    let savedTestDir = `${__dirname  }/test/saved_test_outputs`

    // Get list of all example scripts
    let all = glob.sync("examples/*.js"),
      exclude = glob.sync("examples/example-*.js"),
      list = all.filter(p => !exclude.includes(p))

    list.forEach(function(element) {

      // Create a deferred for each run, which is pushed into a queue.
      let deferred = orgy.deferred()
      jobQueue.push(deferred)

      // eslint-disable-next-line no-unused-vars
      let child = exec(`node ./${element} --color=always`,
        function (error, stdout/* , stderr*/) {
          if (error !== null) {
            grunt.log.error(`Exec error: ${  error}`)
          }
          let subname = element.split("/").pop().split(".")[0]
          let filename = `${subname  }-output.txt`
          let filepath = `${savedTestDir  }/${  filename}`
          fs.writeFileSync(filepath, stdout)
          grunt.log.write(`Wrote output to text file: ${  filepath  }\n`)
          deferred.resolve()
        })
    })

    // Resolve grunt deferred only after jobQueue is complete.
    orgy.queue(jobQueue, [{
      timeout: 1000
    }])
      .done(function() {
        gruntDeferred()
      })

  })

  grunt.registerTask("doc", "Documentation generation task", function() {

    const fs = require("fs")

    // Get README
    let readme = fs.readFileSync("./README.md", {
      encoding: "utf-8"
    })

    // Inject example usage into README
    let example1 = fs.readFileSync("./examples/styles-and-formatting.js", {
      encoding: "utf-8"
    })
    example1 = example1.replace("../", "tty-table")
    example1 = `\n\`\`\`js\n${  example1  }\n\`\`\``
    readme = readme.replace(
      /<!--EXAMPLE-USAGE-->((?:.|[\r\n])*)<!--END-EXAMPLE-USAGE-->/m,
      `<!--EXAMPLE-USAGE-->\n${example1}\n<!--END-EXAMPLE-USAGE-->`
    )

    const jsdoc2md = require("jsdoc-to-markdown")
    let jsdocData = jsdoc2md.getTemplateDataSync({
      // configure: __dirname + '/conf.json', //jsdoc config file path
      files: "src/*.js"
    })
    let stdout = jsdoc2md.renderSync({
      data: jsdocData,
      "no-usage-stats": true
    })

    // Reformat documentation to reflect correct method naming.
    let str = stdout.replace(/new /g, "").replace(/_public\./g, "")

    readme = readme.replace(
      /<!--API-REF-->((?:.|[\r\n])*)<!--END-API-REF-->/m,
      `<!--API-REF-->\n\n${str}\n<!--END-API-REF-->`
    )

    // save
    fs.writeFileSync("./README.md", readme)
  })

  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-shell")

  grunt.registerTask("tags", [
    "shell:generate-vim-tags-file",
  ])

  grunt.registerTask("st", [
    "save-test-outputs"
  ])

  grunt.registerTask("default", [
    "shell:get-node-version",
    "shell:browserify-prod-standalone",
    "shell:browserify-devel-standalone",
    "shell:browserify-prod-bundle",
    "shell:browserify-devel-bundle",
    // 'shell:cleanup',
    // 'doc'
  ])
}
