package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.ImportacionRepository;
import java.io.*;
import java.math.BigDecimal;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Genera libros Excel (.xlsx) con las importaciones y los reportes. */
@Service @Transactional(readOnly = true)
public class ExcelExportService {
  private final ImportacionRepository imps; private final ReporteService reportes;
  public ExcelExportService(ImportacionRepository i, ReporteService r) { imps = i; reportes = r; }

  public byte[] importaciones() throws IOException {
    List<Importacion> lista = imps.findAll(Sort.by(Sort.Direction.DESC, "id"));
    try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      CellStyle head = estiloCabecera(wb), money = estiloDinero(wb);
      Sheet s = wb.createSheet("Importaciones");
      cabecera(s, head, "N.º", "Proveedor", "País", "Fecha registro", "Fecha prevista", "Moneda", "Referencia", "Estado", "Total");
      int r = 1;
      for (Importacion i : lista) {
        Row row = s.createRow(r++);
        texto(row, 0, i.numero); texto(row, 1, i.proveedor.razonSocial); texto(row, 2, i.proveedor.pais);
        texto(row, 3, i.fechaRegistro); texto(row, 4, i.fechaPrevista); texto(row, 5, i.moneda);
        texto(row, 6, i.referencia); texto(row, 7, i.estado); numero(row, 8, i.total, money);
      }
      Sheet d = wb.createSheet("Detalle");
      cabecera(d, head, "Importación", "SKU", "Producto", "Solicitado", "Recibido", "Precio unitario", "Subtotal");
      int k = 1;
      for (Importacion i : lista) for (DetalleImportacion x : i.detalles) {
        Row row = d.createRow(k++);
        texto(row, 0, i.numero); texto(row, 1, x.producto.sku); texto(row, 2, x.producto.nombre);
        numero(row, 3, x.cantidadSolicitada, null); numero(row, 4, x.cantidadRecibida, null);
        numero(row, 5, x.precioUnitario, money); numero(row, 6, x.subtotal, money);
      }
      wb.write(out);
      return out.toByteArray();
    }
  }

  public byte[] reportes() throws IOException {
    try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      CellStyle head = estiloCabecera(wb), money = estiloDinero(wb);
      hoja(wb, head, money, "Importaciones por estado", reportes.porEstado());
      hoja(wb, head, money, "Por proveedor", reportes.porProveedor(null));
      hoja(wb, head, money, "Solicitado vs recibido", reportes.solicitadoVsRecibido());
      hoja(wb, head, money, "Recepciones pendientes", reportes.recepcionesPendientes());
      wb.write(out);
      return out.toByteArray();
    }
  }

  // ---------- utilidades ----------
  private static void hoja(Workbook wb, CellStyle head, CellStyle money, String nombre, List<Map<String, Object>> rows) {
    Sheet s = wb.createSheet(nombre);
    if (rows.isEmpty()) { s.createRow(0).createCell(0).setCellValue("Sin datos"); return; }
    List<String> keys = new ArrayList<>(rows.get(0).keySet());
    Row h = s.createRow(0);
    for (int c = 0; c < keys.size(); c++) {
      Cell cell = h.createCell(c); cell.setCellValue(titulo(keys.get(c))); cell.setCellStyle(head); s.setColumnWidth(c, 22 * 256);
    }
    int r = 1;
    for (Map<String, Object> m : rows) {
      Row row = s.createRow(r++);
      for (int c = 0; c < keys.size(); c++) {
        Object v = m.get(keys.get(c));
        Cell cell = row.createCell(c);
        if (v instanceof BigDecimal b) { cell.setCellValue(b.doubleValue()); cell.setCellStyle(money); }
        else if (v instanceof Number n) cell.setCellValue(n.doubleValue());
        else cell.setCellValue(v == null ? "" : v.toString());
      }
    }
    s.createFreezePane(0, 1);
  }
  private static String titulo(String k) {
    String t = k.replaceAll("([a-z])([A-Z])", "$1 $2");
    return Character.toUpperCase(t.charAt(0)) + t.substring(1);
  }
  private static void cabecera(Sheet s, CellStyle head, String... cols) {
    Row h = s.createRow(0);
    for (int c = 0; c < cols.length; c++) { Cell cell = h.createCell(c); cell.setCellValue(cols[c]); cell.setCellStyle(head); s.setColumnWidth(c, 20 * 256); }
    s.createFreezePane(0, 1);
  }
  private static void texto(Row row, int c, Object o) { row.createCell(c).setCellValue(o == null ? "" : o.toString()); }
  private static void numero(Row row, int c, Number n, CellStyle st) {
    if (n == null) return;
    Cell cell = row.createCell(c); cell.setCellValue(n.doubleValue()); if (st != null) cell.setCellStyle(st);
  }
  private static CellStyle estiloCabecera(Workbook wb) {
    CellStyle st = wb.createCellStyle(); Font f = wb.createFont();
    f.setBold(true); f.setColor(IndexedColors.WHITE.getIndex()); st.setFont(f);
    st.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex()); st.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    return st;
  }
  private static CellStyle estiloDinero(Workbook wb) {
    CellStyle st = wb.createCellStyle(); st.setDataFormat(wb.createDataFormat().getFormat("#,##0.00")); return st;
  }
}
