package com.importastock.config;
import com.importastock.domain.*;
import com.importastock.repo.*;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Datos de DEMOSTRACION (no corresponden a una empresa real). Solo se cargan si la BD esta vacia. */
@Component
public class DataSeeder implements CommandLineRunner {
  private final CategoriaRepository cats; private final ProveedorRepository provs; private final ProductoRepository prods;
  public DataSeeder(CategoriaRepository c, ProveedorRepository p, ProductoRepository pr) { cats = c; provs = p; prods = pr; }

  @Override public void run(String... args) {
    if (cats.count() > 0 || prods.count() > 0) return;
    Categoria el = cat("Electrónica", "Dispositivos y accesorios"), tx = cat("Textil", "Telas y prendas"), he = cat("Herramientas", "Herramientas manuales y eléctricas");
    prov("PRV-001", "Shenzhen Tech Co. (DEMO)", "China", "li@demo.test"); prov("PRV-002", "Milano Tessuti S.p.A. (DEMO)", "Italia", "rossi@demo.test");
    prov("PRV-003", "Hamburg Werkzeug GmbH (DEMO)", "Alemania", "klein@demo.test");
    prod("ELE-001", "Cargador USB-C 65W", el, "VoltX", "China", "UND", "18.50", 20, 0);
    prod("ELE-002", "Auriculares inalámbricos", el, "SoundGo", "China", "UND", "32.00", 15, 0);
    prod("TEX-001", "Tela de algodón 150cm", tx, "TessuPro", "Italia", "MTS", "6.40", 100, 0);
    prod("HER-001", "Taladro percutor 800W", he, "WerkPro", "Alemania", "UND", "74.90", 10, 0);
    prod("HER-002", "Juego de llaves 40 piezas", he, "WerkPro", "Alemania", "SET", "39.00", 12, 0);
  }
  private Categoria cat(String n, String d) { Categoria c = new Categoria(); c.nombre = n; c.descripcion = d; return cats.save(c); }
  private void prov(String cod, String rs, String pais, String mail) { Proveedor p = new Proveedor(); p.codigo = cod; p.razonSocial = rs; p.pais = pais; p.email = mail; p.contacto = "Contacto demo"; provs.save(p); }
  private void prod(String sku, String n, Categoria c, String marca, String pais, String u, String precio, int min, int stock) {
    Producto p = new Producto(); p.sku = sku; p.nombre = n; p.categoria = c; p.marca = marca; p.paisOrigen = pais; p.unidad = u;
    p.precioReferencia = new BigDecimal(precio); p.stockMinimo = min; p.stockActual = stock; prods.save(p);
  }
}
