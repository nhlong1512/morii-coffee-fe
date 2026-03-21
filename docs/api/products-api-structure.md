# Products API Structure & Contracts

This document describes the Products API endpoints consumed by the Morii Coffee frontend, including exact TypeScript interfaces derived from real API responses.

> **CDN Base URL:** `https://ddlda2rzhrys8.cloudfront.net` — all image URLs are served from this CDN.
>
> **Price Format:** All prices are in VND (Vietnamese Dong). Display using `toLocaleString('vi-VN')`.

---

## Endpoint 1 — Product List

```
GET /api/v1/products
```

**Usage:** Product listing page, home page product section, search results, category filtering.

### Query Parameters

| Parameter    | Type           | Description                                          | Default |
|-------------|----------------|------------------------------------------------------|---------|
| `categoryId` | string (uuid)  | Filter by category                                   | —       |
| `isFeatured` | boolean        | Filter featured products                             | —       |
| `page`       | number         | Current page (min: 1)                                | `1`     |
| `size`       | number         | Items per page (min: 1)                              | `10`    |
| `orders`     | array          | Ordering criteria (attribute + direction)            | —       |
| `searches`   | array          | Search criteria (attribute + value)                  | —       |
| `takeAll`    | boolean        | Return all items without pagination                  | `false` |

### TypeScript Interfaces

```typescript
interface ProductListItem {
  id: string
  name: string
  slug: string
  basePrice: number
  categoryNames: string[]
  thumbnailUrl: string | null
  status: 'Active' | 'Inactive'
  isFeatured: boolean
  displayOrder: number
  createdAt: string
}

interface PaginationMetadata {
  currentPage: number
  totalPages: number
  takeAll: boolean
  pageSize: number
  totalCount: number
  payloadSize: number
  hasPrevious: boolean
  hasNext: boolean
}

interface ProductListResponse {
  items: ProductListItem[]
  metadata: PaginationMetadata
}
```

### Notes

- `thumbnailUrl` can be `null` — always render a branded placeholder (`#146d4d`) when `null` or when the URL fails to load.
- `categoryNames` is a flat string array — use for display labels and filtering UI only.

---

## Endpoint 2 — Product Detail

```
GET /api/v1/products/{id}
```

**Path parameter:** `id` — product UUID

**Usage:** Product detail page, admin edit form — full image gallery, variant/size selector, description, categories.

### TypeScript Interfaces

```typescript
interface ProductCategory {
  id: string
  name: string
  description: string
  iconUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProductVariant {
  id: string
  productId: string
  name: string
  size: 'Small' | 'Medium' | 'Large'
  additionalPrice: number
  totalPrice: number
  sku: string | null
  stockQuantity: number
  isDefault: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface ProductImage {
  id: string
  url: string
  displayOrder: number
  isThumbnail: boolean
}

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  categories: ProductCategory[]
  thumbnailUrl: string | null
  status: 'Active' | 'Inactive' | 'OutOfStock'
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  variants: ProductVariant[]
  images: ProductImage[]
}
```

### Key Differences from Product List

| Field          | Product List              | Product Detail                          |
|----------------|---------------------------|-----------------------------------------|
| Categories     | `categoryNames: string[]` | `categories: ProductCategory[]` (full objects) |
| Variants       | not included              | `variants: ProductVariant[]`            |
| Images         | not included              | `images: ProductImage[]`                |
| Description    | not included              | `description: string \| null`           |
| `updatedAt`    | not included              | `updatedAt: string`                     |

> **Important:** The `images` array is **only returned on the detail endpoint**, never on the list endpoint.

### Notes

- **Stock:** `stockQuantity: -1` means unlimited stock. Only block purchase when `stockQuantity === 0`.
- **Primary image:** Use the image where `isThumbnail: true` in the `images` array as the primary display image in the gallery.
- **Default variant:** Pre-select the variant where `isDefault: true` on page load.
- **Variant availability:** Only allow selection of variants where `isAvailable: true`.
- **Price display:** Use `variant.totalPrice` (not `basePrice + additionalPrice`) as the final displayed price for each variant.
- **Error responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

