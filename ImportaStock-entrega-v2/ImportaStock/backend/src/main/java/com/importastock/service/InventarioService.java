package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.*;
import com.importastock.web.*;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Unica via para modificar el stock: cada cambio genera un MovimientoInventario. */
@Service
public class InventarioService {
  private final ProductoRepository prods; private final MovimientoRepository movs;
  public InventarioService(ProductoRepository p, MovimientoRepository m) { prods = p; movs = m; }

  @Transactional
  public MovimientoInventario mover(Producto p, String tipo, int cantidad, String user, String origen) {
    if (cantidad <= 0) throw new ApiException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor que cero");
    int delta = "SALIDA".equals(tipo) ? -cantidad : cantidad;
    if (p.stockActual + delta < 0)
      throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente para " + p.sku + ": disponible " + p.stockActual);
    p.stockActual += delta;
    prods.save(p);
    MovimientoInventario m = new MovimientoInventario();
    m.producto = p; m.tipo = tipo; m.cantidad = cantidad; m.saldo = p.stockActual; m.fecha = LocalDateTime.now(); m.responsable = user; m.origen = origen;
    return movs.save(m);
  }

  @Transactional
  public MovimientoInventario ajuste(Dtos.AjusteReq r, String user) {
    Producto p = prods.findById(r.productoId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inexistente"));
    return mover(p, r.tipo(), r.cantidad(), user, "AJUSTE: " + r.motivo());
  }
}
