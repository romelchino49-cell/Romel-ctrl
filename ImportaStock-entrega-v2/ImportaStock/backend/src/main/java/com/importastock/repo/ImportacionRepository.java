package com.importastock.repo;
import com.importastock.domain.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ImportacionRepository extends JpaRepository<Importacion, Long> {
  boolean existsByProveedorId(Long id);
  boolean existsByNumero(String n);
}
