# Release Notes

## 7.1.0 (2026-10-06)

### Changed

- **Cell code runs once per render.** Function cells and column `formatter`s used to execute twice on a table's first render - once dry, to measure the columns, and once to print them - doubling side effects and letting impure callbacks disagree with their own measurement. They now execute during the measurement pass and the render pass reuses the produced value and `configure()` options. A callback that consulted external state at print time now sees it at evaluation time instead (#123).
- **Bad input throws instead of killing the host process.** Invalid call shapes (`Table()`, `Table({})`) now throw a `TypeError` listing the accepted shapes rather than `console.log` + `process.exit()`, and an unknown `borderStyle` fails early with the available style names (#117).
- **Published types match the library.** `Options` and `Header` are now derived from the internal `TableOptions`/`ColumnOptions` instead of a hand-written duplicate: option keys are typed and autocompleted, numeric `borderStyle` aliases (`0`/`1`/`2`) typecheck, alias-only header columns typecheck, and `Formatter` returns `unknown`. Stricter than before for nonsense values (e.g. `marginLeft: "wide"` is now a type error) - code that compiled against `7.0.x`'s untyped index signature may need a cast (#125).
- Truncate markers wider than their column are trimmed to fit instead of breaking the table box (#118).
- The shipped CLI (`tty-table`) explains bad input - empty stdin, flat JSON arrays, unreadable `--header` files - instead of printing raw stack traces, and accepts `--config` as well as `--header` (#121).

### Fixed

- Falsy cell values (`0`, `false`, `{value: false}`) are measured for column width instead of skipped, so they no longer render one character per line (#115).
- An explicit `width` option is honored when no terminal reports a column count (piping to a file or CI log) (#116).
- String header arrays (`Table(['a','b'], rows)`) render their header row instead of silently dropping it (#114).
- `Table([], [])` renders a degenerate box instead of crashing (#117).
- The column-width cache is per table instance (a `WeakMap` keyed by the table) instead of a process-global dictionary keyed by a module counter, fixing cross-bundle collisions (two copies of the library in one process overwriting each other's geometry) and unbounded memory growth (#119).
- Each render leaves one entry per column in `table.columns` / `table.columnInnerWidths` instead of accumulating a set per render forever (#124).
- The whole config no longer rides on tables as an enumerable property literally named `"undefined"` (it was meant to be `Symbol.config`); it now lives under a module-level symbol, so `Object.keys`, `JSON.stringify` and spread-copies of a table stop exposing internals (#120).
- Row/cell construction no longer passes hundreds of thousands of array items as call arguments, lifting the ~125k-row/column/cell-line limits that threw `RangeError: Maximum call stack size exceeded` (#113).

### Performance

- Per-cell option merging is paid once per column: cells share the merged config/column-settings through the prototype chain, and writes stay own to the cell (#111).
- `displayWidth` gained an ASCII fast path; ANSI regexes are hoisted out of per-cell code (#112).

### Other

- `npm run lint` now passes (275 -> 0 problems, mostly config) and runs in CI; a leftover `debugger` statement was removed from the example runner (#122).

## 7.0.0 (2026-09-20)

### Breaking Changes

- **Node.js requirement:** The minimum supported Node.js version is now **22** (previously 20). This is required by `smartwrap@4` / `breakword@2.1.0`. Applications that must stay on Node 20 should remain on the previous tty-table release line until they can upgrade.
- **Display-width measurement:** Widths are now measured with `breakword.width()` instead of `wcwidth`. A generated Unicode 18.0.0 East Asian Width table (plus UAX #51 Emoji_Presentation) is used. Some code points that `wcwidth` 1.x scored as 1 cell are now measured as 2 (for example `⚡` U+26A1). Tables that contain those characters may reflow slightly compared with prior releases. Wrapping and truncation use the same primitive, so behavior is internally consistent. ZWJ emoji sequences (for example 👨‍👩‍👧) are still measured as the sum of their code points, matching the primitive `smartwrap` uses to wrap.

### Other

- `smartwrap` upgraded from `^2.0.2` to `^4.0.0` (ships its own TypeScript types; local shim removed).
- Direct dependency on `breakword`; `wcwidth` removed.

## 7.0.1 (2026-09-20)

### Other

- Consolidate terminal colors on `chalk`; drop direct dependency on `kleur` (browser colorize now uses a fixed-level chalk instance).

## 5.0.0 (2025-11-01)

### Breaking Changes

- **Default value for missing data:** The `defaultValue` for `null` or `undefined` cells has been changed from a colored `?` to an empty string (`""`). This provides a cleaner default output and makes the behavior consistent. Users who wish to display a `?` or other symbol for missing data can do so using a custom formatter.
