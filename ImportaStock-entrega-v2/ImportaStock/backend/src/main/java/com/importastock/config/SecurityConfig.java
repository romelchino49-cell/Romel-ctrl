package com.importastock.config;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.*;

/** Valida tokens emitidos por Keycloak. 401 sin token válido, 403 sin rol suficiente. */
@Configuration
public class SecurityConfig {
  @Value("${app.cors-origins}") String origins;

  @Bean
  SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults()).csrf(c -> c.disable())
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/reportes/**").hasAnyRole("ADMIN", "SUPERVISOR")
        .requestMatchers(HttpMethod.POST, "/api/recepciones").hasAnyRole("ADMIN", "OPERADOR")
        .requestMatchers(HttpMethod.POST, "/api/inventario/ajuste").hasRole("ADMIN")
        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "OPERADOR", "SUPERVISOR")
        .requestMatchers("/api/**").hasRole("ADMIN")
        .anyRequest().authenticated())
      .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter())));
    return http.build();
  }

  /**
   * Decodificador con timeouts cortos: si Keycloak no responde, la petición falla rápido (401)
   * en vez de quedarse "pending" ~30 s. Las claves (JWKS) se leen de jwk-set-uri si existe
   * (red interna de Docker) o de {issuer}/protocol/openid-connect/certs; el "iss" se valida contra issuer-uri.
   */
  @Bean
  JwtDecoder jwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer,
                        @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}") String jwks) {
    String uri = jwks.isBlank() ? issuer + "/protocol/openid-connect/certs" : jwks;
    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(3000);
    f.setReadTimeout(5000);
    NimbusJwtDecoder d = NimbusJwtDecoder.withJwkSetUri(uri).restOperations(new RestTemplate(f)).build();
    d.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
    return d;
  }

  JwtAuthenticationConverter converter() {
    JwtAuthenticationConverter c = new JwtAuthenticationConverter();
    c.setPrincipalClaimName("preferred_username");
    c.setJwtGrantedAuthoritiesConverter(jwt -> {
      List<GrantedAuthority> out = new ArrayList<>();
      Object ra = jwt.getClaim("realm_access");
      if (ra instanceof Map<?, ?> m && m.get("roles") instanceof Collection<?> roles)
        roles.forEach(r -> out.add(new SimpleGrantedAuthority("ROLE_" + r)));
      return out;
    });
    return c;
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of(origins.split(",")));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
