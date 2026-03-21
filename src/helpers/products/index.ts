import type { CreateProductRequest, UpdateProductRequest } from "@/interfaces/products";

export function buildProductFormData(
  request: CreateProductRequest | UpdateProductRequest
): FormData {
  const fd = new FormData();
  fd.append("Name", request.name);
  if (request.slug !== undefined) fd.append("Slug", request.slug);
  if (request.description !== undefined) fd.append("Description", request.description);
  fd.append("BasePrice", String(request.basePrice));
  for (const id of request.categoryIds) fd.append("CategoryIds", id);
  if (request.thumbnail) fd.append("Thumbnail", request.thumbnail);
  if (request.isFeatured !== undefined) fd.append("IsFeatured", String(request.isFeatured));
  if (request.displayOrder !== undefined) fd.append("DisplayOrder", String(request.displayOrder));
  if ("status" in request && request.status !== undefined) fd.append("Status", request.status);
  return fd;
}
