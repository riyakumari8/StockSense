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

    List<StockLedger> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<StockLedger> findByMovementTypeOrderByCreatedAtDesc(MovementType movementType);

    List<StockLedger> findByReferenceOrderByCreatedAtDesc(String reference);

    List<StockLedger> findAllByOrderByCreatedAtDesc();

    @Query("SELECT sl FROM StockLedger sl WHERE " +
           "(:productId IS NULL OR sl.product.id = :productId) AND " +
           "(:movementType IS NULL OR sl.movementType = :movementType) " +
           "ORDER BY sl.createdAt DESC")
    List<StockLedger> filterLedger(
            @Param("productId") Long productId,
            @Param("movementType") MovementType movementType
    );
}
