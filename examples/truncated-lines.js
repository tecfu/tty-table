var Chalk = require('chalk');
var Table = require('../');

var header = [
  {
    value : "item",
    formatter : function(value){
      return Chalk.cyan(value);
    },
    width : 10
  },
  {
    value : "price",
    width : 10
  },
  {
    value : "organic",
    width : 10
  }
];

//test truncation with elipsis
var t1 = Table(header,[],{
  borderStyle : 1,
  paddingBottom : 0,
  headerAlign : "center",
  align : "center",
  color : "green",
  truncate : "..."
});

t1.push(
  ["chocolate cake",4.65,"no"]
);

var str1 = t1.render();
console.log(str1);

//test truncation with spaces
var t2 = Table(header,[],{
  borderStyle : 1,
  paddingBottom : 0,
  headerAlign : "center",
  align : "center",
  color : "green",
  truncate : "..."
});

t2.push(
  ["pound cake",123456789123456789,"no"]
);

var str1 = t2.render();
console.log(str1);

//test with padding
var t3 = Table(header,[],{
  borderStyle : 1,
  paddingLeft : 2,
  paddingRight: 2,
  headerAlign : "center",
  align : "center",
  color : "green",
  truncate : "..."
});

t3.push(
  ["pound cake",123456789123456789,"no"]
);

var str1 = t3.render();
console.log(str1);

