import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return sessionService.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth'], { queryParams: { redirectTo: state.url } });
};

export const authChildGuard: CanActivateChildFn = (_route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return sessionService.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth'], { queryParams: { redirectTo: state.url } });
};
