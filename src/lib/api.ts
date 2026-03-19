const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown | null;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}
