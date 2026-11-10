import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ToastService {
  msg = signal<{ kind: string; text: string } | null>(null);
  private t: any;
  ok(text: string) { this.show('ok', text); }
  error(text: string) { this.show('err', text); }
  /** Muestra el mensaje del backend; el 403 ya lo notifica el interceptor. */
  fail(e: any) {
    if (e?.status === 403) return;
    if (e?.status === 401) { this.error('El servidor rechazó tu sesión (401). Cierra sesión y vuelve a entrar; si persiste, revisa que Keycloak y el backend estén activos.'); return; }
    if (e?.error instanceof Blob) { // errores de descargas llegan como Blob
      e.error.text().then((t: string) => { let m = 'Error al generar el archivo'; try { m = JSON.parse(t).message ?? m; } catch {} this.error(m); });
      return;
    }
    this.error(e?.error?.message ?? 'Error inesperado (' + (e?.status || 'sin conexión') + ')');
  }
  private show(kind: string, text: string) { this.msg.set({ kind, text }); clearTimeout(this.t); this.t = setTimeout(() => this.msg.set(null), 5000); }
}
