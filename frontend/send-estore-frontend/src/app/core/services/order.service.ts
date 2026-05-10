import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OrderRequest, OrderResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private cartChangedSubject = new Subject<void>();
  cartChanged$ = this.cartChangedSubject.asObservable();

  getOrders(customerId?: number): Observable<OrderResponse[]> {
    const url = customerId 
      ? `${environment.orderServiceUrl}/api/orders?customerId=${customerId}`
      : `${environment.orderServiceUrl}/api/orders`;
    return this.http.get<OrderResponse[]>(url);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${environment.orderServiceUrl}/api/orders/${id}`);
  }

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${environment.orderServiceUrl}/api/orders`, request).pipe(
      tap(() => this.cartChangedSubject.next())
    );
  }

  updateOrderStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${environment.orderServiceUrl}/api/orders/${id}/status?status=${status}`, {}).pipe(
      tap(() => this.cartChangedSubject.next())
    );
  }

  getOrdersByStatus(status: string): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${environment.orderServiceUrl}/api/orders?status=${status}`);
  }

  getOrdersByCustomerAndStatus(customerId: number, status: string): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${environment.orderServiceUrl}/api/orders?customerId=${customerId}&status=${status}`);
  }

  updateOrder(id: number, request: OrderRequest): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${environment.orderServiceUrl}/api/orders/${id}`, request);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.orderServiceUrl}/api/orders/${id}`).pipe(
      tap(() => this.cartChangedSubject.next())
    );
  }

  getPendingOrdersCount(userId: number): Observable<number> {
    return this.http.get<OrderResponse[]>(
      `${environment.orderServiceUrl}/api/orders?customerId=${userId}&status=PENDING`
    ).pipe(
      map(orders => orders.length)
    );
  }
}
