package com.importastock.web;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class Dtos {
  public record ProductoReq(@NotBlank String sku, @NotBlank String nombre, String descripcion, @NotNull Long categoriaId, String marca,
      String paisOrigen, @NotBlank String unidad, @NotNull @DecimalMin("0.0") BigDecimal precioReferencia, @NotNull @Min(0) Integer stockMinimo, Boolean activo) {}
  public record LineaImportacionReq(@NotNull Long productoId, @NotNull @Min(1) Integer cantidad, @NotNull @DecimalMin("0.01") BigDecimal precioUnitario, String observaciones) {}
  public record ImportacionReq(@NotBlank String numero, @NotNull Long proveedorId, LocalDate fechaPrevista, @NotBlank @Pattern(regexp = "USD|EUR|CNY|PEN") String moneda,
      String referencia, String observaciones, @NotEmpty @Valid List<LineaImportacionReq> detalles) {}
  public record LineaRecepcionReq(@NotNull Long detalleImportacionId, @NotNull @Min(0) Integer aceptada, @NotNull @Min(0) Integer danada) {}
  public record RecepcionReq(@NotBlank String numero, @NotNull Long importacionId, String observaciones, @NotEmpty @Valid List<LineaRecepcionReq> lineas) {}
  public record AjusteReq(@NotNull Long productoId, @NotBlank @Pattern(regexp = "ENTRADA|SALIDA") String tipo, @NotNull @Min(1) Integer cantidad, @NotBlank String motivo) {}
}
