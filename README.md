# tty-table

A TypeScript-first terminal table renderer with a compatibility-oriented factory API.

## What's new in 6.0

- Pure TypeScript implementation with generated declarations.
- Deterministic measurement → layout → render pipeline.
- ANSI-safe display-width calculation and Unicode-aware wrapping/truncation.
- Typed column/table options and formatter context.
- ESM and CommonJS package exports.
- Modern Node.js LTS baseline (Node 20+).
- Minimal build toolchain: TypeScript, tsup, Vitest, ESLint.
- CLI is implemented as a separate TypeScript adapter.
- Legacy `Table(header, rows, footer, options)` and `Table(rows, options)` construction remains supported.

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
const formatter = ((value) => String(value).toUpperCase()) as typeof Object
```

The compatibility callback signature is still accepted. New integrations should prefer a formatter that accepts the documented context object and avoid relying on dynamic `this` mutation.

### Width semantics

Widths are measured in terminal display columns, not JavaScript string length. ANSI escape sequences are ignored for measurement; wide Unicode characters are counted using `wcwidth`. Wrapping and truncation operate on the same measurement primitive.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
npm run lint
```

The old Grunt/Babel/Browserify/Rollup pipeline has been removed. The package now builds ESM, CommonJS, and declaration output directly from TypeScript.
