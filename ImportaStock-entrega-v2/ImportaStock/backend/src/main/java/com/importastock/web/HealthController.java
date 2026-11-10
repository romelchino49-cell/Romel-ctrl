package com.importastock.web;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/** Público: sirve para comprobar que el backend está vivo (http://localhost:8082/api/health). */
@RestController
public class HealthController {
  @GetMapping("/api/health")
  public Map<String, String> health() { return Map.of("status", "UP"); }
}
