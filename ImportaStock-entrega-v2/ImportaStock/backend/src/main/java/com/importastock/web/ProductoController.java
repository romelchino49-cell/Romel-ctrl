package com.importastock.web;
import com.importastock.domain.Producto;
import com.importastock.repo.*;
import com.importastock.web.Dtos.ProductoReq;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/productos")
public class ProductoController {
  private final ProductoRepository repo; private final CategoriaRepository cats; private final DetalleImportacionRepository dets;
  public ProductoController(ProductoRepository r, CategoriaRepository c, DetalleImportacionRepository d) { repo = r; cats = c; dets = d; }

  @GetMapping public List<Producto> list(@RequestParam(required = false) String q, @RequestParam(required = false) Long categoriaId) {
    List<Producto> l = (q == null || q.isBlank()) ? repo.findAll() : repo.findByNombreContainingIgnoreCaseOrSkuContainingIgnoreCase(q, q);
    return categoriaId == null ? l : l.stream().filter(p -> p.categoria.id.equals(categoriaId)).toList();
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Producto create(@Valid @RequestBody ProductoReq r) { return repo.save(apply(new Producto(), r)); }
  @PutMapping("/{id}") public Producto update(@PathVariable Long id, @Valid @RequestBody ProductoReq r) {
    return repo.save(apply(repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado")), r)); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
    if (dets.existsByProductoId(id)) throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: el producto figura en importaciones");
    repo.deleteById(id);
  }
  private Producto apply(Producto p, ProductoReq r) {
    p.categoria = cats.findById(r.categoriaId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "La categoría " + r.categoriaId() + " no existe"));
    p.sku = r.sku(); p.nombre = r.nombre(); p.descripcion = r.descripcion(); p.marca = r.marca(); p.paisOrigen = r.paisOrigen();
    p.unidad = r.unidad(); p.precioReferencia = r.precioReferencia(); p.stockMinimo = r.stockMinimo(); p.activo = r.activo() == null || r.activo();
    return p;
  }
}
