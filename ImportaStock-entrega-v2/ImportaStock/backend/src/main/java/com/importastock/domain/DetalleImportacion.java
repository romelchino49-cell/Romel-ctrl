package com.importastock.domain;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
/** Tabla de detalle: resuelve la relacion muchos-a-muchos Importacion <-> Producto. */
@Entity @Table(name = "detalle_importacion")
public class DetalleImportacion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @JsonIgnore @ManyToOne(optional = false) public Importacion importacion;
  @ManyToOne(optional = false) public Producto producto;
  public Integer cantidadSolicitada;
  public Integer cantidadRecibida = 0;
  @Column(precision = 14, scale = 2) public BigDecimal precioUnitario;
  @Column(precision = 14, scale = 2) public BigDecimal subtotal;
  public String observaciones;
}
