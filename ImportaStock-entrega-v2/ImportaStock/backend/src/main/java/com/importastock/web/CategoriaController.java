package com.importastock.web;
import com.importastock.domain.Categoria;
import com.importastock.repo.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/categorias")
public class CategoriaController {
  private final CategoriaRepository repo; private final ProductoRepository prods;
  public CategoriaController(CategoriaRepository r, ProductoRepository p) { repo = r; prods = p; }
  @GetMapping public List<Categoria> list() { return repo.findAll(); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Categoria create(@Valid @RequestBody Categoria c) { c.id = null; return repo.save(c); }
  @PutMapping("/{id}") public Categoria update(@PathVariable Long id, @Valid @RequestBody Categoria c) {
    repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada")); c.id = id; return repo.save(c); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
    if (prods.existsByCategoriaId(id)) throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: la categoría tiene productos asociados");
    repo.deleteById(id);
  }
}
