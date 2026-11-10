import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

const MENU = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/proveedores', label: 'Proveedores' },
  { path: '/categorias', label: 'Categorías' },
  { path: '/productos', label: 'Productos' },
  { path: '/importaciones', label: 'Importaciones' },
  { path: '/recepciones', label: 'Recepciones' },
  { path: '/inventario', label: 'Inventario' },
  { path: '/reportes', label: 'Reportes', roles: ['ADMIN', 'SUPERVISOR'] }
];

@Component({
  standalone: true, selector: 'app-shell', imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <header class="top">
    <button class="burger" (click)="open = !open">☰</button>
    <strong>ImportaStock</strong><span class="sp"></span>
    <span>{{ auth.user().name }} · {{ auth.user().roles.join(', ') }}</span>
    <button (click)="auth.logout()">Salir</button>
  </header>
  <div class="body">
    <nav class="side" [class.open]="open">
      @for (m of menu(); track m.path) { <a [routerLink]="m.path" routerLinkActive="act" (click)="open = false">{{ m.label }}</a> }
    </nav>
    <main><router-outlet /></main>
  </div>
  @if (toast.msg(); as t) { <div class="toast" [class.err]="t.kind === 'err'">{{ t.text }}</div> }`
})
export class ShellComponent {
  auth = inject(AuthService); toast = inject(ToastService); open = false;
  menu() { return MENU.filter(m => !m.roles || this.auth.hasAnyRole(m.roles)); }
}
