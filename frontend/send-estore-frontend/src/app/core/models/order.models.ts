export interface OrderRequest {
  customerId: number;
  productId: number;
  quantity: number;
  status?: OrderStatus;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED'
}
