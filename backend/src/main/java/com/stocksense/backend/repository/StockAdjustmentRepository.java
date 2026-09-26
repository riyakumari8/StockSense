package com.stocksense.backend.repository;

import com.stocksense.backend.entity.StockAdjustment;
import com.stocksense.backend.entity.enums.AdjustmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    @Query("SELECT a FROM StockAdjustment a " +
            "JOIN FETCH a.product " +
            "JOIN FETCH a.warehouse " +
            "JOIN FETCH a.location " +
            "WHERE a.id = :id")
    Optional<StockAdjustment> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT a FROM StockAdjustment a " +
            "JOIN FETCH a.product " +
            "JOIN FETCH a.warehouse " +
            "JOIN FETCH a.location " +
            "WHERE (:status IS NULL OR a.status = :status) " +
            "AND (:warehouseId IS NULL OR a.warehouse.id = :warehouseId) " +
            "AND (:locationId IS NULL OR a.location.id = :locationId) " +
            "AND (:productId IS NULL OR a.product.id = :productId) " +
            "AND (:startDate IS NULL OR a.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<StockAdjustment> findAllFiltered(
            @Param("status") AdjustmentStatus status,
            @Param("warehouseId") Long warehouseId,
            @Param("locationId") Long locationId,
            @Param("productId") Long productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    long count();
}
