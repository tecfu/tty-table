# Changelog

## 4.1.7

Maintenance release on the 4.x line. No public API signature changed. The
behaviour fixes below only change output that was already wrong (dropped headers,
overflowing borders, ignored widths, crashes) or that depended on broken internals;
valid, correctly-rendering tables are unchanged.

### Dependencies

Refreshed within the same major versions (no ESM-only or API-changing bumps):

- `csv` `^5.5.0` -> `^5.5.3`
- `kleur` `^4.1.4` -> `^4.1.5`
- `strip-ansi` `^6.0.0` -> `^6.0.1`
- `yargs` `^17.1.1` -> `^17.7.3`
- dev dependencies: `chai`, `glob`, `mocha`, `nyc`, `grunt`, `browserify`, `rollup`

### Performance

- Measure display width with a printable-ASCII fast path and module-level ANSI
  regexes instead of per-code-point work and per-cell regex compilation.
- Merge cell options once per column (WeakMap) instead of copying ~45 config keys
  for every cell.
- Reset `table.columns` / `table.columnInnerWidths` on each render instead of
  growing them for the life of the table.
- Memoize measured column widths per table (WeakMap), and in one shared slot for
  terminal-adapter streams, instead of a process-global keyed by a module counter.

### Bug fixes

- **Large inputs:** rows are copied with a loop instead of `push(...rows)`, and
  padding uses `fill()` / `Array.from` instead of `Array.apply`, so datasets with
  more than ~125k rows no longer throw `RangeError: Maximum call stack size
  exceeded`.
- **String headers:** `Table(["a", "b"], rows)` now renders the header row, sizes
  columns from the labels, and lays object rows out in declared column order.
- **Resize:** measured widths are invalidated when the terminal geometry changes.
- **Object cells:** an object holding `false`/`0` is sized by its rendered string
  rather than `"[object Object]"`.
- **Truncate markers:** a marker at least as wide as the column no longer asks the
  wrapper for a zero/negative width and overflows the border.
- **Width without a TTY:** an explicit `width` (fixed or percentage) is honoured
  when stdout is redirected, matching terminal output.
- **Validation:** an unrecognised call shape throws a `TypeError` instead of calling
  `process.exit()`; an unknown `borderStyle` throws with the available styles listed;
  `Table([], [])` renders an empty box instead of crashing.
- **CLI:** empty/flat/object input and unreadable header files are reported in the
  `emitError` style instead of a stack trace, and `--config` is accepted as an alias
  of `--header`.

### Tests

Added `test/regressions.js`, which pins each fix above directly (the example golden
files only cover output drift).
