var Table = require("../")

const rows = [[`The use of the secure-rm CLI is deprecated.
Migrate over -> secure-rm-cli. Run:
npm un secure-rm -g
npm i secure-rm-cli -g`]]

const t1 = Table([], rows, {
  borderStyle: 1,
  borderColor: "yellow",
  paddingBottom: 0,
  headerAlign: "center",
  headerColor: "yellow",
  align: "center",
  color: "white"
})

const str1 = t1.render()
console.log(str1)
