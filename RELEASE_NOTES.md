# Release Notes

## 5.0.0 (2025-11-01)

### Breaking Changes

- **Default value for missing data:** The `defaultValue` for `null` or `undefined` cells has been changed from a colored `?` to an empty string (`""`). This provides a cleaner default output and makes the behavior consistent. Users who wish to display a `?` or other symbol for missing data can do so using a custom formatter.

## 6.0.0 (2026-09-05)

### Highlights

- **TypeScript runtime**: the entire `src/` core is now TypeScript with strict typing, shipping type declarations for `Header` / `Options` / `Table` / `Formatter` (`dist/index.d.ts`).
- **Byte-identical output**: rendered output matches the previous release exactly — verified by an example-based golden-file regression suite (21 examples, `npm test`).
- ESM + CommonJS exports via an `exports` map; standalone browser bundle; `tty-table` CLI.
- Node.js 20+ required; legacy build/CI config removed.

**Full changelog**: https://github.com/tecfu/tty-table/compare/v5.0.0...v6.0.0
