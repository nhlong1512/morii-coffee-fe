# Banners API Structure & Contracts

This document describes the Banners API endpoints consumed by the Morii Coffee frontend, including exact TypeScript interfaces derived from real API responses.

> **CDN Base URL:** `https://ddlda2rzhrys8.cloudfront.net` — banner image URLs are served from this CDN.
>
> **Image path pattern:** `https://ddlda2rzhrys8.cloudfront.net/banners/{bannerId}/{timestamp}-{filename}`

---

### Shared Response Interface

```typescript
interface Banner {
  id: string
  title: string
  subtitle: string | null
  cta: string | null
  ctaLink: string | null
  imageUrl: string | null
  displayOrder: number
  startDate: string       // ISO 8601 datetime
  endDate: string         // ISO 8601 datetime
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

---

## Endpoint 1 — Get All Banners

```
GET /api/v1/banners
```

**Usage:** Public hero carousel, admin banner manager — fetch all banners.

> **Response shape:** Plain array — **not** a paginated object. There is no `items` wrapper and no `metadata` field.

### TypeScript Interface

```typescript
// Response — HTTP 200, plain array (no pagination wrapper)
type GetBannersResponse = Banner[]
```

### Example curl

```bash
curl -X 'GET' \
  'http://localhost:5100/api/v1/banners' \
  -H 'accept: application/json'
```

### Notes

- **No pagination:** The response is a plain `Banner[]` array — not a `{ items, metadata }` object. Do not attempt to access `.items` or `.metadata` on this response.
- **Active filtering:** Only banners with `isActive: true` should be shown on the public-facing hero carousel. Filter client-side after fetching.
- **Date filtering:** Use `startDate` and `endDate` (ISO 8601 strings) to determine if a banner is currently active for display — only show banners where `now >= startDate && now <= endDate`.
- **`imageUrl` can be `null`:** Always render a branded placeholder (`#146d4d`) in the UI when `imageUrl` is `null`.
- **Sort by `displayOrder`:** Render banners in ascending `displayOrder` order on the carousel.

---

## Endpoint 2 — Get Banner By ID

```
GET /api/v1/banners/{id}
```

**Path parameter:** `id` — banner UUID

**Usage:** Admin banner edit form — fetch full banner detail.

**Success response:** HTTP **200 OK** — returns a single `Banner` object.

### Example curl

```bash
curl -X 'GET' \
  'http://localhost:5100/api/v1/banners/{id}' \
  -H 'accept: application/json'
```

---

## Endpoint 3 — Create Banner

```
POST /api/v1/banners
```

**Usage:** Admin banner manager — create a new hero carousel banner with optional image.

> **Content-Type:** `multipart/form-data` — this endpoint does **not** accept JSON.
> **Success response:** HTTP **201 Created**.

### Request Fields

| Field          | Type          | Required | Description                                      |
|----------------|---------------|----------|--------------------------------------------------|
| `Title`        | string        | ✅        | Banner headline text                             |
| `Subtitle`     | string        | ❌        | Banner sub-headline text                         |
| `Cta`          | string        | ❌        | Call-to-action button label (e.g. "Shop Now")    |
| `CtaLink`      | string        | ❌        | URL the CTA button links to                      |
| `DisplayOrder` | integer       | ❌        | Sort order on the carousel                       |
| `StartDate`    | string        | ❌        | ISO 8601 datetime — when the banner becomes live |
| `EndDate`      | string        | ❌        | ISO 8601 datetime — when the banner expires      |
| `IsActive`     | boolean       | ❌        | Whether the banner is active                     |
| `Image`        | binary (file) | ❌        | Banner image file                                |

### TypeScript Interface

```typescript
interface CreateBannerRequest {
  Title: string
  Subtitle?: string
  Cta?: string
  CtaLink?: string
  DisplayOrder?: number
  StartDate?: string    // ISO 8601 datetime
  EndDate?: string      // ISO 8601 datetime
  IsActive?: boolean
  Image?: File
}

// Response — HTTP 201, single Banner object
type CreateBannerResponse = Banner
```

### Example curl

