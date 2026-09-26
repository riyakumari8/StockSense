package com.stocksense.backend.repository;

import com.stocksense.backend.entity.Transfer;
import com.stocksense.backend.entity.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    @Query("SELECT t FROM Transfer t " +
            "JOIN FETCH t.product " +
            "JOIN FETCH t.sourceWarehouse " +
            "JOIN FETCH t.sourceLocation " +
            "JOIN FETCH t.destinationWarehouse " +
            "JOIN FETCH t.destinationLocation " +
            "WHERE t.id = :id")
    Optional<Transfer> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT t FROM Transfer t " +
            "JOIN FETCH t.product " +
            "JOIN FETCH t.sourceWarehouse " +
            "JOIN FETCH t.sourceLocation " +
            "JOIN FETCH t.destinationWarehouse " +
            "JOIN FETCH t.destinationLocation " +
            "WHERE (:status IS NULL OR t.status = :status) " +
            "AND (:warehouseId IS NULL OR t.sourceWarehouse.id = :warehouseId OR t.destinationWarehouse.id = :warehouseId) " +
            "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR t.createdAt <= :endDate)")
    Page<Transfer> findAllFiltered(
            @Param("status") TransferStatus status,
            @Param("warehouseId") Long warehouseId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    long count();
}
