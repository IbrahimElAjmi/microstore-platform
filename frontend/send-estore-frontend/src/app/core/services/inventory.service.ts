import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryResponse {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = environment.inventoryServiceUrl;

  constructor(private http: HttpClient) {}

  getInventory(productId: number): Observable<InventoryResponse> {
    return this.http.get<InventoryResponse>(`/inventory-api/api/inventory/${productId}`);
  }

  getInventoryByIds(productIds: number[]): Observable<InventoryResponse[]> {
    const params = productIds.join(',');
    return this.http.get<InventoryResponse[]>(`/inventory-api/api/inventory?productIds=${params}`);
  }

  isInStock(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`/inventory-api/api/inventory/${productId}/stock`);
  }

  setStock(productId: number, quantity: number): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(`/inventory-api/api/inventory/${productId}?quantity=${quantity}`, {});
  }

  reduceStock(productId: number, quantity: number): Observable<InventoryResponse> {
    return this.http.put<InventoryResponse>(`/inventory-api/api/inventory/reduce/${productId}?quantity=${quantity}`, {});
  }

  increaseStock(productId: number, quantity: number): Observable<InventoryResponse> {
    return this.http.put<InventoryResponse>(`/inventory-api/api/inventory/increase/${productId}?quantity=${quantity}`, {});
  }
}
