import type { ApiMetadata, ApiPagination } from "@/types/api";
import type { UserRole } from "@/enums";

export interface StoreOpeningHours {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface StoreLocation {
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

export type StoresPage = ApiPagination<StoreLocation>;

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

export interface GetAdminStoresOptions {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  city?: string;
  isActive?: boolean;
}

export interface UpsertStoreRequest {
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

export interface UpdateStoreStatusRequest {
  isActive: boolean;
}

export interface ReorderStoresRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}

export interface StoreFormValues {
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

export interface StoreAvailabilitySummary {
  isOpenNow: boolean;
  isClosedToday: boolean;
  opensAt: string | null;
  closesAt: string | null;
  todayHoursLabel: string;
}

export interface StoreListItemViewModel {
  store: StoreLocation;
  availability: StoreAvailabilitySummary;
  distanceLabel: string | null;
  isSelected: boolean;
}

export interface StoreLocatorState {
  search: string;
  selectedCity: string;
  selectedStoreId: string | null;
  isNearMeActive: boolean;
  userLatitude: number | null;
  userLongitude: number | null;
  geolocationError: string | null;
  availableCities: string[];
  setSearch: (value: string) => void;
  setSelectedCity: (value: string) => void;
  setSelectedStoreId: (value: string | null) => void;
  requestNearMe: () => Promise<void>;
  clearNearMe: () => void;
}

export interface AdminStoreDirectoryState {
  search: string;
  city: string;
  statusFilter: "all" | "active" | "inactive";
  page: number;
  reorderMode: boolean;
}

export interface UseStoresResult {
  data: StoreLocation[];
  loading: boolean;
  error: string | null;
  metadata: ApiMetadata | null;
  refetch: () => Promise<void>;
}

export interface UseStoreResult {
  data: StoreLocation | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface StorePermissions {
  canAccessAdminStores: boolean;
  canWriteStores: boolean;
  canReorderStores: boolean;
}

export type StoreUserRole = UserRole;
