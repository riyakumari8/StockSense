package com.stocksense.repository;

import com.stocksense.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {
    List<StockLedger> findAllByOrderByTimestampDesc();
    List<StockLedger> findByProductIdOrderByTimestampDesc(Long productId);
    List<StockLedger> findByReferenceOrderByTimestampDesc(String reference);
}
