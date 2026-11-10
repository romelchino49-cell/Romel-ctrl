package com.importastock.web;
import com.importastock.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/** Descargas. Importaciones: cualquier rol autenticado (GET /api/**). Reportes: ADMIN y SUPERVISOR (GET /api/reportes/**). */
@RestController @RequestMapping("/api")
public class ExportController {
  private static final MediaType XLSX = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  private final ExcelExportService excel; private final PdfExportService pdf;
  public ExportController(ExcelExportService e, PdfExportService p) { excel = e; pdf = p; }

  @GetMapping("/importaciones/export/excel")
  public ResponseEntity<byte[]> importacionesExcel() throws Exception { return file(excel.importaciones(), XLSX, "importaciones.xlsx"); }

  @GetMapping("/importaciones/{id}/pdf")
  public ResponseEntity<byte[]> importacionPdf(@PathVariable Long id) throws Exception { return file(pdf.importacion(id), MediaType.APPLICATION_PDF, "importacion-" + id + ".pdf"); }

  @GetMapping("/reportes/export/excel")
  public ResponseEntity<byte[]> reportesExcel() throws Exception { return file(excel.reportes(), XLSX, "reportes.xlsx"); }

  @GetMapping("/reportes/export/pdf")
  public ResponseEntity<byte[]> reportesPdf() throws Exception { return file(pdf.reportes(), MediaType.APPLICATION_PDF, "reportes.pdf"); }

  private static ResponseEntity<byte[]> file(byte[] data, MediaType type, String name) {
    return ResponseEntity.ok().contentType(type)
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString()).body(data);
  }
}
