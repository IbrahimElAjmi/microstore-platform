export interface BillingRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
}

export interface BillingResponse {
  id: number;
  orderId: number;
  amount: number;
  status: BillingStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  paidAt?: string;
}

export enum BillingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}
