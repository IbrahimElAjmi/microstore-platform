import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BillingResponse {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

export interface BillingCreateRequest {
  orderId: number;
  paymentMethod: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER';
export type BillingStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly apiUrl = environment.billingServiceUrl;

  constructor(private http: HttpClient) {}

  getAllBilling(): Observable<BillingResponse[]> {
    return this.http.get<BillingResponse[]>(`${this.apiUrl}/api/billing`);
  }

  getBillingByStatus(status: BillingStatus): Observable<BillingResponse[]> {
    return this.http.get<BillingResponse[]>(`${this.apiUrl}/api/billing?status=${status}`);
  }

  getBillingById(id: number): Observable<BillingResponse> {
    return this.http.get<BillingResponse>(`${this.apiUrl}/api/billing/${id}`);
  }

  getBillingByOrder(orderId: number): Observable<BillingResponse> {
    return this.http.get<BillingResponse>(`${this.apiUrl}/api/billing/order/${orderId}`);
  }

  createBilling(request: BillingCreateRequest): Observable<BillingResponse> {
    return this.http.post<BillingResponse>(`${this.apiUrl}/api/billing`, request);
  }

  payBilling(id: number): Observable<BillingResponse> {
    return this.http.put<BillingResponse>(`${this.apiUrl}/api/billing/${id}/pay`, {});
  }

  failBilling(id: number): Observable<BillingResponse> {
    return this.http.put<BillingResponse>(`${this.apiUrl}/api/billing/${id}/fail`, {});
  }

  refundBilling(id: number): Observable<BillingResponse> {
    return this.http.put<BillingResponse>(`${this.apiUrl}/api/billing/${id}/refund`, {});
  }
}
