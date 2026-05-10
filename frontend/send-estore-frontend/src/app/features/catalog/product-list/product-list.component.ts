import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, finalize, Subject, timeout } from 'rxjs';
import { CatalogService } from '@core/services/catalog.service';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { ProductResponse, CategoryResponse } from '@core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  searchKeyword = '';
  selectedCategoryId: number | null = null;
  isLoading = true;
  addingProductId: number | null = null;
  successMessage = '';
  errorMessage = '';
  private searchSubject = new Subject<string>();

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(keyword => {
      this.filterProducts(keyword);
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadProducts();
    this.loadCategories();

    // Handle query parameters for category filtering
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategoryId = +params['categoryId'];
        // Apply filter after products are loaded
        setTimeout(() => {
          this.filterProducts(this.searchKeyword);
        }, 100);
      }
    });
  }

  loadProducts(): void {
    this.catalogService.getProducts().subscribe({
      next: (products: ProductResponse[]) => {
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les produits.';
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
        this.errorMessage = 'Impossible de charger les categories.';
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  filterProducts(keyword: string): void {
    let filtered = this.products;

    if (keyword) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.description.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (this.selectedCategoryId) {
      filtered = filtered.filter(product => product.categoryId === this.selectedCategoryId);
    }

    this.filteredProducts = filtered;
  }

  onCategoryChange(): void {
    this.filterProducts(this.searchKeyword);
  }

  viewProductDetail(id: number): void {
    this.router.navigate(['/products', id]);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  addToCart(product: ProductResponse): void {
    if (this.isAdmin()) {
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

    this.addingProductId = product.id;
    this.successMessage = '';
    this.errorMessage = '';

    this.orderService.createOrder({
      customerId: currentUser.userId,
      productId: product.id,
      quantity: 1
    }).pipe(
      timeout(10000),
      finalize(() => {
        this.addingProductId = null;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.successMessage = `${product.name} ajoute au panier`;
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = this.getAddToCartErrorMessage(error);
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 4000);
      }
    });
  }

  private getAddToCartErrorMessage(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'Le service commande ne repond pas. Reessaie dans quelques secondes.';
    }

    if (error?.status === 0) {
      return 'Connexion au serveur impossible. Verifie que les services backend sont demarres.';
    }

    if (error?.status === 400) {
      return 'Impossible de reserver ce produit. Verifie le stock disponible et reessaie.';
    }

    if (error?.status === 404) {
      return 'Produit, client ou stock introuvable.';
    }

    if (error?.status >= 500) {
      return 'Erreur serveur pendant l ajout au panier. Reessaie plus tard.';
    }

    return 'Impossible d ajouter ce produit au panier.';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getProductImage(imageUrl?: string, productId?: number, productName?: string): string {
    if (!imageUrl) {
      return this.buildFallbackImage(productName || `Produit ${productId || ''}`);
    }

    // Check if it's a fake/example URL from database
    if (imageUrl.includes('example.com') || imageUrl.includes('example.org')) {
      return this.buildFallbackImage(productName || `Produit ${productId || ''}`);
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

  productInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.buildFallbackImage(image.alt || 'Produit');
  }

  private buildFallbackImage(label: string): string {
    const initials = this.productInitials(label) || 'ES';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#e0f2fe"/><rect x="32" y="32" width="536" height="336" rx="26" fill="#ffffff" opacity=".72"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="76" font-weight="800" fill="#1d4ed8">${initials}</text><text x="50%" y="63%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#475569">E-Store</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}

