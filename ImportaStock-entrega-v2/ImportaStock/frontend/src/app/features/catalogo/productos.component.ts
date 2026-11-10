import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, Producto } from '../../shared/interfaces/models';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

/** CRUD dependiente: la categoria sale de GET /api/categorias y el backend valida que exista. */
@Component({ standalone: true, selector: 'app-productos', imports: [FormsModule, MoneyPipe], template: `
<h2>Catálogo de productos</h2>
@if (admin) {
<form class="card grid" #f="ngForm" (ngSubmit)="save()">
  <input name="sku" [(ngModel)]="form.sku" placeholder="SKU *" required>
  <input name="nombre" [(ngModel)]="form.nombre" placeholder="Nombre *" required>
  <select name="categoriaId" [(ngModel)]="form.categoriaId" required><option [ngValue]="null">— Categoría * —</option>
    @for (c of cats(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }</select>
  <input name="marca" [(ngModel)]="form.marca" placeholder="Marca">
  <input name="paisOrigen" [(ngModel)]="form.paisOrigen" placeholder="País de origen">
  <input name="unidad" [(ngModel)]="form.unidad" placeholder="Unidad (UND, MTS…) *" required>
  <input name="precio" type="number" min="0" step="0.01" [(ngModel)]="form.precioReferencia" placeholder="Precio ref. *" required>
  <input name="stockMinimo" type="number" min="0" [(ngModel)]="form.stockMinimo" placeholder="Stock mínimo *" required>
  <input name="descripcion" [(ngModel)]="form.descripcion" placeholder="Descripción">
  <select name="activo" [(ngModel)]="form.activo"><option [ngValue]="true">Activo</option><option [ngValue]="false">Inactivo</option></select>
  <div><button [disabled]="f.invalid">{{ form.id ? 'Actualizar' : 'Crear' }}</button> @if (form.id) { <button type="button" class="sec" (click)="reset()">Cancelar</button> }</div>
</form>}
<div class="card grid"><input [(ngModel)]="q" placeholder="Buscar por SKU o nombre"><select [(ngModel)]="catFiltro"><option [ngValue]="null">Todas las categorías</option>
  @for (c of cats(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }</select><button (click)="load()">Buscar</button></div>
<div class="tscroll"><table><tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Marca</th><th>Origen</th><th>Und.</th><th class="r">Precio ref.</th><th class="r">Mín.</th><th class="r">Stock</th><th></th></tr>
@for (p of items(); track p.id) { <tr><td>{{ p.sku }}</td><td>{{ p.nombre }}</td><td>{{ p.categoria?.nombre }}</td><td>{{ p.marca }}</td><td>{{ p.paisOrigen }}</td><td>{{ p.unidad }}</td>
  <td class="r">{{ p.precioReferencia | money }}</td><td class="r">{{ p.stockMinimo }}</td><td class="r">{{ p.stockActual }}</td>
  <td>@if (admin) { <button class="sec" (click)="edit(p)">Editar</button> <button class="del" (click)="remove(p)">Eliminar</button> }</td></tr>
} @empty { <tr><td colspan="10" class="empty">Sin productos</td></tr> }</table></div>` })
export class ProductosComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  items = signal<Producto[]>([]); cats = signal<Categoria[]>([]); q = ''; catFiltro: number | null = null; form: any = this.empty();
  get admin() { return this.auth.hasRole('ADMIN'); }
  constructor() { this.api.get<Categoria[]>('/categorias').subscribe(r => this.cats.set(r)); this.load(); }
  empty() { return { sku: '', nombre: '', categoriaId: null, marca: '', paisOrigen: '', unidad: '', precioReferencia: null, stockMinimo: 0, descripcion: '', activo: true }; }
  load() {
    const params: any = {}; if (this.q) params.q = this.q; if (this.catFiltro) params.categoriaId = this.catFiltro;
    this.api.get<Producto[]>('/productos', params).subscribe({ next: r => this.items.set(r), error: e => this.toast.fail(e) });
  }
  edit(p: Producto) { this.form = { ...p, categoriaId: p.categoria?.id }; }
  reset() { this.form = this.empty(); }
  save() {
    const r = this.form.id ? this.api.put('/productos/' + this.form.id, this.form) : this.api.post('/productos', this.form);
    r.subscribe({ next: () => { this.toast.ok('Producto guardado'); this.reset(); this.load(); }, error: e => this.toast.fail(e) });
  }
  remove(p: Producto) {
    if (!confirm('¿Eliminar ' + p.nombre + '?')) return;
    this.api.delete('/productos/' + p.id).subscribe({ next: () => { this.toast.ok('Eliminado'); this.load(); }, error: e => this.toast.fail(e) });
  }
}
