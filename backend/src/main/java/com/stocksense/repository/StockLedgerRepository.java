package com.stocksense.repository;

import com.stocksense.entity.MovementType;
import com.stocksense.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    @Query("SELECT l FROM StockLedger l WHERE " +
           "(:productId IS NULL OR l.product.id = :productId) AND " +
           "(:locationId IS NULL OR l.location.id = :locationId) AND " +
           "(:movementType IS NULL OR l.movementType = :movementType) " +
           "ORDER BY l.createdAt DESC")
    List<StockLedger> filterLedger(
            @Param("productId") Long productId,
            @Param("locationId") Long locationId,
            @Param("movementType") MovementType movementType
    );
}
