import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '@core/services/catalog.service';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { InventoryService } from '@core/services/inventory.service';
import { ProductResponse } from '@core/models';
import { InventoryResponse } from '@core/services/inventory.service';
import { environment } from '../../../../environments/environment';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: ProductResponse | null = null;
  inventory: InventoryResponse | null = null;
  isLoading = true;
  isAddingToCart = false;
  selectedQuantity = 1;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private authService: AuthService,
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.loadProduct(productId);
      this.loadInventory(productId);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Produit non trouve';
    }
  }

  loadProduct(id: number): void {
    this.catalogService.getProductById(id).subscribe({
      next: (product: ProductResponse) => {
        this.product = product;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Produit non trouve';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadInventory(id: number): void {
    console.log(`Loading inventory for product ${id} from ${environment.inventoryServiceUrl}/api/inventory/${id}`);
    this.inventoryService.getInventory(id).subscribe({
      next: (inventory: InventoryResponse) => {
        console.log('Inventory response:', inventory);
        this.inventory = inventory;
        this.selectedQuantity = this.clampQuantity(this.selectedQuantity);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Inventory service error:', error);
        this.inventory = { productId: id, quantity: 0 };
        this.selectedQuantity = 1;
        this.cdr.markForCheck();
      }
    });
  }

  addToCart(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    if (!this.product || !this.inventory || this.isAddingToCart || !this.canAddToCart()) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const quantity = this.clampQuantity(this.selectedQuantity);
    this.selectedQuantity = quantity;
    this.isAddingToCart = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.orderService.createOrder({
      customerId: currentUser.userId,
      productId: this.product.id,
      quantity
    }).pipe(
      timeout(10000),
      finalize(() => {
        this.isAddingToCart = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.successMessage = `${quantity} produit(s) ajoute(s) au panier`;
        this.loadInventory(this.product!.id);
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = this.getAddToCartErrorMessage(error);
        this.loadInventory(this.product!.id);
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      }
    });
  }

  decreaseQuantity(): void {
    this.selectedQuantity = this.clampQuantity(this.selectedQuantity - 1);
  }

  increaseQuantity(): void {
    this.selectedQuantity = this.clampQuantity(this.selectedQuantity + 1);
  }

  onQuantityChange(value: string | number): void {
    const parsed = typeof value === 'number' ? value : Number(value);
    this.selectedQuantity = this.clampQuantity(Number.isFinite(parsed) ? parsed : 1);
  }

  getMaxQuantity(): number {
    return Math.max(this.inventory?.quantity ?? 0, 0);
  }

  canAddToCart(): boolean {
    return this.isInStock() && this.selectedQuantity >= 1 && this.selectedQuantity <= this.getMaxQuantity();
  }

  getProductImage(imageUrl?: string, productId?: number, productName?: string): string {
    if (!imageUrl || imageUrl.includes('example.com') || imageUrl.includes('example.org')) {
      return this.buildFallbackImage(productName || `Produit ${productId || ''}`);
    }

    // If it's a full URL, return as is
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

  isInStock(): boolean {
    return this.inventory ? this.inventory.quantity > 0 : false;
  }

  getStockStatus(): string {
    if (!this.inventory) return 'Stock inconnu';
    if (this.inventory.quantity === 0) return 'Rupture de stock';
    if (this.inventory.quantity <= 5) return `Plus que ${this.inventory.quantity} en stock`;
    return `${this.inventory.quantity} en stock`;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.buildFallbackImage(image.alt || 'Produit');
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  private clampQuantity(quantity: number): number {
    const maxQuantity = this.getMaxQuantity();
    if (maxQuantity <= 0) {
      return 1;
    }

    return Math.min(Math.max(Math.trunc(quantity), 1), maxQuantity);
  }

  private getAddToCartErrorMessage(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'Le service commande ne repond pas. Reessaie dans quelques secondes.';
    }

    if (error?.status === 0) {
      return 'Connexion au serveur impossible. Verifie que les services backend sont demarres.';
    }

    if (error?.status === 400) {
      return 'Impossible de reserver cette quantite. Verifie le stock disponible et reessaie.';
    }

    if (error?.status === 404) {
      return 'Produit, client ou stock introuvable.';
    }

    if (error?.status >= 500) {
      return 'Erreur serveur pendant l ajout au panier. Reessaie plus tard.';
    }

    return 'Stock insuffisant ou erreur lors de l ajout au panier.';
  }

  private buildFallbackImage(label: string): string {
    const initials = label
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ES';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480"><rect width="720" height="480" fill="#e0f2fe"/><rect x="42" y="42" width="636" height="396" rx="30" fill="#ffffff" opacity=".72"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="800" fill="#1d4ed8">${initials}</text><text x="50%" y="63%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#475569">E-Store</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
