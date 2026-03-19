const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

interface ApiFileBlob {
  uri: string;
  name: string;
  contentType: string;
  size: number;
}

interface ApiUploadResult {
  status: string;
  error: boolean;
  blob: ApiFileBlob;
}

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  errors: unknown | null;
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("BucketName", "products");

  const res = await fetch(`${BASE_URL}/v1/files/upload`, {
    method: "POST",
    body: formData,
    // No Content-Type header — browser sets multipart/form-data with boundary
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const envelope = (await res.json()) as ApiEnvelope<ApiUploadResult>;
  return envelope.data.blob.uri;
}
