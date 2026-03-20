const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown;
}

function toBodyInit(body?: FormData | object): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function apiGet<T>(
  path: string,
  options?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: FormData | object,
  options?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body: toBodyInit(body) });
}

export function apiPut<T>(
  path: string,
  body?: FormData | object,
  options?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  return request<T>(path, { ...options, method: "PUT", body: toBodyInit(body) });
}

export function apiDelete(
  path: string,
  options?: Omit<RequestInit, "method">
): Promise<void> {
  return request<void>(path, { ...options, method: "DELETE" });
}

/** @deprecated Use apiGet / apiPost / apiPut / apiDelete instead. */
export const apiFetch = request;
