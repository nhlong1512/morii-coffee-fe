import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";
import * as authService from "@/services/auth-service";
import * as userService from "@/services/user-service";
import { UserRole } from "@/enums";

jest.mock("@/services/auth-service");
jest.mock("@/services/user-service");
// Prevent registerAuthHandlers from causing issues with the API module
jest.mock("@/lib/api", () => ({
  registerAuthHandlers: jest.fn(),
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const mockAuthResponse = {
  user: {
    id: "u1",
    email: "user@example.com",
    userName: "testuser",
    roles: [UserRole.Customer],
    phoneNumber: "0912345678",
    fullName: "Test User",
    avatarUrl: null,
    isActive: true,
    gender: null,
    dateOfBirth: null,
    createdAt: "2024-01-01",
  },
  accessToken: "access-123",
  refreshToken: "refresh-456",
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    redirectTo: null,
  });
  jest.clearAllMocks();
});

describe("auth store — signIn", () => {
  it("sets user, tokens, and isAuthenticated on success", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("access-123");
    expect(state.refreshToken).toBe("refresh-456");
    expect(state.user?.email).toBe("user@example.com");
  });

  it("throws when service throws", async () => {
    (authService.signIn as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));
    await expect(
      useAuthStore.getState().signIn("bad@example.com", "wrong")
    ).rejects.toThrow("Invalid credentials");
  });
});

describe("auth store — signUp", () => {
  it("sets user, tokens, and isAuthenticated on success", async () => {
    (authService.signUp as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signUp("user@example.com", "0912345678", "Password1", "testuser");
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("user@example.com");
  });
});

describe("auth store — logout", () => {
  it("clears all auth state", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.redirectTo).toBeNull();
  });
});

describe("auth store — hasRole", () => {
  it("returns true when user has the role", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");
    expect(useAuthStore.getState().hasRole(UserRole.Customer)).toBe(true);
  });

  it("returns false when user does not have the role", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");
    expect(useAuthStore.getState().hasRole(UserRole.Admin)).toBe(false);
  });

  it("returns false when user is null", () => {
    expect(useAuthStore.getState().hasRole(UserRole.Customer)).toBe(false);
  });
});

describe("auth store — setTokens", () => {
  it("updates tokens and sets isAuthenticated", () => {
    useAuthStore.getState().setTokens("new-access", "new-refresh");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-access");
    expect(state.refreshToken).toBe("new-refresh");
    expect(state.isAuthenticated).toBe(true);
  });

  it("does not authenticate an empty access token", () => {
    useAuthStore.getState().setTokens("", "new-refresh");
    expect(selectHasValidSession(useAuthStore.getState())).toBe(false);
  });
});

describe("auth store — valid session selector", () => {
  it("requires an access token in addition to the persisted boolean", () => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: true });
    expect(selectHasValidSession(useAuthStore.getState())).toBe(false);
  });
});

describe("auth store — redirectTo management", () => {
  it("setRedirectTo stores the path", () => {
    useAuthStore.getState().setRedirectTo("/orders");
    expect(useAuthStore.getState().redirectTo).toBe("/orders");
  });

  it("clearRedirectTo sets redirectTo to null", () => {
    useAuthStore.getState().setRedirectTo("/orders");
    useAuthStore.getState().clearRedirectTo();
    expect(useAuthStore.getState().redirectTo).toBeNull();
  });

  it("getAndClearRedirectTo returns path and clears it", () => {
    useAuthStore.getState().setRedirectTo("/profile");
    const path = useAuthStore.getState().getAndClearRedirectTo();
    expect(path).toBe("/profile");
    expect(useAuthStore.getState().redirectTo).toBeNull();
  });

  it("getAndClearRedirectTo returns null when no redirect is set", () => {
    expect(useAuthStore.getState().getAndClearRedirectTo()).toBeNull();
  });
});

describe("auth store — syncProfile", () => {
  it("updates user from getMe on success", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");

    const updatedUser = { ...mockAuthResponse.user, fullName: "Updated Name" };
    (userService.getMe as jest.Mock).mockResolvedValue(updatedUser);

    await useAuthStore.getState().syncProfile();
    expect(useAuthStore.getState().user?.fullName).toBe("Updated Name");
  });

  it("calls logout when getMe throws", async () => {
    (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);
    await useAuthStore.getState().signIn("user@example.com", "password");

    (userService.getMe as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    await useAuthStore.getState().syncProfile();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
