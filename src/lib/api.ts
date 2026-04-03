const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5100/api";

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown;
}

// ---------------------------------------------------------------------------
// Token accessor — set once by the auth store on hydration
// ---------------------------------------------------------------------------

type TokenAccessor = () => {
  accessToken: string | null;
  refreshToken: string | null;
};
type TokenUpdater = (accessToken: string, refreshToken: string) => void;
type SessionClearer = () => void;

let _getTokens: TokenAccessor = () => ({
  accessToken: null,
  refreshToken: null,
});
let _setTokens: TokenUpdater = () => {};
let _clearSession: SessionClearer = () => {};

export function registerAuthHandlers(
  getTokens: TokenAccessor,
  setTokens: TokenUpdater,
  clearSession: SessionClearer
) {
  _getTokens = getTokens;
  _setTokens = setTokens;
  _clearSession = clearSession;
}

// ---------------------------------------------------------------------------
// Refresh guard — ensures only one concurrent refresh request
// ---------------------------------------------------------------------------

let _refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  const { accessToken, refreshToken } = _getTokens();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const envelope = (await res.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>;
    _setTokens(envelope.data.accessToken, envelope.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!_refreshPromise) {
    _refreshPromise = attemptRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

function toBodyInit(body?: FormData | object): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

/** Options bag for internal request. `skipAuth` skips Bearer header (for auth endpoints). */
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const { skipAuth, ...init } = options ?? {};
  const isFormData = init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  // Attach bearer token unless explicitly skipped
  if (!skipAuth) {
    const { accessToken } = _getTokens();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
  });

  // Handle 401 — attempt token refresh then retry once
  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      // Retry with new token
      const { accessToken } = _getTokens();
      const retryHeaders = {
        ...headers,
        ...(init.headers as Record<string, string>),
      };
      if (accessToken) {
        retryHeaders["Authorization"] = `Bearer ${accessToken}`;
      }
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: retryHeaders,
      });
      if (!retryRes.ok) {
        if (retryRes.status === 401) _clearSession();
        throw new Error(`API ${retryRes.status}: ${retryRes.statusText}`);
      }
      if (retryRes.status === 204) return undefined as T;
      const envelope = (await retryRes.json()) as ApiEnvelope<T>;
      return envelope.data;
    }
    // Refresh failed — clear session
    _clearSession();
    throw new Error("API 401: Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? body?.Message ?? `API ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

// ---------------------------------------------------------------------------
// Public helpers — same signatures as before
// ---------------------------------------------------------------------------

export function apiGet<T>(
  path: string,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: FormData | object,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "POST",
    body: toBodyInit(body),
  });
}

export function apiPut<T>(
  path: string,
  body?: FormData | object,
  options?: Omit<RequestOptions, "method" | "body">
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "PUT",
    body: toBodyInit(body),
  });
}

export function apiDelete(
  path: string,
  options?: Omit<RequestOptions, "method">
): Promise<void> {
  return request<void>(path, { ...options, method: "DELETE" });
}

/** @deprecated Use apiGet / apiPost / apiPut / apiDelete instead. */
export const apiFetch = request;
