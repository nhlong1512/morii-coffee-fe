import { apiPost } from "@/lib/api";
import type { ApiUploadResult } from "@/interfaces/files";

export type { ApiFileBlob, ApiUploadResult } from "@/interfaces/files";

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("BucketName", "products");

  const result = await apiPost<ApiUploadResult>("/v1/files/upload", formData);
  return result.blob.uri;
}
