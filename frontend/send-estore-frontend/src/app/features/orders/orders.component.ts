import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '@core/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { OrderResponse, OrderStatus } from '@core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  isLoading = true;
  currentFilter: string = 'all';
  updatingOrderId: number | null = null;
  successMessage = '';
  errorMessage = '';
  currentPage = 1;
  readonly pageSize = 10;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    this.orderService.getOrders(currentUser.userId).subscribe({
      next: (orders: OrderResponse[]) => {
        this.orders = orders.filter((order: OrderResponse) => order.status !== OrderStatus.PENDING);
        this.filteredOrders = this.orders;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.currentFilter = status;
    this.currentPage = 1;
    if (status === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter((order: OrderResponse) => order.status === status);
    }
  }

  // Helper method to check if order can be marked as delivered
  canMarkAsDelivered(order: OrderResponse): boolean {
    return order.status === OrderStatus.CONFIRMED;
  }

  // Method to mark order as delivered
  markAsDelivered(order: OrderResponse): void {
    if (this.updatingOrderId) {
      return;
    }

    this.updatingOrderId = order.id;
    this.successMessage = '';
    this.errorMessage = '';

    this.orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED).subscribe({
      next: () => {
        this.successMessage = `Commande #${order.id} marquee comme livree`;
        this.updatingOrderId = null;
        this.loadOrders();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Impossible de mettre a jour cette commande. Reessaie plus tard.';
        this.updatingOrderId = null;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  formatPrice(price: number): string {
    return `${(price || 0).toFixed(2)} DH`;
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case OrderStatus.CONFIRMED: return 'Confirmee';
      case OrderStatus.DELIVERED: return 'Livree';
      case OrderStatus.CANCELLED: return 'Annulee';
      default: return status;
    }
  }

  getOrdersCount(status?: string): number {
    if (!status) {
      return this.orders.length;
    }

    return this.orders.filter((order) => order.status === status).length;
  }

  getTotalAmount(): number {
    return this.orders.reduce((total, order) => total + (order.totalPrice || 0), 0);
  }

  getAverageAmount(): number {
    if (!this.orders.length) {
      return 0;
    }

    return this.getTotalAmount() / this.orders.length;
  }

  trackByOrderId(_: number, order: OrderResponse): number {
    return order.id;
  }

  getPaginatedOrders(): OrderResponse[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(): number {
    return Math.max(Math.ceil(this.filteredOrders.length / this.pageSize), 1);
  }

  getPaginationStart(): number {
    if (!this.filteredOrders.length) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredOrders.length);
  }

  goToPreviousPage(): void {
    this.currentPage = Math.max(this.currentPage - 1, 1);
  }

  goToNextPage(): void {
    this.currentPage = Math.min(this.currentPage + 1, this.getTotalPages());
  }
}
