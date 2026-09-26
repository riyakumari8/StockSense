package com.stocksense.repository;

import com.stocksense.entity.Receipt;
import com.stocksense.entity.ReceiptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    Boolean existsByReceiptNumber(String receiptNumber);

    long countBySupplierId(Long supplierId);

    Optional<Receipt> findTopByOrderByIdDesc();

    @Query("SELECT r FROM Receipt r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:supplierId IS NULL OR r.supplier.id = :supplierId) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(r.receiptNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.supplier.supplierName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<Receipt> filterReceipts(
            @Param("search") String search,
            @Param("status") ReceiptStatus status,
            @Param("supplierId") Long supplierId
    );
}
