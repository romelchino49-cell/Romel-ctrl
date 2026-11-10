import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

interface Session { access_token: string; refresh_token?: string; id_token?: string; expires_at: number; }
const KEY = 'importastock.session';
const PKCE = 'importastock.pkce';
const LOOP = 'importastock.loginTries';

/**
 * Authorization Code + PKCE contra Keycloak. Ninguna contraseña pasa por la SPA.
 * Token en memoria; copia espejo en sessionStorage para sobrevivir un F5 (nunca localStorage).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private session: Session | null = null;
  private refreshing: Promise<boolean> | null = null;
  /** Mensaje cuando se detiene un bucle de inicio de sesión (lo muestra AppComponent). */
  loginError = signal<string | null>(null);
  private cfg = environment.keycloak;
  private oidc = `${this.cfg.url}/realms/${this.cfg.realm}/protocol/openid-connect`;
  private redirect = window.location.origin + '/';

  /** APP_INITIALIZER: procesa el retorno de Keycloak (?code=) o restaura la sesión espejo. */
  async init(): Promise<void> {
    const q = new URLSearchParams(window.location.search);
    const code = q.get('code'), state = q.get('state');
    if (code && state) {
      const saved = sessionStorage.getItem(PKCE);
      sessionStorage.removeItem(PKCE);
      let path = '/';
      if (saved) {
        const p = JSON.parse(saved); path = p.path || '/';
        if (p.state === state) {
          try {
            await this.fetchToken(new URLSearchParams({ grant_type: 'authorization_code', client_id: this.cfg.clientId, code, redirect_uri: this.redirect, code_verifier: p.verifier }));
          } catch { this.clear(); }
        }
      }
      history.replaceState({}, '', path);
    } else {
      const raw = sessionStorage.getItem(KEY);
      if (raw) { try { this.session = JSON.parse(raw); } catch { this.clear(); } }
    }
  }

  get token(): string | null { return this.session?.access_token ?? null; }

  /** true si hay sesión válida; intenta renovar una vez si el token venció. */
  async ensureSession(): Promise<boolean> {
    if (!this.session) return false;
    if (this.session.expires_at - 10_000 > Date.now()) return true;
    return this.refresh();
  }

  async login(returnPath = '/'): Promise<void> {
    if (this.tooManyLogins()) {
      this.loginError.set('No se pudo validar tu sesión con el servidor: se detuvo un bucle de inicio de sesión. Comprueba que Keycloak y el backend estén activos (docker compose ps) y pulsa Reintentar.');
      return;
    }
    const verifier = this.rand(64), state = this.rand(16);
    const challenge = this.b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
    sessionStorage.setItem(PKCE, JSON.stringify({ verifier, state, path: returnPath }));
    const p = new URLSearchParams({ client_id: this.cfg.clientId, redirect_uri: this.redirect, response_type: 'code', scope: 'openid profile email',
      state, code_challenge: challenge, code_challenge_method: 'S256' });
    window.location.href = `${this.oidc}/auth?${p}`;
  }

  /** Renovación única en vuelo (evita bucles): si falla, limpia la sesión. */
  refresh(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;
    const rt = this.session?.refresh_token;
    if (!rt) { this.clear(); return Promise.resolve(false); }
    this.refreshing = this.fetchToken(new URLSearchParams({ grant_type: 'refresh_token', client_id: this.cfg.clientId, refresh_token: rt }))
      .then(() => true).catch(() => { this.clear(); return false; }).finally(() => (this.refreshing = null));
    return this.refreshing;
  }

  logout() {
    const hint = this.session?.id_token;
    this.clear();
    const p = new URLSearchParams({ client_id: this.cfg.clientId, post_logout_redirect_uri: this.redirect });
    if (hint) p.set('id_token_hint', hint);
    window.location.href = `${this.oidc}/logout?${p}`;
  }

  user(): { name: string; roles: string[] } {
    const c = this.session ? this.decode(this.session.access_token) : {};
    return { name: c.name || c.preferred_username || '', roles: c.realm_access?.roles?.filter((r: string) => ['ADMIN', 'OPERADOR', 'SUPERVISOR'].includes(r)) ?? [] };
  }
  hasRole(r: string) { return this.user().roles.includes(r); }
  hasAnyRole(rs: string[]) { return rs.some(r => this.hasRole(r)); }

  /** Limpia todo y vuelve a empezar desde cero. */
  reintentar() { this.clear(); sessionStorage.removeItem(LOOP); sessionStorage.removeItem(PKCE); this.loginError.set(null); window.location.href = '/'; }

  // ---- internos ----
  private tooManyLogins(): boolean {
    const now = Date.now(); let t: number[] = [];
    try { t = JSON.parse(sessionStorage.getItem(LOOP) || '[]'); } catch { t = []; }
    t = t.filter(x => now - x < 30_000); t.push(now);
    sessionStorage.setItem(LOOP, JSON.stringify(t));
    return t.length > 3; // más de 3 redirecciones en 30 s = bucle
  }
  private async fetchToken(body: URLSearchParams) {
    const r = await fetch(`${this.oidc}/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!r.ok) throw new Error('token ' + r.status);
    const t = await r.json();
    this.session = { access_token: t.access_token, refresh_token: t.refresh_token, id_token: t.id_token, expires_at: Date.now() + t.expires_in * 1000 };
    sessionStorage.setItem(KEY, JSON.stringify(this.session));
  }
  private clear() { this.session = null; sessionStorage.removeItem(KEY); }
  private rand(n: number) { const a = new Uint8Array(n); crypto.getRandomValues(a); return this.b64url(a).slice(0, n); }
  private b64url(b: Uint8Array) { let s = ''; b.forEach(x => (s += String.fromCharCode(x))); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  private decode(t: string): any {
    try {
      const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b + '='.repeat((4 - (b.length % 4)) % 4)), c => c.charCodeAt(0))));
    } catch { return {}; }
  }
}
