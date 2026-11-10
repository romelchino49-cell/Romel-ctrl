package com.importastock.domain;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
@Entity @Table(name = "recepcion")
public class Recepcion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @Column(unique = true, nullable = false) public String numero;
  @JsonIgnoreProperties("detalles") @ManyToOne(optional = false) public Importacion importacion;
  public LocalDateTime fecha;
  public String responsable;
  public String observaciones;
  @OneToMany(mappedBy = "recepcion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  public Set<DetalleRecepcion> detalles = new LinkedHashSet<>();
}
