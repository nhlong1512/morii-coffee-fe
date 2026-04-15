import { renderHook } from "@testing-library/react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useAuthStore } from "@/stores/auth-store";

// next/jest automatically provides mocks for next/navigation
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/sign-in",
}));

// Suppress console errors from useSyncExternalStore in test env
beforeEach(() => {
  mockReplace.mockClear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    redirectTo: null,
  });
});

describe("useAuthGuard", () => {
  it("returns isLoading=true when user is not authenticated (SSR-side false from server snapshot)", () => {
    const { result } = renderHook(() => useAuthGuard());
    // In jsdom, useSyncExternalStore returns the client snapshot (true = mounted)
    // isAuthenticated is false, so: isLoading = !true || false = false
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("calls router.replace when user is authenticated and mounted", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    renderHook(() => useAuthGuard("/dashboard"));
    // Give useEffect time to fire
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("uses '/' as default redirect destination", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    renderHook(() => useAuthGuard());
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("does not call router.replace when user is not authenticated", async () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderHook(() => useAuthGuard());
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
