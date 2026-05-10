import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { OrderResponse, OrderStatus } from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CartItem extends OrderResponse {
  productName: string;
  productPrice: number;
  imageUrl: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  pendingOrders: CartItem[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadPendingOrders();
  }

  loadPendingOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Show login prompt instead of redirecting on refresh
      this.isLoading = false;
      return;
    }

    this.orderService.getOrders(currentUser.userId).subscribe({
      next: (orders: OrderResponse[]) => {
        const pending = orders.filter((order: OrderResponse) => order.status === OrderStatus.PENDING);
        if (!pending.length) {
          this.pendingOrders = [];
          this.isLoading = false;
          return;
        }

        forkJoin(pending.map((order) =>
          this.catalogService.getProductById(order.productId).pipe(
            map((product) => ({
              ...order,
              productName: product.name,
              productPrice: product.price,
              imageUrl: this.getProductImage(product.imageUrl, product.id)
            })),
            catchError(() => of({
              ...order,
              productName: 'Produit',
              productPrice: order.totalPrice / order.quantity,
              imageUrl: this.getProductImage(undefined, order.productId)
            }))
          )
        )).subscribe((items) => {
          this.pendingOrders = items;
          this.isLoading = false;
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le panier';
        this.isLoading = false;
      }
    });
  }

  deleteOrder(id: number): void {
    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.loadPendingOrders();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  async confirmOrder(order: CartItem): Promise<void> {
    try {
      // Prepare checkout data for single product
      const checkoutData = {
        cartItems: [{
          ...order,
          productName: order.productName,
          productPrice: order.productPrice,
          imageUrl: order.imageUrl
        }],
        totalAmount: order.totalPrice,
        subtotal: order.totalPrice,
        shipping: 0,
        tax: 0,
        paymentMethod: 'CARD',
        customerInfo: {
          fullName: this.currentCustomerName(),
          email: this.authService.getCurrentUser()?.email
        },
        type: 'single',
        orderId: order.id
      };
      
      // Store checkout data for payment component
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Navigate to payment page
      this.router.navigate(['/payment']);
    } catch (error) {
      this.errorMessage = 'Impossible de preparer le paiement.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  getTotalAmount(): number {
    return this.pendingOrders.reduce((total, order) => total + order.totalPrice, 0);
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} DH`;
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-[#fbbf24] text-[#92400e]';
      case OrderStatus.CONFIRMED: return 'bg-[#2563eb] text-white';
      case OrderStatus.DELIVERED: return 'bg-[#10b981] text-white';
      case OrderStatus.CANCELLED: return 'bg-[#ef4444] text-white';
      default: return 'bg-[#64748b] text-white';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'In Cart';
      case OrderStatus.CONFIRMED: return 'Confirmed';
      case OrderStatus.DELIVERED: return 'Delivered';
      case OrderStatus.CANCELLED: return 'Cancelled';
      default: return status;
    }
  }

  // Helper method to check if payment can be processed
  canProcessPayment(order: OrderResponse): boolean {
    return order.status === OrderStatus.PENDING;
  }

  async proceedToCheckout(): Promise<void> {
    try {
      const subtotal = this.getTotalAmount();
      const shipping = 0;
      const tax = 0;
      
      // Prepare checkout data for all cart items
      const checkoutData = {
        cartItems: this.pendingOrders,
        totalAmount: subtotal + shipping + tax,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        paymentMethod: 'CARD',
        customerInfo: {
          fullName: this.currentCustomerName(),
          email: this.authService.getCurrentUser()?.email
        },
        type: 'all'
      };
      
      // Store checkout data for payment component
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Navigate to payment page
      this.router.navigate(['/payment']);
    } catch (error) {
      this.errorMessage = 'Impossible de preparer le paiement.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  private currentCustomerName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Customer';
  }

  private getProductImage(imageUrl: string | undefined, productId: number): string {
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

  private buildFallbackImage(productId: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="#e0f2fe"/><rect x="16" y="16" width="128" height="128" rx="18" fill="#ffffff" opacity=".7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#1d4ed8">Produit</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
