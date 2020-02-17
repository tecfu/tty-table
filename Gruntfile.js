/**
 * to debug gruntfile:
 * node-debug $(which grunt) task
 */

module.exports = function(grunt) {

  // modules for browserify to ignore
  const _ignore = `--ignore=path --ignore=request --ignore=http --ignore=fs --ignore=vm --ignore=lodash --ignore=yargs`

  const banner = "/** \n<%= pkg.name %>: <%= pkg.description %> \nVersion: <%= pkg.version %> \nBuilt: <%= grunt.template.today(\"yyyy-mm-dd\") %> <%= options.timestamp %>\nAuthor: <%= pkg.author %>  \n*/\n"


  // project configuration.
  grunt.initConfig({


    pkg: grunt.file.readJSON("package.json"),


    options: {
      timestamp: () => new Date().toISOString().replace(/.*T|\..*/g, "")
    },


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

    let fs = require("fs")
    let glob = require("glob")
    let exec = require("child_process").exec
    let gruntDeferred = this.async()
    let jobQueue = []
    let Orgy = require("orgy")
    let savedTestDir = `${__dirname  }/test/saved_test_outputs`

    // get list of all example scripts
    let all = glob.sync("examples/*.js")
    let exclude = glob.sync("examples/example-*.js")
    let list = all.filter(p => !exclude.includes(p))

    list.forEach( element => {

      // create a deferred for each run, which is pushed into a queue.
      let deferred = Orgy.deferred()
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

    // resolve grunt deferred only after jobQueue is complete.
    Orgy.queue(jobQueue, [{
      timeout: 1000
    }])
    .done(function() {
      gruntDeferred()
    })

  })


  grunt.registerTask("doc", "Documentation generation task", function() {

    const fs = require("fs")
    const jsdoc2md = require("jsdoc-to-markdown")

    // get README
    let readme = fs.readFileSync("./README.md", {
      encoding: "utf-8"
    })

    // inject example usage into README
    let example1 = fs.readFileSync("./examples/styles-and-formatting.js", {
      encoding: "utf-8"
    })
    example1 = example1.replace("../", "tty-table")
    example1 = `\n\`\`\`js\n${  example1  }\n\`\`\``

    readme = readme.replace(
      /<!--EXAMPLE-USAGE-->((?:.|[\r\n])*)<!--END-EXAMPLE-USAGE-->/m,
      `<!--EXAMPLE-USAGE-->\n${example1}\n<!--END-EXAMPLE-USAGE-->`
    )

    let jsdocData = jsdoc2md.getTemplateDataSync({
      // configure: __dirname + '/conf.json', //jsdoc config file path
      files: "src/*.js"
    })

    let stdout = jsdoc2md.renderSync({
      data: jsdocData,
      "no-usage-stats": true
    })

    // reformat documentation to reflect correct method naming.
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
    // 'doc'
  ])
}
