@echo off
echo Deteniendo contenedores de la version de desarrollo (si existen)...
docker stop deployment-keycloak-1 deployment-keycloak-db-1 deployment-oracle-1 >nul 2>&1
docker compose up -d --build
echo.
echo App:      http://localhost:4200
echo Keycloak: http://localhost:8081  (admin / admin)
echo La primera vez tarda varios minutos; espera ~1 min a que Keycloak inicie.
echo Si algo falla, ejecuta diagnostico.bat
pause
