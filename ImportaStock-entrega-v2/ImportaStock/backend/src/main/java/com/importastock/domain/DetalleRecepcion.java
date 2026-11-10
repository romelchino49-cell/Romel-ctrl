package com.importastock.domain;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
@Entity @Table(name = "detalle_recepcion")
public class DetalleRecepcion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @JsonIgnore @ManyToOne(optional = false) public Recepcion recepcion;
  @ManyToOne(optional = false) public Producto producto;
  public Long detalleImportacionId;
  public Integer aceptada;
  public Integer danada;
}
