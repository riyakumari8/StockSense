package com.stocksense.backend.repository;

import com.stocksense.backend.entity.StockLedger;
import com.stocksense.backend.entity.enums.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    @Query("SELECT l FROM StockLedger l " +
            "JOIN FETCH l.product " +
            "JOIN FETCH l.warehouse " +
            "LEFT JOIN FETCH l.sourceLocation " +
            "LEFT JOIN FETCH l.destinationLocation " +
            "WHERE (:productId IS NULL OR l.product.id = :productId) " +
            "AND (:warehouseId IS NULL OR l.warehouse.id = :warehouseId) " +
            "AND (:locationId IS NULL OR l.sourceLocation.id = :locationId OR l.destinationLocation.id = :locationId) " +
            "AND (:movementType IS NULL OR l.movementType = :movementType) " +
            "AND (:startDate IS NULL OR l.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR l.createdAt <= :endDate)")
    Page<StockLedger> findAllFiltered(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("locationId") Long locationId,
            @Param("movementType") MovementType movementType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}
