import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private u = (p: string) => environment.apiUrl + p;
  get<T>(p: string, params?: any) { return this.http.get<T>(this.u(p), { params }); }
  post<T>(p: string, b: any) { return this.http.post<T>(this.u(p), b); }
  put<T>(p: string, b: any) { return this.http.put<T>(this.u(p), b); }
  delete(p: string) { return this.http.delete(this.u(p)); }
  /** Descarga un archivo con el Bearer del interceptor (un enlace directo no llevaría el token). */
  download(p: string, filename: string) {
    return this.http.get(this.u(p), { responseType: 'blob' }).pipe(tap(blob => {
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    }));
  }
}
