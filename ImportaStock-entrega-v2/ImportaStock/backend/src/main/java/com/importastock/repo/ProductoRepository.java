package com.importastock.repo;
import com.importastock.domain.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductoRepository extends JpaRepository<Producto, Long> {
  boolean existsByCategoriaId(Long id);
  List<Producto> findByNombreContainingIgnoreCaseOrSkuContainingIgnoreCase(String n, String s);
}
