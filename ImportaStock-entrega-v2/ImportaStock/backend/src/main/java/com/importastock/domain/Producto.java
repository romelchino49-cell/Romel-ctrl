package com.importastock.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name = "producto")
public class Producto {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @Column(unique = true, nullable = false) public String sku;
  @Column(nullable = false) public String nombre;
  public String descripcion;
  @ManyToOne(optional = false) public Categoria categoria;
  public String marca;
  public String paisOrigen;
  public String unidad;
  @Column(precision = 14, scale = 2) public BigDecimal precioReferencia;
  public Integer stockMinimo = 0;
  public Integer stockActual = 0;
  public boolean activo = true;
}
