import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate([authService.isLoggedIn() ? '/products' : '/login']);
  return false;
};
