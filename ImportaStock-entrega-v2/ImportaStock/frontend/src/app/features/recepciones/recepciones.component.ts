import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Importacion } from '../../shared/interfaces/models';

@Component({ standalone: true, selector: 'app-recepciones', imports: [FormsModule], template: `
<h2>Recepción de mercancías</h2>
@if (puede) {
<div class="card">
  <label>Importación pendiente<select [ngModel]="selId" (ngModelChange)="elegir($event)"><option [ngValue]="null">— Seleccionar —</option>
    @for (i of imps(); track i.id) { <option [ngValue]="i.id">{{ i.numero }} · {{ i.proveedor.razonSocial }} ({{ i.estado }})</option> }</select></label>
  @if (f) {
    <p>N.º recepción: <b>{{ f.numero }}</b></p>
    <table><tr><th>Producto</th><th>Pendiente</th><th>Aceptada</th><th>Dañada</th></tr>
    @for (l of f.lineas; track l.detalleImportacionId) { <tr><td>{{ l.producto }}</td><td>{{ l.pendiente }}</td>
      <td><input type="number" min="0" [max]="l.pendiente" [(ngModel)]="l.aceptada"></td><td><input type="number" min="0" [max]="l.pendiente" [(ngModel)]="l.danada"></td></tr> }</table>
    <label>Observaciones<input [(ngModel)]="f.observaciones"></label>
    <p><button (click)="guardar()">Confirmar recepción</button></p>
  }
</div>}
<h3>Historial</h3>
<div class="tscroll"><table><tr><th>N.º</th><th>Importación</th><th>Fecha</th><th>Responsable</th><th>Líneas</th></tr>
@for (r of hist(); track r.id) { <tr><td>{{ r.numero }}</td><td>{{ r.importacion.numero }}</td><td>{{ r.fecha }}</td><td>{{ r.responsable }}</td>
  <td>@for (d of r.detalles; track d.id) { <div>{{ d.producto.sku }}: {{ d.aceptada }} ok / {{ d.danada }} dañ.</div> }</td></tr>
} @empty { <tr><td colspan="5" class="empty">Sin recepciones</td></tr> }</table></div>` })
export class RecepcionesComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  imps = signal<Importacion[]>([]); hist = signal<any[]>([]); selId: number | null = null; f: any = null;
  get puede() { return this.auth.hasAnyRole(['ADMIN', 'OPERADOR']); }
  constructor() { this.load(); }
  load() {
    this.api.get<Importacion[]>('/importaciones').subscribe(r => this.imps.set(r.filter(i => i.estado !== 'COMPLETA')));
    this.api.get<any[]>('/recepciones').subscribe(r => this.hist.set(r));
  }
  elegir(id: number | null) {
    this.selId = id; const i = this.imps().find(x => x.id === id);
    // El numero se genera una vez: si se reintenta la confirmacion, el backend lo rechaza y no duplica stock.
    this.f = i ? { numero: 'REC-' + Date.now().toString().slice(-7), importacionId: i.id, observaciones: '',
      lineas: i.detalles.map(d => ({ detalleImportacionId: d.id, producto: d.producto.nombre, pendiente: d.cantidadSolicitada - d.cantidadRecibida, aceptada: 0, danada: 0 })) } : null;
  }
  guardar() {
    const body = { numero: this.f.numero, importacionId: this.f.importacionId, observaciones: this.f.observaciones,
      lineas: this.f.lineas.filter((l: any) => l.aceptada + l.danada > 0).map((l: any) => ({ detalleImportacionId: l.detalleImportacionId, aceptada: l.aceptada, danada: l.danada })) };
    this.api.post('/recepciones', body).subscribe({
      next: () => { this.toast.ok('Recepción registrada'); this.f = null; this.selId = null; this.load(); }, error: e => this.toast.fail(e) });
  }
}
