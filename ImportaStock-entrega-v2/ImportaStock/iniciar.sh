#!/bin/sh
docker stop deployment-keycloak-1 deployment-keycloak-db-1 deployment-oracle-1 >/dev/null 2>&1
docker compose up -d --build
echo "App: http://localhost:4200  |  Keycloak: http://localhost:8081 (admin/admin)"
