import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  standalone: true, selector: 'app-root', imports: [RouterOutlet],
  template: `
  @if (auth.loginError(); as m) {
    <div class="card" style="max-width:560px;margin:80px auto">
      <h2>No se pudo iniciar la sesión</h2><p>{{ m }}</p>
      <button (click)="auth.reintentar()">Reintentar</button>
      <button class="sec" (click)="auth.logout()">Cerrar sesión en Keycloak</button>
    </div>
  } @else { <router-outlet /> }`
})
export class AppComponent { auth = inject(AuthService); }
