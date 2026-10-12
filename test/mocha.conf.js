/* globals describe, it */
const chai = require("chai"),
  // eslint-disable-next-line no-unused-vars
  expect = chai.expect,
  // eslint-disable-next-line no-unused-vars
  assert = chai.assert,
  // eslint-disable-next-line no-unused-vars
  should = chai.should(),
  fs = require("fs"),
  path = require("path"),
  glob = require("glob"),
  grunt = require("grunt"),
  exec = require("child_process").exec,
  pkg = require("../package.json"),
  savedTestDir = path.join(__dirname, "/saved_test_outputs")

chai.should()

// Test all example scripts against their saved output
let allScripts = glob.sync(path.join(__dirname, "../examples/*.js")),
  excludeScripts = glob.sync(path.join(__dirname, "../examples/example-*.js")),
  exampleScripts = allScripts.filter(p => !excludeScripts.includes(p))

exampleScripts.forEach(function(element) {

  let fileName = path.basename(element).replace(/\..*/, ""),
    savedTestPath = path.join(savedTestDir, `${fileName}-output.txt`)

  describe(element, function() {
    it(`Should match ${savedTestPath}`, function(deferred) {
      // Pin the ANSI level and column count so the goldens do not depend on the
      // caller's environment: `--color=always` alone is overridden by an ambient
      // FORCE_COLOR/NO_COLOR, which made the same tests pass under a pipe and
      // fail on a developer's terminal.
      const childEnv = Object.assign({}, process.env, {
        COLUMNS: String(pkg.defaultTestColumns),
        FORCE_COLOR: "1"
      })
      delete childEnv.NO_COLOR
      exec(`node ${element} --color=always`, { env: childEnv },
        function (error, stdout /* , stderr */) {
          if (error !== null) {
            grunt.log.error(`Exec error: ${error}`)
          }
          var subname = fileName.replace(/\..*/, ""),
            filepath = path.join(savedTestDir, `${subname}-output.txt`),
            expected1 = fs.readFileSync(filepath, "utf-8")

          // example result should match saved output
          stdout.should.equal(expected1)
          deferred()
        }
      )
    })
  })
})
