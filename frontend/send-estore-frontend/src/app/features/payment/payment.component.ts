import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '@core/services';
import { BillingService, PaymentMethod } from '@core/services/billing.service';
import { OrderStatus } from '@core/models';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  checkoutData: any;
  isLoading = false;
  orderNumber = '';
  errorMessage = '';
  paymentMethods: PaymentMethod[] = ['CARD', 'CASH', 'BANK_TRANSFER'];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private billingService: BillingService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    const stored = localStorage.getItem('checkoutData');
    if (stored) {
      this.checkoutData = JSON.parse(stored);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.checkoutData = { ...this.checkoutData, paymentMethod: method };
    localStorage.setItem('checkoutData', JSON.stringify(this.checkoutData));
  }

  processPayment(): void {
    if (!this.canProcessPayment()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.orderNumber = 'ORD' + Date.now();

    const items = this.checkoutData.cartItems || [];
    if (!items.length) {
      this.errorMessage = 'Aucun article a payer.';
      this.isLoading = false;
      return;
    }

    const method = this.checkoutData.paymentMethod as PaymentMethod;
    const operations = items.map((item: any) =>
      this.orderService.updateOrderStatus(item.id, OrderStatus.CONFIRMED).pipe(
        switchMap(() => this.billingService.createBilling({ orderId: item.id, paymentMethod: method })),
        switchMap((billing) => method === 'CARD' ? this.billingService.payBilling(billing.id) : of(billing))
      )
    );

    forkJoin(operations).pipe(
      catchError((error) => {
        this.errorMessage = error?.error?.message || 'Paiement impossible. Verifie les services backend.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((result) => {
      if (!result) {
        return;
      }

      const orderData = {
        orderNumber: this.orderNumber,
        customerInfo: this.checkoutData.customerInfo,
        items,
        subtotal: this.checkoutData.subtotal,
        shipping: this.checkoutData.shipping,
        tax: this.checkoutData.tax,
        totalAmount: this.checkoutData.totalAmount,
        paymentMethod: method,
        status: method === 'CARD' ? 'PAID' : 'CONFIRMED'
      };

      localStorage.setItem('orderData', JSON.stringify(orderData));
      localStorage.removeItem('checkoutData');
      this.isLoading = false;
      this.router.navigate(['/order-success']);
    });
  }

  canProcessPayment(): boolean {
    if (!this.checkoutData || this.isLoading) {
      return false;
    }
    return this.checkoutData.paymentMethod === 'CARD' ? this.paymentForm.valid : true;
  }

  formatPrice(price: number): string {
    return `${(price || 0).toFixed(2)} DH`;
  }

  getPaymentLabel(method = this.checkoutData?.paymentMethod): string {
    switch (method) {
      case 'CARD': return 'Carte bancaire';
      case 'CASH': return 'Especes';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      default: return 'Paiement';
    }
  }
}
