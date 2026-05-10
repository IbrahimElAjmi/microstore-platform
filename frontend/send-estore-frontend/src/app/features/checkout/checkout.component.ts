import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, AuthService, CatalogService } from '@core/services';
import { OrderResponse, OrderStatus } from '@core/models';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  })
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  totalAmount = 0;
  paymentMethods = ['CARD', 'CASH', 'BANK_TRANSFER'];
  selectedPaymentMethod = 'CARD';
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private catalogService: CatalogService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.prefillUserInfo();
  }

  loadCartItems(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.orderService.getOrders(user.userId).subscribe({
      next: (orders: OrderResponse[]) => {
        const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING);
        if (!pendingOrders.length) {
          this.cartItems = [];
          this.totalAmount = 0;
          this.isLoading = false;
          return;
        }

        forkJoin(pendingOrders.map(order =>
          this.catalogService.getProductById(order.productId).pipe(
            map(product => ({
              ...order,
              productName: product.name,
              productPrice: product.price,
              imageUrl: product.imageUrl || `https://picsum.photos/seed/product-${order.productId}/100/100.jpg`
            })),
            catchError(() => of({
              ...order,
              productName: 'Produit',
              productPrice: order.totalPrice / order.quantity,
              imageUrl: `https://picsum.photos/seed/product-${order.productId}/100/100.jpg`
            }))
          )
        )).subscribe(items => {
          this.cartItems = items;
          this.calculateTotal();
          this.isLoading = false;
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le panier';
        this.isLoading = false;
      }
    });
  }

  prefillUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.checkoutForm.patchValue({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email
      });
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  proceedToPayment(): void {
    if (this.checkoutForm.valid) {
      this.isLoading = true;
      
      // Store checkout data for payment page
      const checkoutData = {
        ...this.checkoutForm.value,
        paymentMethod: this.selectedPaymentMethod,
        cartItems: this.cartItems,
        subtotal: this.totalAmount,
        shipping: 0,
        tax: 0,
        totalAmount: this.totalAmount,
        customerInfo: this.checkoutForm.value
      };
      
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      setTimeout(() => {
        this.router.navigate(['/payment']);
      }, 1000);
    }
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} DH`;
  }
}
