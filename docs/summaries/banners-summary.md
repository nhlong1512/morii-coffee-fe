# Banners Feature — Implementation Summary

## Overview

Full banner management implemented for both the admin dashboard and the public-facing hero carousel. Admins can create, edit, delete, and toggle banners via a dedicated admin section. The public carousel fetches live banner data from the API and applies active/date-range filtering client-side.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/types/api.ts` | Added `ApiBanner` interface |
| `src/interfaces/banners/index.ts` | `CreateBannerRequest` and `UpdateBannerRequest` |
| `src/helpers/banners/index.ts` | `buildBannerFormData` — converts request to `FormData` |
| `src/services/banners-service.ts` | All 5 API functions: `getBanners`, `getBannerById`, `createBanner`, `updateBanner`, `deleteBanner` |
| `src/app/admin/banners/page.tsx` | Admin banner list page |
| `src/app/admin/banners/new/page.tsx` | Create banner form |
| `src/app/admin/banners/edit/[id]/page.tsx` | Edit banner form |
| `docs/api/banners-api-structure.md` | Full API contract documentation |

## Files Modified

| File | Change |
|------|--------|
| `src/types/api.ts` | Added `ApiBanner` interface |
| `src/app/admin/layout.tsx` | Added **Banners** nav item with `Images` icon; replaced `useState`/`useEffect` mounted pattern with `useSyncExternalStore` |
| `src/components/home/hero-carousel.tsx` | Replaced mock data with real API call; added loading skeleton, fallback state, null-image gradient, date-range filter |
| `src/lib/utils.ts` | Added `formatDateRange` helper |
| `src/components/admin/image-upload.tsx` | Added `previewClassName` and `recommendedSize` props |

---

## API Endpoints Used

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/banners` | Fetch all banners — returns plain `Banner[]` (no pagination) |
| `GET` | `/api/v1/banners/{id}` | Fetch single banner by ID |
| `POST` | `/api/v1/banners` | Create banner — `multipart/form-data`, returns HTTP 201 |
| `PUT` | `/api/v1/banners/{id}` | Update banner — `multipart/form-data`, returns HTTP 200 |
| `DELETE` | `/api/v1/banners/{id}` | Soft delete banner — returns HTTP 204 No Content |

All write operations use `multipart/form-data` — not JSON.

---

## Admin Site — Feature Walkthrough

### Banner List (`/admin/banners`)
- Lists all banners sorted by `displayOrder` ascending
- **Columns:** Image preview (40×16 thumbnail or branded `#146d4d` placeholder), Title + Subtitle, Display Order, Date Range (`startDate → endDate`), Status badge, Actions
- **Inline toggle:** The `isActive` switch in each row calls `PUT /api/v1/banners/{id}` with an optimistic UI update and rollback on failure
- **Delete:** Opens a `ConfirmDialog` with soft-delete description; calls `DELETE /api/v1/banners/{id}` (204) and removes the row from state
- **Add Banner** button navigates to `/admin/banners/new`
- Loading and error states with a Retry button

### Create Banner (`/admin/banners/new`)
- **Required:** Title
- **Optional:** Subtitle, CTA label, CTA link, Display Order, Start Date, End Date, IsActive toggle, Image
- Date fields use `<input type="datetime-local" />` — converted to ISO 8601 on submit
- Image upload uses the shared `ImageUpload` component with `previewClassName="w-full aspect-[5/2]"` matching the carousel's 2.5:1 aspect ratio
- Recommended size hint shown: **1500 × 600px (landscape) · JPG, PNG, WebP · max 5MB**
- On success: shows a green check confirmation and redirects to `/admin/banners` after 1.2 s

