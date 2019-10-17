const Table = require('../');

//Example with arrays as rows 
const rows = [
  ['xxxyyyzzz'],
  ['zzzxxxyyy']
];

const t1 = Table(rows,{
  borderStyle: "none",
  marginTop: 0,
  marginLeft: 0,
  align : "left",
  color : "white"
});

str1 = t1.render();
console.log(str1);

//Example with arrays as rows 
const rows2 = [
  ['xxxyyyzzz'],
  ['zzzxxxyyy']
];

const t2 = Table(rows,{
  borderStyle : "none",
  compact: true,
  marginTop: 0,
  marginLeft: 0,
  align : "left",
  color : "white"
});

str2 = t2.render();
console.log(str2);



//Example with arrays as rows 
const rows3 = [
  ['xxxyyyzzz', 'aaaaa'],
  ['zzzxxxyyy', 'bbbbbb']
];

const t3 = Table(rows3,{
  borderStyle : "none",
  compact: true,
  align : "left",
  color : "white",
  marginTop: 0,
  marginLeft: 0
});

str3 = t3.render();
console.log(str3);
