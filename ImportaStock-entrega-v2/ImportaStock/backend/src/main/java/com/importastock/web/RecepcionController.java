package com.importastock.web;
import com.importastock.domain.Recepcion;
import com.importastock.repo.RecepcionRepository;
import com.importastock.service.RecepcionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/recepciones")
public class RecepcionController {
  private final RecepcionRepository repo; private final RecepcionService svc;
  public RecepcionController(RecepcionRepository r, RecepcionService s) { repo = r; svc = s; }
  @GetMapping public List<Recepcion> list() { return repo.findAll(Sort.by(Sort.Direction.DESC, "id")); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Recepcion create(@Valid @RequestBody Dtos.RecepcionReq r, Authentication a) { return svc.registrar(r, a.getName()); }
}
