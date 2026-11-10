# Plan de pruebas — resultados a registrar por el equipo
> Estado inicial: **PENDIENTE DE EJECUTAR**. No se han registrado resultados reales todavía.

| # | Prueba | Resultado esperado | Resultado observado | Estado |
|---|---|---|---|---|
| 1 | Entrar al dashboard sin sesión | Redirige a Keycloak | | Pendiente |
| 2 | Login `admin1` | Dashboard con nombre y rol | | Pendiente |
| 3 | CRUD proveedores | Persiste tras recargar | | Pendiente |
| 4 | Producto con categoría inexistente (curl) | 400 con mensaje | | Pendiente |
| 5 | Importación con 3 líneas | Subtotales/total correctos y persistidos | | Pendiente |
| 6 | Importación con cantidad 0 o producto inexistente | Rechazo, sin filas nuevas | | Pendiente |
| 7 | Recepción válida y reintento con el mismo número | 1 movimiento; reintento 409 | | Pendiente |
| 8 | `operador1` vs `admin1` | Permisos según matriz | | Pendiente |
| 9 | Token vencido / 401 | 1 refresh y reintento; si falla, login | | Pendiente |
| 10 | `operador1` → `POST /api/proveedores` | 403 | | Pendiente |
| 11 | Filtros de reportes vs datos | Coinciden | | Pendiente |
| 12 | Seguir el README en limpio | Sistema arranca | | Pendiente |

Ejemplo de prueba 10: obtener un token de `operador1` desde el navegador (`sessionStorage`) y ejecutar
`curl -i -X POST localhost:8080/api/proveedores -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'` → debe responder 403.
