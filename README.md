# tty-table

A TypeScript-first terminal table renderer with a compatibility-oriented factory API.

## [Examples](examples/)

[See here for complete example list](examples/)


To view all example output:

```sh
$ git clone https://github.com/tecfu/tty-table && cd tty-table && npm i
$ npm run view-examples
```

### Terminal (Static)

[examples/styles-and-formatting.js](examples/styles-and-formatting.js)

![Static](https://cloud.githubusercontent.com/assets/7478359/15691679/07142030-273f-11e6-8f1e-25728d558a2d.png "Static Example") 

### Terminal (Streaming)

```
$ node examples/data/fake-stream.js | tty-table --format json --header examples/config/header.js
```

![Streaming](https://user-images.githubusercontent.com/7478359/51738817-47c25700-204d-11e9-9df1-04e478331658.gif "tty-table streaming example") 

- See the built-in help for the terminal version of tty-table with: 
```
$ tty-table -h
```

### MCP server

Expose tty-table to MCP clients (Claude, IDE agents, Cursor, etc.) over stdio.

#### Client configuration

```json
{
  "mcpServers": {
    "tty-table": {
      "command": "npx",
      "args": ["-y", "--package=tty-table", "tty-table-mcp"]
    }
  }
}
```

#### Tools

| Tool | Description |
|------|-------------|
| `render_table` | Render data as an ASCII/Unicode terminal table. Accepts `header`, `rows`, and any tty-table `options`; returns the rendered table as text. |

**Arguments for `render_table`:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `header` | `(string \| {value, align?, width?})[]` | no | Column definitions |
| `rows` | `(unknown[] \| Record<string, unknown>)[]` | yes | Row data (arrays of cells, or objects keyed by column name) |
| `options` | `object` | no | Any tty-table option (e.g. `width`, `borderStyle`, `align`, `compact`) |

Example tool call:

```json
{
  "header": [{ "value": "name" }, { "value": "score", "align": "right" }],
  "rows": [["Ada", 100], ["Grace", 98]],
  "options": { "width": 40 }
}
```

Rendered result:

```text
  ┌───────┬───────┐
  │ name  │ score │
  ├───────┼───────┤
  │  Ada  │   100 │
  ├───────┼───────┤
  │ Grace │    98 │
  └───────┴───────┘
```

> Additional tools may be added in future releases under the same MCP server.

### Browser & Browser Console 

- View in Chrome or Chromium at [http://localhost:8070/examples/browser-example.html](http://localhost:8070/examples/browser-example.html) using a dockerized apache instance:

    ```sh
    git clone https://github.com/tecfu/tty-table
    cd tty-table
    docker run -dit --name tty-table-in-browser -p 8070:80 -v "$PWD":/usr/local/apache2/htdocs/ httpd:2.4
    ```

- [live demo (chrome only): jsfiddle](https://jsfiddle.net/nb14eyav/)
- [live demo (chrome only): plnkr](https://plnkr.co/edit/iQn9xn5yCY4NUkXRF87o?p=preview)
- [source: examples/browser-example.html](examples/browser-example.html)

![Browser Console Example](https://user-images.githubusercontent.com/7478359/74614563-cbcaff00-50e6-11ea-9101-5457497696b8.jpg "tty-table in the browser console") 

<br/>
<br/>

## What's new in 6.0

- ANSI-safe display-width calculation and Unicode-aware wrapping/truncation.
- Typed column/table options and formatter context.
- ESM and CommonJS package exports.
- Modern Node.js LTS baseline (Node 22+; raised from 20+ when adopting smartwrap v4).
- A standalone browser bundle is produced for direct use from a browser console or `<script>` tag.
- Legacy `Table(header, rows, footer, options)` and `Table(rows, options)` construction remains supported.

## Compatibility

### Node.js

**Current releases require Node.js 22 or newer.** This is a breaking change from the Node 20 baseline used by early v6 releases (and from the v5 line, which supported older Node.js releases). The floor was raised to match `smartwrap@4` / `breakword@2.1.0`. If your application must remain on Node 20, stay on a prior tty-table release until you can upgrade.

The published package provides both ESM and CommonJS entry points for Node.js. The CLI requires Node.js 22+ as well.

## API

```ts
import Table from "tty-table"

const table = Table(
  [{ value: "name" }, { value: "score", align: "right" }],
  [
    { name: "Ada", score: 100 },
    { name: "Grace", score: 98 }
  ],
  { borderStyle: "solid" }
)

console.log(table.render())
```

### Formatter context

New code can use the explicit context form:

```ts
const formatter = (value: unknown) => String(value).toUpperCase()
```

The compatibility callback signature is still accepted. New integrations should prefer a formatter that accepts the documented context object and avoid relying on dynamic `this` mutation.

### Width semantics

Widths are measured in terminal display columns, not JavaScript string length. ANSI escape sequences are ignored for measurement; Unicode code points are counted using [`breakword.width()`](https://github.com/tecfu/breakword) (Unicode 18.0.0 East Asian Width + UAX #51 Emoji_Presentation). Wrapping and truncation operate on the same display-width semantics.

Compared with older releases that used `wcwidth`, some symbols that were previously treated as 1 cell are now 2 cells (for example `⚡` U+26A1). Tables containing those characters may reflow slightly; measurement is now aligned with the same library used for wrapping.

## Development

```sh
npm install
npm run typecheck
npm run build
npm test
npm run test:unit
npm run lint
```
