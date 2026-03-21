import type { CreateBannerRequest, UpdateBannerRequest } from "@/interfaces/banners";

export function buildBannerFormData(
  request: CreateBannerRequest | UpdateBannerRequest
): FormData {
  const fd = new FormData();
  fd.append("Title", request.title);
  if (request.subtitle !== undefined) fd.append("Subtitle", request.subtitle);
  if (request.cta !== undefined) fd.append("Cta", request.cta);
  if (request.ctaLink !== undefined) fd.append("CtaLink", request.ctaLink);
  if (request.displayOrder !== undefined) fd.append("DisplayOrder", String(request.displayOrder));
  if (request.startDate !== undefined) fd.append("StartDate", request.startDate);
  if (request.endDate !== undefined) fd.append("EndDate", request.endDate);
  if (request.isActive !== undefined) fd.append("IsActive", String(request.isActive));
  if (request.image) fd.append("Image", request.image);
  return fd;
}
