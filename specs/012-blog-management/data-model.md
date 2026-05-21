# Data Model: Blog Management

## Overview

The blog-management feature introduces two primary content entities and one derived state model. The frontend will mirror the backend DTOs closely while layering form models and view models for admin/public rendering.

## Entity: Blog Post

**Purpose**: Represents a curated article managed from the admin workspace and optionally displayed on the storefront.

### Core Fields

- `id`: Unique post identifier
- `title`: Human-readable article title
- `slug`: Unique public URL key
- `excerpt`: Short summary used in lists and previews
- `contentJson`: Structured rich-text document used to rehydrate the editor
- `contentHtml`: Rendered article snapshot used in public rendering
- `coverImageUrl`: Public URL for the cover image
- `coverImageFileName`: Optional storage object name for later replacement or cleanup workflows
- `status`: Publication state
- `isFeatured`: Whether the post is eligible for featured storefront sections
- `displayOrder`: Manual sort position for curated lists
- `seoTitle`: Optional search preview title
- `seoDescription`: Optional search preview description
- `publishedAt`: Timestamp for first successful publication
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

### Validation Rules

- `title` is required for every saved post
- `slug` must be unique among blog posts
- `contentJson` and `contentHtml` are both required for a published post
- At least one category must be attached before a post can be published
- `displayOrder` must be a non-negative integer
- `seoTitle` and `seoDescription` remain optional
- `coverImageUrl` remains optional for drafts and published posts unless product later tightens this rule

### State Transitions

- `Draft -> Draft`: Save edits without publication
- `Draft -> Published`: Publish when all required publication data is valid
- `Draft -> Archived`: Remove unfinished or obsolete drafts from active management
- `Published -> Published`: Update an already published article
- `Published -> Draft`: Unpublish while keeping the content editable
- `Published -> Archived`: Remove from storefront while retaining history
- `Archived -> Draft`: Restore for editing
- `Archived -> Published`: Restore directly to storefront if all publication requirements are satisfied

### Derived Behaviors

- Only `Published` posts appear on public routes
- Only `Published` posts with `isFeatured = true` appear in featured public sections
- Soft-deleted posts are excluded from standard admin and all public lists

## Entity: Blog Category

**Purpose**: Organizes blog posts for admin management and storefront browsing.

### Core Fields

- `id`: Unique category identifier
- `name`: Human-readable category name
- `slug`: Unique public URL key for category filtering
- `description`: Optional category summary
- `displayOrder`: Manual sort position
- `isActive`: Whether the category is available for public browsing and routine selection
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

### Validation Rules

- `name` is required
- `slug` must be unique among blog categories
- `displayOrder` must be a non-negative integer
- A category linked to any non-deleted post cannot be deleted

### Derived Behaviors

- Inactive or soft-deleted categories are hidden from public category browsing
- Reordering categories changes both admin presentation and public navigation/filter ordering

## Relationship: Blog Post ↔ Blog Category

**Type**: Many-to-many

### Rules

- A post may belong to multiple categories
- A draft may temporarily have zero categories
- A published post must belong to at least one category
- Category deletion is blocked while any non-deleted post still references it

## Form Model: Blog Post Editor

**Purpose**: Captures admin input before save/publish actions.

### Fields

- `title`
- `slug`
- `excerpt`
- `contentJson`
- `contentHtml`
- `coverImageUrl`
- `coverImageFileName`
- `categoryIds`
- `seoTitle`
- `seoDescription`
- `isFeatured`
- `displayOrder`
- `status`

### Notes

- The editor form should distinguish between save-as-draft and publish intent.
- Validation is stricter on publish than on draft save.

## View Model: Public Blog List Item

**Purpose**: Drives `/blog`, homepage previews, and featured sections.

### Fields

- `id`
- `title`
- `slug`
- `excerpt`
- `coverImageUrl`
- `publishedAt`
- `categories`
- `isFeatured`
- `displayOrder`

### Rules

- Derived only from published posts
- Ordered by explicit merchandising rules rather than implicit mock-data order
