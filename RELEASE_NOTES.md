# Release Notes

## Unreleased (smartwrap v4 / Node 22)

### Breaking Changes

- **Node.js requirement:** The minimum supported Node.js version is now **22** (previously 20). This is required by `smartwrap@4` / `breakword@2.1.0`. Applications that must stay on Node 20 should remain on the previous tty-table release line until they can upgrade.
- **Display-width measurement:** Widths are now measured with `breakword.width()` instead of `wcwidth`. A generated Unicode 18.0.0 East Asian Width table (plus UAX #51 Emoji_Presentation) is used. Some code points that `wcwidth` 1.x scored as 1 cell are now measured as 2 (for example `⚡` U+26A1). Tables that contain those characters may reflow slightly compared with prior releases. Wrapping and truncation use the same primitive, so behavior is internally consistent.

### Other

- `smartwrap` upgraded from `^2.0.2` to `^4.0.0` (ships its own TypeScript types; local shim removed).
- Direct dependency on `breakword`; `wcwidth` removed.

## 5.0.0 (2025-11-01)

### Breaking Changes

- **Default value for missing data:** The `defaultValue` for `null` or `undefined` cells has been changed from a colored `?` to an empty string (`""`). This provides a cleaner default output and makes the behavior consistent. Users who wish to display a `?` or other symbol for missing data can do so using a custom formatter.
