# Matriz de roles (implementada en `SecurityConfig`)
| Recurso | ADMIN | OPERADOR | SUPERVISOR |
|---|:-:|:-:|:-:|
| Consultar proveedores, categorías, productos, importaciones, recepciones, inventario, dashboard | ✔ | ✔ | ✔ |
| Crear/editar/eliminar proveedores, categorías, productos | ✔ | ✖ 403 | ✖ 403 |
| Crear importaciones | ✔ | ✖ 403 | ✖ 403 |
| Registrar recepciones | ✔ | ✔ | ✖ 403 |
| Ajustes de inventario | ✔ | ✖ 403 | ✖ 403 |
| Reportes | ✔ | ✖ 403 | ✔ |
