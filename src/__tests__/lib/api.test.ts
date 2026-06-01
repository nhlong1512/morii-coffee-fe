type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

interface ApiModule {
  apiGet: <T>(path: string) => Promise<T>;
  registerAuthHandlers: (
    getTokens: () => Tokens,
    setTokens: (accessToken: string, refreshToken: string) => void,
    clearSession: () => void
  ) => void;
}

const envelope = <T,>(data: T) => ({
  statusCode: 200,
  message: "OK",
  data,
  errors: null,
});

const response = (status: number, body?: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe("API refresh-token handling", () => {
  let api: ApiModule;
  let tokens: Tokens;
  let setTokens: jest.Mock;
  let clearSession: jest.Mock;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();
    tokens = {
      accessToken: "expired-access",
      refreshToken: "current-refresh",
    };
    setTokens = jest.fn((accessToken: string, refreshToken: string) => {
      tokens = { accessToken, refreshToken };
    });
    clearSession = jest.fn();
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    api = await import("@/lib/api");
    api.registerAuthHandlers(() => tokens, setTokens, clearSession);
  });

  it("refreshes the token pair and retries the original request once", async () => {
    fetchMock
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(
        response(
          200,
          envelope({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          })
        )
      )
      .mockResolvedValueOnce(response(200, envelope({ id: "user-1" })));

    await expect(api.apiGet<{ id: string }>("/v1/users/me")).resolves.toEqual({
      id: "user-1",
    });

    expect(setTokens).toHaveBeenCalledWith("new-access", "new-refresh");
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/v1/users/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer new-access",
        }),
      })
    );
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("preserves the session when refresh is temporarily unavailable", async () => {
    fetchMock
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(503));

    await expect(api.apiGet("/v1/users/me")).rejects.toThrow(
      "Unable to refresh session. Please try again."
    );

    expect(clearSession).not.toHaveBeenCalled();
  });

  it("clears the session when the backend rejects the current token pair", async () => {
    fetchMock
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401));

    await expect(api.apiGet("/v1/users/me")).rejects.toThrow(
      "API 401: Unauthorized"
    );

    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it("retries with a token pair rotated by another browser tab", async () => {
    fetchMock
      .mockResolvedValueOnce(response(401))
      .mockImplementationOnce(async () => {
        tokens = {
          accessToken: "other-tab-access",
          refreshToken: "other-tab-refresh",
        };
        return response(401);
      })
      .mockResolvedValueOnce(response(200, envelope({ id: "user-1" })));

    await expect(api.apiGet<{ id: string }>("/v1/users/me")).resolves.toEqual({
      id: "user-1",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/v1/users/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer other-tab-access",
        }),
      })
    );
    expect(clearSession).not.toHaveBeenCalled();
  });
});
