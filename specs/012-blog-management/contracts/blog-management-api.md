# Contract: Blog Management API Integration

## Scope

This contract defines the frontend-facing integration points needed to implement the internal blog CMS and replace public mock blog data.

## Shared Response Patterns

All endpoints are expected to use the existing Morii API envelope:

```ts
interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown;
}
```

Paginated endpoints are expected to return:

```ts
interface ApiPagination<T> {
  items: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    payloadSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    takeAll: boolean;
  };
}
```

## Publication Status

```ts
type BlogPostStatus = "Draft" | "Published" | "Archived";
```

## Entity DTOs

### Blog Category

```ts
interface ApiBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

### Blog Post Summary

```ts
interface ApiBlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  categories: ApiBlogCategory[];
}
```

### Blog Post Detail

```ts
interface ApiBlogPostDetail extends ApiBlogPostSummary {
  contentHtml: string;
  contentJson: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImageFileName: string | null;
}
```

## Admin Endpoints

Workspace-level assumption: any user admitted to the admin blog area may execute the full mutation set below for this release.

### Blog Posts

- `GET /api/v1/admin/blog-posts?page&size&takeAll&status&categoryId&search`
- `GET /api/v1/admin/blog-posts/{id}`
- `POST /api/v1/admin/blog-posts`
- `PUT /api/v1/admin/blog-posts/{id}`
- `DELETE /api/v1/admin/blog-posts/{id}`
- `PATCH /api/v1/admin/blog-posts/{id}/status`
- `PATCH /api/v1/admin/blog-posts/reorder`

#### Create / Update payload

```ts
interface UpsertBlogPostRequest {
  title: string;
  slug?: string | null;
  excerpt: string | null;
  contentHtml: string;
  contentJson: string | null;
  coverImageUrl: string | null;
  coverImageFileName: string | null;
  categoryIds: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  displayOrder: number;
  status: BlogPostStatus;
}
```

#### Status payload

```ts
interface UpdateBlogPostStatusRequest {
  status: BlogPostStatus;
}
```

#### Reorder payload

```ts
interface ReorderBlogPostsRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}
```

### Blog Categories

- `GET /api/v1/admin/blog-categories?page&size&takeAll&search`
- `GET /api/v1/admin/blog-categories/{id}`
- `POST /api/v1/admin/blog-categories`
- `PUT /api/v1/admin/blog-categories/{id}`
- `DELETE /api/v1/admin/blog-categories/{id}`
- `PATCH /api/v1/admin/blog-categories/reorder`

#### Create / Update payload

```ts
interface UpsertBlogCategoryRequest {
  name: string;
  slug?: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}
```

#### Reorder payload

```ts
interface ReorderBlogCategoriesRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}
```

## Public Endpoints

- `GET /api/v1/blog-posts?page&size&takeAll&categorySlug&search&featuredOnly`
- `GET /api/v1/blog-posts/{slug}`
- `GET /api/v1/blog-categories?activeOnly=true`
- `GET /api/v1/blog-posts/featured?take=3`

## Upload Integration

Cover-image uploads must reuse the shared file API rather than introducing a blog-specific upload route.

- `POST /api/v1/files/upload`

Expected multipart fields:

- `File`
- `BucketName=blogs`

Expected frontend result mapping:

```ts
interface ApiUploadResult {
  blob: {
    uri: string;
    name: string;
  };
}
```

The frontend should persist:

- `coverImageUrl = blob.uri`
- `coverImageFileName = blob.name`

## Public Route Contract

The frontend must preserve these route shapes:

- `/blog`
- `/blog/[slug]`
- homepage preview section linking into `/blog`

The admin area should add:

- `/admin/blogs`
- `/admin/blogs/new`
- `/admin/blogs/edit/[id]`

## Validation Expectations

- Publishing must fail if required publishable fields are missing.
- Duplicate post or category slugs must be rejected with a user-facing validation message.
- Category deletion must fail while the category is still linked to any non-deleted post.
- Public endpoints must never return draft, archived, or deleted posts.