```bash
curl -X 'POST' \
  'http://localhost:5100/api/v1/banners' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Title=Spring Collection 2026' \
  -F 'Subtitle=Fresh blends, brewed with care' \
  -F 'Cta=Shop Now' \
  -F 'CtaLink=/products' \
  -F 'DisplayOrder=1' \
  -F 'StartDate=2026-03-01T00:00:00Z' \
  -F 'EndDate=2026-05-31T23:59:59Z' \
  -F 'IsActive=true' \
  -F 'Image=@banner.jpg;type=image/jpeg'
```

### Notes

- **Multipart only:** Must be `multipart/form-data` — JSON will fail.
- **Image upload:** If provided, image is stored in S3 at `banners/{id}/{timestamp}-{filename}` and served via CloudFront (`https://ddlda2rzhrys8.cloudfront.net/banners/...`). The returned `imageUrl` will be `null` if no image is uploaded.
- **`IsActive`:** Defaults to `true` on the server if omitted.
- **`StartDate` / `EndDate`:** Optional ISO 8601 strings. If omitted, the banner has no date constraint and visibility is controlled solely by `isActive`.
- **HTTP 201:** A successful create returns `201 Created`, not `200 OK`.

---

## Endpoint 4 — Update Banner

```
PUT /api/v1/banners/{id}
```

**Path parameter:** `id` — banner UUID

**Usage:** Admin banner manager — update banner content, dates, active state, or image.

> **Content-Type:** `multipart/form-data` — this endpoint does **not** accept JSON.
> **Success response:** HTTP **200 OK**.

### Request Fields

| Field          | Type          | Required | Description                                                        |
|----------------|---------------|----------|--------------------------------------------------------------------|
| `Title`        | string        | ✅        | Banner headline text                                               |
| `Subtitle`     | string        | ❌        | Banner sub-headline text                                           |
| `Cta`          | string        | ❌        | Call-to-action button label                                        |
| `CtaLink`      | string        | ❌        | URL the CTA button links to                                        |
| `DisplayOrder` | integer       | ❌        | Sort order on the carousel                                         |
| `StartDate`    | string        | ❌        | ISO 8601 datetime                                                  |
| `EndDate`      | string        | ❌        | ISO 8601 datetime                                                  |
| `IsActive`     | boolean       | ❌        | Whether the banner is active                                       |
| `Image`        | binary (file) | ❌        | New banner image — if omitted, existing `imageUrl` is **preserved** |

### TypeScript Interface

```typescript
interface UpdateBannerRequest {
  Title: string
  Subtitle?: string
  Cta?: string
  CtaLink?: string
  DisplayOrder?: number
  StartDate?: string    // ISO 8601 datetime
  EndDate?: string      // ISO 8601 datetime
  IsActive?: boolean
  Image?: File
}

// Response — HTTP 200, updated Banner object
type UpdateBannerResponse = Banner
```

### Example curl

```bash
curl -X 'PUT' \
  'http://localhost:5100/api/v1/banners/{id}' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Title=Spring Collection 2026 — Updated' \
  -F 'Subtitle=New arrivals every week' \
  -F 'Cta=Explore Now' \
  -F 'CtaLink=/products?featured=true' \
  -F 'DisplayOrder=1' \
  -F 'StartDate=2026-03-01T00:00:00Z' \
  -F 'EndDate=2026-06-30T23:59:59Z' \
  -F 'IsActive=true'
```

### Notes

- **Multipart only:** Must be `multipart/form-data` — JSON will fail.
- **Image preservation:** If `Image` is omitted, the backend keeps the existing `imageUrl` unchanged. Send `Image` only when replacing the banner image.
- **Toggle active:** Set `IsActive=false` to hide from the carousel without deleting the banner.
- **Error responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

---

## Endpoint 5 — Delete Banner

```
DELETE /api/v1/banners/{id}
```

**Path parameter:** `id` — banner UUID

**Usage:** Admin banner manager — remove a banner from the carousel.

> **Request body:** None — ID is a path parameter only.
> **Success response:** HTTP **204 No Content** with an empty body.

### Example curl

```bash
curl -X 'DELETE' \
  'http://localhost:5100/api/v1/banners/{id}' \
  -H 'accept: */*'
```

### Notes

- **Soft delete:** The banner record is retained in the database for audit purposes — it is not physically removed. The banner will no longer appear in public responses after deletion.
- **HTTP 204:** Returns `204 No Content` on success — do not attempt to parse a response body.
- **Error responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.
