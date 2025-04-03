import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authToken = authService.getToken();

  let request = req;

  if (authToken) {
    request = req.clone({
      setHeaders: {
        "x-access-token": authToken
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
      } else if (error.status === 403) {
        console.error('403 err', error)
      } else if (error.status === 400) {
        console.error('400 Bad Request:', error);
      }

      return throwError(() => error);
    })
  );
};