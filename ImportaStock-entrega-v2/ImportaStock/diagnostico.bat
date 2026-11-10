@echo off
docker compose ps -a
echo.
echo --- Backend (debe decir UP):
curl -s http://localhost:8082/api/health
echo.
echo --- Keycloak, realm importastock (debe mostrar "realm":"importastock"):
curl -s http://localhost:8081/realms/importastock
echo.
echo --- Contenedores que usan el puerto 8081 (solo debe haber uno, importastock-keycloak-1):
docker ps --filter "publish=8081"
echo.
echo --- Ultimas lineas del backend:
docker compose logs --tail 25 backend
pause
