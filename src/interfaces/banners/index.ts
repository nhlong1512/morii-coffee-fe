export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  cta?: string;
  ctaLink?: string;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  image?: File;
}

export interface UpdateBannerRequest {
  title: string;
  subtitle?: string;
  cta?: string;
  ctaLink?: string;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  image?: File;
}
