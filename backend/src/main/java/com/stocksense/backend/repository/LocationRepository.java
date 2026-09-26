package com.stocksense.backend.repository;

import com.stocksense.backend.entity.Location;
import com.stocksense.backend.entity.enums.LocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByWarehouseId(Long warehouseId);

    List<Location> findByWarehouseIdAndStatus(Long warehouseId, LocationStatus status);

    boolean existsByWarehouseIdAndCode(Long warehouseId, String code);

    boolean existsByWarehouseIdAndCodeAndIdNot(Long warehouseId, String code, Long id);

    @Query("SELECT l FROM Location l JOIN FETCH l.warehouse WHERE l.id = :id")
    Optional<Location> findByIdWithWarehouse(Long id);

    @Query("SELECT l FROM Location l JOIN FETCH l.warehouse")
    List<Location> findAllWithWarehouse();

    @Query("SELECT l FROM Location l JOIN FETCH l.warehouse WHERE l.warehouse.id = :warehouseId")
    List<Location> findByWarehouseIdWithWarehouse(Long warehouseId);
}
