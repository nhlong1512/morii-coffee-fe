import { UserRole } from "@/enums";
import type {
  ReorderStoresRequest,
  StoreAvailabilitySummary,
  StoreFormValues,
  StoreLocation,
  StoreOpeningHours,
  StorePermissions,
  UpsertStoreRequest,
} from "./types";

const DAY_ORDER: Array<StoreOpeningHours["dayOfWeek"]> = [0, 1, 2, 3, 4, 5, 6];

function parseMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeLabel(value: string): string {
  return value;
}

export function sortOpeningHours(
  openingHours: StoreOpeningHours[]
): StoreOpeningHours[] {
  return [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

export function getStoreAvailability(
  store: Pick<StoreLocation, "openingHours">,
  date: Date = new Date()
): StoreAvailabilitySummary {
  const openingHours = sortOpeningHours(store.openingHours);
  const dayOfWeek = date.getDay() as StoreOpeningHours["dayOfWeek"];
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const today = openingHours.find((entry) => entry.dayOfWeek === dayOfWeek);

  if (!today || today.isClosed) {
    return {
      isOpenNow: false,
      isClosedToday: true,
      opensAt: null,
      closesAt: null,
      todayHoursLabel: "Closed today",
    };
  }

  const openMinutes = parseMinutes(today.openTime);
  const closeMinutes = parseMinutes(today.closeTime);
  const isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpenNow,
    isClosedToday: false,
    opensAt: isOpenNow ? null : formatTimeLabel(today.openTime),
    closesAt: isOpenNow ? formatTimeLabel(today.closeTime) : null,
    todayHoursLabel: `${formatTimeLabel(today.openTime)} - ${formatTimeLabel(today.closeTime)}`,
  };
}

export function deriveAvailableCities(stores: StoreLocation[]): string[] {
  return [...new Set(stores.map((store) => store.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function formatDistanceKm(distanceKm: number | null): string | null {
  if (distanceKm === null || Number.isNaN(distanceKm)) {
    return null;
  }

  return distanceKm < 1 ? distanceKm.toFixed(2) : distanceKm.toFixed(1);
}

export function buildStoreFormValues(store?: StoreLocation | null): StoreFormValues {
  const defaultHours = createDefaultOpeningHours();

  if (!store) {
    return {
      name: "",
      slug: "",
      address: "",
      district: "",
      city: "",
      province: "",
      latitude: "",
      longitude: "",
      phone: "",
      email: "",
      coverImageUrl: "",
      isActive: true,
      displayOrder: "1",
      openingHours: defaultHours,
    };
  }

  const hoursByDay = new Map(
    sortOpeningHours(store.openingHours).map((hour) => [hour.dayOfWeek, hour])
  );

  return {
    name: store.name,
    slug: store.slug,
    address: store.address,
    district: store.district ?? "",
    city: store.city,
    province: store.province ?? "",
    latitude: String(store.latitude),
    longitude: String(store.longitude),
    phone: store.phone,
    email: store.email ?? "",
    coverImageUrl: store.coverImageUrl ?? "",
    isActive: store.isActive,
    displayOrder: String(store.displayOrder),
    openingHours: defaultHours.map((hour) => {
      const existing = hoursByDay.get(hour.dayOfWeek);
      return existing
        ? {
            dayOfWeek: existing.dayOfWeek,
            openTime: existing.openTime,
            closeTime: existing.closeTime,
            isClosed: existing.isClosed,
          }
        : hour;
    }),
  };
}

export function buildUpsertStoreRequest(
  values: StoreFormValues
): UpsertStoreRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() ? values.slug.trim() : null,
    address: values.address.trim(),
    district: values.district.trim() ? values.district.trim() : null,
    city: values.city.trim(),
    province: values.province.trim() ? values.province.trim() : null,
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    phone: values.phone.trim(),
    email: values.email.trim() ? values.email.trim() : null,
    coverImageUrl: values.coverImageUrl.trim() ? values.coverImageUrl.trim() : null,
    isActive: values.isActive,
    displayOrder: Number(values.displayOrder),
    openingHours: values.openingHours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
    })),
  };
}

export function buildReorderStoresRequest(
  stores: Array<Pick<StoreLocation, "id" | "displayOrder">>
): ReorderStoresRequest {
  return {
    items: stores.map((store, index) => ({
      id: store.id,
      displayOrder: index + 1,
    })),
  };
}

export function sortStoresForDisplay(stores: StoreLocation[]): StoreLocation[] {
  return [...stores].sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }

    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    return a.name.localeCompare(b.name);
  });
}

export function getStorePermissions(roles: UserRole[] = []): StorePermissions {
  const isAdmin = roles.includes(UserRole.Admin);
  const isStaff = roles.includes(UserRole.Staff);

  return {
    canAccessAdminStores: isAdmin || isStaff,
    canWriteStores: isAdmin,
    canReorderStores: isAdmin || isStaff,
  };
}

export function createDefaultOpeningHours(): StoreFormValues["openingHours"] {
  return DAY_ORDER.map((dayOfWeek) => ({
    dayOfWeek,
    openTime: "07:00",
    closeTime: "21:00",
    isClosed: false,
  }));
}

export function getDayLabel(dayOfWeek: StoreOpeningHours["dayOfWeek"]): string {
  switch (dayOfWeek) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    default:
      return "Saturday";
  }
}
