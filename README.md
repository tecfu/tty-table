# tty-table 电传打字台

[![Build Status](https://travis-ci.org/tecfu/tty-table.svg?branch=master)](https://travis-ci.org/tecfu/tty-table) [![NPM version](https://badge.fury.io/js/tty-table.svg)](http://badge.fury.io/js/tty-table)

---

Display your data in a table using a terminal, browser, or browser console.

---

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

<br/>
<br/>

## API Reference 
<!--API-REF-->

<a name="new_Table_new"></a>
### Table(header ```array```, rows ```array```, options ```object```)

| Param | Type | Description |
| --- | --- | --- |
| [header](#header_options) | <code>array</code> | Per-column configuration. An array of objects, one object for each column. Each object contains properties you can use to configure that particular column. [See available properties](#header_options) |
| [rows](#rows_examples) | <code>array</code> | Your data. An array of arrays or objects. [See examples](#rows_examples) |
| [options](#options_properties) | <code>object</code> | Global table configuration. [See available properties](#options_properties) |


<br/>
<a name="header_options"></a>

#### header <code>array of objects</code>

| Param | Type | Description |
| --- | --- | --- |
| alias | <code>string</code> | Text to display in column header cell |
| align | <code>string</code> | default: "center" |
| color | <code>string</code> | default: terminal default color |
| footerAlign | <code>string</code> | default: "center" |
| footerColor | <code>string</code> | default: terminal default color |
| formatter | <code>function(cellValue, columnIndex, rowIndex, rowData,inputData)</code> | Runs a callback on each cell value in the parent column |
| headerAlign | <code>string</code> | default: "center" |
| headerColor | <code>string</code> | default: terminal's default color |
| marginLeft | <code>integer</code> | default: 0 |
| marginTop | <code>integer</code> | default: 0 |
| width | <code>string</code> \|\| <code>integer</code> | default: "auto" |
| paddingBottom | <code>integer</code> | default: 0 |
| paddingLeft | <code>integer</code> | default: 1 |
| paddingRight | <code>integer</code> | default: 1 |
| paddingTop | <code>integer</code> | default: 0 |
| value | <code>string</code> | Name of the property to display in each cell when data passed as an array of objects |


**Example**
```js
let header = [
  {
    alias: "my items",
    value: "item",
    headerColor: "cyan",
    color: "white",
    align: "left",
    paddingLeft: 5,
    width: 30
  },
  {
    value: "price", // if not set, alias will default to "price"
    color: "red",
    width: 10,
    formatter: function(cellValue) {
      var str = `$${cellValue.toFixed(2)}`
      if(value > 5) {
        str = chalk.underline.green(str)
      }
      return str
    }
  }
]
```


<br/>
<br/>
<a name="rows_examples"></a>

#### rows <code>array</code>

**Example**
- each row an array
```js
const rows = [
  ["hamburger",2.50],
]
```
- each row an object
```js
const rows = [
  {
    item: "hamburger",
    price: 2.50
  }
]
```


<br/>
<br/>
<a name="options_properties"></a>

#### options <code>object</code>

| Param | Type | Description |
| --- | --- | --- |
| borderStyle | <code>string</code> | default: "solid".  "solid", "dashed", "none" |
| borderColor | <code>string</code> | default: terminal default color |
| color | <code>string</code> | default: terminal default color |
| compact | <code>boolean</code> | default: false Removes horizontal lines when true. |
| defaultErrorValue | <code>mixed</code> | default: 'ERROR!' |
| defaultValue | <code>mixed</code> | default: '?' |
| errorOnNull | <code>boolean</code> | default: false |
| truncate | <code>mixed</code> | default: false <br/> When this property is set to a string, cell contents will be truncated by that string instead of wrapped when they extend beyond of the width of the cell.  <br/> For example if: <br/> <code>"truncate":"..."</code> <br/> the cell will be truncated with "..." |

**Example**
```js
const options = {
  borderStyle: 1,
  borderColor: "blue",
  headerAlign: "center",
  align: "left",
  color: "white",
  truncate: "..."
}
```

<br/>

### Table.render() ⇒ <code>String</code>
<a name="Table.tableObject.render"></a>

Add method to render table to a string

**Example**  
```js
const out = Table(header,rows,options).render()
console.log(out); //prints output
```

<!--END-API-REF-->

<br/>
<br/>

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
 const Table = require('tty-table');
 ...
</script>
```


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
