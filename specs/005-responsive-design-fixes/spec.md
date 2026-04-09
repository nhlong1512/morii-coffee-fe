# Feature Specification: Responsive Design Fixes

**Feature Branch**: `005-responsive-design-fixes`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Please review all pages and components in the project for responsive design issues. Ensure every page works correctly on three breakpoints: Mobile: < 768px, Tablet: 768px - 1024px, Desktop: > 1024px. Use Tailwind's responsive prefixes (sm:, md:, lg:) to fix any issues found."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile Visitor Browsing Products (Priority: P1)

A customer visits the Morii Coffee website on a smartphone (< 768px). They navigate the home page, browse the product listing, view a product detail, and add an item to their cart — all without horizontal scrolling, overlapping elements, or broken layouts.

**Why this priority**: Mobile traffic represents the majority of e-commerce visits. A broken mobile experience directly impacts conversions and perceived quality.

**Independent Test**: Open the home page, products page, product detail page, and cart page on a 375px-wide viewport. Verify all layouts stack correctly, text is readable, and interactive elements are tap-friendly.

**Acceptance Scenarios**:

1. **Given** a user on a 375px mobile viewport, **When** they load the home page, **Then** the hero carousel, product cards, and navigation all display without horizontal overflow.
2. **Given** a user on a mobile viewport, **When** they open the mobile navigation menu, **Then** all nav links are visible, tappable, and the menu closes cleanly.
3. **Given** a user on a mobile viewport, **When** they view a product card grid, **Then** cards are displayed in a single column with appropriate spacing.
4. **Given** a user on a mobile viewport, **When** they open the cart page, **Then** line items, totals, and checkout controls are legible and actionable without zooming.

---

### User Story 2 - Tablet User Browsing and Ordering (Priority: P2)

A customer uses a tablet (768px–1024px) to browse products, read blog posts, and manage their profile. Layouts adapt to the medium viewport: grids shift from single-column to two-column where appropriate, and the desktop header is visible but sized for the intermediate screen width.

**Why this priority**: Tablets are a significant secondary device category. Layouts that skip the tablet breakpoint produce jarring jumps from mobile to desktop.

**Independent Test**: Resize the browser to 768px and 1024px. Verify grids, navigation, and page sections adapt smoothly without overflow or collapsed text.

**Acceptance Scenarios**:

1. **Given** a user on a 768px viewport, **When** they view the products listing page, **Then** product cards display in a 2-column grid.
2. **Given** a user on a tablet viewport, **When** they navigate to the blog page, **Then** blog post cards and their images scale proportionally without cropping or overflow.
3. **Given** a user on a 1024px viewport, **When** they open the profile page, **Then** form fields and sections display in a readable two-column or single-column layout without clipping.

---

### User Story 3 - Admin User Managing Products on Any Device (Priority: P3)

An admin user accesses the admin panel from a tablet or laptop to manage products, orders, and promotions. The admin sidebar collapses on smaller screens and the data tables scroll horizontally when content exceeds the viewport.

**Why this priority**: Admin panels are commonly accessed from varying screen sizes during operations. Broken admin layouts impede day-to-day management tasks.

**Independent Test**: Open the admin products, orders, and reports pages at 768px. Verify data tables have horizontal scroll, the sidebar either collapses or is replaced by a hamburger menu, and stat cards reflow.

**Acceptance Scenarios**:

1. **Given** an admin on a tablet viewport, **When** they open the admin dashboard, **Then** stat cards reflow into a 2-column grid instead of overflowing off-screen.
2. **Given** an admin on a mobile viewport, **When** they view a data table, **Then** the table scrolls horizontally inside its container without breaking the page layout.
3. **Given** an admin on a tablet viewport, **When** they access the admin sidebar, **Then** it is either collapsed into a toggle or remains navigable without overlapping content.

---

### Edge Cases

- What happens when a user rotates their device between portrait and landscape orientations mid-session?
- How does the layout handle very long product names or prices that could cause text overflow on small viewports?
- How do modals and dialogs (e.g., confirm-dialog, product form) display on a 320px-wide device?
- What happens to the hero carousel on extremely narrow screens where slide content may be unreadable?
- How does the notification bell dropdown render at the top of a mobile viewport where it might be clipped?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every public-facing page MUST display without horizontal scrollbar on viewports >= 320px wide.
- **FR-002**: Navigation MUST provide a functional mobile menu (hamburger/drawer) on viewports < 768px, replacing the desktop nav links.
- **FR-003**: Product card grids MUST use a single column on mobile (< 768px), two columns on tablet (768px-1024px), and three or four columns on desktop (> 1024px).
- **FR-004**: All interactive controls (buttons, links, form inputs) MUST have a minimum tap target size of 44x44px on mobile viewports.
- **FR-005**: Typography MUST scale appropriately across breakpoints — no text should be smaller than 14px on mobile or overflow its container.
- **FR-006**: Images MUST be responsive and never exceed their container width on any breakpoint.
- **FR-007**: The admin data tables MUST scroll horizontally within their container when content exceeds viewport width, rather than causing page-level overflow.
- **FR-008**: The admin sidebar MUST collapse or toggle on viewports < 1024px to avoid obscuring content.
- **FR-009**: Modals and dialogs MUST be constrained to the viewport width on all breakpoints and support vertical scroll for tall content.
- **FR-010**: The footer MUST stack its column groups vertically on mobile rather than overflowing horizontally.
- **FR-011**: All pages under src/app/ and all components under src/components/ MUST be audited and updated to use Tailwind responsive prefixes (sm:, md:, lg:) as needed.
- **FR-012**: The hero carousel MUST maintain readable text and visible controls on all three breakpoints.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 35+ pages load without horizontal overflow on a 375px mobile viewport (verified via visual inspection or automated snapshot testing).
- **SC-002**: Users can complete the core purchase flow (browse, product detail, cart) on a 375px viewport without encountering overlapping elements or unclickable controls.
- **SC-003**: All pages transition smoothly at the 768px and 1024px breakpoints with no layout jumps or content clipping.
- **SC-004**: Every interactive element on mobile has a tap target area sufficient for use without zooming.
- **SC-005**: The admin panel is fully operable on a 768px tablet viewport — stat cards, tables, and forms all display correctly.
- **SC-006**: Zero pages produce a horizontal scrollbar on any of the three target breakpoints (320px, 768px, 1280px).

## Assumptions

- The three target breakpoints are: mobile (< 768px), tablet (768px-1024px), desktop (> 1024px), consistent with Tailwind's md and lg breakpoints.
- The minimum supported mobile viewport width is 320px.
- Dark mode responsive behavior is included in scope — layouts must be correct in both light and dark modes.
- The admin panel responsive fixes are lower priority than public-facing pages but are in scope.
- Existing Tailwind CSS v4 configuration and design tokens (CSS variables) will not be changed — only responsive layout classes will be adjusted.
- No new pages or features will be added as part of this work — changes are purely layout/spacing/typography fixes.
- All 35+ page files under src/app/ and all components under src/components/ are in scope for audit.
- The fixes will use Tailwind's built-in responsive prefix system (sm:, md:, lg:) rather than custom CSS media queries.
