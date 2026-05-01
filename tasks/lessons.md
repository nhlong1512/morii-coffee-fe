# Lessons

- When renaming an i18n message key, keep a backward-compatible alias in locale JSON files and avoid switching component lookups until both locale bundles are verified at runtime.
- When backend exposes separate admin and self-service order endpoints, verify each frontend screen uses the correct route instead of reusing a nearby orders API by assumption.
- When integrating DTOs from backend order APIs, prefer tolerant mappers that accept both nested and flattened delivery fields so a partial contract mismatch does not crash the page.
- When rendering order summaries, normalize backend list DTOs before they reach the UI so derived values like item counts and preview names do not silently fall back to zero or empty strings.
