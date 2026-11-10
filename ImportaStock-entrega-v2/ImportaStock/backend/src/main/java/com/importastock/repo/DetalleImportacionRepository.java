package com.importastock.repo;
import com.importastock.domain.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DetalleImportacionRepository extends JpaRepository<DetalleImportacion, Long> {
  boolean existsByProductoId(Long id);
}
