package com.importastock.web;
import com.importastock.domain.*;
import com.importastock.repo.*;
import com.importastock.service.InventarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/inventario")
public class InventarioController {
  private final ProductoRepository prods; private final MovimientoRepository movs; private final InventarioService inv;
  public InventarioController(ProductoRepository p, MovimientoRepository m, InventarioService i) { prods = p; movs = m; inv = i; }
  @GetMapping("/stock") public List<Producto> stock() { return prods.findAll(); }
  @GetMapping("/movimientos") public List<MovimientoInventario> movimientos() { return movs.findTop50ByOrderByIdDesc(); }
  @PostMapping("/ajuste") @ResponseStatus(HttpStatus.CREATED) public MovimientoInventario ajuste(@Valid @RequestBody Dtos.AjusteReq r, Authentication a) { return inv.ajuste(r, a.getName()); }
}
