package com.stocksense.repository;

import com.stocksense.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    @Query("SELECT COUNT(r) FROM Receipt r WHERE r.status = 'DRAFT'")
    long countPendingReceipts();

    @Query("SELECT r FROM Receipt r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:supplierId IS NULL OR r.supplier.id = :supplierId) AND " +
           "(:warehouseId IS NULL OR r.warehouse.id = :warehouseId) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(r.receiptNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.reference) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Receipt> filterReceipts(
            @Param("status") String status,
            @Param("supplierId") Long supplierId,
            @Param("warehouseId") Long warehouseId,
            @Param("search") String search
    );
}
