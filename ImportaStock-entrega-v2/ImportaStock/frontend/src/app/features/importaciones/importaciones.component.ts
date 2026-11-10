import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Importacion, Producto, Proveedor } from '../../shared/interfaces/models';
import { BadgeComponent } from '../../shared/components/badge.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

/** Formulario transaccional Importacion–DetalleImportacion. El backend recalcula subtotales y total. */
@Component({ standalone: true, selector: 'app-importaciones', imports: [FormsModule, BadgeComponent, MoneyPipe], template: `
<h2>Importaciones</h2>
<p>@if (admin && !nuevo) { <button (click)="abrir()">+ Nueva importación</button> } <button class="sec" (click)="excel()">⬇ Exportar a Excel</button></p>
@if (nuevo) {
<div class="card">
  <h3>Cabecera</h3>
  <div class="grid">
    <label>N.º importación<input [(ngModel)]="f.numero"></label>
    <label>Proveedor *<select [(ngModel)]="f.proveedorId"><option [ngValue]="null">— Seleccionar —</option>@for (p of provs(); track p.id) { <option [ngValue]="p.id">{{ p.razonSocial }}</option> }</select></label>
    <label>Llegada prevista<input type="date" [(ngModel)]="f.fechaPrevista"></label>
    <label>Moneda *<select [(ngModel)]="f.moneda"><option>USD</option><option>EUR</option><option>CNY</option><option>PEN</option></select></label>
    <label>Documento comercial<input [(ngModel)]="f.referencia"></label>
    <label>Observaciones<input [(ngModel)]="f.observaciones"></label>
  </div>
  <h3>Detalle</h3>
  <table><tr><th>Producto *</th><th>Cantidad *</th><th>Precio unit. *</th><th class="r">Subtotal</th><th></th></tr>
  @for (l of f.detalles; track $index) {
    <tr><td><select [ngModel]="l.productoId" (ngModelChange)="l.productoId = $event; onProducto(l)"><option [ngValue]="null">— Producto —</option>@for (p of prods(); track p.id) { <option [ngValue]="p.id">{{ p.sku }} · {{ p.nombre }}</option> }</select></td>
    <td><input type="number" min="1" [(ngModel)]="l.cantidad"></td><td><input type="number" min="0.01" step="0.01" [(ngModel)]="l.precioUnitario"></td>
    <td class="r">{{ sub(l) | money }}</td><td><button class="sec" (click)="quitar($index)">Quitar</button></td></tr>
  }</table>
  <p><button class="sec" (click)="addLine()">+ Añadir línea</button> &nbsp; <b>Total estimado: {{ f.moneda }} {{ total() | money }}</b></p>
  @if (error()) { <p style="color:#a1281b">{{ error() }}</p> }
  @if (!resumen) { <button (click)="revisar()">Revisar resumen</button> }
  @else {
    <div class="card"><b>Resumen previo a la confirmación</b>
      <div>{{ f.numero }} · {{ nombreProv() }} · {{ f.detalles.length }} línea(s) · {{ f.moneda }} {{ total() | money }}</div>
      <button (click)="guardar()" [disabled]="saving">Confirmar y registrar</button> <button class="sec" (click)="resumen = false">Volver</button></div>
  }
  <button class="sec" (click)="nuevo = false">Cancelar</button>
</div>}
<div class="tscroll"><table><tr><th>N.º</th><th>Proveedor</th><th>Registro</th><th>Prevista</th><th>Moneda</th><th class="r">Total</th><th>Estado</th><th>Detalle</th><th></th></tr>
@for (i of lista(); track i.id) { <tr><td>{{ i.numero }}</td><td>{{ i.proveedor.razonSocial }}</td><td>{{ i.fechaRegistro }}</td><td>{{ i.fechaPrevista }}</td><td>{{ i.moneda }}</td>
  <td class="r">{{ i.total | money }}</td><td><app-badge [texto]="i.estado" /></td>
  <td>@for (d of i.detalles; track d.id) { <div>{{ d.producto.sku }} × {{ d.cantidadSolicitada }} ({{ d.cantidadRecibida }} rec.)</div> }</td>
  <td><button class="sec" (click)="pdf(i)">⬇ PDF</button></td></tr>
} @empty { <tr><td colspan="9" class="empty">Sin importaciones</td></tr> }</table></div>` })
export class ImportacionesComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  lista = signal<Importacion[]>([]); provs = signal<Proveedor[]>([]); prods = signal<Producto[]>([]); error = signal('');
  nuevo = false; resumen = false; saving = false; f: any = {};
  get admin() { return this.auth.hasRole('ADMIN'); }
  constructor() { this.load(); }
  load() { this.api.get<Importacion[]>('/importaciones').subscribe({ next: r => this.lista.set(r), error: e => this.toast.fail(e) }); }
  excel() { this.api.download('/importaciones/export/excel', 'importaciones.xlsx').subscribe({ error: e => this.toast.fail(e) }); }
  pdf(i: Importacion) { this.api.download('/importaciones/' + i.id + '/pdf', 'importacion-' + i.numero + '.pdf').subscribe({ error: e => this.toast.fail(e) }); }
  abrir() {
    this.api.get<Proveedor[]>('/proveedores').subscribe(r => this.provs.set(r.filter(p => p.activo)));
    this.api.get<Producto[]>('/productos').subscribe(r => this.prods.set(r.filter(p => p.activo)));
    this.f = { numero: 'IMP-' + Date.now().toString().slice(-6), proveedorId: null, fechaPrevista: '', moneda: 'USD', referencia: '', observaciones: '', detalles: [] };
    this.addLine(); this.nuevo = true; this.resumen = false; this.error.set('');
  }
  addLine() { this.f.detalles.push({ productoId: null, cantidad: 1, precioUnitario: 0 }); }
  quitar(i: number) { this.f.detalles.splice(i, 1); }
  onProducto(l: any) { const p = this.prods().find(x => x.id === l.productoId); if (p) l.precioUnitario = p.precioReferencia; }
  sub(l: any) { return (l.cantidad || 0) * (l.precioUnitario || 0); }
  total() { return this.f.detalles.reduce((s: number, l: any) => s + this.sub(l), 0); }
  nombreProv() { return this.provs().find(p => p.id === this.f.proveedorId)?.razonSocial; }
  revisar() {
    const d = this.f.detalles;
    if (!this.f.numero || !this.f.proveedorId) return this.error.set('Indica número y proveedor.');
    if (!d.length) return this.error.set('Añade al menos una línea.');
    if (d.some((l: any) => !l.productoId || !(l.cantidad > 0) || !(l.precioUnitario > 0))) return this.error.set('Cada línea requiere producto, cantidad > 0 y precio > 0.');
    this.error.set(''); this.resumen = true;
  }
  guardar() {
    this.saving = true;
    this.api.post('/importaciones', { ...this.f, fechaPrevista: this.f.fechaPrevista || null }).subscribe({
      next: () => { this.saving = false; this.nuevo = false; this.toast.ok('Importación registrada'); this.load(); },
      error: e => { this.saving = false; this.toast.fail(e); }
    });
  }
}
