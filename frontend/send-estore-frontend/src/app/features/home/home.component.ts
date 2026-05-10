import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { CatalogService } from '@core/services/catalog.service';
import { ProductResponse, CategoryResponse } from '@core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  isLoading = true;
  addingProductId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private catalogService: CatalogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.catalogService.getProducts().subscribe({
      next: (products: ProductResponse[]) => {
        this.featuredProducts = products.slice(0, 6);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les produits pour le moment.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (categories: CategoryResponse[]) => {
        this.categories = categories;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les catégories.';
        this.cdr.markForCheck();
      }
    });
  }

  addToCart(productId: number): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    if (this.addingProductId) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.addingProductId = productId;
    this.successMessage = '';
    this.errorMessage = '';

    this.orderService.createOrder({
      customerId: currentUser.userId,
      productId,
      quantity: 1
    }).subscribe({
      next: () => {
        this.successMessage = 'Produit ajouté au panier.';
        this.addingProductId = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: () => {
        this.errorMessage = 'Impossible d\'ajouter le produit au panier.';
        this.addingProductId = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      }
    });
  }

  getProductImage(imageUrl: string | undefined, productId: number): string {
    if (!imageUrl || imageUrl.includes('example.com') || imageUrl.includes('example.org')) {
      return this.buildFallbackImage(`Produit ${productId}`);
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's just a filename, serve from public folder
    if (!imageUrl.includes('/')) {
      return `images/products/${imageUrl}`;
    }

    // If it's a relative path starting with /, serve from public folder
    if (imageUrl.startsWith('/')) {
      return `images/products${imageUrl}`;
    }

    // Default to public folder
    return `images/products/${imageUrl}`;
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} DH`;
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Electronics': '💻',
      'Clothing': '👕',
      'Home & Garden': '🏠',
      'Sports': '⚽',
      'Books': '📚',
      'Toys': '🧸',
      'Beauty': '💄',
      'Automotive': '🚗',
      'Health': '🏥',
      'Food': '🍎'
    };
    return icons[categoryName] || categoryName.slice(0, 2).toUpperCase();
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { categoryId } });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  private buildFallbackImage(label: string): string {
    const initials = label
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ES';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#e0f2fe"/><rect x="34" y="34" width="572" height="352" rx="26" fill="#ffffff" opacity=".72"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="76" font-weight="800" fill="#1d4ed8">${initials}</text><text x="50%" y="63%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#475569">E-Store</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
