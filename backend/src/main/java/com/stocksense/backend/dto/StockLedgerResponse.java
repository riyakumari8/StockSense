package com.stocksense.backend.dto;

import com.stocksense.backend.entity.StockLedger;
import com.stocksense.backend.entity.enums.MovementType;

import java.time.LocalDateTime;

public record StockLedgerResponse(
        Long id,
        Long productId,
        String productName,
        String productSku,
        Long warehouseId,
        String warehouseName,
        Long sourceLocationId,
        String sourceLocationName,
        Long destinationLocationId,
        String destinationLocationName,
        MovementType movementType,
        String referenceType,
        Long referenceId,
        Long quantity,
        Long previousQuantity,
        Long resultingQuantity,
        String performedBy,
        LocalDateTime createdAt,
        String remarks
) {
    public static StockLedgerResponse from(StockLedger l) {
        return new StockLedgerResponse(
                l.getId(),
                l.getProduct().getId(),
                l.getProduct().getName(),
                l.getProduct().getSku(),
                l.getWarehouse().getId(),
                l.getWarehouse().getName(),
                l.getSourceLocation() != null ? l.getSourceLocation().getId() : null,
                l.getSourceLocation() != null ? l.getSourceLocation().getName() : null,
                l.getDestinationLocation() != null ? l.getDestinationLocation().getId() : null,
                l.getDestinationLocation() != null ? l.getDestinationLocation().getName() : null,
                l.getMovementType(),
                l.getReferenceType(),
                l.getReferenceId(),
                l.getQuantity(),
                l.getPreviousQuantity(),
                l.getResultingQuantity(),
                l.getPerformedBy(),
                l.getCreatedAt(),
                l.getRemarks()
        );
    }
}
