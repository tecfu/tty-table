# tty-table

A TypeScript-first terminal table renderer with a compatibility-oriented factory API.

## What's new in 6.0

- TypeScript API surface with generated declarations; battle-tested CommonJS runtime core.
- Compatibility verified by the example-based regression suite (`npm test`).
- ANSI-safe display-width calculation and Unicode-aware wrapping/truncation.
- Typed column/table options and formatter context.
- ESM and CommonJS package exports.
- Modern Node.js LTS baseline (Node 20+).
- Minimal build toolchain: TypeScript, tsup, Vitest, Mocha, ESLint.
- CLI is implemented as a separate TypeScript adapter.
- A standalone browser bundle is produced for direct use from a browser console or `<script>` tag.
- Legacy `Table(header, rows, footer, options)` and `Table(rows, options)` construction remains supported.

## Compatibility

### Node.js

**v6 requires Node.js 20 or newer.** This is a breaking change from the v5 line, which supported older Node.js releases. If your application must remain on an older Node version, stay on the v5 release line.

The published package provides both ESM and CommonJS entry points for Node.js. The CLI requires Node.js 20+ as well.

### Browser and browser console

The table renderer remains usable in browsers. The core runtime does not depend on Node.js APIs; Node-only functionality is isolated to the CLI adapter. The build produces a single self-contained browser bundle at `dist/browser/tty-table.global.js`, so it can be loaded directly with a `<script>` tag without a bundler:

```html
<script src="./dist/browser/tty-table.global.js"></script>
<script>
  const table = TtyTable.default([
    { value: "name" },
    { value: "score", align: "right" }
  ], [
    { name: "Ada", score: 100 },
    { name: "Grace", score: 98 }
  ])

  console.log(table.render())
</script>
```

For browser applications using a bundler, import the normal package entry; bundlers can use the `browser` package field to select the browser build.

The browser bundle is a single compiled IIFE file that exposes `TtyTable` globally and includes the runtime dependency needed for Unicode display-width calculations. It does not include the Node.js CLI or its Node-only dependencies.

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
npm run build   # required before npm test: the regression suite runs examples against dist/
npm test        # example-based golden-file regression suite
npm run test:unit  # vitest unit suite
npm run lint
```

The old Grunt/Babel/Browserify/Rollup pipeline has been removed. The package now builds ESM, CommonJS, declarations, and a standalone browser bundle directly from TypeScript.
