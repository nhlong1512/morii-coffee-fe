# UI Contracts: Store Management

**Feature**: 018-store-management  
**Date**: 2026-05-22

## Overview

This document defines the route-level, component-level, and API-facing contracts for the Morii Coffee store management feature. It covers both the public store locator experience and the admin store operations workspace.

---

## 1. Public Route Contracts

### `/stores`

**Location**: `src/app/stores/page.tsx`  
**Type**: Client page wrapper that mounts the feature locator

**Contract**:

```typescript
export default function StoresPage(): JSX.Element
```

**Responsibilities**:
- Render the public store locator shell.
- Delegate data fetching and interaction logic to `src/features/stores`.
- Preserve a usable experience across desktop and mobile layouts.

**Required UI States**:
- Loading skeleton or spinner while initial stores load.
- Inline error with retry action if fetching fails.
- Empty state when search or filter returns no stores.
- Interactive data state with list, filters, and map panel.

### Home Store Preview

**Location**: `src/components/home/store-locator-preview.tsx`

**Contract**:

```typescript
export function StoreLocatorPreview(): JSX.Element
```

**Responsibilities**:
- Display a concise preview of public stores on the homepage.
- Reuse the same store data normalization and availability logic as `/stores`.
- Link clearly to the full locator at `/stores`.

**Rules**:
- Show only public-facing stores.
- Prefer the first curated stores from the public ordering when distance ranking is not in use.
- Remain useful if only a small number of stores are available.

---

## 2. Admin Route Contracts

### `/admin/stores`

**Location**: `src/app/admin/stores/page.tsx`

**Contract**:

```typescript
export default function AdminStoresPage(): JSX.Element
```

**Responsibilities**:
- Render the admin directory for active and inactive stores.
- Support search, city filtering, status filtering, row actions, and reorder entry.
- Reuse shared admin primitives for table, badges, loading, empty, and confirmation states.

### `/admin/stores/new`

**Location**: `src/app/admin/stores/new/page.tsx`

**Contract**:

```typescript
export default function NewStorePage(): JSX.Element
```

**Responsibilities**:
- Mount the reusable store form in create mode.
- Provide clear save, cancel, validation, and success feedback.

### `/admin/stores/edit/[id]`

**Location**: `src/app/admin/stores/edit/[id]/page.tsx`

**Contract**:

```typescript
export default function EditStorePage(): JSX.Element
```

**Responsibilities**:
- Load a store by ID for editing.
- Reuse the same form contract as create mode.
- Handle not-found and load-failure states explicitly.

### Admin Navigation

**Location**: `src/app/admin/layout.tsx`

**Contract**:
- Add a Stores entry to the admin sidebar navigation.
- Use existing role guard behavior already applied by the admin layout.
- Keep path activation behavior consistent with other admin modules.

---

## 3. Feature Module Export Contract

**Location**: `src/features/stores/index.ts`

**Export Contract**:

```typescript
export * from "./types";
export * from "./api";
export * from "./hooks";
export * from "./schema";
export * from "./utils";
export { StoreLocator } from "./components/store-locator";
export { StoreLocatorPreviewList } from "./components/store-preview-list";
export { AdminStoreList } from "./components/admin-store-list";
export { StoreForm } from "./components/store-form";
export { StoreHoursEditor } from "./components/store-hours-editor";
export { StoreStatusBadge } from "./components/store-status-badge";
```

**Rules**:
- Public pages import from feature exports rather than reaching into deep internal paths when avoidable.
- Internal helper components can remain unexported if only used inside the feature.

---

## 4. API Integration Contracts

### Public API Functions

**Location**: `src/features/stores/api.ts`

```typescript
export interface GetPublicStoresOptions {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export async function getPublicStores(
  options?: GetPublicStoresOptions
): Promise<ApiPagination<StoreLocation>>;

export async function getPublicStoreById(id: string): Promise<StoreLocation>;
```

### Admin API Functions

