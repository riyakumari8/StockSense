package com.stocksense.repository;

import com.stocksense.entity.ReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceiptItemRepository extends JpaRepository<ReceiptItem, Long> {
    List<ReceiptItem> findByReceiptId(Long receiptId);
    List<ReceiptItem> findByProductId(Long productId);
}
