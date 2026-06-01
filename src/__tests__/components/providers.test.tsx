import { render } from "@testing-library/react";
import { Providers } from "@/components/providers";
import { useAuthStore } from "@/stores/auth-store";

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/stores/auth-store", () => {
  const useAuthStore = (selector: (state: { accessToken: string; isAuthenticated: boolean }) => unknown) =>
    selector({ accessToken: "access-token", isAuthenticated: true });
  useAuthStore.persist = { rehydrate: jest.fn() };

  return {
    AUTH_STORAGE_KEY: "morii-auth",
    selectHasValidSession: (state: { accessToken: string; isAuthenticated: boolean }) =>
      state.isAuthenticated && Boolean(state.accessToken),
    useAuthStore,
  };
});

jest.mock("@/stores/cart-store", () => ({
  useCartStore: (
    selector: (state: {
      initializeForSession: jest.Mock;
      resetAfterLogout: jest.Mock;
    }) => unknown
  ) =>
    selector({
      initializeForSession: jest.fn(),
      resetAfterLogout: jest.fn(),
    }),
}));

jest.mock("@/stores/wishlist-store", () => ({
  useWishlistStore: (
    selector: (state: {
      initializeForSession: jest.Mock;
      resetAfterLogout: jest.Mock;
    }) => unknown
  ) =>
    selector({
      initializeForSession: jest.fn(),
      resetAfterLogout: jest.fn(),
    }),
}));

describe("Providers", () => {
  const rehydrateMock = useAuthStore.persist.rehydrate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rehydrates auth state when another browser tab updates persisted tokens", () => {
    const { unmount } = render(
      <Providers>
        <div>content</div>
      </Providers>
    );

    window.dispatchEvent(new StorageEvent("storage", { key: "morii-auth" }));
    expect(rehydrateMock).toHaveBeenCalledTimes(1);

    unmount();
    window.dispatchEvent(new StorageEvent("storage", { key: "morii-auth" }));
    expect(rehydrateMock).toHaveBeenCalledTimes(1);
  });
});
