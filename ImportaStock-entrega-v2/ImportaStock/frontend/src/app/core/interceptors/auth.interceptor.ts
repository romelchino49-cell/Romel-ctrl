import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Adjunta el Bearer. Ante 401: renueva UNA vez y reintenta.
 *  - Si la renovación falla -> vuelve a Keycloak (con protección anti-bucle en AuthService.login).
 *  - Si el reintento TAMBIÉN da 401, el backend rechaza el token: se informa el error y NO se redirige
 *    (redirigir provocaba un bucle infinito de login).
 * Ante 403: avisa que el rol no permite la acción.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  const auth = inject(AuthService), toast = inject(ToastService);
  const withToken = () => (auth.token ? req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } }) : req);
  const denied = (e: HttpErrorResponse) => { if (e.status === 403) toast.error('Acceso denegado (403): tu rol no permite esta acción'); return throwError(() => e); };

  return next(withToken()).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return denied(err);
      return from(auth.refresh()).pipe(
        switchMap(ok => {
          if (!ok) { auth.login(location.pathname); return EMPTY; }
          return next(withToken()).pipe(catchError((e2: HttpErrorResponse) => denied(e2)));
        })
      );
    })
  );
};
