import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductResponse, CategoryResponse, ProductDTO, CategoryDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);

  getProducts(keyword?: string, categoryId?: number): Observable<ProductResponse[]> {
    let params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (categoryId) params.append('categoryId', categoryId.toString());
    
    const url = `${environment.catalogServiceUrl}/api/products${params.toString() ? '?' + params.toString() : ''}`;
    return this.http.get<ProductResponse[]>(url);
  }

  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${environment.catalogServiceUrl}/api/products/${id}`);
  }

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${environment.catalogServiceUrl}/api/categories`);
  }

  createCategory(dto: CategoryDTO, requestedBy: number): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(
      `${environment.catalogServiceUrl}/api/categories?requestedBy=${requestedBy}`,
      dto
    );
  }

  updateCategory(id: number, dto: CategoryDTO, requestedBy: number): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(
      `${environment.catalogServiceUrl}/api/categories/${id}?requestedBy=${requestedBy}`,
      dto
    );
  }

  deleteCategory(id: number, requestedBy: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.catalogServiceUrl}/api/categories/${id}?requestedBy=${requestedBy}`
    );
  }

  createProduct(dto: ProductDTO, requestedBy: number): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(
      `${environment.catalogServiceUrl}/api/products?requestedBy=${requestedBy}`, 
      dto
    );
  }

  updateProduct(id: number, dto: ProductDTO, requestedBy: number): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(
      `${environment.catalogServiceUrl}/api/products/${id}?requestedBy=${requestedBy}`, 
      dto
    );
  }

  deleteProduct(id: number, requestedBy: number): Observable<void> {
    return this.http.delete<void>(`${environment.catalogServiceUrl}/api/products/${id}?requestedBy=${requestedBy}`);
  }
}
