import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductResponse, CategoryResponse, ProductDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CatalogMockService {
  // Mock categories
  private mockCategories: CategoryResponse[] = [
    { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets' },
    { id: 2, name: 'Clothing', description: 'Fashion and apparel' },
    { id: 3, name: 'Books', description: 'Books and educational materials' },
    { id: 4, name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    { id: 5, name: 'Sports', description: 'Sports equipment and accessories' },
    { id: 6, name: 'Toys', description: 'Toys and games for all ages' }
  ];

  // Mock products
  private mockProducts: ProductResponse[] = [
    {
      id: 1,
      name: 'Laptop Pro 15"',
      description: 'High-performance laptop with 16GB RAM and 512GB SSD',
      price: 1299.99,
      categoryId: 1,
      categoryName: 'Electronics',
      imageUrl: 'https://picsum.photos/seed/laptop1/300/200.jpg'
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones',
      price: 299.99,
      categoryId: 1,
      categoryName: 'Electronics',
      imageUrl: 'https://picsum.photos/seed/headphones1/300/200.jpg'
    },
    {
      id: 3,
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch with heart rate monitor',
      price: 199.99,
      categoryId: 1,
      categoryName: 'Electronics',
      imageUrl: 'https://picsum.photos/seed/watch1/300/200.jpg'
    },
    {
      id: 4,
      name: 'Designer T-Shirt',
      description: 'Premium cotton designer t-shirt',
      price: 49.99,
      categoryId: 2,
      categoryName: 'Clothing',
      imageUrl: 'https://picsum.photos/seed/tshirt1/300/200.jpg'
    },
    {
      id: 5,
      name: 'Running Shoes',
      description: 'Professional running shoes with advanced cushioning',
      price: 129.99,
      categoryId: 5,
      categoryName: 'Sports',
      imageUrl: 'https://picsum.photos/seed/shoes1/300/200.jpg'
    },
    {
      id: 6,
      name: 'JavaScript Guide',
      description: 'Complete guide to modern JavaScript development',
      price: 39.99,
      categoryId: 3,
      categoryName: 'Books',
      imageUrl: 'https://picsum.photos/seed/book1/300/200.jpg'
    },
    {
      id: 7,
      name: 'Garden Tool Set',
      description: 'Complete set of essential garden tools',
      price: 79.99,
      categoryId: 4,
      categoryName: 'Home & Garden',
      imageUrl: 'https://picsum.photos/seed/garden1/300/200.jpg'
    },
    {
      id: 8,
      name: 'Board Game Collection',
      description: 'Classic board games for family fun',
      price: 59.99,
      categoryId: 6,
      categoryName: 'Toys',
      imageUrl: 'https://picsum.photos/seed/games1/300/200.jpg'
    }
  ];

  getProducts(keyword?: string, categoryId?: number): Observable<ProductResponse[]> {
    return of(this.mockProducts).pipe(
      delay(500),
      map(products => {
        let filtered = products;
        
        if (keyword) {
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(keyword.toLowerCase()) ||
            product.description.toLowerCase().includes(keyword.toLowerCase())
          );
        }
        
        if (categoryId) {
          filtered = filtered.filter(product => product.categoryId === categoryId);
        }
        
        return filtered;
      })
    );
  }

  getProductById(id: number): Observable<ProductResponse> {
    const product = this.mockProducts.find(p => p.id === id);
    if (product) {
      return of(product).pipe(delay(300));
    } else {
      return throwError(() => new Error('Product not found'));
    }
  }

  getCategories(): Observable<CategoryResponse[]> {
    return of(this.mockCategories).pipe(delay(300));
  }

  createProduct(dto: ProductDTO, requestedBy: number): Observable<ProductResponse> {
    const category = this.mockCategories.find(c => c.id === dto.categoryId);
    const newProduct: ProductResponse = {
      id: this.mockProducts.length + 1,
      name: dto.name,
      description: dto.description || '',
      price: dto.price,
      categoryId: dto.categoryId,
      categoryName: category?.name || 'Unknown',
      imageUrl: dto.imageUrl
    };
    
    this.mockProducts.push(newProduct);
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: number, dto: ProductDTO, requestedBy: number): Observable<ProductResponse> {
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const category = this.mockCategories.find(c => c.id === dto.categoryId);
      this.mockProducts[index] = {
        ...this.mockProducts[index],
        name: dto.name,
        description: dto.description || this.mockProducts[index].description,
        price: dto.price,
        categoryId: dto.categoryId,
        categoryName: category?.name || this.mockProducts[index].categoryName,
        imageUrl: dto.imageUrl || this.mockProducts[index].imageUrl
      };
      return of(this.mockProducts[index]).pipe(delay(500));
    } else {
      return throwError(() => new Error('Product not found'));
    }
  }

  deleteProduct(id: number, requestedBy: number): Observable<void> {
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
      return of(undefined).pipe(delay(300));
    } else {
      return throwError(() => new Error('Product not found'));
    }
  }
}
