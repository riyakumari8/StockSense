package com.stocksense.backend.repository;

import com.stocksense.backend.entity.Warehouse;
import com.stocksense.backend.entity.enums.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    Optional<Warehouse> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Warehouse> findByStatus(WarehouseStatus status);

    @Query("SELECT w FROM Warehouse w LEFT JOIN FETCH w.locations WHERE w.id = :id")
    Optional<Warehouse> findByIdWithLocations(Long id);

    @Query("SELECT w FROM Warehouse w LEFT JOIN FETCH w.locations")
    List<Warehouse> findAllWithLocations();
}