---

## Endpoint 3 — Create Product

```
POST /api/v1/products
```

**Usage:** Admin new product form — create a product with basic info, pricing, categories, and optional thumbnail.

> **Content-Type:** `multipart/form-data` — this endpoint does **not** accept JSON.
> **Success response:** HTTP **201 Created** (not 200).

### Request Fields

| Field          | Type            | Required | Description                                                  |
|----------------|-----------------|----------|--------------------------------------------------------------|
| `Name`         | string          | ✅        | Product name                                                 |
| `Slug`         | string          | ❌        | URL slug — auto-generated from Name if omitted. Must be unique. |
| `Description`  | string          | ❌        | Product description                                          |
| `BasePrice`    | number (double) | ✅        | Base price in VND                                            |
| `CategoryIds`  | string[] (uuid) | ✅        | Array of category UUIDs — send as repeated form fields       |
| `Thumbnail`    | binary (file)   | ❌        | Thumbnail image file                                         |
| `IsFeatured`   | boolean         | ❌        | Featured flag                                                |
| `DisplayOrder` | integer         | ❌        | Display order                                                |

### TypeScript Interfaces

```typescript
interface CreateProductRequest {
  Name: string
  Slug?: string
  Description?: string
  BasePrice: number
  CategoryIds: string[]
  Thumbnail?: File
  IsFeatured?: boolean
  DisplayOrder?: number
}

// Response — HTTP 201, same shape as ProductDetail (Endpoint 2)
interface CreateProductResponse {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  categories: ProductCategory[]
  thumbnailUrl: string | null
  status: 'Active' | 'Inactive' | 'OutOfStock'
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  variants: ProductVariant[]
  images: ProductImage[]
}
```

### Example curl

```bash
curl -X 'POST' \
  'http://localhost:8002/api/v1/products' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Name=New Product Mar 21 Test' \
  -F 'Slug=new-product-mar-21-test' \
  -F 'Description=New Product Mar 21 Test' \
  -F 'BasePrice=45000' \
  -F 'CategoryIds=873053a3-cf04-47a2-9f50-b48c352340f0' \
  -F 'Thumbnail=@MiraeAsset.jpg;type=image/jpeg' \
  -F 'IsFeatured=true' \
  -F 'DisplayOrder=2'
```

### Notes

- **Multipart only:** The request must be sent as `multipart/form-data`. Sending JSON will fail.
- **CategoryIds array:** Supports multiple values — send as repeated form fields (`-F 'CategoryIds=uuid1' -F 'CategoryIds=uuid2'`). In the frontend use `formData.append('CategoryIds', id)` in a loop.
- **Slug:** Optional — if omitted, the backend auto-generates it from `Name`. Slugs must be unique across all products; submitting a duplicate slug will return an error.
- **Status:** Not included in the create request. Newly created products default to `Active`.
- **Thumbnail:** Optional — if provided, uploaded to the `moriicoffee-public` S3 bucket and the returned `thumbnailUrl` will be a CloudFront CDN URL (`https://ddlda2rzhrys8.cloudfront.net/...`).
- **Empty arrays on creation:** `variants` and `images` always return as `[]` on creation. Add them via their respective endpoints after the product is created.
- **HTTP 201:** A successful create returns `201 Created`, not `200 OK`.

---

## Endpoint 4 — Update Product

```
PUT /api/v1/products/{id}
```


**Path parameter:** `id` — product UUID

**Usage:** Admin product edit form — update name, slug, description, price, categories, thumbnail, status, featured flag, display order.

> **Content-Type:** `multipart/form-data` — this endpoint does **not** accept JSON.

### Request Fields

