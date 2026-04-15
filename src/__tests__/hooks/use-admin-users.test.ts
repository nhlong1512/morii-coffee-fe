import { renderHook, waitFor } from "@testing-library/react";
import { useAdminUsers } from "@/hooks/use-admin-users";
import * as userService from "@/services/user-service";

jest.mock("@/services/user-service");

const mockGetUsers = userService.getUsers as jest.MockedFunction<
  typeof userService.getUsers
>;

const mockUsersResult = {
  items: [
    { id: "u1", email: "a@example.com" },
    { id: "u2", email: "b@example.com" },
  ] as any[],
  metadata: {
    currentPage: 1,
    totalPages: 3,
    pageSize: 10,
    totalCount: 25,
    payloadSize: 2,
    hasPrevious: false,
    hasNext: true,
    takeAll: false,
  },
};

describe("useAdminUsers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetUsers.mockResolvedValue(mockUsersResult);
    const { result } = renderHook(() => useAdminUsers());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after data loads", async () => {
    mockGetUsers.mockResolvedValue(mockUsersResult);
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("populates users on success", async () => {
    mockGetUsers.mockResolvedValue(mockUsersResult);
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toHaveLength(2);
  });

  it("populates metadata on success", async () => {
    mockGetUsers.mockResolvedValue(mockUsersResult);
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metadata?.totalCount).toBe(25);
  });

  it("sets error message when service throws", async () => {
    mockGetUsers.mockRejectedValue(new Error("Forbidden"));
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Forbidden");
  });

  it("uses fallback error message for non-Error throws", async () => {
    mockGetUsers.mockRejectedValue("error");
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load users");
  });

  it("refetch re-calls the service", async () => {
    mockGetUsers.mockResolvedValue(mockUsersResult);
    const { result } = renderHook(() => useAdminUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.refetch();
    expect(mockGetUsers).toHaveBeenCalledTimes(2);
  });
});
