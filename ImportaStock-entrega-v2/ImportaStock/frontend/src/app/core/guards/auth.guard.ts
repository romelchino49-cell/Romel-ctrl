import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** Sin sesión válida -> redirige a Keycloak. */
export const authGuard: CanActivateFn = async (_r, state) => {
  const auth = inject(AuthService);
  if (await auth.ensureSession()) return true;
  await auth.login(state.url);
  return false;
};

/** Exige alguno de los roles; si no, pantalla 403. */
export const rolGuard = (...roles: string[]): CanActivateFn => () => {
  if (inject(AuthService).hasAnyRole(roles)) return true;
  inject(Router).navigate(['/403']);
  return false;
};
