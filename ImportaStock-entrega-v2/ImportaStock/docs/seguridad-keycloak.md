# Seguridad con Keycloak
- Realm `importastock`, cliente público `importastock-spa`, Authorization Code + PKCE (S256), sin contraseñas en la SPA.
- Token en memoria; copia en `sessionStorage` (sobrevive F5); nunca `localStorage`.
- Interceptor: ante 401 intenta `refresh` una sola vez; si falla, limpia sesión y vuelve a Keycloak. Ante 403 muestra aviso.
- Backend: `spring-boot-starter-oauth2-resource-server` con `issuer-uri`; roles tomados de `realm_access.roles`.
- 401 = sin autenticación válida; 403 = autenticado sin permiso.
- Límites: sesión de desarrollo sobre HTTP; el access token vive 5 min; el refresh depende de la sesión SSO de Keycloak.
