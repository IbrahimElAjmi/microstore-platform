import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'products', loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:id', loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [adminGuard] },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent), canActivate: [clientGuard] },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [clientGuard] },
  { path: 'payment', loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent), canActivate: [clientGuard] },
  { path: 'order-success', loadComponent: () => import('./features/order-success/order-success.component').then(m => m.OrderSuccessComponent), canActivate: [clientGuard] },
  { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent), canActivate: [clientGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
