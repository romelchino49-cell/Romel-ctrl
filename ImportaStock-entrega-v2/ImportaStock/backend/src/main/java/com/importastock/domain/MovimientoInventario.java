package com.importastock.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "movimiento_inventario")
public class MovimientoInventario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne(optional = false) public Producto producto;
  public String tipo;
  public Integer cantidad;
  public Integer saldo;
  public LocalDateTime fecha;
  public String responsable;
  public String origen;
}
