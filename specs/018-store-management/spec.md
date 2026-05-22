# Feature Specification: Store Management

**Feature Branch**: `018-store-management`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "Làm ơn đọc các documents trong /Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/docs/features/store-management. Cùng với những thư viện, công nghệ tôi và bạn đã discuss. Giúp tôi implement tính năng store management thật đầy đủ và comprehensive nào."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find The Right Store Quickly (Priority: P1)

As a customer, I want to browse Morii Coffee locations, narrow the list to stores that matter to me, and see whether a branch is open right now so I can decide where to go without guessing.

**Why this priority**: The public store locator is the customer-facing outcome of the feature. If customers cannot confidently find a nearby branch and understand its availability, the feature fails its primary purpose.

**Independent Test**: Can be fully tested by visiting the public store locator, searching or filtering the list, using the near-me experience when location access is allowed, and confirming that each visible store shows enough information to choose a branch.

**Acceptance Scenarios**:

1. **Given** active stores are available, **When** a customer opens the store locator, **Then** they see a list of public stores with each store's name, address, contact information, opening schedule, and current open or closed status.
2. **Given** multiple stores are available, **When** a customer searches by store name or address keywords, **Then** the list updates to show only matching public stores.
3. **Given** stores exist in multiple cities, **When** a customer filters by city, **Then** only stores in the selected city remain visible.
4. **Given** the customer allows location access, **When** they choose the near-me experience, **Then** the locator prioritizes nearby stores and displays the distance for each result.
5. **Given** the customer denies or cannot share location access, **When** they continue using the locator, **Then** the store list still works normally without distance-based ranking.
6. **Given** a customer selects a store from the list or map, **When** the store becomes active, **Then** the corresponding location details are highlighted consistently across the locator experience.

---

### User Story 2 - Maintain Accurate Store Information (Priority: P2)

As an administrator, I want to create, edit, deactivate, and remove store records so that the public store locator always reflects accurate branch information and operating schedules.

**Why this priority**: Accurate store data directly affects customer trust and operational correctness. Without a reliable maintenance workflow, the public locator becomes stale and misleading.

**Independent Test**: Can be fully tested by signing in as an administrator, creating a new store with a full weekly schedule, updating its details, changing its active state, and removing it from the active directory while confirming the public experience reflects those changes.

**Acceptance Scenarios**:

1. **Given** an administrator has the required permissions, **When** they create a store with valid profile details and a full weekly schedule, **Then** the new store is saved and becomes available according to its active state.
2. **Given** an existing store record, **When** an administrator edits its contact details, location details, or schedule, **Then** the saved record reflects the new values and the public locator uses the latest approved information.
3. **Given** an existing active store, **When** an administrator deactivates it, **Then** the store stops appearing in public browsing experiences but remains manageable in the admin workspace.
4. **Given** an existing store record, **When** an administrator removes it, **Then** it no longer appears in public or admin listings while historical records remain protected from accidental hard deletion.

---

### User Story 3 - Curate Store Visibility And Ordering (Priority: P3)

As an operations staff member, I want to review the full store directory, reorder public presentation, and monitor store visibility so that customers see the most relevant branches first and internal teams can manage rollout changes safely.

**Why this priority**: Once the core locator and CRUD flows exist, the next operational need is keeping presentation and availability curated without requiring full administrative ownership for every routine adjustment.

**Independent Test**: Can be fully tested by signing in with staff-level access, reviewing the admin store list, filtering and searching stores, changing public display order where allowed, and confirming the public store surfaces reflect the curated order.

**Acceptance Scenarios**:

1. **Given** a staff member has access to store operations, **When** they open the admin store directory, **Then** they can review active and inactive stores, search records, and filter the list without exposing removed stores.
2. **Given** multiple stores are eligible for public display, **When** an authorized operations user changes their display order, **Then** the public store experiences reflect the updated ordering consistently.
3. **Given** a staff member does not have administrative write permissions, **When** they access store operations, **Then** they can perform only the actions their role allows and restricted actions remain unavailable.

### Edge Cases