| Field          | Type                               | Required | Description                              |
|----------------|------------------------------------|----------|------------------------------------------|
| `Name`         | string                             | ✅        | Product name                             |
| `Slug`         | string                             | ❌        | URL slug                                 |
| `Description`  | string                             | ❌        | Product description                      |
| `BasePrice`    | number (double)                    | ✅        | Base price in VND                        |
| `CategoryIds`  | string[] (uuid)                    | ✅        | Array of category UUIDs                  |
| `Thumbnail`    | binary (file)                      | ❌        | Thumbnail image file                     |
| `Status`       | `'Active' \| 'Inactive' \| 'OutOfStock'` | ❌ | Product status                          |
| `IsFeatured`   | boolean                            | ❌        | Featured flag                            |
| `DisplayOrder` | integer                            | ❌        | Display order                            |

### TypeScript Interfaces

```typescript
interface UpdateProductRequest {
  Name: string
  Slug?: string
  Description?: string
  BasePrice: number
  CategoryIds: string[]
  Thumbnail?: File
  Status?: 'Active' | 'Inactive' | 'OutOfStock'
  IsFeatured?: boolean
  DisplayOrder?: number
}

// Response — same shape as ProductDetail (Endpoint 2)
interface UpdateProductResponse {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  categories: ProductCategory[]
  thumbnailUrl: string | null
  status: 'Active' | 'Inactive' | 'OutOfStock'
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  variants: ProductVariant[]
  images: ProductImage[]
}
```

### Example curl

```bash
curl -X 'PUT' \
  'http://localhost:8002/api/v1/products/{id}' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Name=Butter Croissant' \
  -F 'Slug=butter-croissant' \
  -F 'Thumbnail=@image.jpg;type=image/jpeg' \
  -F 'DisplayOrder=1' \
  -F 'Status=Active' \
  -F 'BasePrice=86000' \
  -F 'IsFeatured=true' \
  -F 'CategoryIds=873053a3-cf04-47a2-9f50-b48c352340f0' \
  -F 'Description=Product description here'
```

### Notes

- **Multipart only:** The request must be sent as `multipart/form-data`. Sending JSON will fail.
- **CategoryIds array:** Send each UUID as a separate form field. In curl: `-F 'CategoryIds=uuid1' -F 'CategoryIds=uuid2'`. In the browser with `FormData`: call `formData.append('CategoryIds', uuid)` once per UUID.
- **Thumbnail:** Optional — if omitted, the existing thumbnail is preserved. When provided, the file is uploaded to the `moriicoffee-public` S3 bucket and the returned `thumbnailUrl` will be a CloudFront CDN URL (`https://ddlda2rzhrys8.cloudfront.net/...`).
- **Sparse response:** `variants` and `images` in the response may return as empty arrays `[]`. If the full detail (variants, images) is needed immediately after update, follow up with `GET /api/v1/products/{id}`.
- **Status note:** The update endpoint accepts `'OutOfStock'` as a valid `Status` value (unlike the list endpoint which only returns `'Active' | 'Inactive'`).

---

## Endpoint 5 — Upload Product Images

```
POST /api/v1/products/{productId}/images
```

**Path parameter:** `productId` — product UUID

**Usage:** Admin product form — attach one or more gallery images to an existing product after it has been created.

> **Content-Type:** `multipart/form-data` — this endpoint does **not** accept JSON.
> **Success response:** HTTP **201 Created** (not 200).

### Path Parameters

| Field       | Type          | Required | Description              |
|-------------|---------------|----------|--------------------------|
| `productId` | string (uuid) | ✅        | ID of the product        |

### Request Fields

| Field   | Type            | Required | Description                          |
|---------|-----------------|----------|--------------------------------------|
| `Files` | binary[] (file) | ✅        | One or more image files to upload    |

### TypeScript Interfaces

```typescript
interface UploadProductImagesRequest {
  Files: File[]
}

type UploadProductImagesResponse = {
  id: string
  url: string
  displayOrder: number
}[]
```

### Example curl

```bash
curl -X 'POST' \
  'http://localhost:8002/api/v1/products/e18de1cc-db6a-4aa1-97e0-60ef04d3a9dd/images' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'Files=@RICHWEBDEV_LOGO.jpg;type=image/jpeg'
```

