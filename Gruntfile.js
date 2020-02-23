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

  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-shell")


  grunt.registerTask("tags", [
    "shell:generate_vim_tags_file",
  ])

  grunt.registerTask("browserify", [
    "shell:browserify_prod_umd",
    //"shell:browserify_devel_umd",
    "shell:browserify_prod_cjs",
    //"shell:browserify_devel_cjs",
  ])
}
