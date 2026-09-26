package com.stocksense.repository;

import com.stocksense.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByWarehouseId(Long warehouseId);
    Optional<Location> findByWarehouseIdAndCode(Long warehouseId, String code);
    Boolean existsByWarehouseIdAndCode(Long warehouseId, String code);
}
