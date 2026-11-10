package com.importastock.web;
import com.importastock.domain.Proveedor;
import com.importastock.repo.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/proveedores")
public class ProveedorController {
  private final ProveedorRepository repo; private final ImportacionRepository imps;
  public ProveedorController(ProveedorRepository r, ImportacionRepository i) { repo = r; imps = i; }
  @GetMapping public List<Proveedor> list() { return repo.findAll(); }
  @GetMapping("/{id}") public Proveedor get(@PathVariable Long id) { return repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Proveedor no encontrado")); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Proveedor create(@Valid @RequestBody Proveedor p) { p.id = null; return repo.save(p); }
  @PutMapping("/{id}") public Proveedor update(@PathVariable Long id, @Valid @RequestBody Proveedor p) { get(id); p.id = id; return repo.save(p); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
    get(id);
    if (imps.existsByProveedorId(id)) throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: el proveedor tiene importaciones asociadas");
    repo.deleteById(id);
  }
}
