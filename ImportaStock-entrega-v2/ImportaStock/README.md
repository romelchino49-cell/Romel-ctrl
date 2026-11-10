# ImportaStock v2 — Gestión de almacén de productos importados (LP2 · Unidad 2)

SPA Angular 18 + Spring Boot 3.3 + Keycloak 25 (Authorization Code + PKCE) + Oracle/H2. Los datos son de **demostración**.

## Ejecutar en cualquier máquina (solo requiere Docker Desktop)
1. Instala y abre **Docker Desktop** (espera a que diga "Engine running").
2. Descomprime el proyecto, abre una terminal en esta carpeta y ejecuta:
   ```
   docker compose up -d --build
   ```
   (en Windows también sirve hacer doble clic en `iniciar.bat`).
3. La **primera vez tarda varios minutos** (descarga imágenes y compila; necesita internet). Espera ~1 minuto más a que Keycloak inicie.
4. Abre **http://localhost:4200** e inicia sesión.

| Servicio | URL |
|---|---|
| Aplicación (SPA) | http://localhost:4200 |
| Keycloak (admin / admin) | http://localhost:8081 |
| API directa (pruebas con curl) | http://localhost:8082/api |

Puertos que deben estar libres: **4200, 8081, 8082**. Usa siempre `localhost` en el navegador (el login PKCE necesita contexto seguro).

## Usuarios de prueba (solo demo)
| Usuario | Contraseña | Rol |
|---|---|---|
| admin1 | Admin123! | ADMIN |
| operador1 | Operador123! | OPERADOR |
| supervisor1 | Supervisor123! | SUPERVISOR |

## Base de datos
- **Por defecto** (`BACKEND_PROFILE=dev` en `.env`): H2 en memoria con datos de demostración; se reinician al reiniciar el backend.
- **Con Oracle** (datos persistentes): cambia `.env` a `BACKEND_PROFILE=oracle` y ejecuta `docker compose --profile oracle up -d --build`. La primera vez Oracle tarda varios minutos y el backend reintenta solo hasta que esté listo (necesita ~2 GB de RAM libre). Oracle queda en el puerto 1522 (usuario/clave `importastock`).
- Script de particionamiento: `database/particionamiento-oracle.sql`.

## Comandos útiles
```
docker compose ps                  # estado de los servicios
docker compose logs -f backend     # ver el log del backend
docker compose down                # detener
docker compose down -v             # detener y borrar la base de Keycloak (reinicio limpio)
```

## Entregar sin internet (opcional)
En la máquina con internet: `docker compose build` y luego
`docker save -o imagenes.tar importastock-backend importastock-frontend postgres:16 quay.io/keycloak/keycloak:25.0.6`.
En la otra máquina: `docker load -i imagenes.tar` y `docker compose up -d`.

## Estructura
```
backend/     Spring Boot (domain, repo, service, web, config) + Dockerfile
frontend/    Angular: core/{auth,guards,interceptors,layout,services}, shared/, features/ + Dockerfile + nginx.conf
deployment/  realm de Keycloak (y compose de desarrollo)
database/    script de particionamiento Oracle
docs/        MkDocs (mkdocs.yml en la raíz)
```

## Desarrollo sin Docker (opcional)
Keycloak: `cd deployment && docker compose up -d` · Backend: `cd backend && mvn spring-boot:run` · Frontend: `cd frontend && npm install && npm start`.

## Limitaciones conocidas
- Pensado para usarse en una sola máquina vía `localhost` (para otra dirección habría que cambiar el hostname de Keycloak y las URI del realm).
- El esquema lo crea Hibernate; sin Flyway ni paginación en listados.
- Credenciales de demostración; en producción usar HTTPS y secretos propios.
- Resultados de pruebas: ver `docs/pruebas.md` (pendientes de registrar por el equipo).

## Solución de problemas
| Síntoma | Causa probable y solución |
|---|---|
| La pantalla parpadea o aparece "No se pudo iniciar la sesión" | El backend rechaza el token. Ejecuta `diagnostico.bat`: debe haber **un solo** Keycloak en el 8081 (`importastock-keycloak-1`). Si aparece `deployment-keycloak-1`, ejecuta `docker stop deployment-keycloak-1 deployment-keycloak-db-1 deployment-oracle-1`, reinicia con `docker compose up -d` y entra en una ventana de incógnito. |
| "Cargando panel…" sin fin | Keycloak o el backend no están activos: `docker compose ps -a` y `docker compose logs --tail 60 backend`. |
| `port is already allocated` (8081, 1522) | Otro contenedor usa el puerto: `docker ps` y `docker stop <nombre>`. |
| Token viejo tras recrear Keycloak | Pulsa **Salir** o usa ventana de incógnito. |

## Cambios de la v2
- **Corregido el bucle de login** (parpadeo): un segundo 401 ya no redirige a Keycloak sin fin; se muestra el error. Además se detiene cualquier bucle tras 3 redirecciones en 30 s y se ofrece "Reintentar".
- El backend valida el token con **timeouts cortos** (3 s / 5 s) y falla rápido si Keycloak no responde, en lugar de quedarse "pending".
- Nuevo endpoint público `GET /api/health` para comprobar que el backend está vivo.
- Servicios con `restart: unless-stopped` (se recuperan solos si Keycloak arranca tarde).
- `iniciar.bat`/`iniciar.sh` detienen los contenedores de la versión de desarrollo que bloquean el puerto 8081; nuevo `diagnostico.bat`.
