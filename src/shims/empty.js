// browser bundle shim: stub modules the browser path never calls
// (yargs: smartwrap's CLI dep; chalk: unused because style.js falls back to
// kleur when process.stdout is absent) — same trick as the legacy browserify
// build's --ignore flags
module.exports = {}
