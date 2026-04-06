// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check if logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }


  const expectedRoles = route.data['roles'] as Array<string>;
  const user = authService.getUser();

  if (expectedRoles && (!user || !expectedRoles.includes(user.role))) {
   
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};