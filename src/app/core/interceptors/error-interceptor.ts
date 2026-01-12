import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 – unauthorized
      if (error.status === 401) {
        authService.logout?.(); // optional if implemented
        router.navigate(['/login']);
      }

      // 403 – forbidden
      if (error.status === 403) {
        router.navigate(['/login']);
      }

      // You can show toast/snackbar here if you have a service
      // e.g., notificationService.show(error.error?.message || 'Unexpected error');

      // Always rethrow so callers can still handle it if needed
      return throwError(() => error);
    })
  );
};
