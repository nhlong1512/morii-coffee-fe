# Research: Blog Management

## Decision 1: Use a feature-local blog module with typed service boundaries

**Decision**: Implement blog management through a dedicated `src/features/blogs/` module that owns DTO types, API calls, hooks, validation schema, and reusable blog-specific components, while keeping page files as composition layers.

**Rationale**: The repo's current feature direction and the `implement-feature` guidance favor colocating new feature logic instead of spreading it across unrelated pages. This keeps public pages, admin pages, and tests aligned around one source of truth for blog behavior.

**Alternatives considered**:
- Keep all logic directly inside `src/app/blog/*` and `src/app/admin/blogs/*`: rejected because it would repeat request/validation logic and make tests harder to target.
- Put everything in `src/services/`: rejected because this feature needs more than transport helpers; it also needs form schema, mapping helpers, and admin/public presentation primitives.

## Decision 2: Use Tiptap for rich text editing and store both structured content and rendered HTML

**Decision**: Use Tiptap as the blog editor, with the editor state persisted in structured form for re-editing and a rendered HTML snapshot included in the save payload for storefront rendering.

**Rationale**: The feature requires reliable round-tripping for internal editing plus fast, SEO-friendly public rendering. Tiptap supports structured document content, controlled extension growth, and future editor customization more cleanly than simpler HTML-first editors.

**Alternatives considered**:
- Plain textarea or Markdown-only editor: rejected because it would not match the desired rich formatting experience for internal content staff.
- Quill-style editor: rejected because Tiptap offers a more composable schema model and is better aligned with the expected future growth of headings, lists, links, and embedded media.
- HTML-only persistence: rejected because rehydrating an editor from HTML alone is less reliable for long-term editing.

## Decision 3: Reuse the shared file upload flow and generalize it for blog cover images

**Decision**: Reuse the existing shared upload API and `file-service` pattern, extending it so blog cover uploads target the `blogs` bucket/container rather than introducing a blog-specific upload endpoint.

**Rationale**: The current codebase already uploads images through a common `/v1/files/upload` flow. Reusing that path reduces surface area, keeps auth and validation behavior consistent, and avoids duplicating upload UI or transport code.

**Alternatives considered**:
- Create a dedicated blog upload endpoint: rejected because the feature is intentionally lightweight and does not justify a separate upload pipeline.
- Store raw `File` objects until post save: rejected for cover-image UX because the repo already favors pre-upload plus URL persistence patterns.

## Decision 4: Align admin permissions to workspace access, not per-author rules

**Decision**: Treat blog permissions as inherited from access to the admin blog workspace. Anyone allowed into that workspace can perform all blog-management actions in this release.

**Rationale**: The latest product decision explicitly removes author distinctions and approval workflow from the feature. That keeps the module operationally simple and avoids extra role branches inside post/category forms, actions, or tests.

**Alternatives considered**:
- Preserve the earlier `ADMIN`/`STAFF` split from background documents: rejected because it conflicts with the updated product direction for this implementation.
- Introduce per-post ownership: rejected because it adds complexity without current business value.

## Decision 5: Replace mock public blog data with backend-backed reads while preserving existing public route shapes

**Decision**: Keep `/blog` and `/blog/[slug]` as the public route contract, but replace `src/data/blogs.ts` as the data source with typed API-backed fetching and public-only filtering from the backend.

**Rationale**: Existing navigation, homepage preview links, and public route expectations already point to these paths. Swapping the data source is lower risk than redesigning the route structure and keeps the storefront aligned with current user-facing navigation.

**Alternatives considered**:
- Introduce a new blog route tree or headless CMS shell: rejected because it would create unnecessary migration surface for a feature meant to remain close to the storefront.
- Keep mock data as fallback in production: rejected because the feature goal is to make blog content fully manageable from admin.

## Decision 6: Cover the feature with service, hook, component, and route-level tests before final verification

**Decision**: Add focused tests for blog services, validation/mapping helpers, public/admin rendering components, and the main admin/public pages, then run the full test suite and production build.

**Rationale**: Current repo patterns already rely on Jest and React Testing Library for targeted regression coverage. Because this feature spans multiple surfaces, service-only tests would leave too much UI and route wiring unverified.

**Alternatives considered**:
- Service tests only: rejected because it would not verify page-level state handling or category/blog interaction behavior.
- Manual verification only: rejected because the requested quality gate explicitly requires passing automated tests and a clean build before shipping.
