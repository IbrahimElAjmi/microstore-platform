import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  })
export class OrderSuccessComponent implements OnInit {
  orderData: any;
  estimatedDelivery = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrderData();
    this.calculateEstimatedDelivery();
  }

  loadOrderData(): void {
    const stored = localStorage.getItem('orderData');
    if (stored) {
      this.orderData = JSON.parse(stored);
    } else {
      this.router.navigate(['/home']);
    }
  }

  calculateEstimatedDelivery(): void {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days delivery
    this.estimatedDelivery = deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatPrice(price: number): string {
    return `${(price || 0).toFixed(2)} DH`;
  }

  continueShopping(): void {
    localStorage.removeItem('orderData');
    this.router.navigate(['/products']);
  }

  trackOrder(): void {
    this.router.navigate(['/orders']);
  }
}
