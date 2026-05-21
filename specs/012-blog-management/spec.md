# Feature Specification: Blog Management

**Feature Branch**: `012-blog-management`  
**Created**: 2026-05-21  
**Status**: Draft  
**Input**: User description: "Implement a comprehensive internal blog management feature for Morii Coffee using the existing project direction and the clarified business decisions from the current discussion."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage blog posts in admin (Priority: P1)

As a staff member who can access the blog area in admin, I want to create, update, save, publish, archive, and remove blog posts so that Morii can maintain storefront content without relying on mock data or developer intervention.

**Why this priority**: Post management is the core value of the feature. Without it, Morii cannot operate the blog as an internal CMS.

**Independent Test**: Can be fully tested by entering the admin blog area, creating a new post, saving it as a draft, publishing it, updating it, archiving it, and soft deleting it while confirming the expected visibility changes in admin and storefront views.

**Acceptance Scenarios**:

1. **Given** an eligible staff member is in the admin blog area, **When** they create a new post with the required publication data and choose to publish it, **Then** the post is saved and becomes available on the public blog.
2. **Given** an existing post is in draft, **When** the staff member edits and saves it without publishing, **Then** the post remains available in admin and hidden from the public blog.
3. **Given** a published post exists, **When** the staff member changes it to draft or archived, **Then** it is removed from the public blog and remains manageable in admin.
4. **Given** a post has been soft deleted, **When** the admin list is viewed with default filters, **Then** the deleted post does not appear in routine admin browsing or any public blog surface.

---

### User Story 2 - Organize categories and curated ordering (Priority: P2)

As a staff member who manages blog content, I want to group posts into categories and control their display order and featured status so that Morii can present content intentionally on the storefront.

**Why this priority**: Once posts exist, discoverability and curation become the next most important business need for a commerce-focused brand blog.

**Independent Test**: Can be fully tested by creating categories, assigning them to posts, reordering categories and posts, marking a post as featured, and verifying the resulting organization in admin and public listings.

**Acceptance Scenarios**:

1. **Given** categories exist, **When** a staff member assigns one or more categories to a post and publishes it, **Then** the post appears under those categories on the public blog.
2. **Given** multiple published posts exist, **When** a staff member changes featured status or display order, **Then** curated blog sections reflect the new order consistently.
3. **Given** a category is still linked to one or more active posts, **When** a staff member attempts to delete that category, **Then** the system blocks the action and explains why.

---

### User Story 3 - Read published blog content on the storefront (Priority: P3)

As a storefront visitor, I want to browse published blog posts, open a post by its URL, and discover featured content and categories so that I can engage with Morii's stories, education, and brand content.

**Why this priority**: Public consumption is the customer-facing payoff of the CMS, but it depends on internal content operations already being in place.

**Independent Test**: Can be fully tested by visiting the public blog listing, opening a published post by its URL, browsing featured items, and confirming that draft or archived content never appears publicly.

**Acceptance Scenarios**:

1. **Given** published blog posts exist, **When** a storefront visitor opens the public blog listing, **Then** they see only published content with its category and summary information.
2. **Given** a published post has a unique URL slug, **When** a storefront visitor opens that slug, **Then** they see the full published article.
3. **Given** a post is draft, archived, or deleted, **When** a storefront visitor browses the public blog, **Then** that post is not accessible from public blog listings or detail views.

### Edge Cases

- What happens when a staff member tries to publish a post that is missing required publication data such as a title, URL slug, main content, or at least one category?
- What happens when a staff member creates or renames a post or category to a URL slug that already exists?
- How does the system behave when a published post is moved back to draft or archived while a visitor is actively browsing blog pages?
- How does the system handle display-order conflicts when multiple posts or categories are assigned overlapping positions?
- What happens when a category is deactivated after being assigned to existing posts?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an admin blog workspace where any platform user who is allowed to access that workspace can manage blog content without additional author-specific role distinctions inside the feature.
- **FR-002**: The system MUST allow eligible staff to create, view, update, archive, publish, unpublish, and soft delete blog posts from the admin workspace.
- **FR-003**: The system MUST allow eligible staff to save incomplete blog posts as drafts without making them visible on the public site.
- **FR-004**: The system MUST support rich article content, short summary content, optional cover media, optional search-preview metadata, featured status, and manual display order for each blog post.
- **FR-005**: The system MUST require each published post to have a valid title, unique public URL slug, publishable main content, and at least one assigned category before publication succeeds.
- **FR-006**: The system MUST set and retain post lifecycle timestamps needed to distinguish created, updated, and published states.
- **FR-007**: The system MUST ensure that only posts in the published state are visible through public blog browsing and public post detail access.
- **FR-008**: The system MUST remove a post from all public blog surfaces immediately when its status changes from published to draft, archived, or deleted.
- **FR-009**: The system MUST allow eligible staff to create, update, activate, deactivate, reorder, and soft delete blog categories.
- **FR-010**: The system MUST block category deletion when that category is still linked to any non-deleted blog post and MUST present a clear validation message for the blocked action.
- **FR-011**: The system MUST allow a blog post to be assigned to multiple categories.
- **FR-012**: The system MUST provide admin blog lists with search and status/category filtering so staff can quickly find and manage content.
- **FR-013**: The system MUST provide public blog listings, public blog detail pages by slug, public category browsing, and public featured-content browsing based only on published content.
- **FR-014**: The system MUST preserve manual ordering choices for both posts and categories so the storefront can present curated content in a predictable order.
- **FR-015**: The system MUST prevent duplicate slugs across blog posts and across blog categories within their respective content types.
- **FR-016**: The system MUST return user-friendly validation or error feedback when a save, publish, delete, or reorder action cannot be completed.
- **FR-017**: The system MUST support replacing mock or manually maintained blog content on the storefront with managed CMS content from this feature.

### Key Entities *(include if feature involves data)*

- **Blog Post**: A managed content item with a title, URL slug, summary, full article body, publication status, featured flag, display position, optional cover media, optional search-preview metadata, lifecycle timestamps, and links to one or more categories.
- **Blog Category**: A named grouping used to organize blog posts for admin management and storefront discovery, including its own URL slug, description, active state, display position, and lifecycle timestamps.
- **Blog Publication State**: The business state of a post that determines whether it is work in progress, publicly visible, or retained internally without public visibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Eligible staff can create a new draft blog post and save it successfully in under 5 minutes on their first attempt.
- **SC-002**: Eligible staff can publish a valid blog post and see it appear in the public blog listing and detail view within one content refresh cycle.
- **SC-003**: 100% of draft, archived, deleted, or otherwise unpublished posts remain inaccessible from public blog listings and public post detail views during verification.
- **SC-004**: Eligible staff can reorder posts or categories and observe the updated order consistently in the relevant admin and public views without manual data correction.
- **SC-005**: Attempts to publish incomplete posts or delete categories that are still in use are blocked with clear, actionable feedback in every verified case.

## Assumptions

- Access to the admin blog workspace is governed by Morii's existing platform access controls, and any user who can enter that workspace may perform full blog-management actions for this release.
- The first release manages a single-language blog experience and does not include parallel localized versions of the same article.
- Public blog comments, editorial approval flows, scheduled publishing, revision history, and per-author attribution remain out of scope for this feature.
- Existing shared media handling and existing storefront navigation patterns will be reused rather than introducing a separate asset-management or discovery workflow just for blog content.
