export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: File;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  icon?: File;
  displayOrder?: number;
  isActive?: boolean;
}
