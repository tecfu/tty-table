# tty-table 电传打字台

[![Build Status](https://travis-ci.org/tecfu/tty-table.svg?branch=master)](https://travis-ci.org/tecfu/tty-table) [![NPM version](https://badge.fury.io/js/tty-table.svg)](http://badge.fury.io/js/tty-table)

---

Display your data in a table using a terminal, browser, or browser console.

---

## Installation

- [Terminal](docs/terminal.md):

```sh
$ npm install tty-table -g
```

- Node Module

```sh
$ npm install tty-table
```

- Browser

```html
<script src="tty-table.bundle.min.js"></script>
<script>
 let Table = require('tty-table');
 ...
</script>
```

## [Examples](examples/)

[See here for complete example list](examples/)


### Terminal (Static)

[examples/styles-and-formatting.js](examples/styles-and-formatting.js)

![Static](https://cloud.githubusercontent.com/assets/7478359/15691679/07142030-273f-11e6-8f1e-25728d558a2d.png "Static Example") 

### Terminal (Streaming)

```
$ node examples/data/fake-stream.js | tty-table --format json --header examples/config/header.js
```

![Streaming](https://user-images.githubusercontent.com/7478359/51738817-47c25700-204d-11e9-9df1-04e478331658.gif "Streaming Example") 

- See the built-in help for the terminal version of tty-table with: 
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
> borderStyle : "dashed"
> ```

## API Reference 
<!--API-REF-->

<a name="Table"></a>

## Table
**Kind**: global class  

* [Table](#Table)
    * [Table(header, rows, options)](#new_Table_new)
    * [.tableObject.render()](#Table.tableObject.render) ⇒ <code>String</code>

<a name="new_Table_new"></a>

### Table(header, rows, options)

| Param | Type | Description |
| --- | --- | --- |
| header | <code>array</code> | [See example](#example-usage) |
| header.column | <code>object</code> | Column options |
| header.column.alias | <code>string</code> | Alternate header column name |
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
| options.borderStyle | <code>string</code> | default: "solid". options: "solid", "dashed", "none" |
| options.borderCharacters | <code>object</code> | [See @note](#note) |
| options.borderColor | <code>string</code> | default: terminal's default color |
| options.compact | <code>boolean</code> | default: false Removes horizontal lines when true. |
| options.defaultErrorValue | <code>mixed</code> | default: 'ERROR!' |
| options.defaultValue | <code>mixed</code> | default: '?' |
| options.errorOnNull | <code>boolean</code> | default: false |
| options.truncate | <code>mixed</code> | default: false <br/> When this property is set to a string, cell contents will be truncated by that string instead of wrapped when they extend beyond of the width of the cell.  <br/> For example if: <br/> <code>"truncate":"..."</code> <br/> the cell will be truncated with "..." |

**Example**  
```js
let Table = require('tty-table');
let t1 = Table(header,rows,options);
console.log(t1.render()); 
```
<a name="Table.tableObject.render"></a>

### Table.tableObject.render() ⇒ <code>String</code>
Add method to render table to a string

**Kind**: static method of [<code>Table</code>](#Table)  
**Example**  
```js
let str = t1.render(); 
console.log(str); //outputs table
```

<!--END-API-REF-->

## Running tests

```sh
$ npx grunt test
```

## Saving the output of new unit tests 

```sh
$ npx grunt st
```
- Because: 

`node script.js --color=always`

## Dev Tips

- To generate vim tags (make sure [jsctags](https://github.com/ramitos/jsctags) is installed globally)

```sh
$ npx grunt tags
```

- To generate vim tags on file save 

```sh
$ npx grunt watch
```

## [Packaging as a distributable](packaging.md)


## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2015-2019, Tecfu. 
