/**
 * to debug gruntfile:
 * node-debug $(which grunt) task
 */

module.exports = function(grunt) {

  // modules for browserify to ignore
  const _ignore = `--ignore=path --ignore=request --ignore=http --ignore=fs --ignore=vm --ignore=lodash --ignore=yargs`

  // project configuration.
  grunt.initConfig({


    pkg: grunt.file.readJSON("package.json"),


    shell: {

      browserify_prod_umd: {
        command: () => `npx browserify --standalone=TTY_Table ${_ignore} -r ./adapters/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.umd.js -t [ babelify --presets [ es2015 babili] ]`
      },

      browserify_devel_umd: {
        command: () => `npx browserify --debug --standalone=TTY_Table ${_ignore} -r ./adapters/default-adapter.js > ./dist/<%= pkg.name %>.umd.js -t [ babelify --presets [ es2015 babili] ]`
      },

      browserify_prod_cjs: {
        command: () => `npx browserify ${_ignore} -r ./adapters/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.cjs.js -t [ babelify --presets [ es2015 babili] ]`
      },

      browserify_devel_cjs: {
        command: () => `npx browserify --debug ${_ignore} -r ./adapters/default-adapter.js:<%= pkg.name %> > ./dist/<%= pkg.name %>.cjs.devel.js -t [ babelify --presets [ es2015 babili] ]`
      },

      generate_vim_tags_file: {
        command: () => `find . -name \"*.js\" -path \"./src/*\" | xargs jsctags {} -f | sed \"/^$/d\" | sort > tags`
      }
    },

    // regenerate tags file on file save
    watch: {
      scripts: {
        files: ["**/*.js"],
        tasks: [
          "shell:generate_vim_tags_file",
          "mochaTest:test"
        ],
        options: {
          spawn: true,
          livereload: true // defaults to port 35729
        }
      }
    }
  })


  grunt.registerTask("save_test_outputs",
    "Saves the ouptuts of all unit tests to file.", function() {

    const fs = require("fs")
    const glob = require("glob")
    const exec = require("child_process").exec
    const Orgy = require("orgy")

    let gruntDeferred = this.async()
    const savedTestDir = `${__dirname}/test/saved_test_outputs`

    let jobQueue = []

    // get list of all example scripts
    const all = glob.sync("examples/*.js")
    const exclude = glob.sync("examples/example-*.js")
    const list = all.filter(p => !exclude.includes(p))

    list.forEach( element => {
      // create a deferred for each run, which is pushed into a queue.
      let deferred = Orgy.deferred()
      jobQueue.push(deferred)

      // eslint-disable-next-line no-unused-vars
      let child = exec(`node ./${element} --color=always`,
        function (error, stdout/* , stderr*/) {
          if (error !== null) {
            grunt.log.error(`Exec error: ${ error }`)
          }

          let subname = element.split("/").pop().split(".")[0]
          let filename = `${subname}-output.txt`
          let filepath = `${savedTestDir}/${filename}`

          fs.writeFileSync(filepath, stdout)
          grunt.log.write(`Wrote output to text file: ${filepath}\n`)

          deferred.resolve()
        })
    })

    // resolve grunt deferred only after jobQueue is complete.
    Orgy.queue(jobQueue, [{
      timeout: 1000
    }])
    .done(function() {
      gruntDeferred()
    })

  })


  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-shell")


  grunt.registerTask("tags", [
    "shell:generate_vim_tags_file",
  ])
  grunt.registerTask("st", [
    "save_test_outputs"
  ])
  grunt.registerTask("browserify", [
    "shell:browserify_prod_umd",
    //"shell:browserify_devel_umd",
    "shell:browserify_prod_cjs",
    //"shell:browserify_devel_cjs",
  ])
}
