package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly = true)
public class ReporteService {
  private final ImportacionRepository imps; private final ProductoRepository prods; private final MovimientoRepository movs;
  public ReporteService(ImportacionRepository i, ProductoRepository p, MovimientoRepository m) { imps = i; prods = p; movs = m; }

  private static Map<String, Object> row(Object... kv) { Map<String, Object> m = new LinkedHashMap<>(); for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]); return m; }
  private static BigDecimal sum(Collection<Importacion> c) { return c.stream().map(x -> x.total).reduce(BigDecimal.ZERO, BigDecimal::add); }

  public List<Map<String, Object>> porEstado() {
    return imps.findAll().stream().collect(Collectors.groupingBy(i -> i.estado, TreeMap::new, Collectors.toList()))
        .entrySet().stream().map(e -> row("estado", e.getKey(), "cantidad", e.getValue().size(), "total", sum(e.getValue()))).toList();
  }
  public List<Map<String, Object>> porProveedor(String estado) {
    return imps.findAll().stream().filter(i -> estado == null || estado.isBlank() || i.estado.equals(estado))
        .collect(Collectors.groupingBy(i -> i.proveedor.razonSocial, TreeMap::new, Collectors.toList()))
        .entrySet().stream().map(e -> row("proveedor", e.getKey(), "cantidad", e.getValue().size(), "total", sum(e.getValue()))).toList();
  }
  public List<Map<String, Object>> solicitadoVsRecibido() {
    List<Map<String, Object>> out = new ArrayList<>();
    for (Importacion i : imps.findAll()) for (DetalleImportacion d : i.detalles)
      out.add(row("importacion", i.numero, "sku", d.producto.sku, "producto", d.producto.nombre, "solicitado", d.cantidadSolicitada,
          "recibido", d.cantidadRecibida, "pendiente", d.cantidadSolicitada - d.cantidadRecibida));
    return out;
  }
  public List<Map<String, Object>> recepcionesPendientes() {
    return imps.findAll().stream().filter(i -> !"COMPLETA".equals(i.estado)).map(i -> row("importacion", i.numero, "proveedor", i.proveedor.razonSocial,
        "estado", i.estado, "fechaPrevista", i.fechaPrevista,
        "unidadesPendientes", i.detalles.stream().mapToInt(d -> d.cantidadSolicitada - d.cantidadRecibida).sum())).toList();
  }
  public Map<String, Object> dashboard() {
    List<Producto> ps = prods.findAll(); List<Importacion> is = imps.findAll();
    return row("productos", ps.size(),
        "unidades", ps.stream().mapToInt(p -> p.stockActual).sum(),
        "importacionesEnCurso", is.stream().filter(i -> !"COMPLETA".equals(i.estado)).count(),
        "pendientesRecepcion", is.stream().filter(i -> "REGISTRADA".equals(i.estado)).count(),
        "stockBajo", ps.stream().filter(p -> p.stockActual <= p.stockMinimo).map(p -> row("sku", p.sku, "nombre", p.nombre, "stock", p.stockActual, "minimo", p.stockMinimo)).toList(),
        "movimientosRecientes", movs.findTop50ByOrderByIdDesc().stream().limit(8).map(m -> row("fecha", m.fecha, "producto", m.producto.nombre, "tipo", m.tipo, "cantidad", m.cantidad, "origen", m.origen)).toList(),
        "porCategoria", ps.stream().collect(Collectors.groupingBy(p -> p.categoria.nombre, TreeMap::new, Collectors.summingInt(p -> p.stockActual)))
            .entrySet().stream().map(e -> row("categoria", e.getKey(), "unidades", e.getValue())).toList(),
        "porEstado", porEstado());
  }
}
