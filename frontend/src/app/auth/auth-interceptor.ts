import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from './auth-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore: AuthStore = inject(AuthStore);
  const token = authStore.obtenerToken();

  const pedido = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(pedido).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = request.url.includes('/api/v1/auth');

      if (error.status === 401 && !esLogin) {
        authStore.cerrarSesion();
      }

      return throwError(() => error);
    }),
  );
};
