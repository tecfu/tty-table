# tty-table

[![Build Status](https://travis-ci.org/tecfu/tty-table.svg?branch=master)](https://travis-ci.org/tecfu/tty-table) [![Dependency Status](https://david-dm.org/tecfu/tty-table.png)](https://david-dm.org/tecfu/tty-table) [![NPM version](https://badge.fury.io/js/tty-table.svg)](http://badge.fury.io/js/tty-table) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A terminal table widget for nodejs and the browser.

## Installation

- As a [terminal application](docs/terminal.md):

```
$ sudo apt-get install nodejs //if not already installed
$ npm install tty-table -g
```

- As a Nodejs module:

```
npm install tty-table
```

- Browser (via browserify)

```
<script src="tty-table.bundle.min.js"></script>
<script>
	var Table = require('tty-table');
	...
</script>
```

## Why would someone do such a thing?

### Drop-in replacement for [Automattic/cli-table](docs/automattic-cli-table.md):
```
var Table = require('tty-table')('automattic-cli-table');
//now runs with same syntax as Automattic/cli-table
...
```

- Fixes these known issues with Automattic/cli-table:
	- Automatic text wrapping
	- [Supports Asian characters](https://github.com/tecfu/tty-table/pull/5) 
	- [Automatically resizes to terminal width](https://github.com/tecfu/tty-table/issues/4)

- See the [docs here](docs/automattic-cli-table.md).

### Beyond that, the native API also supports:

- Optional callbacks on column values
- Header, body column alignment
- Padding
- Passing of rows as either arrays or objects
- Colors (not supported in browser)
- [Footer](https://github.com/tecfu/tty-table/issues/6)
- [Works in the browser as well as nodejs](https://cdn.rawgit.com/tecfu/tty-table/master/examples/browser-example.html)
- [Can be run as a standalone terminal application](docs/terminal.md)

## Example Output

### Terminal Application 
(npm i -g tty-table)

![Terminal Application Example](https://cloud.githubusercontent.com/assets/7478359/15691533/39f5fed4-273e-11e6-81a6-533bd8dbd1c4.gif "Terminal Application Example") 

### Nodejs Module
![Terminal Example](https://cloud.githubusercontent.com/assets/7478359/15691679/07142030-273f-11e6-8f1e-25728d558a2d.png "Terminal Example") 

### Browser & Browser Console 
![Browser Console Example](https://cloud.githubusercontent.com/assets/7478359/15691676/043a47ea-273f-11e6-8889-df03e8a25e26.png "Browser Console Example") 

[Working Example in Browser](https://cdn.rawgit.com/tecfu/tty-table/master/examples/browser-example.html)

> Note that neither ASCI colors nor default borders are rendered in the browser.
> An alternative border style, as shown below, should be used by setting the following option:
>
> ```
> borderStyle : 2
> ```

## Default API Usage

<!--EXAMPLE-USAGE-->

```
var Table = require('tty-table');
var chalk = require('chalk');

var header = [
	{
		value : "item",
		headerColor : "cyan",
		color: "white",
		align : "left",
		paddingLeft : 5,
		width : 30
	},
	{
		value : "price",
		color : "red", 
		width : 10,
		formatter : function(value){
			var str = "$" + value.toFixed(2);
			if(value > 5){
				str = chalk.underline.green(str);
			}
			return str;
		}
	},
	{
		alias : "Is organic?",	
		value : "organic",
		width : 15,
		formatter : function(value){
			
			//will convert an empty string to 0	
			//value = value * 1;
			
			if(value === 'yes'){
				value = chalk.black.bgGreen(value);
			}
			else{
				value = chalk.white.bgRed(value);
			}
			return value;
		}
	}
];

//Example with arrays as rows 
var rows = [
	["hamburger",2.50,"no"],
	["el jefe's special cream sauce",0.10,"yes"],
	["two tacos, rice and beans topped with cheddar cheese",9.80,"no"],
	["apple slices",1.00,"yes"],
	["ham sandwich",1.50,"no"],
	["macaroni, ham and peruvian mozzarella",3.75,"no"]
];

var footer = [
	"TOTAL",
	(function(){
		return rows.reduce(function(prev,curr){
			return prev+curr[1]
		},0)
	}()),
	(function(){
		var total = rows.reduce(function(prev,curr){
			return prev+((curr[2]==='yes') ? 1 : 0);
		},0);
		return (total/rows.length*100).toFixed(2) + "%";
	}())];

var t1 = Table(header,rows,footer,{
	borderStyle : 1,
	borderColor : "blue",
	paddingBottom : 0,
	headerAlign : "center",
	align : "center",
	color : "white"
});

str1 = t1.render();
console.log(str1);


//Example with objects as rows 
var rows = [
	{
		item : "hamburger",
		price : 2.50,
		organic : "no"
	},
	{
		item : "el jefe's special cream sauce",
		price : 0.10,
		organic : "yes"
	},
	{
		item : "two tacos, rice and beans topped with cheddar cheese",
		price : 9.80,
		organic : "no"
	},
	{
		item : "apple slices",
		price : 1.00,
		organic : "yes"	
	},	
	{
		item : "ham sandwich",
		price : 1.50,
		organic : "no"
	},
	{
		item : "macaroni, ham and peruvian mozzarella",
		price : 3.75,
		organic : "no"
	}
];

var t2 = Table(header,rows,{
	borderStyle : 1,
	paddingBottom : 0,
	headerAlign : "center",
	align : "center",
	color : "white"
});

var str2 = t2.render();
console.log(str2);

```
<!--END-EXAMPLE-USAGE-->

## Default API Reference 
<!--API-REF-->

<a name="Table"></a>

## Table
**Kind**: global class  
**Note**: <a name="note"/>
Default border character sets:
```
	[
		[
			{v: " ", l: " ", j: " ", h: " ", r: " "},
			{v: " ", l: " ", j: " ", h: " ", r: " "},
			{v: " ", l: " ", j: " ", h: " ", r: " "}
		],
		[
			{v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
			{v: "│", l: "├", j: "┼", h: "─", r: "┤"},
			{v: "│", l: "└", j: "┴", h: "─", r: "┘"}
		],
		[
			{v: "|", l: "+", j: "+", h: "-", r: "+"},
			{v: "|", l: "+", j: "+", h: "-", r: "+"},
			{v: "|", l: "+", j: "+", h: "-", r: "+"}
		]
	]
```  

* [Table](#Table)
    * [Table(header, rows, options)](#new_Table_new)
    * [.Cls.render()](#Table.Cls.render) ⇒ <code>String</code>

<a name="new_Table_new"></a>

### Table(header, rows, options)

| Param | Type | Description |
| --- | --- | --- |
| header | <code>array</code> | [See example](#example-usage) |
| header.column | <code>object</code> | Column options |
| header.column.alias | <code>string</code> | Alernate header column name |
| header.column.align | <code>string</code> | default: "center" |
| header.column.color | <code>string</code> | default: terminal default color |
| header.column.footerAlign | <code>string</code> | default: "center" |
| header.column.footerColor | <code>string</code> | default: terminal default color |
| header.column.formatter | <code>function</code> | Runs a callback on each cell value in the parent column |
| header.column.headerAlign | <code>string</code> | default: "center" |
| header.column.headerColor | <code>string</code> | default: terminal's default color |
| header.column.marginLeft | <code>number</code> | default: 0 |
| header.column.marginTop | <code>number</code> | default: 0 |
| header.column.maxWidth | <code>number</code> | default: 20 |
| header.column.paddingBottom | <code>number</code> | default: 0 |
| header.column.paddingLeft | <code>number</code> | default: 0 |
| header.column.paddingRight | <code>number</code> | default: 0 |
| header.column.paddingTop | <code>number</code> | default: 0 |
| rows | <code>array</code> | [See example](#example-usage) |
| options | <code>object</code> | Table options |
| options.borderStyle | <code>number</code> | default: 1 (0 = no border)  Refers to the index of the desired character set. |
| options.borderCharacters | <code>array</code> | [See @note](#note) |
| options.borderColor | <code>string</code> | default: terminal's default color |
| options.defaultErrorValue | <code>mixed</code> | default: 'ERROR!' |
| options.defaultValue | <code>mixed</code> | default: '?' |
| options.errorOnNull | <code>boolean</code> | default: false |
| options.truncate | <code>mixed</code> | default: false  Cell values are truncated when 'truncate' set to a string, length > 0 |

**Example**  
```
var Table = require('tty-table');
var t1 = Table(header,rows,options);
console.log(t1.render()); 
```
<a name="Table.Cls.render"></a>

### Table.Cls.render() ⇒ <code>String</code>
Renders a table to a string

**Kind**: static method of <code>[Table](#Table)</code>  
**Example**  
```
var str = t1.render(); 
console.log(str); //outputs table
```

<!--END-API-REF-->

## Running tests

```
grunt test
```

## Saving the output of new unit tests 

```
grunt st
```
- Because: 

`node script.js --color=always`

## Dev Tips

- To generate vim tags (make sure [jsctags](https://github.com/ramitos/jsctags) is installed globally)

```
grunt tags
```

- To generate vim tags on file save 

```
grunt watch
```

## [Packaging as a distributable](packaging.md)


## License

[GPLv3 License](http://www.gnu.org/licenses/gpl-3.0.en.html)

Copyright 2015-2016, Tecfu. 
