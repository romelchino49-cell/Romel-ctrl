export const environment = {
  apiUrl: '/api', // mismo origen: nginx reenvía al backend
  keycloak: { url: 'http://localhost:8081', realm: 'importastock', clientId: 'importastock-spa' }
};