- What happens when a customer searches or filters and no stores match the criteria? The locator must show a clear empty state and preserve the current search or filter context.
- How does the system handle location access being denied, unavailable, or timing out? The locator must fall back to the standard list without blocking browsing.
- What happens when a store is marked closed for the entire day? The public experience must show that the store is closed today rather than showing a misleading opening time.
- What happens when a schedule entry is incomplete, duplicated, or logically invalid for an open day? The store cannot be saved until the weekly schedule is complete and internally consistent.
- What happens when a new or edited store would conflict with another active store's unique identity information? The save must be rejected with a clear conflict message so the user can correct it.
- What happens when an inactive or removed store is accessed through an outdated public link or cached selection? The public experience must treat that store as unavailable and guide the user back to valid results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a public store locator that lists only customer-visible stores.
- **FR-002**: The public store locator MUST show each visible store's core decision-making details, including name, address, contact information, weekly opening schedule, and current open or closed status.
- **FR-003**: Users MUST be able to search the public store locator by store name or address-related keywords.
- **FR-004**: Users MUST be able to narrow the public store locator by city.
- **FR-005**: The public store locator MUST support a near-me experience that prioritizes nearby stores and shows distance when the user shares their location.
- **FR-006**: The public store locator MUST remain fully usable when location access is denied, unavailable, or skipped.
- **FR-007**: The public store experience MUST provide a synchronized location view so that selecting a store in one part of the experience highlights the same store details everywhere else in the locator.
- **FR-008**: The system MUST calculate and display a store's current open or closed state from its structured weekly operating schedule.
- **FR-009**: The home page MUST surface a preview of public stores and provide a clear path to the full store locator.
- **FR-010**: Authorized internal users MUST be able to view an admin store directory that includes both active and inactive stores while excluding removed stores.
- **FR-011**: Administrators MUST be able to create store records with all required public-facing profile details, location details, and a complete seven-day operating schedule.
- **FR-012**: Administrators MUST be able to edit existing store records, including store identity details, contact details, public visibility state, display order, and operating schedule.
- **FR-013**: The system MUST enforce that each store has exactly one operating-hours entry for each day of the week before the store can be saved.
- **FR-014**: The system MUST prevent logically invalid operating schedules for open days, including missing times and non-sensical opening windows.
- **FR-015**: The system MUST prevent conflicting store identity records by rejecting duplicate unique store identifiers among non-removed stores.
- **FR-016**: Administrators MUST be able to deactivate a store without deleting its record, and deactivated stores MUST immediately stop appearing in public store browsing.
- **FR-017**: Authorized internal users MUST be able to reorder stores for public presentation, and the public browsing experience MUST reflect that ordering consistently whenever distance-based ranking is not being used.
- **FR-018**: Removing a store MUST behave as a protected removal action that hides the store from public and admin listings without requiring hard deletion.
- **FR-019**: The system MUST provide clear success, validation, and failure feedback for public and admin store-management actions.
- **FR-020**: The system MUST enforce role-based access so that read, reorder, status, and destructive actions are available only to the appropriate internal user roles.

### Key Entities *(include if feature involves data)*

- **Store Location**: A physical Morii Coffee branch with a unique public identity, contact details, address details, geographic position, visibility state, and display order.
- **Weekly Operating Schedule**: A seven-day schedule attached to a store location that records whether the branch is closed on a given day and, if open, the opening and closing times used to determine live availability.
- **Store Directory View**: A customer-facing and staff-facing presentation of store records that supports browsing, filtering, ordering, and selection based on the user's context and permissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, at least 90% of customers can identify a suitable store and its current availability within 2 minutes of opening the public locator.
- **SC-002**: In acceptance testing, 100% of active public stores displayed on the home preview also appear in the full public locator with matching core details.
- **SC-003**: In acceptance testing, 100% of inactive or removed stores are excluded from public store browsing results.
- **SC-004**: In acceptance testing, authorized administrators can create or update a complete store record, including all seven schedule entries, in under 5 minutes without needing manual support.
- **SC-005**: In acceptance testing, 100% of attempted invalid schedules or duplicate unique store identities are rejected before they can become publicly visible.
- **SC-006**: In role-based acceptance testing, 100% of restricted store-management actions remain inaccessible to users without the required permissions.

## Assumptions

- Existing authentication and role-management capabilities will be reused for store-management permissions.
- The first release focuses on store discovery and administration only; reservations, live occupancy, directions handoff, and delivery-zone management are out of scope.
- Public customers do not need to sign in to browse stores or use the near-me experience.
- The public store experience uses a selected-store detail state within the locator rather than requiring a separate customer-facing store profile workflow in this phase.
- Store data already has a single source of truth within Morii Coffee operations, and the admin experience is responsible for keeping the customer-facing directory aligned with that source.
