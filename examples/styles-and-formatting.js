const Table = require("../")
const chalk = require("chalk")

let header = [
  {
    value: "item",
    headerColor: "cyan",
    color: "white",
    align: "left",
    paddingLeft: 5,
    width: 30
  },
  {
    value: "price",
    color: "red",
    width: 10,
    formatter: function(value) {
      var str = `$${value.toFixed(2)}`
      if(value > 5) {
        str = chalk.underline.green(str)
      }
      return str
    }
  },
  {
    alias: "Is organic?",
    value: "organic",
    width: 15,
    formatter: function(value) {

      //will convert an empty string to 0
      //value = value * 1;

      if(value === "yes") {
        value = chalk.black.bgGreen(value)
      } else{
        value = chalk.white.bgRed(value)
      }
      return value
    }
  }
]

//Example with arrays as rows
const rows = [
  ["hamburger",2.50,"no"],
  ["el jefe's special cream sauce",0.10,"yes"],
  ["two tacos, rice and beans topped with cheddar cheese",9.80,"no"],
  ["apple slices",1.00,"yes"],
  ["ham sandwich",1.50,"no"],
  ["macaroni, ham and peruvian mozzarella",3.75,"no"]
]

const footer = [
  "TOTAL",
  (function() {
    return rows.reduce(function(prev,curr) {
      return prev+curr[1]
    },0)
  }()),
  (function() {
    var total = rows.reduce(function(prev,curr) {
      return prev+((curr[2]==="yes") ? 1 : 0)
    },0)
    return `${(total/rows.length*100).toFixed(2)  }%`
  }())]

let t1 = Table(header,rows,footer,{
  borderStyle: 1,
  borderColor: "blue",
  paddingBottom: 0,
  headerAlign: "center",
  align: "center",
  color: "white",
  truncate: "..."
})

console.log(t1.render())


//Example with objects as rows
const rows2 = [
  {
    item: "hamburger",
    price: 2.50,
    organic: "no"
  },
  {
    item: "el jefe's special cream sauce",
    price: 0.10,
    organic: "yes"
  },
  {
    item: "two tacos, rice and beans topped with cheddar cheese",
    price: 9.80,
    organic: "no"
  },
  {
    item: "apple slices",
    price: 1.00,
    organic: "yes"
  },
  {
    item: "ham sandwich",
    price: 1.50,
    organic: "no"
  },
  {
    item: "macaroni, ham and peruvian mozzarella",
    price: 3.75,
    organic: "no"
  }
]

const t2 = Table(header,rows2,{
  borderStyle: 1,
  paddingBottom: 0,
  headerAlign: "center",
  align: "center",
  color: "white"
})

console.log(t2.render())


//template literals
let header3 = [
  { value: "name", width: 30, headerAlign: "left" },
  { value: "price", width: 30, headerAlign: "left" }
]

const opts = {
  align: "left"
}

const rows3 = [
  [`apple ${chalk.red("mac")}`,92.50],
  ["ibm",120.15]
]

let t3 = Table(header3, rows3, opts)
console.log(t3.render())


const header4 = [
  {
    value: 'price',
    formatter(cellValue, columnIndex, rowIndex, rowData, inputData) {
      const row = inputData[rowIndex] // How to get the whole row
      let _color

      if(!row.enabled) _color = 'gray'
      if(row.important) _color = 'red'
      
      return chalk[_color](cellValue)
    }
  },
  {
    value: 'item'
  }
]

const rows4 = [
  { item: 'banana', price: 1.99, important: true, enabled: true },
  { item: 'grapes', price: 2.99, important: false, enabled: false }
]

const t4 = Table(header4, rows4)
console.log(t4.render())
