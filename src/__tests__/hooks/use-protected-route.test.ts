import { renderHook } from "@testing-library/react";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useAuthStore } from "@/stores/auth-store";

const mockReplace = jest.fn();
const mockSetRedirectTo = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/orders",
}));

beforeEach(() => {
  mockReplace.mockClear();
  mockSetRedirectTo.mockClear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    redirectTo: null,
  });
});

describe("useProtectedRoute", () => {
  it("returns isAuthenticated=false when not authenticated", () => {
    const { result } = renderHook(() => useProtectedRoute());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns isAuthenticated=true when authenticated", () => {
    useAuthStore.setState({ accessToken: "access-token", isAuthenticated: true });
    const { result } = renderHook(() => useProtectedRoute());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("redirects to /sign-in when not authenticated", async () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderHook(() => useProtectedRoute());
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });

  it("does not redirect when authenticated", async () => {
    useAuthStore.setState({ accessToken: "access-token", isAuthenticated: true });
    renderHook(() => useProtectedRoute());
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("returns isLoading=false when authenticated and mounted", () => {
    useAuthStore.setState({ accessToken: "access-token", isAuthenticated: true });
    const { result } = renderHook(() => useProtectedRoute());
    expect(result.current.isLoading).toBe(false);
  });

  it("stores the current pathname before redirecting", async () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderHook(() => useProtectedRoute());
    await new Promise((r) => setTimeout(r, 0));
    // setRedirectTo should be called with the current pathname (/orders from mock)
    expect(useAuthStore.getState().redirectTo).toBe("/orders");
  });

  it("redirects when persisted auth state has no access token", async () => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: true });
    const { result } = renderHook(() => useProtectedRoute());
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });
});
