# ImportaStock — Demo LP2 Unidad 2
SPA única (Angular) conectada al backend Spring Boot, con identidad en Keycloak (realm `importastock`).

**Dominio:** proveedores internacionales, catálogo (categoría → producto), importaciones (cabecera–detalle), recepciones, inventario y reportes.

## Guion de demo (8 pasos)
1. Abrir `http://localhost:4200` sin sesión → redirige a Keycloak (authGuard, PKCE).
2. Entrar como `admin1` y luego como `operador1`: el menú y los botones difieren.
3. **CRUD independiente:** Proveedores (crear, editar, eliminar; eliminar uno con importaciones → 409).
4. **CRUD dependiente:** Productos con categoría desde `GET /api/categorias`; probar categoría inexistente (rechazo 400).
5. **Cabecera–detalle:** Importaciones → varias líneas, subtotales, resumen y confirmación (`POST /api/importaciones`).
6. Validación: cantidad 0 / producto inexistente → rechazo sin persistencia parcial.
7. **Reporte agregado:** Reportes → importaciones por estado y solicitado vs. recibido (`supervisor1`).
8. **403:** como `operador1`, intentar `POST /api/proveedores` (curl con su token) → 403.
