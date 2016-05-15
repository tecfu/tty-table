var Table = require('../')('cli-table');

var table = new Table({
    head: ['TH 1 label', 'TH 2 label']
  , colWidths: [20, 10]
});

// table is an Array, so you can `push`, `unshift`, `splice` and friends
table.push(
    ['First value', 'Second value']
  , ['First value', 'Second value']
);

console.log(table.toString());
