# Summary: Product Image Management Feature

**Date:** 2026-03-19
**Feature:** Product Image Management — Upload, Delete, Set Thumbnail, Reorder

---

## 1. Overview

Complete implementation of product image management for MoriiCoffee. Images are stored in the public AWS S3 bucket (`moriicoffee-public`) at the path `products/{productId}/{timestamp}-{filename}` and served via CloudFront CDN. The CDN URL is persisted to the database — the raw S3 URL is never stored. Every image operation is transactional: if the DB commit fails, any already-uploaded S3 objects are rolled back.

---

## 2. Files Created

### Domain Layer
| File | Description |
|------|-------------|
| `MoriiCoffee.Domain/Repositories/IProductImagesRepository.cs` | Repository interface with `GetByProductIdAsync`, `ClearThumbnailFlagAsync`, `CountByProductIdAsync` |

### Application Layer — DTOs
| File | Description |
|------|-------------|
| `Application/SeedWork/DTOs/ProductImage/ProductImageDto.cs` | Response DTO: `Id`, `Url`, `DisplayOrder`, `IsThumbnail` |
| `Application/SeedWork/DTOs/ProductImage/UploadProductImagesDto.cs` | Request DTO: list of `IFormFile` |
| `Application/SeedWork/DTOs/ProductImage/ReorderProductImagesDto.cs` | Request DTO: ordered list of image GUIDs |

### Application Layer — Commands
| File | Description |
|------|-------------|
| `Commands/Product/UploadProductImages/UploadProductImagesCommand.cs` | Command to upload one or more images |
| `Commands/Product/UploadProductImages/UploadProductImagesCommandValidator.cs` | Validates file type (jpg/jpeg/png/webp) and size (max 5 MB) |
| `Commands/Product/UploadProductImages/UploadProductImagesCommandHandler.cs` | Uploads to S3 with a DB transaction; rolls back S3 on DB failure |
| `Commands/Product/DeleteProductImage/DeleteProductImageCommand.cs` | Command to delete one image |
| `Commands/Product/DeleteProductImage/DeleteProductImageCommandHandler.cs` | Deletes from DB, auto-promotes next thumbnail, then deletes from S3 |
| `Commands/Product/SetProductImageThumbnail/SetProductImageThumbnailCommand.cs` | Command to promote an image as the thumbnail |
| `Commands/Product/SetProductImageThumbnail/SetProductImageThumbnailCommandHandler.cs` | Clears old thumbnail flag, sets new one, updates `Product.ThumbnailUrl` |
| `Commands/Product/ReorderProductImages/ReorderProductImagesCommand.cs` | Command to reorder gallery images |
| `Commands/Product/ReorderProductImages/ReorderProductImagesCommandValidator.cs` | Validates no duplicate IDs |
| `Commands/Product/ReorderProductImages/ReorderProductImagesCommandHandler.cs` | Validates all IDs belong to the product, reassigns `DisplayOrder` 1…N |

### Infrastructure Layer
| File | Description |
|------|-------------|
| `Infrastructure.Persistence/Repositories/ProductImagesRepository.cs` | EF Core implementation of `IProductImagesRepository` |

### Database Migration
| File | Description |
|------|-------------|
| `Migrations/20260319161922_RefactorProductImagesAddS3KeyAndIsThumbnail.cs` | EF Core migration for ProductImages schema changes |

---

## 3. Files Modified

| File | Change |
|------|--------|
| `Domain/Aggregates/ProductAggregate/Entities/ProductImage.cs` | Renamed `ImageUrl` → `Url`, `IsMain` → `IsThumbnail`; removed `AltText`; added `S3Key` |
| `Domain/SeedWork/Persistence/IUnitOfWork.cs` | Added `IProductImagesRepository ProductImages` property |
| `Application/SeedWork/Abstractions/IFileService.cs` | Added `UploadAsync(blob, bucketName, customObjectName)` overload for custom S3 paths |
| `Application/SeedWork/DTOs/Product/ProductDto.cs` | Added `List<ProductImageDto> Images` (populated on detail endpoint only) |
| `Application/SeedWork/Mappings/ProductMapper.cs` | Added `ProductImage → ProductImageDto` map; wired `Images` into `Product → ProductDto` |
| `Infrastructure/Services/AwsS3FileService.cs` | Implemented the new `UploadAsync` overload |
| `Infrastructure/Services/MinioFileService.cs` | Implemented the new `UploadAsync` overload |
| `Infrastructure.Persistence/SeedWork/UnitOfWork/UnitOfWork.cs` | Added `ProductImagesRepository` with lazy initialization |
| `Infrastructure.Persistence/Configurations/ProductConfiguration.cs` | Added `OnDelete(Cascade)` for the Images relationship |
| `Presentation/Controllers/ProductsController.cs` | Added 4 new image management endpoints |

