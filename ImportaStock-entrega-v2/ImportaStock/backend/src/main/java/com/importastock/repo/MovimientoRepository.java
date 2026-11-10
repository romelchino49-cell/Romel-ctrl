package com.importastock.repo;
import com.importastock.domain.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MovimientoRepository extends JpaRepository<MovimientoInventario, Long> {
  List<MovimientoInventario> findTop50ByOrderByIdDesc();
}
