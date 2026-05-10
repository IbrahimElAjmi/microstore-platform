import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;
  cartCount: number = 0;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService
  ) {
    // Close menus on every route change
    this.subscriptions.add(this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMenus();
      this.loadCartCount();
    }));

    // Subscribe to auth state changes
    this.subscriptions.add(this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role !== 'ADMIN') {
        this.loadCartCount();
      } else {
        this.cartCount = 0;
      }
    }));

    this.subscriptions.add(this.orderService.cartChanged$.subscribe(() => {
      this.loadCartCount();
    }));
  }

  ngOnInit() {
    // The subscription in constructor handles initial load
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCartCount() {
    if (this.currentUser?.userId && !this.isAdmin()) {
      this.orderService.getPendingOrdersCount(this.currentUser.userId)
        .subscribe({
          next: (count) => this.cartCount = count,
          error: () => this.cartCount = 0
        });
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMenus();
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path).then(() => {
      this.closeMenus();
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  closeMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
  }
}
