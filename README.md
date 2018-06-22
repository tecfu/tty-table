# tty-table

[![Build Status](https://travis-ci.org/tecfu/tty-table.svg?branch=master)](https://travis-ci.org/tecfu/tty-table) [![Dependency Status](https://david-dm.org/tecfu/tty-table.png)](https://david-dm.org/tecfu/tty-table) [![NPM version](https://badge.fury.io/js/tty-table.svg)](http://badge.fury.io/js/tty-table) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Display yout data in a table using a terminal, browser, or browser console.

## Installation

- To install as a [terminal application](docs/terminal.md):

```sh
$ sudo apt-get install nodejs 
$ npm install tty-table -g
```

- As a Nodejs module:

```sh
$ npm install tty-table
```

- Browser (via browserify)

```html
<script src="tty-table.bundle.min.js"></script>
<script>
 var Table = require('tty-table');
 ...
</script>
```

## Why would someone do such a thing?

- Can be used as a bugfixed, drop-in replacement for the [unmaintained, but popular Automattic/cli-table](https://github.com/Automattic/cli-table/issues/91):
```js
var Table = require('tty-table')('automattic-cli-table');
//now runs with same syntax as Automattic/cli-table
...
```

- Fixes these open issues with Automattic/cli-table:
  - [Text alignment](https://github.com/Automattic/cli-table/issues/64)
  - [Alternative table character sets](https://github.com/Automattic/cli-table/issues/10)
  - [Automatic text wrapping](https://github.com/Automattic/cli-table/issues/35)
  - [Wide character support](https://github.com/Automattic/cli-table/issues/82)
  - [Chokes on null values](https://github.com/Automattic/cli-table/issues/65)
  - [Automatically resize to terminal width](https://github.com/tecfu/tty-table/issues/4)


### In addition to the fixes listed above, the native API also supports:

- Optional callbacks on column values
- Header, body column alignment
- Padding
- Passing of rows as either arrays or objects
- Colors (not supported in browser)
- [Footer](https://github.com/tecfu/tty-table/issues/6)
- [Works in the browser as well as nodejs](https://cdn.rawgit.com/tecfu/tty-table/master/examples/browser-example.html)
- [Can be run as a standalone terminal application](docs/terminal.md)

## Output Examples

### Terminal (Static)

[examples/styles-and-formatting.js](examples/styles-and-formatting.js)

![Static](https://cloud.githubusercontent.com/assets/7478359/15691679/07142030-273f-11e6-8f1e-25728d558a2d.png "Static Example") 

### Terminal (Streaming)

```
$ node examples/data/fake-stream.js | tty-table --format=json
```

![Streaming](https://cloud.githubusercontent.com/assets/7478359/26528893/88e38e38-4369-11e7-8125-05df0259511e.gif "Streaming Example") 

- *See the built-in help for the terminal version of tty-table with: 
```
$ tty-table -h
```

### Browser & Browser Console 

- [examples/browser-example.html](examples/browser-example.html)

![Browser Console Example](https://cloud.githubusercontent.com/assets/7478359/25214897/df99d2e8-254e-11e7-962f-743890292a24.png) 

[Working Example in Browser](https://cdn.rawgit.com/tecfu/tty-table/master/examples/browser-example.html)

> Note that neither ASCI colors nor default borders are rendered in the browser.
> An alternative border style, as shown below, should be used by setting the following option:
>
> ```
> borderStyle : 2
> ```

## API Reference 
<!--API-REF-->

<a name="Table"></a>

## Table
**Kind**: global class  
**Note**: <a name="note"/>
Default border character sets:
```js
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
| header.column.width | <code>string</code> \| <code>number</code> | default: "auto" |
| header.column.paddingBottom | <code>number</code> | default: 0 |
| header.column.paddingLeft | <code>number</code> | default: 1 |
| header.column.paddingRight | <code>number</code> | default: 1 |
| header.column.paddingTop | <code>number</code> | default: 0 |
| rows | <code>array</code> | [See example](#example-usage) |
| options | <code>object</code> | Table options |
| options.borderStyle | <code>number</code> | default: 1 (0 = no border)  Refers to the index of the desired character set. |
| options.borderCharacters | <code>array</code> | [See @note](#note) |
| options.borderColor | <code>string</code> | default: terminal's default color |
| options.compact | <code>boolean</code> | default: false Removes horizontal lines when true. |
| options.defaultErrorValue | <code>mixed</code> | default: 'ERROR!' |
| options.defaultValue | <code>mixed</code> | default: '?' |
| options.errorOnNull | <code>boolean</code> | default: false |
| options.truncate | <code>mixed</code> | default: false  <br/> When this property is set to a string, cell contents will be truncated by that string instead of wrapped when they extend beyond of the width of the cell.  <br/> For example if:  <br/> <code>"truncate":"..."</code> <br/> the cell will be truncated with "..." |

**Example**  
```js
let Table = require('tty-table');
let t1 = Table(header,rows,options);
console.log(t1.render()); 
```
<a name="Table.Cls.render"></a>

### Table.Cls.render() ⇒ <code>String</code>
Renders a table to a string

**Kind**: static method of [<code>Table</code>](#Table)  
**Example**  
```js
let str = t1.render(); 
console.log(str); //outputs table
```

<!--END-API-REF-->

## Running tests

```sh
$ grunt test
```

## Saving the output of new unit tests 

```sh
$ grunt st
```
- Because: 

`node script.js --color=always`

## Dev Tips

- To generate vim tags (make sure [jsctags](https://github.com/ramitos/jsctags) is installed globally)

```sh
$ grunt tags
```

- To generate vim tags on file save 

```sh
$ grunt watch
```

## [Packaging as a distributable](packaging.md)


## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2015-2017, Tecfu. 
