import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({ standalone: true, selector: 'app-reportes', imports: [FormsModule, MoneyPipe], template: `
<h2>Consultas y reportes</h2>
<p><button (click)="descargar('excel')">⬇ Descargar Excel</button> <button class="sec" (click)="descargar('pdf')">⬇ Descargar PDF</button></p>
<div class="card"><h3>Importaciones por estado (agregado)</h3>
<table><tr><th>Estado</th><th class="r">Importaciones</th><th class="r">Total</th></tr>
@for (r of estado(); track r.estado) { <tr><td>{{ r.estado }}</td><td class="r">{{ r.cantidad }}</td><td class="r">{{ r.total | money }}</td></tr> } @empty { <tr><td colspan="3" class="empty">Sin datos</td></tr> }</table></div>
<div class="card"><h3>Importaciones por proveedor</h3>
<p><select [(ngModel)]="filtro" (ngModelChange)="cargarProv()"><option value="">Todos los estados</option><option>REGISTRADA</option><option>PARCIAL</option><option>COMPLETA</option></select></p>
<table><tr><th>Proveedor</th><th class="r">Importaciones</th><th class="r">Total</th></tr>
@for (r of prov(); track r.proveedor) { <tr><td>{{ r.proveedor }}</td><td class="r">{{ r.cantidad }}</td><td class="r">{{ r.total | money }}</td></tr> } @empty { <tr><td colspan="3" class="empty">Sin datos</td></tr> }</table></div>
<div class="card"><h3>Solicitado vs. recibido</h3><div class="tscroll">
<table><tr><th>Importación</th><th>SKU</th><th>Producto</th><th class="r">Solicitado</th><th class="r">Recibido</th><th class="r">Pendiente</th></tr>
@for (r of sol(); track $index) { <tr><td>{{ r.importacion }}</td><td>{{ r.sku }}</td><td>{{ r.producto }}</td><td class="r">{{ r.solicitado }}</td><td class="r">{{ r.recibido }}</td><td class="r">{{ r.pendiente }}</td></tr> } @empty { <tr><td colspan="6" class="empty">Sin datos</td></tr> }</table></div></div>
<div class="card"><h3>Recepciones pendientes</h3>
<table><tr><th>Importación</th><th>Proveedor</th><th>Estado</th><th>Prevista</th><th class="r">Unid. pendientes</th></tr>
@for (r of pend(); track r.importacion) { <tr><td>{{ r.importacion }}</td><td>{{ r.proveedor }}</td><td>{{ r.estado }}</td><td>{{ r.fechaPrevista }}</td><td class="r">{{ r.unidadesPendientes }}</td></tr> } @empty { <tr><td colspan="5" class="empty">Nada pendiente</td></tr> }</table></div>` })
export class ReportesComponent {
  private api = inject(ApiService); private toast = inject(ToastService);
  estado = signal<any[]>([]); prov = signal<any[]>([]); sol = signal<any[]>([]); pend = signal<any[]>([]); filtro = '';
  constructor() {
    const h = (s: any) => ({ next: (r: any) => s.set(r), error: (e: any) => this.toast.fail(e) });
    this.api.get<any[]>('/reportes/importaciones-por-estado').subscribe(h(this.estado));
    this.api.get<any[]>('/reportes/solicitado-vs-recibido').subscribe(h(this.sol));
    this.api.get<any[]>('/reportes/recepciones-pendientes').subscribe(h(this.pend));
    this.cargarProv();
  }
  descargar(tipo: 'excel' | 'pdf') { this.api.download('/reportes/export/' + tipo, tipo === 'excel' ? 'reportes.xlsx' : 'reportes.pdf').subscribe({ error: e => this.toast.fail(e) }); }
  cargarProv() { this.api.get<any[]>('/reportes/importaciones-por-proveedor', this.filtro ? { estado: this.filtro } : {}).subscribe({ next: r => this.prov.set(r), error: e => this.toast.fail(e) }); }
}
