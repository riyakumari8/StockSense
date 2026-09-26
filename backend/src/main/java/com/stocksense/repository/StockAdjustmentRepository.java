package com.stocksense.repository;

import com.stocksense.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    Optional<StockAdjustment> findByAdjustmentNumber(String adjustmentNumber);

    @Query("SELECT COUNT(a) FROM StockAdjustment a WHERE a.status = 'DRAFT'")
    long countPendingAdjustments();
}
