# Data Model: Store Management

**Feature**: 018-store-management  
**Date**: 2026-05-22

## Overview

This document defines the store-management entities, request shapes, derived state, and validation rules needed for the Morii Coffee public store locator and admin store operations. The backend remains the source of truth; the frontend adds derived view state for live availability, filtering, and map/list synchronization.

---

## 1. Core Transport Entities

### StoreOpeningHours

```typescript
interface StoreOpeningHours {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  openTime: string;   // "HH:mm"
  closeTime: string;  // "HH:mm"
  isClosed: boolean;
}
```

**Purpose**: Represents one day's operating hours for a store.

**Validation Rules**:
- Exactly one entry must exist for each day of week.
- `dayOfWeek` values must be unique across the seven entries.
- If `isClosed` is `true`, `openTime` and `closeTime` may remain informational but must not drive availability.
- If `isClosed` is `false`, `openTime` and `closeTime` are required and `openTime` must be earlier than `closeTime`.

### StoreLocation

```typescript
interface StoreLocation {
  id: string;
  name: string;
  slug: string;
  address: string;
  district: string | null;
  city: string;
  province: string | null;
  latitude: number;
  longitude: number;
  phone: string;
  email: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  distanceKm: number | null;
  openingHours: StoreOpeningHours[];
  createdAt: string;
  updatedAt: string | null;
}
```

**Purpose**: Canonical store record returned by public and admin APIs.

**Validation Rules**:
- `id`, `name`, `slug`, `address`, `city`, `latitude`, `longitude`, `phone`, `isActive`, `displayOrder`, and `openingHours` are required.
- `name` and `slug` must remain unique among non-deleted stores.
- `latitude` must be between `-90` and `90`.
- `longitude` must be between `-180` and `180`.
- `openingHours` must always contain exactly seven valid `StoreOpeningHours` entries.
- `distanceKm` is nullable and only expected when public geolocation-aware listing is used.

**Relationships**:
- One `StoreLocation` owns exactly seven `StoreOpeningHours`.

---

## 2. Query And Mutation Shapes

### PublicStoreQuery

```typescript
interface PublicStoreQuery {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
```

**Purpose**: Filters and ranks the public store locator.

**Rules**:
- `latitude` and `longitude` must be provided together to enable distance ranking.
- `radius` is only meaningful when `latitude` and `longitude` exist.
- Empty search or city values are omitted from the request rather than sent as blank strings.

### AdminStoresQuery

```typescript
interface AdminStoresQuery {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  city?: string;
  isActive?: boolean;
}
```

**Purpose**: Filters the admin directory while including active and inactive stores.

### UpsertStoreRequest

```typescript
interface UpsertStoreRequest {
  name: string;
  slug: string | null;
  address: string;
  district: string | null;
  city: string;
  province: string | null;
  latitude: number;
  longitude: number;
  phone: string;
  email: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  openingHours: Array<{
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}
```

**Purpose**: Shared payload shape for create and update operations.

**Rules**:
- Input must be complete enough to form one valid store record.
- `slug` may be null to allow backend generation.
- The opening-hours payload must preserve exactly seven entries even if some days are closed.

### UpdateStoreStatusRequest

```typescript
interface UpdateStoreStatusRequest {
  isActive: boolean;
}
```

**Purpose**: Toggle whether a store is publicly visible.

### ReorderStoresRequest

```typescript
interface ReorderStoresRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}
```

**Purpose**: Persist curated public ordering for one or more stores.

**Rules**:
- Each item ID must be unique within the batch.
- `displayOrder` values should be sequential or at least deterministic after save.

---

## 3. Form And UI State Models

### StoreFormValues

```typescript
interface StoreFormValues {
  name: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  coverImageUrl: string;
  isActive: boolean;
  displayOrder: string;
  openingHours: Array<{
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}
```

**Purpose**: Client form representation used by `react-hook-form` and zod validation.

**Why separate from transport**:
- Numeric fields arrive from inputs as strings before normalization.
- Nullable transport values become empty strings in form fields for easier editing.

### StoreLocatorState

```typescript
interface StoreLocatorState {
  search: string;
  selectedCity: string;
  selectedStoreId: string | null;
  isNearMeActive: boolean;
  userLatitude: number | null;
  userLongitude: number | null;
  geolocationError: string | null;
  mapError: string | null;
}
```

**Purpose**: Local page state for the public store locator experience.

### AdminStoreDirectoryState

```typescript
interface AdminStoreDirectoryState {
  search: string;
  city: string;
  statusFilter: "all" | "active" | "inactive";
  page: number;
  selectedDeleteId: string | null;
  reorderMode: boolean;
}
```

**Purpose**: Local page state for the admin list and reorder experience.

---

## 4. Derived View Models

### StoreAvailabilitySummary

```typescript
interface StoreAvailabilitySummary {
  isOpenNow: boolean;
  statusLabel: string;
  nextTransitionLabel: string | null;
  todayHoursLabel: string;
}
```

**Purpose**: Frontend-only summary displayed in the public locator, home preview, and admin status hints.

**Derived From**:
- Current client time
- Today's `StoreOpeningHours`
- `isClosed`, `openTime`, and `closeTime`

### StoreListItemViewModel

```typescript
interface StoreListItemViewModel {
  store: StoreLocation;
  availability: StoreAvailabilitySummary;
  cityLabel: string;
  distanceLabel: string | null;
  isSelected: boolean;
}
```

**Purpose**: Presentation model for list cards and map side panels.

---

## 5. State Transitions

### Public Visibility State

```text
Active -> Inactive
Inactive -> Active
Active/Inactive -> Removed (soft delete)
Removed -> terminal for frontend visibility
```

**Rules**:
- Active stores appear in public queries.
- Inactive stores remain admin-visible but are hidden from public results.
- Removed stores are hidden from both public and admin listings.

### Locator Selection State

```text
No selection -> Store selected from list
No selection -> Store selected from map marker
Selected store -> Different store selected
Selected store -> Cleared when filtered result disappears
```

### Form Lifecycle

```text
Initial load -> Editing -> Validating -> Saving -> Success
Initial load -> Editing -> Validating -> Validation error
Initial load -> Editing -> Saving -> Server error -> Editing
```

---

## 6. Testing-Focused Invariants

- Every normalized store record must have seven unique `openingHours` entries.
- Open-state calculation must behave correctly for closed days, opening windows, and post-close times.
- Public list normalization must tolerate missing optional fields such as `district`, `province`, `email`, `coverImageUrl`, and `distanceKm`.
- Form normalization must convert string inputs into numeric payload fields safely and reject invalid coordinates or hours before submit.
- Reorder payload generation must preserve intended `displayOrder` values deterministically.
