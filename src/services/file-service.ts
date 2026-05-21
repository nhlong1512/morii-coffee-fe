import { apiPost } from "@/lib/api";
import type { ApiFileBlob, ApiUploadResult } from "@/interfaces/files";

export type { ApiFileBlob, ApiUploadResult } from "@/interfaces/files";

export async function uploadImageAsset(
  file: File,
  bucketName: string = "products"
): Promise<ApiFileBlob> {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("BucketName", bucketName);

  const result = await apiPost<ApiUploadResult>("/v1/files/upload", formData);
  return result.blob;
}

export async function uploadProductImage(file: File): Promise<string> {
  const blob = await uploadImageAsset(file, "products");
  return blob.uri;
}
