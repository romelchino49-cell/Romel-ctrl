import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Proveedor } from '../../shared/interfaces/models';

@Component({ standalone: true, selector: 'app-proveedores', imports: [FormsModule], template: `
<h2>Proveedores internacionales</h2>
@if (admin) {
<form class="card grid" #f="ngForm" (ngSubmit)="save()">
  <input name="codigo" [(ngModel)]="form.codigo" placeholder="Código *" required>
  <input name="razonSocial" [(ngModel)]="form.razonSocial" placeholder="Razón social *" required>
  <input name="pais" [(ngModel)]="form.pais" placeholder="País *" required>
  <input name="contacto" [(ngModel)]="form.contacto" placeholder="Contacto">
  <input name="email" type="email" [(ngModel)]="form.email" placeholder="Correo">
  <input name="telefono" [(ngModel)]="form.telefono" placeholder="Teléfono">
  <input name="direccion" [(ngModel)]="form.direccion" placeholder="Dirección">
  <select name="activo" [(ngModel)]="form.activo"><option [ngValue]="true">Activo</option><option [ngValue]="false">Inactivo</option></select>
  <div><button [disabled]="f.invalid">{{ form.id ? 'Actualizar' : 'Crear' }}</button>
  @if (form.id) { <button type="button" class="sec" (click)="reset()">Cancelar</button> }</div>
</form>}
<div class="tscroll"><table><tr><th>Código</th><th>Razón social</th><th>País</th><th>Contacto</th><th>Correo</th><th>Estado</th><th></th></tr>
@for (p of items(); track p.id) {
  <tr><td>{{ p.codigo }}</td><td>{{ p.razonSocial }}</td><td>{{ p.pais }}</td><td>{{ p.contacto }}</td><td>{{ p.email }}</td><td>{{ p.activo ? 'Activo' : 'Inactivo' }}</td>
  <td>@if (admin) { <button class="sec" (click)="edit(p)">Editar</button> <button class="del" (click)="remove(p)">Eliminar</button> }</td></tr>
} @empty { <tr><td colspan="7" class="empty">Sin proveedores</td></tr> }</table></div>` })
export class ProveedoresComponent {
  private api = inject(ApiService); private toast = inject(ToastService); private auth = inject(AuthService);
  items = signal<Proveedor[]>([]); form: any = this.empty();
  get admin() { return this.auth.hasRole('ADMIN'); }
  constructor() { this.load(); }
  empty() { return { codigo: '', razonSocial: '', pais: '', contacto: '', email: '', telefono: '', direccion: '', activo: true }; }
  load() { this.api.get<Proveedor[]>('/proveedores').subscribe({ next: r => this.items.set(r), error: e => this.toast.fail(e) }); }
  edit(p: Proveedor) { this.form = { ...p }; }
  reset() { this.form = this.empty(); }
  save() {
    const r = this.form.id ? this.api.put('/proveedores/' + this.form.id, this.form) : this.api.post('/proveedores', this.form);
    r.subscribe({ next: () => { this.toast.ok('Proveedor guardado'); this.reset(); this.load(); }, error: e => this.toast.fail(e) });
  }
  remove(p: Proveedor) {
    if (!confirm('¿Eliminar ' + p.razonSocial + '?')) return;
    this.api.delete('/proveedores/' + p.id).subscribe({ next: () => { this.toast.ok('Eliminado'); this.load(); }, error: e => this.toast.fail(e) });
  }
}
