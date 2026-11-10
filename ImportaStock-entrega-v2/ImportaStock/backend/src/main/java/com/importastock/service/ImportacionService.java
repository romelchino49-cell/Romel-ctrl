package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.*;
import com.importastock.web.*;
import java.math.*;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImportacionService {
  private final ImportacionRepository repo; private final ProveedorRepository provs; private final ProductoRepository prods;
  public ImportacionService(ImportacionRepository r, ProveedorRepository p, ProductoRepository pr) { repo = r; provs = p; prods = pr; }

  /** Todo o nada: cualquier error revierte cabecera y detalles. Subtotales y total se recalculan aqui. */
  @Transactional
  public Importacion crear(Dtos.ImportacionReq r) {
    if (repo.existsByNumero(r.numero())) throw new ApiException(HttpStatus.CONFLICT, "Ya existe la importación " + r.numero());
    Proveedor p = provs.findById(r.proveedorId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Proveedor inexistente: " + r.proveedorId()));
    if (!p.activo) throw new ApiException(HttpStatus.BAD_REQUEST, "El proveedor está inactivo");
    if (r.fechaPrevista() != null && r.fechaPrevista().isBefore(LocalDate.now()))
      throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha prevista no puede ser anterior a hoy");
    Importacion i = new Importacion();
    i.numero = r.numero(); i.proveedor = p; i.fechaRegistro = LocalDate.now(); i.fechaPrevista = r.fechaPrevista();
    i.moneda = r.moneda(); i.referencia = r.referencia(); i.observaciones = r.observaciones(); i.estado = "REGISTRADA";
    BigDecimal total = BigDecimal.ZERO;
    for (var l : r.detalles()) {
      Producto pr = prods.findById(l.productoId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inexistente: " + l.productoId()));
      DetalleImportacion d = new DetalleImportacion();
      d.importacion = i; d.producto = pr; d.cantidadSolicitada = l.cantidad();
      d.precioUnitario = l.precioUnitario().setScale(2, RoundingMode.HALF_UP);
      d.subtotal = d.precioUnitario.multiply(BigDecimal.valueOf(l.cantidad()));
      d.observaciones = l.observaciones();
      i.detalles.add(d);
      total = total.add(d.subtotal);
    }
    i.total = total;
    return repo.save(i);
  }
}
