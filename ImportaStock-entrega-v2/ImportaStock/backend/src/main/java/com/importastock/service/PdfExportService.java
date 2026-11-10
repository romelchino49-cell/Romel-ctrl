package com.importastock.service;
import com.importastock.domain.*;
import com.importastock.repo.ImportacionRepository;
import com.importastock.web.ApiException;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Genera PDF de una importación (cabecera + detalle) y del conjunto de reportes. */
@Service @Transactional(readOnly = true)
public class PdfExportService {
  private static final Color AZUL = new Color(18, 53, 91), GRIS = new Color(238, 243, 250);
  private final ImportacionRepository imps; private final ReporteService reportes;
  public PdfExportService(ImportacionRepository i, ReporteService r) { imps = i; reportes = r; }

  public byte[] importacion(Long id) throws Exception {
    Importacion i = imps.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Importación no encontrada"));
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    Document d = new Document(PageSize.A4, 36, 36, 40, 40);
    PdfWriter.getInstance(d, out);
    d.open();
    d.add(new Paragraph("ImportaStock", fuente(10, false, Color.GRAY)));
    d.add(new Paragraph("Importación " + i.numero, fuente(20, true, AZUL)));
    d.add(new Paragraph(" "));
    dato(d, "Proveedor", i.proveedor.razonSocial + " (" + i.proveedor.pais + ")");
    dato(d, "Fecha de registro", String.valueOf(i.fechaRegistro));
    dato(d, "Llegada prevista", i.fechaPrevista == null ? null : i.fechaPrevista.toString());
    dato(d, "Moneda", i.moneda);
    dato(d, "Documento comercial", i.referencia);
    dato(d, "Estado", i.estado);
    dato(d, "Observaciones", i.observaciones);
    d.add(new Paragraph(" "));
    PdfPTable t = new PdfPTable(new float[] { 2, 5, 1.6f, 1.6f, 2, 2 });
    t.setWidthPercentage(100);
    for (String h : new String[] { "SKU", "Producto", "Solicitado", "Recibido", "P. unitario", "Subtotal" })
      t.addCell(celda(h, fuente(10, true, Color.WHITE), !h.equals("SKU") && !h.equals("Producto"), AZUL));
    Font normal = fuente(10, false, Color.BLACK);
    for (DetalleImportacion x : i.detalles) {
      t.addCell(celda(x.producto.sku, normal, false, null));
      t.addCell(celda(x.producto.nombre, normal, false, null));
      t.addCell(celda(String.valueOf(x.cantidadSolicitada), normal, true, null));
      t.addCell(celda(String.valueOf(x.cantidadRecibida), normal, true, null));
      t.addCell(celda(dinero(x.precioUnitario), normal, true, null));
      t.addCell(celda(dinero(x.subtotal), normal, true, null));
    }
    PdfPCell lbl = celda("Total (" + i.moneda + ")", fuente(11, true, Color.BLACK), true, GRIS);
    lbl.setColspan(5); t.addCell(lbl);
    t.addCell(celda(dinero(i.total), fuente(11, true, Color.BLACK), true, GRIS));
    d.add(t);
    d.add(new Paragraph(" "));
    d.add(new Paragraph("Generado el " + ahora() + " · ImportaStock", fuente(8, false, Color.GRAY)));
    d.close();
    return out.toByteArray();
  }

  public byte[] reportes() throws Exception {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    Document d = new Document(PageSize.A4, 36, 36, 40, 40);
    PdfWriter.getInstance(d, out);
    d.open();
    d.add(new Paragraph("ImportaStock", fuente(10, false, Color.GRAY)));
    d.add(new Paragraph("Reportes de importaciones e inventario", fuente(18, true, AZUL)));
    d.add(new Paragraph("Generado el " + ahora(), fuente(9, false, Color.GRAY)));
    d.add(new Paragraph(" "));
    seccion(d, "Importaciones por estado", reportes.porEstado());
    seccion(d, "Importaciones por proveedor", reportes.porProveedor(null));
    seccion(d, "Solicitado vs. recibido", reportes.solicitadoVsRecibido());
    seccion(d, "Recepciones pendientes", reportes.recepcionesPendientes());
    d.close();
    return out.toByteArray();
  }

  // ---------- utilidades ----------
  private static void seccion(Document d, String titulo, List<Map<String, Object>> rows) throws Exception {
    d.add(new Paragraph(titulo, fuente(13, true, AZUL)));
    d.add(new Paragraph(" ", fuente(4, false, Color.BLACK)));
    if (rows.isEmpty()) { d.add(new Paragraph("Sin datos", fuente(10, false, Color.GRAY))); d.add(new Paragraph(" ")); return; }
    List<String> keys = new ArrayList<>(rows.get(0).keySet());
    PdfPTable t = new PdfPTable(keys.size());
    t.setWidthPercentage(100);
    for (String k : keys) t.addCell(celda(titulo(k), fuente(9, true, Color.WHITE), false, AZUL));
    Font normal = fuente(9, false, Color.BLACK);
    for (Map<String, Object> m : rows)
      for (String k : keys) {
        Object v = m.get(k);
        boolean num = v instanceof Number;
        String txt = v instanceof BigDecimal b ? dinero(b) : (v == null ? "" : v.toString());
        t.addCell(celda(txt, normal, num, null));
      }
    d.add(t);
    d.add(new Paragraph(" "));
  }
  private static void dato(Document d, String k, String v) throws Exception {
    Paragraph p = new Paragraph();
    p.add(new Phrase(k + ": ", fuente(10, true, Color.DARK_GRAY)));
    p.add(new Phrase(v == null || v.isBlank() ? "—" : v, fuente(10, false, Color.BLACK)));
    d.add(p);
  }
  private static PdfPCell celda(String txt, Font f, boolean derecha, Color fondo) {
    PdfPCell c = new PdfPCell(new Phrase(txt, f)); c.setPadding(5);
    if (derecha) c.setHorizontalAlignment(Element.ALIGN_RIGHT);
    if (fondo != null) c.setBackgroundColor(fondo);
    return c;
  }
  private static Font fuente(float size, boolean bold, Color color) {
    return FontFactory.getFont(FontFactory.HELVETICA, size, bold ? Font.BOLD : Font.NORMAL, color);
  }
  private static String dinero(BigDecimal n) { return n == null ? "" : String.format(Locale.US, "%,.2f", n); }
  private static String titulo(String k) { String t = k.replaceAll("([a-z])([A-Z])", "$1 $2"); return Character.toUpperCase(t.charAt(0)) + t.substring(1); }
  private static String ahora() { return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")); }
}
