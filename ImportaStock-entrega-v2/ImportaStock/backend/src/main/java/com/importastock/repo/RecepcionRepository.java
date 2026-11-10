package com.importastock.repo;
import com.importastock.domain.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {
  boolean existsByNumero(String n);
}
