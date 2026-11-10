import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Producto } from '../../shared/interfaces/models';
import { BadgeComponent } from '../../shared/components/badge.component';

@Component({ standalone: true, selector: 'app-inventario', imports: [FormsModule, BadgeComponent], template: `
<h2>Inventario</h2>
@if (admin) {
<div class="card grid">
  <select [(ngModel)]="aj.productoId"><option [ngValue]="null">— Producto —</option>@for (p of stock(); track p.id) { <option [ngValue]="p.id">{{ p.sku }} · {{ p.nombre }}</option> }</select>
  <select [(ngModel)]="aj.tipo"><option>ENTRADA</option><option>SALIDA</option></select>
  <input type="number" min="1" [(ngModel)]="aj.cantidad" placeholder="Cantidad">
  <input [(ngModel)]="aj.motivo" placeholder="Motivo del ajuste">
  <button (click)="ajustar()" [disabled]="!aj.productoId || !aj.cantidad || !aj.motivo">Registrar ajuste</button>
</div>}
<h3>Stock actual</h3>
<div class="tscroll"><table><tr><th>SKU</th><th>Producto</th><th>Categoría</th><th class="r">Stock</th><th class="r">Mínimo</th><th>Alerta</th></tr>
@for (p of stock(); track p.id) { <tr><td>{{ p.sku }}</td><td>{{ p.nombre }}</td><td>{{ p.categoria?.nombre }}</td><td class="r">{{ p.stockActual }}</td><td class="r">{{ p.stockMinimo }}</td>
  <td>@if (p.stockActual <= p.stockMinimo) { <app-badge texto="bajo" /> } @else { <app-badge texto="ok" /> }</td></tr> }</table></div>
<h3>Movimientos recientes</h3>
<div class="tscroll"><table><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th class="r">Cant.</th><th class="r">Saldo</th><th>Responsable</th><th>Origen</th></tr>
@for (m of movs(); track m.id) { <tr><td>{{ m.fecha }}</td><td>{{ m.producto.sku }}</td><td><app-badge [texto]="m.tipo" /></td><td class="r">{{ m.cantidad }}</td><td class="r">{{ m.saldo }}</td><td>{{ m.responsable }}</td><td>{{ m.origen }}</td></tr>
} @empty { <tr><td colspan="7" class="empty">Sin movimientos</td></tr> }</table></div>` })
export class InventarioComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  stock = signal<Producto[]>([]); movs = signal<any[]>([]); aj: any = { productoId: null, tipo: 'ENTRADA', cantidad: null, motivo: '' };
  get admin() { return this.auth.hasRole('ADMIN'); }
  constructor() { this.load(); }
  load() {
    this.api.get<Producto[]>('/inventario/stock').subscribe({ next: r => this.stock.set(r), error: e => this.toast.fail(e) });
    this.api.get<any[]>('/inventario/movimientos').subscribe(r => this.movs.set(r));
  }
  ajustar() {
    this.api.post('/inventario/ajuste', this.aj).subscribe({
      next: () => { this.toast.ok('Ajuste registrado'); this.aj = { productoId: null, tipo: 'ENTRADA', cantidad: null, motivo: '' }; this.load(); }, error: e => this.toast.fail(e) });
  }
}