### Notes

- **Multipart only:** The request must be sent as `multipart/form-data`. Sending JSON will fail.
- **Multiple files:** `Files` supports multiple uploads — send as repeated form fields (`-F 'Files=@img1.png' -F 'Files=@img2.png'`). In the frontend use `formData.append('Files', file)` in a loop.
- **Supported types:** `jpg`, `jpeg`, `png`, `webp`.
- **Max file size:** 5 MB per image.
- **Max images per product:** 10.
- **Storage path:** Images are stored in the `moriicoffee-public` S3 bucket at `products/{productId}/{timestamp}-{filename}` and served via CloudFront CDN (`https://ddlda2rzhrys8.cloudfront.net/...`).
- **Auto-thumbnail:** If the product has no existing images, the first uploaded image is automatically set as the thumbnail.
- **Array response:** The response is always an array, even when uploading a single file.
- **HTTP 201:** A successful upload returns `201 Created`, not `200 OK`.

---

## Endpoint 6 — Delete Product Image

```
DELETE /api/v1/products/{productId}/images/{imageId}
```

**Usage:** Admin product form — permanently remove a single image from a product's gallery.

> **Request body:** None — both IDs are passed as path parameters only.
> **Success response:** HTTP **204 No Content** with an empty body (not 200).

### Path Parameters

| Field       | Type          | Required | Description                    |
|-------------|---------------|----------|--------------------------------|
| `productId` | string (uuid) | ✅        | ID of the product              |
| `imageId`   | string (uuid) | ✅        | ID of the image to delete      |

### Example curl

```bash
curl -X 'DELETE' \
  'http://localhost:8002/api/v1/products/e18de1cc-db6a-4aa1-97e0-60ef04d3a9dd/images/916f0aac-2b6c-47eb-9976-86ee61d22439' \
  -H 'accept: */*'
```

### Notes

- **No request body:** Both `productId` and `imageId` are path parameters — do not send a body.
- **Permanent deletion:** The image is removed from both the database and S3 storage and cannot be recovered.
- **Auto-thumbnail promotion:** If the deleted image was the product thumbnail, the next image by `displayOrder` is automatically promoted as the new thumbnail.
- **HTTP 204:** A successful delete returns `204 No Content` with an empty body — not `200 OK`.
- **Error responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

---

## Endpoint 7 — Create Product Variants

```
POST /api/v1/products/{productId}/variants
```

**Path parameter:** `productId` — product UUID

**Usage:** Admin product form — adds one or more size variants to an existing product in a single request.

> **Content-Type:** `application/json` — this endpoint does **not** accept `multipart/form-data`.
> **Success response:** HTTP **201 Created** (not 200).

### Path Parameters

| Field       | Type          | Required | Description         |
|-------------|---------------|----------|---------------------|
| `productId` | string (uuid) | ✅        | ID of the product   |

### Request Fields

The request body is a **JSON array** of variant objects — even when creating a single variant.

```typescript
interface CreateProductVariantRequest {
  name: string
  size: 'Small' | 'Medium' | 'Large'
  additionalPrice: number
  sku?: string
  stockQuantity: number   // -1 = unlimited
  isDefault: boolean
  isAvailable?: boolean   // defaults to true on the server
}

type CreateProductVariantsPayload = CreateProductVariantRequest[]
```

### TypeScript Interfaces

```typescript
// Response — HTTP 201, array of created variants
type CreateProductVariantsResponse = ProductVariant[]
```

### Example curl

```bash
curl -X 'POST' \
  'http://localhost:8002/api/v1/products/73b8b5bb-ec9f-4719-9abf-91544c75c9b3/variants' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '[
    { "name": "Small (700ml)", "size": "Small", "additionalPrice": 0, "sku": "", "stockQuantity": -1, "isDefault": true, "isAvailable": true },
    { "name": "Medium (1000ml)", "size": "Medium", "additionalPrice": 10000, "sku": "", "stockQuantity": -1, "isDefault": false, "isAvailable": true },
    { "name": "Large (1000ml)", "size": "Large", "additionalPrice": 20000, "sku": "", "stockQuantity": -1, "isDefault": false, "isAvailable": true }
  ]'
```

