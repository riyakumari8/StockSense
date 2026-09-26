package com.stocksense.backend.dto;

import com.stocksense.backend.entity.StockAdjustment;
import com.stocksense.backend.entity.enums.AdjustmentStatus;

import java.time.LocalDateTime;

public record AdjustmentResponse(
        Long id,
        String referenceNumber,
        Long productId,
        String productName,
        String productSku,
        Long warehouseId,
        String warehouseName,
        Long locationId,
        String locationName,
        Long systemQuantity,
        Long physicalQuantity,
        Long difference,
        String reason,
        AdjustmentStatus status,
        String createdBy,
        LocalDateTime createdAt,
        String approvedBy,
        LocalDateTime approvedAt
) {
    public static AdjustmentResponse from(StockAdjustment a) {
        return new AdjustmentResponse(
                a.getId(),
                a.getReferenceNumber(),
                a.getProduct().getId(),
                a.getProduct().getName(),
                a.getProduct().getSku(),
                a.getWarehouse().getId(),
                a.getWarehouse().getName(),
                a.getLocation().getId(),
                a.getLocation().getName(),
                a.getSystemQuantity(),
                a.getPhysicalQuantity(),
                a.getDifference(),
                a.getReason(),
                a.getStatus(),
                a.getCreatedBy(),
                a.getCreatedAt(),
                a.getApprovedBy(),
                a.getApprovedAt()
        );
    }
}
