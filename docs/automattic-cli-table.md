# Automattic/cli-table Adapter

- tty-table can be used as a drop-in replacement for [Automattic/cli-table](https://github.com/Automattic/cli-table)

### Sample Usage 
(from Automattic/cli-table README.md):

```

var Table = require('tty-table/automattic-cli-table');

/* col widths */
var table = new Table({
head: ['Rel', 'Change', 'By', 'When']
, colWidths: [6, 21, 25, 17]
});
table.push(
['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago']
, ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
);
console.log(table.toString();

/* compact */
 var table = new Table({
 head: ['Rel', 'Change', 'By', 'When']
 , colWidths: [6, 21, 25, 17]
 , style : {compact : true, 'padding-left' : 1}
 });
 table.push(
 ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago']
 , ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
 , []
 , ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
 );
 console.log(table.toString());

/* headless */
var headless_table = new Table();
headless_table.push(['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago']);
console.log(headless_table.toString());

/* vertical */
var vertical_table = new Table({
	style : {
		head : ['green']
	}
});
vertical_table.push({ "Some Key": "Some Value"},
{ "Another much longer key": "And its corresponding longer value"}
);
console.log(vertical_table.toString());

/* cross */
var cross_table = new Table({ head: ["", "Header #1", "Header #2"] });
cross_table.push({ "Header #3": ["Value 1", "Value 2"] },
{ "Header #4": ["Value 3", "Value 4"] });
console.log(cross_table.toString());

```

- Outputs: 

![Automattic/cli-table Example Output](https://cloud.githubusercontent.com/assets/7478359/15693270/c901a0ce-2748-11e6-8fcb-e946b6c608f1.png "Automattic/cli-table Output Example") 