### Notes

- **JSON array body:** The request body must always be a JSON array — even when creating a single variant.
- **`totalPrice` is server-computed:** Do not include `totalPrice` in the request — the server calculates it as `basePrice + additionalPrice`.
- **Unlimited stock:** `stockQuantity: -1` means unlimited stock. Only block purchase when `stockQuantity === 0`.
- **`isDefault` behavior:** Setting `isDefault: true` on any variant in the request clears all existing default flags on the product first — only one variant can be default at a time.
- **`isAvailable`:** Optional — defaults to `true` on the server. Set to `false` to create a variant that is immediately unavailable.
- **HTTP 201:** A successful create returns `201 Created`, not `200 OK`.
- **Error responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

---

## Endpoint 8 — Update Product Variant

```
PUT /api/v1/products/{productId}/variants/{variantId}
```

**Usage:** Admin product form — update a single existing variant's name, size, price, stock, and availability.

> **Content-Type:** `application/json` — this endpoint does **not** accept `multipart/form-data`.
> **Success response:** HTTP **200 OK**.

### Path Parameters

| Parameter   | Type          | Required |
|-------------|---------------|----------|
| `productId` | string (uuid) | ✅        |
| `variantId` | string (uuid) | ✅        |

### TypeScript Interfaces

```typescript
interface UpdateProductVariantRequest {
  name: string
  size: 'Small' | 'Medium' | 'Large'
  additionalPrice: number
  sku?: string
  stockQuantity: number
  isDefault: boolean
  isAvailable: boolean
}

// Response — HTTP 200
interface ProductVariantResponse {
  id: string
  productId: string
  name: string
  size: 'Small' | 'Medium' | 'Large'
  additionalPrice: number
  totalPrice: number
  sku: string
  stockQuantity: number
  isDefault: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}
```

### Example curl

```bash
curl -X 'PUT' \
  'http://localhost:8002/api/v1/products/{productId}/variants/{variantId}' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Small (800ml)",
  "size": "Small",
  "additionalPrice": 5000,
  "sku": "",
  "stockQuantity": -1,
  "isDefault": true,
  "isAvailable": true
}'
```

### Notes

- **JSON only:** Request body must be `application/json` — not `multipart/form-data`.
- **`totalPrice` is server-computed:** Do not include `totalPrice` in the request — the backend computes it as `basePrice + additionalPrice`.
- **`isDefault` auto-clear:** Setting `isDefault: true` automatically clears `isDefault` on all other variants for the same product — no frontend handling needed.
- **Unlimited stock:** `stockQuantity: -1` means unlimited stock.
- **Error responses:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

---

## Endpoint 9 — Delete Product Variant

```
DELETE /api/v1/products/{productId}/variants/{variantId}
```

**Usage:** Admin product form — remove a variant from a product.

> **Request body:** None — both IDs are path parameters only.
> **Success response:** HTTP **204 No Content** with an empty body.

### Path Parameters

| Parameter   | Type          | Required |
|-------------|---------------|----------|
| `productId` | string (uuid) | ✅        |
| `variantId` | string (uuid) | ✅        |

### Example curl

```bash
curl -X 'DELETE' \
  'http://localhost:8002/api/v1/products/{productId}/variants/{variantId}' \
  -H 'accept: */*'
```

### Notes

- **HTTP 204:** Returns `204 No Content` on success — do not attempt to parse a response body.
- **Soft delete:** The variant record is retained in the database for order history integrity — it is just no longer active.
- **Refresh after delete:** After deletion, refetch the product detail (`GET /api/v1/products/{id}`) to reflect the updated variants list in the UI.
- **Error responses:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.
