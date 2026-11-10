import { Routes } from '@angular/router';
import { authGuard, rolGuard } from './core/guards/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  { path: '', component: ShellComponent, canActivate: [authGuard], children: [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'proveedores', loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
    { path: 'categorias', loadComponent: () => import('./features/catalogo/categorias.component').then(m => m.CategoriasComponent) },
    { path: 'productos', loadComponent: () => import('./features/catalogo/productos.component').then(m => m.ProductosComponent) },
    { path: 'importaciones', loadComponent: () => import('./features/importaciones/importaciones.component').then(m => m.ImportacionesComponent) },
    { path: 'recepciones', loadComponent: () => import('./features/recepciones/recepciones.component').then(m => m.RecepcionesComponent) },
    { path: 'inventario', loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent) },
    { path: 'reportes', canActivate: [rolGuard('ADMIN', 'SUPERVISOR')], loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent) },
    { path: '403', loadComponent: () => import('./core/layout/forbidden.component').then(m => m.ForbiddenComponent) }
  ] },
  { path: '**', redirectTo: '' }
];
