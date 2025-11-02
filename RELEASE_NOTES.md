# Release Notes

## 5.0.0 (2025-11-01)

### Breaking Changes

- **Default value for missing data:** The `defaultValue` for `null` or `undefined` cells has been changed from a colored `?` to an empty string (`""`). This provides a cleaner default output and makes the behavior consistent. Users who wish to display a `?` or other symbol for missing data can do so using a custom formatter.