```typescript
export interface GetAdminStoresOptions {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  city?: string;
  isActive?: boolean;
}

export async function getAdminStores(
  options?: GetAdminStoresOptions
): Promise<ApiPagination<StoreLocation>>;

export async function getAdminStoreById(id: string): Promise<StoreLocation>;

export async function createStore(
  payload: UpsertStoreRequest
): Promise<StoreLocation>;

export async function updateStore(
  id: string,
  payload: UpsertStoreRequest
): Promise<StoreLocation>;

export async function deleteStore(id: string): Promise<void>;

export async function updateStoreStatus(
  id: string,
  payload: UpdateStoreStatusRequest
): Promise<StoreLocation>;

export async function reorderStores(
  payload: ReorderStoresRequest
): Promise<void>;
```

**Rules**:
- All functions use shared API helpers rather than raw `fetch`.
- Public list functions must tolerate absent geolocation fields.
- Admin mutations surface validation and conflict failures as user-visible errors.

---

## 5. Hook Contracts

### Public Hooks

```typescript
export function usePublicStores(
  options?: GetPublicStoresOptions
): {
  data: StoreLocation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useStoreLocatorState(): {
  search: string;
  selectedCity: string;
  selectedStoreId: string | null;
  isNearMeActive: boolean;
  availableCities: string[];
  setSearch: (value: string) => void;
  setSelectedCity: (value: string) => void;
  setSelectedStoreId: (value: string | null) => void;
  requestNearMe: () => Promise<void>;
  clearNearMe: () => void;
};
```

### Admin Hooks

```typescript
export function useAdminStores(
  options?: GetAdminStoresOptions
): {
  data: StoreLocation[];
  loading: boolean;
  error: string | null;
  metadata: ApiMetadata | null;
  refetch: () => Promise<void>;
};

export function useAdminStore(
  id: string | null
): {
  data: StoreLocation | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
```

**Rules**:
- Hooks own async loading/error state.
- Components consume hooks and stay mostly presentational.
- Hook return shapes stay consistent with existing feature hooks.

---

## 6. Component Contracts

### `StoreLocator`

**Purpose**: Main public locator composition.

**Contract**:

```typescript
export function StoreLocator(): JSX.Element
```

**Behavior**:
- Coordinates search, city filtering, near-me actions, list selection, and map synchronization.
- Uses feature utilities to derive live availability labels.
- Gracefully degrades if geolocation or maps are unavailable.

### `StoreLocatorMap`

**Purpose**: Google Maps rendering wrapper for public stores.

**Contract**:

```typescript
interface StoreLocatorMapProps {
  stores: StoreLocation[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
}
```

**Rules**:
- Client-only rendering.
- Lazy loads the map script.
- Shows fallback UI if the map cannot initialize.

### `AdminStoreList`

**Purpose**: Admin directory table and row actions.

**Contract**:

```typescript
export function AdminStoreList(): JSX.Element
```

**Behavior**:
- Displays store rows with status badges and actions for edit, activate/deactivate, delete, and reorder entry.
- Uses shared confirmation UX for destructive actions.

### `StoreForm`

**Purpose**: Shared create/edit form.

**Contract**:

```typescript
interface StoreFormProps {
  mode: "create" | "edit";
  initialValue?: StoreLocation | null;
  onSubmit: (payload: UpsertStoreRequest) => Promise<void>;
  onCancel: () => void;
}
```

**Behavior**:
- Validates all required store fields.
- Includes all seven opening-hours entries.
- Normalizes string form fields into transport-safe numeric/null values before submit.

### `StoreHoursEditor`

**Purpose**: Weekly hours sub-form used inside `StoreForm`.

**Contract**:

```typescript
interface StoreHoursEditorProps {
  value: StoreFormValues["openingHours"];
  onChange: (nextValue: StoreFormValues["openingHours"]) => void;
  errors?: Record<number, string | undefined>;
}
```

---

## 7. Verification Contracts

- Public locator behavior must be unit-tested for availability calculation, query normalization, and near-me fallback handling.
- Admin store form behavior must be unit-tested for weekly-hours validation and payload normalization.
- API wrappers must be unit-tested against expected endpoint URLs, query strings, and mutation payloads.
- Final implementation must pass `pnpm test`, `pnpm lint`, and `pnpm build`.
