package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.*;
import com.importastock.web.*;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecepcionService {
  private final RecepcionRepository repo; private final ImportacionRepository imps; private final InventarioService inv;
  public RecepcionService(RecepcionRepository r, ImportacionRepository i, InventarioService v) { repo = r; imps = i; inv = v; }

  @Transactional
  public Recepcion registrar(Dtos.RecepcionReq r, String user) {
    // Idempotencia: reintentar el mismo numero NO vuelve a sumar stock.
    if (repo.existsByNumero(r.numero()))
      throw new ApiException(HttpStatus.CONFLICT, "La recepción " + r.numero() + " ya fue registrada; no se duplicó el stock");
    Importacion imp = imps.findById(r.importacionId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Importación inexistente"));
    if ("COMPLETA".equals(imp.estado)) throw new ApiException(HttpStatus.BAD_REQUEST, "La importación ya fue recibida por completo");
    Recepcion rec = new Recepcion();
    rec.numero = r.numero(); rec.importacion = imp; rec.fecha = LocalDateTime.now(); rec.responsable = user; rec.observaciones = r.observaciones();
    for (var l : r.lineas()) {
      DetalleImportacion d = imp.detalles.stream().filter(x -> x.id.equals(l.detalleImportacionId())).findFirst()
          .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "La línea " + l.detalleImportacionId() + " no pertenece a la importación"));
      int total = l.aceptada() + l.danada();
      int pendiente = d.cantidadSolicitada - d.cantidadRecibida;
      if (total <= 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Cantidad recibida inválida para " + d.producto.sku);
      if (total > pendiente) throw new ApiException(HttpStatus.BAD_REQUEST, "Se recibe más de lo pendiente para " + d.producto.sku + " (pendiente " + pendiente + ")");
      d.cantidadRecibida += total;
      DetalleRecepcion dr = new DetalleRecepcion();
      dr.recepcion = rec; dr.producto = d.producto; dr.detalleImportacionId = d.id; dr.aceptada = l.aceptada(); dr.danada = l.danada();
      rec.detalles.add(dr);
      if (l.aceptada() > 0) inv.mover(d.producto, "ENTRADA", l.aceptada(), user, "RECEPCION " + r.numero());
    }
    boolean completa = imp.detalles.stream().allMatch(x -> x.cantidadRecibida >= x.cantidadSolicitada);
    imp.estado = completa ? "COMPLETA" : "PARCIAL";
    imps.save(imp);
    return repo.save(rec);
  }
}