### Edit Banner (`/admin/banners/edit/[id]`)
- Loads banner via `GET /api/v1/banners/{id}` and pre-populates all fields
- Skeleton loading state while data is fetching
- ISO dates are sliced to `YYYY-MM-DDTHH:mm` for `datetime-local` inputs
- **Image preservation:** `Image` field is only included in the FormData when a new file is selected; omitting preserves the existing `imageUrl`
- Same wide preview (`aspect-[5/2]`) and recommended size hint as create form
- On success: shows a green check confirmation and redirects to `/admin/banners` after 1.2 s

---

## Client Site — Hero Carousel Changes

### Before
- Imported static mock data from `src/data/banners.ts`
- Always showed all 4 mock banners with local image paths
- No loading state

### After
- Calls `getBanners()` (`GET /api/v1/banners`) on mount
- **Loading state:** Full-height animated skeleton while fetching
- **Active filter:** Only renders banners where `isActive === true`
- **Date-range filter:** Only renders banners where `startDate <= now <= endDate` (evaluated client-side at render time)
- **Sorted** by `displayOrder` ascending
- **`imageUrl` handling:**
  - If `imageUrl` is not null → renders `<Image fill object-cover />` from CloudFront CDN
  - If `imageUrl` is null → renders branded gradient background using `#146d4d`
- **`subtitle` / `cta` / `ctaLink` are nullable** — subtitle and CTA button are only rendered when the field is non-null
- **Fallback state:** If no active banners are returned, renders a static branded section with a default "Welcome to Morii Coffee" message and a "Shop Now" CTA
- Existing carousel behavior preserved: Embla, autoplay every 5 s, prev/next arrows, dot indicators

---

## Image Upload — Banner Preview

The `ImageUpload` component was extended with two new optional props:

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `previewClassName` | `string` | `"h-40 w-40"` | Override preview container size/shape |
| `recommendedSize` | `string` | — | Renders a hint line below the drop zone |

Both banner forms pass:
- `previewClassName="w-full aspect-[5/2]"` — matches the carousel's rendered dimensions (full-width × 500/600px = ~2.5:1 ratio)
- `recommendedSize="1500 × 600px (landscape) · JPG, PNG, WebP · max 5MB"`

Existing usages (products, categories) are unaffected — they omit both props and keep the square `h-40 w-40` default.

---

## Business Rules Applied

| Rule | Implementation |
|------|---------------|
| Only `isActive: true` banners on public carousel | `banner.isActive` check in `isCurrentlyActive()` |
| Date-range filtering | `startDate <= now <= endDate` check in `isCurrentlyActive()` |
| `null` imageUrl → branded placeholder | `BRAND_GRADIENT` constant (`#146d4d`) rendered when `imageUrl === null` |
| GET returns plain array, not paginated | `apiGet<ApiBanner[]>` — no `.items` unwrapping |
| All writes use `multipart/form-data` | `buildBannerFormData` helper builds `FormData` |
| Image omitted on update → preserves existing | `image: imageFile ?? undefined` — only included when `imageFile` is not null |
| Delete is soft — record retained | ConfirmDialog description informs admin of soft-delete behaviour |

---

## End-to-End Testing Checklist

### Admin
1. Navigate to `/admin/banners` — verify list loads, columns display correctly
2. Click **Add Banner** → fill Title, set Start/End dates, upload an image → **Create Banner** — verify redirect and new row appears
3. Click the pencil icon on a banner → edit the title → **Save Changes** — verify updated title in list
4. Toggle the `isActive` switch → verify badge and switch update immediately; check DB if available
5. Click the trash icon → confirm dialog → confirm — verify row disappears
6. Create a banner without an image → verify `#146d4d` placeholder shows in both the list and the carousel

### Client Carousel
1. With active banners in the API: reload `/` — verify skeleton appears briefly, then carousel shows correct title/subtitle/CTA
2. With `imageUrl` set: verify banner image renders from CloudFront CDN
3. With `imageUrl: null`: verify branded green gradient renders
4. Set all banners to `isActive: false` (or expired dates) → verify fallback "Welcome to Morii Coffee" section renders
5. Verify autoplay, prev/next arrows, and dot indicators still work correctly
