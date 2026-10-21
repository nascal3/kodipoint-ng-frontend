import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from '../services/auth-token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authTokenService = inject(AuthTokenService);
  const router = inject(Router);

  if (authTokenService.hasToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