---

## 4. Database Changes

Migration `RefactorProductImagesAddS3KeyAndIsThumbnail` alters the `ProductImages` table:

| Operation | Detail |
|-----------|--------|
| Rename column | `ImageUrl` → `Url` |
| Rename column | `IsMain` → `IsThumbnail` |
| Drop column | `AltText nvarchar(200)` |
| Add column | `S3Key nvarchar(500) NOT NULL` — stores the S3 object key for future deletion |

---

## 5. API — New Endpoints

All write endpoints require the Admin role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/products/{productId}/images` | Upload one or more images (`multipart/form-data`, field: `files[]`) |
| `DELETE` | `/api/v1/products/{productId}/images/{imageId}` | Delete an image from DB and S3 |
| `PATCH` | `/api/v1/products/{productId}/images/{imageId}/set-thumbnail` | Promote an image as the product thumbnail |
| `PATCH` | `/api/v1/products/{productId}/images/reorder` | Reorder gallery images (`body: { "imageIds": [...] }`) |

### Existing Endpoints Updated
- `GET /api/v1/products/{id}` — response now includes a full `images` array (`url`, `displayOrder`, `isThumbnail`)
- `GET /api/v1/products` (list) — does **not** include `images`; only `thumbnailUrl` is returned

---

## 6. Business Rules Applied

| Rule | Enforcement |
|------|-------------|
| Max 10 images per product | Checked before upload; returns 400 if exceeded |
| Only one thumbnail at a time | `ClearThumbnailFlagAsync` unsets all others before setting the new one |
| First uploaded image auto-set as thumbnail | Handler checks `existingCount == 0`, sets `IsThumbnail = true` on the first file |
| Deleting thumbnail auto-promotes next image | After delete, the image with the lowest remaining `DisplayOrder` is promoted |
| Deleting all images sets `ThumbnailUrl = null` | `Product.ThumbnailUrl` is explicitly nulled when no images remain |
| S3 rollback on DB failure | Upload runs inside a DB transaction; caught exceptions trigger S3 cleanup |
| Allowed file types | `jpg`, `jpeg`, `png`, `webp` only |
| Max file size | 5 MB per file |
| URL stored in DB | Always the CloudFront CDN URL (`https://ddlda2rzhrys8.cloudfront.net/...`) |

---

## 7. Architecture Notes

### S3 Key Strategy
The `IFileService` interface was extended with a custom-key `UploadAsync` overload. The command handler builds the key as:
```
{productId}/{timestamp}-{sanitized-filename}
```
The S3 service then stores the full object at:
```
products/{productId}/{timestamp}-{sanitized-filename}
```
Both `S3Key` (for deletion) and `Url` (CDN URL for display) are persisted to the DB independently.

### Transaction Safety
The upload handler calls `BeginTransactionAsync` before the first S3 upload and `EndTransactionAsync` (commit) after all DB inserts. If any step throws, `RollbackTransactionAsync` is called and all already-uploaded S3 objects are deleted via `IFileService.DeleteAsync`.

---

## 8. How to Verify

### Step 1 — Apply the migration
```bash
dotnet ef database update \
  --project source/MoriiCoffee.Infrastructure.Persistence/MoriiCoffee.Infrastructure.Persistence.csproj \
  --startup-project source/MoriiCoffee.Presentation/MoriiCoffee.Presentation.csproj
```

### Step 2 — Run the application
```bash
dotnet run --project source/MoriiCoffee.Presentation
```

### Step 3 — Test via Swagger UI or Postman
1. **Upload first image** → Verify `isThumbnail: true` and `Product.ThumbnailUrl` is set to the CDN URL
2. **Upload additional images** → Verify new images have `isThumbnail: false`
3. **Set thumbnail** → Previous thumbnail becomes `false`, target becomes `true`
4. **Reorder** → Send a new ID order, verify `displayOrder` values update accordingly
5. **Delete thumbnail** → Next image (by `displayOrder`) is auto-promoted as thumbnail
6. **Delete all images** → Verify `Product.ThumbnailUrl` returns `null`
7. **GET /products/{id}** → Response includes full `images` array
8. **GET /products** → Response does **not** include `images`, only `thumbnailUrl`
