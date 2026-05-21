# Lessons

- When renaming an i18n message key, keep a backward-compatible alias in locale JSON files and avoid switching component lookups until both locale bundles are verified at runtime.
- When backend exposes separate admin and self-service order endpoints, verify each frontend screen uses the correct route instead of reusing a nearby orders API by assumption.
- When integrating DTOs from backend order APIs, prefer tolerant mappers that accept both nested and flattened delivery fields so a partial contract mismatch does not crash the page.
- When rendering order summaries, normalize backend list DTOs before they reach the UI so derived values like item counts and preview names do not silently fall back to zero or empty strings.
- When the backend adds `paymentInfo` onto the order-detail DTO, treat that object as the storefront order page's source of truth for payment lifecycle instead of making a second payment-summary call and risking stale or differently aggregated state.
- When Stripe success redirects are not guaranteed to mean webhook sync has finished, the success page should reconcile once and then poll order detail briefly instead of assuming the redirect itself proves payment state.
- When Stripe payment flow changes between order-first and payment-first, verify the live Swagger contract before preserving any stored `orderId` assumptions in checkout, success, or retry flows.
- When debugging local integration issues, do not infer the active backend port from Docker alone if the user has already confirmed a different local process is serving the real API.
- When a backend refund endpoint self-heals Stripe drift, treat `status = Succeeded` as a valid success outcome in admin UI instead of assuming only newly-created pending refunds can return 200.
- When a backend endpoint already has a stable request contract, fix the frontend payload to match it rather than broadening backend DTOs unless the user explicitly wants backend compatibility support.
