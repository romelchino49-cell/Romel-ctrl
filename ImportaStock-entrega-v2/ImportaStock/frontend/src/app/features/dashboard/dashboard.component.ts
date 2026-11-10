import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

const COLORS: any = { REGISTRADA: '#2f80ed', PARCIAL: '#f2a900', COMPLETA: '#1e9e5a' };
const BARS = ['#2f80ed', '#9b51e0', '#f2994a', '#27ae60', '#eb5757', '#00a3b4'];

@Component({
  standalone: true, selector: 'app-dashboard', imports: [RouterLink],
  styles: [`
    .hero{background:linear-gradient(120deg,#12355b,#2f80ed 60%,#56ccf2);color:#fff;border-radius:14px;padding:22px 24px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:18px}
    .hero h2{margin:0;font-size:24px}.hero small{opacity:.85;text-transform:capitalize}
    .acts{display:flex;flex-wrap:wrap;gap:8px}
    .acts a{background:rgba(255,255,255,.18);color:#fff;text-decoration:none;padding:8px 14px;border-radius:20px;font-weight:600;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.35)}
    .acts a:hover{background:rgba(255,255,255,.32)}
    .kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:18px}
    .k{border-radius:14px;padding:16px;color:#fff;position:relative;overflow:hidden;box-shadow:0 6px 16px rgba(18,53,91,.15)}
    .k .ic{position:absolute;right:12px;top:8px;font-size:38px;opacity:.28}
    .k b{display:block;font-size:34px;line-height:1.1}.k span{opacity:.92}
    .k1{background:linear-gradient(135deg,#2f80ed,#1c5bb8)}.k2{background:linear-gradient(135deg,#9b51e0,#6a2fb0)}
    .k3{background:linear-gradient(135deg,#f2994a,#d9731a)}.k4{background:linear-gradient(135deg,#00a3b4,#07727f)}
    .k5{background:linear-gradient(135deg,#eb5757,#b83232)}
    .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px}
    .p{background:#fff;border:1px solid #dde3ea;border-radius:14px;padding:18px}
    .p h3{margin:0 0 14px;font-size:16px}
    .donut{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
    .lg div{display:flex;align-items:center;gap:8px;margin:5px 0}.lg i{width:12px;height:12px;border-radius:50%;display:inline-block}
    .bar{margin:10px 0}.bar .t{display:flex;justify-content:space-between;margin-bottom:4px}
    .trk{background:#eef2f7;border-radius:8px;height:12px;overflow:hidden}.fil{height:100%;border-radius:8px;transition:width .8s}
    .sb{margin:11px 0}.sb .t{display:flex;justify-content:space-between;font-size:13px}
    .tl{position:relative;margin-left:8px;border-left:2px solid #e3e9f1;padding-left:16px}
    .tl .it{position:relative;margin-bottom:14px}
    .tl .it:before{content:"";position:absolute;left:-23px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--c);border:2px solid #fff;box-shadow:0 0 0 2px var(--c)}
    .tl small{color:#6b7785;display:block}
    .ok{color:#1e9e5a;font-weight:600}.vacio{color:#6b7785;text-align:center;padding:14px}
    .gauge{display:flex;align-items:center;gap:16px}
  `],
  template: `
  <div class="hero">
    <div><small>{{ hoy }}</small><h2>¡Hola, {{ nombre() }}! 👋</h2><div>Así está tu almacén de importaciones hoy.</div></div>
    <div class="acts">
      @if (rol('ADMIN')) { <a routerLink="/importaciones">🚢 Nueva importación</a> }
      @if (rol('ADMIN') || rol('OPERADOR')) { <a routerLink="/recepciones">📥 Registrar recepción</a> }
      <a routerLink="/inventario">📦 Ver inventario</a>
      @if (rol('ADMIN') || rol('SUPERVISOR')) { <a routerLink="/reportes">📊 Reportes</a> }
      <a href="javascript:void(0)" (click)="cargar()">🔄 Actualizar</a>
    </div>
  </div>

  @if (d(); as x) {
    <div class="kp">
      <div class="k k1"><div class="ic">📦</div><b>{{ x.productos }}</b><span>Productos en catálogo</span></div>
      <div class="k k2"><div class="ic">🏬</div><b>{{ x.unidades }}</b><span>Unidades disponibles</span></div>
      <div class="k k3"><div class="ic">🚢</div><b>{{ x.importacionesEnCurso }}</b><span>Importaciones en curso</span></div>
      <div class="k k4"><div class="ic">⏳</div><b>{{ x.pendientesRecepcion }}</b><span>Pendientes de recepción</span></div>
      <div class="k k5"><div class="ic">⚠️</div><b>{{ x.stockBajo.length }}</b><span>Alertas de stock bajo</span></div>
    </div>

    <div class="g">
      <div class="p"><h3>🚢 Importaciones por estado</h3>
        @if (total() > 0) {
          <div class="donut">
            <svg width="150" height="150" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#eef2f7" stroke-width="14"/>
              @for (s of segs(); track s.estado) {
                <circle cx="50" cy="50" r="40" fill="none" [attr.stroke]="s.color" stroke-width="14"
                  [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.off" transform="rotate(-90 50 50)"/>
              }
              <text x="50" y="48" text-anchor="middle" font-size="16" font-weight="700" fill="#12355b">{{ total() }}</text>
              <text x="50" y="60" text-anchor="middle" font-size="7" fill="#6b7785">importaciones</text>
            </svg>
            <div class="lg">@for (s of segs(); track s.estado) { <div><i [style.background]="s.color"></i>{{ s.estado }} · <b>{{ s.cantidad }}</b></div> }</div>
          </div>
        } @else { <div class="vacio">🛳️ Aún no hay importaciones.<br>Registra la primera y verás el gráfico aquí.</div> }
      </div>

      <div class="p"><h3>🏷️ Existencias por categoría</h3>
        @for (c of x.porCategoria; track c.categoria; let i = $index) {
          <div class="bar"><div class="t"><span>{{ c.categoria }}</span><b>{{ c.unidades }} und.</b></div>
            <div class="trk"><div class="fil" [style.width.%]="ancho(c.unidades)" [style.background]="barra(i)"></div></div></div>
        } @empty { <div class="vacio">Sin categorías</div> }
        @if (maxCat() === 0) { <div class="vacio">Sin stock todavía: registra una recepción.</div> }
      </div>

      <div class="p"><h3>🩺 Salud del inventario</h3>
        <div class="gauge">
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" fill="none" stroke="#eef2f7" stroke-width="12"/>
            <circle cx="50" cy="50" r="36" fill="none" [attr.stroke]="salud() >= 70 ? '#1e9e5a' : salud() >= 40 ? '#f2a900' : '#eb5757'" stroke-width="12" stroke-linecap="round"
              [attr.stroke-dasharray]="saludDash()" transform="rotate(-90 50 50)"/>
            <text x="50" y="56" text-anchor="middle" font-size="20" font-weight="700" fill="#12355b">{{ salud() }}%</text>
          </svg>
          <div>Productos con stock sobre el mínimo<br><span class="ok">{{ x.productos - x.stockBajo.length }} de {{ x.productos }}</span></div>
        </div>
      </div>
    </div>

    <div class="g">
      <div class="p"><h3>⚠️ Stock bajo</h3>
        @for (p of x.stockBajo; track p.sku) {
          <div class="sb"><div class="t"><span><b>{{ p.sku }}</b> · {{ p.nombre }}</span><span>{{ p.stock }} / {{ p.minimo }}</span></div>
            <div class="trk"><div class="fil" [style.width.%]="nivel(p)" [style.background]="nivel(p) < 35 ? '#eb5757' : '#f2a900'"></div></div></div>
        } @empty { <div class="vacio ok">✅ Todo el stock está sobre el mínimo</div> }
      </div>

      <div class="p"><h3>🕒 Movimientos recientes</h3>
        <div class="tl">
          @for (m of x.movimientosRecientes; track $index) {
            <div class="it" [style.--c]="m.tipo === 'ENTRADA' ? '#1e9e5a' : '#eb5757'">
              <b>{{ m.tipo === 'ENTRADA' ? '▲' : '▼' }} {{ m.cantidad }} × {{ m.producto }}</b>
              <small>{{ fmt(m.fecha) }} · {{ m.origen }}</small></div>
          } @empty { <div class="vacio">Sin movimientos todavía</div> }
        </div>
      </div>
    </div>
  } @else { <div class="vacio">Cargando panel…</div> }`
})
export class DashboardComponent {
  private api = inject(ApiService); private auth = inject(AuthService); private toast = inject(ToastService);
  d = signal<any>(null);
  hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  constructor() { this.cargar(); }
  cargar() { this.api.get<any>('/dashboard').subscribe({ next: r => this.d.set(r), error: e => this.toast.fail(e) }); }
  nombre() { return (this.auth.user().name || '').split(' ')[0]; }
  rol(r: string) { return this.auth.hasRole(r); }
  total() { return (this.d()?.porEstado ?? []).reduce((s: number, e: any) => s + e.cantidad, 0); }
  segs() {
    const est = this.d()?.porEstado ?? [], tot = this.total(), C = 251.33; let off = 0;
    return est.map((e: any) => {
      const len = tot ? (e.cantidad / tot) * C : 0;
      const r = { estado: e.estado, cantidad: e.cantidad, color: COLORS[e.estado] || '#8a97a6', dash: `${len} ${C - len}`, off: -off };
      off += len; return r;
    });
  }
  maxCat() { return Math.max(0, ...(this.d()?.porCategoria ?? []).map((c: any) => c.unidades)); }
  ancho(u: number) { const m = this.maxCat(); return m ? Math.max(3, (u / m) * 100) : 0; }
  barra(i: number) { return BARS[i % BARS.length]; }
  nivel(p: any) { return p.minimo ? Math.min(100, (p.stock / p.minimo) * 100) : 100; }
  salud() { const x = this.d(); return x && x.productos ? Math.round(((x.productos - x.stockBajo.length) / x.productos) * 100) : 0; }
  saludDash() { const C = 226.2, l = (this.salud() / 100) * C; return `${l} ${C - l}`; }
  fmt(f: string) { return (f || '').replace('T', ' ').slice(0, 16); }
}
