package com.importastock.domain;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
@Entity @Table(name = "categoria")
public class Categoria {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @NotBlank @Column(unique = true, nullable = false) public String nombre;
  public String descripcion;
}
