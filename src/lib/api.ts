const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api";

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
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
