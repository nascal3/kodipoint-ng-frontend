import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '../services/auth-token.service';
import { DARK_MODE_STORAGE_PREFIX } from '../services/theme.service';
import { tap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authTokenService = inject(AuthTokenService);
  const token = authTokenService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    tap({
      error: (error) => {
        if (error.status === 401) {
          authTokenService.removeToken();
          const themePreferences = Object.entries(localStorage).filter(([key]) =>
            key.startsWith(DARK_MODE_STORAGE_PREFIX),
          );
          localStorage.clear();
          for (const [key, value] of themePreferences) {
            localStorage.setItem(key, value);
          }
        }
      }
    })
  );
};
