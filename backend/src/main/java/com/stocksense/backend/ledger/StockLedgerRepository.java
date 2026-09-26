package com.stocksense.backend.ledger;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Intentionally exposes only reads plus the {@code save} inherited from
 * {@link JpaRepository} (used exclusively to insert brand-new rows -- see
 * the class comment on {@link StockLedger}). No bespoke update/delete query
 * is defined here; do not add one.
 */
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    @Query("""
            select l from StockLedger l
            where (:productId is null or l.productId = :productId)
              and (:warehouseId is null or l.warehouse.id = :warehouseId)
              and (:locationId is null or l.sourceLocation.id = :locationId or l.destinationLocation.id = :locationId)
              and (:movementType is null or l.movementType = :movementType)
              and (:startDate is null or l.createdAt >= :startDate)
              and (:endDate is null or l.createdAt <= :endDate)
            """)
    Page<StockLedger> search(@Param("productId") Long productId,
                              @Param("warehouseId") Long warehouseId,
                              @Param("locationId") Long locationId,
                              @Param("movementType") MovementType movementType,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate,
                              Pageable pageable);
}
