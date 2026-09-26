package com.stocksense.backend.dto;

import com.stocksense.backend.entity.Transfer;
import com.stocksense.backend.entity.enums.TransferStatus;

import java.time.LocalDateTime;

public record TransferResponse(
        Long id,
        String referenceNumber,
        Long productId,
        String productName,
        String productSku,
        Long sourceWarehouseId,
        String sourceWarehouseName,
        Long sourceLocationId,
        String sourceLocationName,
        Long destinationWarehouseId,
        String destinationWarehouseName,
        Long destinationLocationId,
        String destinationLocationName,
        Long quantity,
        TransferStatus status,
        String remarks,
        String createdBy,
        LocalDateTime createdAt,
        String validatedBy,
        LocalDateTime validatedAt
) {
    public static TransferResponse from(Transfer t) {
        return new TransferResponse(
                t.getId(),
                t.getReferenceNumber(),
                t.getProduct().getId(),
                t.getProduct().getName(),
                t.getProduct().getSku(),
                t.getSourceWarehouse().getId(),
                t.getSourceWarehouse().getName(),
                t.getSourceLocation().getId(),
                t.getSourceLocation().getName(),
                t.getDestinationWarehouse().getId(),
                t.getDestinationWarehouse().getName(),
                t.getDestinationLocation().getId(),
                t.getDestinationLocation().getName(),
                t.getQuantity(),
                t.getStatus(),
                t.getRemarks(),
                t.getCreatedBy(),
                t.getCreatedAt(),
                t.getValidatedBy(),
                t.getValidatedAt()
        );
    }
}
