import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria } from '../../shared/interfaces/models';

@Component({ standalone: true, selector: 'app-categorias', imports: [FormsModule], template: `
<h2>Categorías</h2>
@if (admin) {
<form class="card grid" #f="ngForm" (ngSubmit)="save()">
  <input name="nombre" [(ngModel)]="form.nombre" placeholder="Nombre *" required>
  <input name="descripcion" [(ngModel)]="form.descripcion" placeholder="Descripción">
  <div><button [disabled]="f.invalid">{{ form.id ? 'Actualizar' : 'Crear' }}</button> @if (form.id) { <button type="button" class="sec" (click)="reset()">Cancelar</button> }</div>
</form>}
<table><tr><th>Nombre</th><th>Descripción</th><th></th></tr>
@for (c of items(); track c.id) { <tr><td>{{ c.nombre }}</td><td>{{ c.descripcion }}</td>
  <td>@if (admin) { <button class="sec" (click)="edit(c)">Editar</button> <button class="del" (click)="remove(c)">Eliminar</button> }</td></tr>
} @empty { <tr><td colspan="3" class="empty">Sin categorías</td></tr> }</table>` })
export class CategoriasComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  items = signal<Categoria[]>([]); form: any = {};
  get admin() { return this.auth.hasRole('ADMIN'); }
  constructor() { this.load(); }
  edit(c: Categoria) { this.form = { ...c }; }
  reset() { this.form = {}; }
  load() { this.api.get<Categoria[]>('/categorias').subscribe({ next: r => this.items.set(r), error: e => this.toast.fail(e) }); }
  save() {
    const r = this.form.id ? this.api.put('/categorias/' + this.form.id, this.form) : this.api.post('/categorias', this.form);
    r.subscribe({ next: () => { this.toast.ok('Categoría guardada'); this.form = {}; this.load(); }, error: e => this.toast.fail(e) });
  }
  remove(c: Categoria) {
    if (!confirm('¿Eliminar ' + c.nombre + '?')) return;
    this.api.delete('/categorias/' + c.id).subscribe({ next: () => { this.toast.ok('Eliminada'); this.load(); }, error: e => this.toast.fail(e) });
  }
}
