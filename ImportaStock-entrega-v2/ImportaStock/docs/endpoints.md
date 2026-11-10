# Endpoints (todos bajo `/api`, Bearer obligatorio)
| Método | Ruta | Descripción |
|---|---|---|
| GET/POST/PUT/DELETE | `/proveedores[/{id}]` | CRUD independiente |
| GET/POST/PUT/DELETE | `/categorias[/{id}]` | Maestro de categorías |
| GET/POST/PUT/DELETE | `/productos[/{id}]` (`?q=&categoriaId=`) | CRUD dependiente (categoría) |
| GET/POST | `/importaciones` , GET `/importaciones/{id}` | Cabecera–detalle |
| GET/POST | `/recepciones` | Recepción parcial/total, genera ENTRADA |
| GET | `/inventario/stock`, `/inventario/movimientos` | Existencias e historial |
| POST | `/inventario/ajuste` | Ajuste autorizado (ADMIN) |
| GET | `/importaciones/export/excel` , `/importaciones/{id}/pdf` | Descargas de importaciones (cualquier rol) |
| GET | `/reportes/export/excel` , `/reportes/export/pdf` | Descargas de reportes (ADMIN, SUPERVISOR) |
| GET | `/dashboard` | Indicadores |
| GET | `/reportes/importaciones-por-estado`, `/importaciones-por-proveedor?estado=`, `/solicitado-vs-recibido`, `/recepciones-pendientes` | Reportes |
