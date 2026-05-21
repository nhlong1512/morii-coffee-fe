# Quickstart: Blog Management

## Goal

Implement the internal blog CMS end to end in the frontend, then verify that automated tests pass and the production build is clean.

## Implementation Sequence

1. Add blog domain types and request/response contracts.
2. Add blog feature services, hooks, validation schema, and mapping helpers under `src/features/blogs/`.
3. Generalize shared upload support so blog cover images can reuse the existing file-upload flow.
4. Build admin blog screens for:
   - list/search/filter
   - create post
   - edit post
   - category management
5. Replace mock public blog data on:
   - `/blog`
   - `/blog/[slug]`
   - homepage blog preview
6. Add route constants and admin navigation entry points.
7. Add localized strings for new admin/public blog UI.
8. Add focused tests for service, schema, hook, component, and route behavior.
9. Run full verification before shipping.

## Expected Code Areas

### New or extended feature layer

- `src/features/blogs/types.ts`
- `src/features/blogs/api.ts`
- `src/features/blogs/hooks.ts`
- `src/features/blogs/schema.ts`
- `src/features/blogs/utils.ts`
- `src/features/blogs/components/*`
- `src/features/blogs/index.ts`

### Admin routes

- `src/app/admin/blogs/page.tsx`
- `src/app/admin/blogs/new/page.tsx`
- `src/app/admin/blogs/edit/[id]/page.tsx`

### Public routes

- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/components/home/blog-preview.tsx`

### Shared extensions

- `src/services/file-service.ts`
- `src/constants/routes.ts`
- `src/types/api.ts`
- `src/app/admin/layout.tsx`
- `src/i18n/messages/en.json`
- `src/i18n/messages/vi.json`

### Tests

- `src/__tests__/services/blogs-service.test.ts`
- `src/__tests__/hooks/use-blog-admin.test.ts`
- `src/__tests__/components/admin/blog-form.test.tsx`
- `src/__tests__/pages/admin-blogs-page.test.tsx`
- `src/__tests__/pages/blog-page.test.tsx`

## Verification Commands

Run after implementation:

```bash
rtk pnpm test
rtk pnpm build
```

If targeted debugging is needed during development:

```bash
rtk pnpm test -- --runInBand src/__tests__/services/blogs-service.test.ts
rtk pnpm test -- --runInBand src/__tests__/pages/blog-page.test.tsx
```

## Completion Criteria

- Admin blog CRUD works from the unified admin blog workspace.
- Category management supports create/update/reorder/delete constraints.
- Public blog routes read only published content from backend-backed services.
- Mock blog data is no longer the production source for blog pages.
- Localized strings exist for new admin and public surfaces.
- `rtk pnpm test` passes.
- `rtk pnpm build` passes cleanly.
