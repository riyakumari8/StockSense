package com.stocksense.repository;

import com.stocksense.entity.StockTransfer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    @Query("SELECT COUNT(t) FROM StockTransfer t WHERE t.status = 'DRAFT'")
    long countPendingTransfers();

    @Query("SELECT t FROM StockTransfer t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:locationId IS NULL OR t.sourceLocation.id = :locationId OR t.destinationLocation.id = :locationId)")
    List<StockTransfer> filterTransfers(@Param("status") String status, @Param("locationId") Long locationId);
}
