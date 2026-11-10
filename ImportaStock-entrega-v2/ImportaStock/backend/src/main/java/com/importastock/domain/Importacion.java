package com.importastock.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
@Entity @Table(name = "importacion")
public class Importacion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @Column(unique = true, nullable = false) public String numero;
  @ManyToOne(optional = false) public Proveedor proveedor;
  public LocalDate fechaRegistro;
  public LocalDate fechaPrevista;
  public String moneda;
  public String referencia;
  public String estado;
  @Column(length = 500) public String observaciones;
  @Column(precision = 14, scale = 2) public BigDecimal total;
  @OneToMany(mappedBy = "importacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  public Set<DetalleImportacion> detalles = new LinkedHashSet<>();
}
