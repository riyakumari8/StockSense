package com.stocksense.backend.repository;

import com.stocksense.backend.entity.Stock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    @Query("SELECT s FROM Stock s JOIN FETCH s.product JOIN FETCH s.location l JOIN FETCH l.warehouse WHERE s.product.id = :productId AND s.location.id = :locationId")
    Optional<Stock> findByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    /**
     * Pessimistic write lock for transfer/adjustment operations.
     * Prevents concurrent modifications to the same stock row.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Stock s WHERE s.product.id = :productId AND s.location.id = :locationId")
    Optional<Stock> findByProductIdAndLocationIdForUpdate(@Param("productId") Long productId, @Param("locationId") Long locationId);

    @Query("SELECT s FROM Stock s JOIN FETCH s.product JOIN FETCH s.location l JOIN FETCH l.warehouse WHERE s.location.id = :locationId")
    List<Stock> findByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT s FROM Stock s JOIN FETCH s.product JOIN FETCH s.location l JOIN FETCH l.warehouse WHERE l.warehouse.id = :warehouseId")
    List<Stock> findByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT s FROM Stock s JOIN FETCH s.product JOIN FETCH s.location l JOIN FETCH l.warehouse WHERE s.product.id = :productId")
    List<Stock> findByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM Stock s WHERE s.location.id = :locationId")
    Long sumQuantityByLocationId(@Param("locationId") Long locationId);
}
