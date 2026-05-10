import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { OrderRequest, OrderResponse } from '../models';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

@Injectable({
  providedIn: 'root'
})
export class OrderMockService {
  // Mock orders
  private mockOrders: OrderResponse[] = [
    {
      id: 1,
      customerId: 1,
      productId: 1,
      quantity: 1,
      totalPrice: 1299.99,
      status: OrderStatus.PENDING,
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      customerId: 1,
      productId: 2,
      quantity: 1,
      totalPrice: 299.99,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: 3,
      customerId: 1,
      productId: 3,
      quantity: 1,
      totalPrice: 199.99,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: 4,
      customerId: 2,
      productId: 5,
      quantity: 1,
      totalPrice: 129.99,
      status: OrderStatus.DELIVERED,
      createdAt: new Date('2024-01-12').toISOString()
    },
    {
      id: 5,
      customerId: 2,
      productId: 6,
      quantity: 3,
      totalPrice: 119.97,
      status: OrderStatus.DELIVERED,
      createdAt: new Date('2024-01-12').toISOString()
    },
    {
      id: 6,
      customerId: 2,
      productId: 4,
      quantity: 1,
      totalPrice: 49.99,
      status: OrderStatus.PENDING,
      createdAt: new Date('2024-01-08').toISOString()
    },
    {
      id: 7,
      customerId: 2,
      productId: 8,
      quantity: 1,
      totalPrice: 59.99,
      status: OrderStatus.PENDING,
      createdAt: new Date('2024-01-08').toISOString()
    }
  ];

  getOrders(customerId?: number): Observable<OrderResponse[]> {
    let orders = this.mockOrders;
    
    if (customerId) {
      orders = orders.filter(order => order.customerId === customerId);
    }
    
    return of(orders).pipe(delay(500));
  }

  getOrderById(id: number): Observable<OrderResponse> {
    const order = this.mockOrders.find(o => o.id === id);
    if (order) {
      return of(order).pipe(delay(300));
    } else {
      return throwError(() => new Error('Order not found'));
    }
  }

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    const newOrder: OrderResponse = {
      id: this.mockOrders.length + 1,
      customerId: request.customerId,
      productId: request.productId,
      quantity: request.quantity,
      totalPrice: 99.99, // Mock price calculation
      status: request.status || OrderStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    
    this.mockOrders.push(newOrder);
    return of(newOrder).pipe(delay(500));
  }

  updateOrderStatus(id: number, status: string): Observable<OrderResponse> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.mockOrders[index].status = status as OrderStatus;
      return of(this.mockOrders[index]).pipe(delay(300));
    } else {
      return throwError(() => new Error('Order not found'));
    }
  }

  getOrdersByStatus(status: string): Observable<OrderResponse[]> {
    const orders = this.mockOrders.filter(order => order.status === status);
    return of(orders).pipe(delay(400));
  }

  getOrdersByCustomerAndStatus(customerId: number, status: string): Observable<OrderResponse[]> {
    const orders = this.mockOrders.filter(order => 
      order.customerId === customerId && order.status === status
    );
    return of(orders).pipe(delay(400));
  }

  updateOrder(id: number, request: OrderRequest): Observable<OrderResponse> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.mockOrders[index] = {
        ...this.mockOrders[index],
        customerId: request.customerId,
        productId: request.productId,
        quantity: request.quantity,
        status: request.status || this.mockOrders[index].status
      };
      return of(this.mockOrders[index]).pipe(delay(500));
    } else {
      return throwError(() => new Error('Order not found'));
    }
  }

  deleteOrder(id: number): Observable<void> {
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.mockOrders.splice(index, 1);
      return of(undefined).pipe(delay(300));
    } else {
      return throwError(() => new Error('Order not found'));
    }
  }

  getPendingOrdersCount(userId: number): Observable<number> {
    const pendingOrders = this.mockOrders.filter(order => 
      order.customerId === userId && order.status === OrderStatus.PENDING
    );
    return of(pendingOrders.length).pipe(delay(200));
  }
}
