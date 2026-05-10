import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.error('Access denied');
      } else if (error.status === 404) {
        console.error('Not found');
      } else if (error.status === 500) {
        console.error('Server error');
      }
      throw error;
    })
  );
};
