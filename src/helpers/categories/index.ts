import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/interfaces/categories";

export function buildCategoryFormData(
  request: CreateCategoryRequest | UpdateCategoryRequest
): FormData {
  const fd = new FormData();
  fd.append("Name", request.name);
  if (request.description !== undefined) fd.append("Description", request.description);
  if (request.icon) fd.append("Icon", request.icon);
  if (request.displayOrder !== undefined) fd.append("DisplayOrder", String(request.displayOrder));
  if ("isActive" in request && request.isActive !== undefined) {
    fd.append("IsActive", String(request.isActive));
  }
  return fd;
}
