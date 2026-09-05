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
- Modern Node.js LTS baseline (Node 20+).
- A standalone browser bundle is produced for direct use from a browser console or `<script>` tag.
- Legacy `Table(header, rows, footer, options)` and `Table(rows, options)` construction remains supported.

## Compatibility

### Node.js

**v6 requires Node.js 20 or newer.** This is a breaking change from the v5 line, which supported older Node.js releases. If your application must remain on an older Node version, stay on the v5 release line.

The published package provides both ESM and CommonJS entry points for Node.js. The CLI requires Node.js 20+ as well.

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

Widths are measured in terminal display columns, not JavaScript string length. ANSI escape sequences are ignored for measurement; wide Unicode characters are counted using `wcwidth`. Wrapping and truncation operate on the same measurement primitive.

## Development

```sh
npm install
npm run typecheck
npm run build
npm test
npm run test:unit
npm run lint
```
