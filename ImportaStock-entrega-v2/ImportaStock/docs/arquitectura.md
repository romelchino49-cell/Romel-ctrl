# Arquitectura
```
SPA Angular (core · shared · features) --PKCE--> Keycloak (realm importastock, Postgres)
        | Bearer token
        v
Spring Boot único (resource server, valida issuer-uri) --> Oracle (H2 modo Oracle en dev)
```
- `core/auth`: `AuthService` (PKCE, sesión en memoria + espejo en `sessionStorage`).
- `core/guards`: `authGuard`, `rolGuard`. `core/interceptors`: Bearer + un solo reintento ante 401.
- **Cabecera–detalle:** `DetalleImportacion` resuelve el muchos-a-muchos Importación↔Producto.
- **Transacciones:** `ImportacionService.crear` es `@Transactional` y recalcula subtotales/total en el servidor.
- **Inventario:** solo `InventarioService.mover` cambia stock y siempre genera un `MovimientoInventario`; las salidas no pueden dejar stock negativo.
- **Recepciones idempotentes:** el número de recepción es único; reintentar devuelve 409 sin duplicar stock.
