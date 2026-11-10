package com.importastock.web;
import com.importastock.service.ReporteService;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api")
public class ReporteController {
  private final ReporteService svc;
  public ReporteController(ReporteService s) { svc = s; }
  @GetMapping("/dashboard") public Map<String, Object> dashboard() { return svc.dashboard(); }
  @GetMapping("/reportes/importaciones-por-estado") public List<Map<String, Object>> porEstado() { return svc.porEstado(); }
  @GetMapping("/reportes/importaciones-por-proveedor") public List<Map<String, Object>> porProveedor(@RequestParam(required = false) String estado) { return svc.porProveedor(estado); }
  @GetMapping("/reportes/solicitado-vs-recibido") public List<Map<String, Object>> sol() { return svc.solicitadoVsRecibido(); }
  @GetMapping("/reportes/recepciones-pendientes") public List<Map<String, Object>> pend() { return svc.recepcionesPendientes(); }
}
