package com.importastock.web;
import com.importastock.domain.Importacion;
import com.importastock.repo.ImportacionRepository;
import com.importastock.service.ImportacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/importaciones")
public class ImportacionController {
  private final ImportacionRepository repo; private final ImportacionService svc;
  public ImportacionController(ImportacionRepository r, ImportacionService s) { repo = r; svc = s; }
  @GetMapping public List<Importacion> list() { return repo.findAll(Sort.by(Sort.Direction.DESC, "id")); }
  @GetMapping("/{id}") public Importacion get(@PathVariable Long id) { return repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Importación no encontrada")); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Importacion create(@Valid @RequestBody Dtos.ImportacionReq r) { return svc.crear(r); }
}
