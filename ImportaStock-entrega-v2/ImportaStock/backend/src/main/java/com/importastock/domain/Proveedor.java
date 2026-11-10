package com.importastock.domain;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name = "proveedor")
public class Proveedor {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @NotBlank @Column(unique = true, nullable = false) public String codigo;
  @NotBlank public String razonSocial;
  @NotBlank public String pais;
  public String contacto;
  @Email public String email;
  public String telefono;
  public String direccion;
  public boolean activo = true;
}
