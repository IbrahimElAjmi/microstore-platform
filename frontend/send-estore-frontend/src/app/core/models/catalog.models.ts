export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
}

export interface ProductDTO {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
}

export interface CategoryDTO {
  name: string;
  description?: string;
}
