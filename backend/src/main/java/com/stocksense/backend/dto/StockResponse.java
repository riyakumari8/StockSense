package com.stocksense.backend.dto;

import com.stocksense.backend.entity.Stock;

public record StockResponse(
        Long id,
        Long productId,
        String productName,
        String productSku,
        Long locationId,
        String locationName,
        String locationCode,
        Long warehouseId,
        String warehouseName,
        Long quantity
) {
    public static StockResponse from(Stock s) {
        return new StockResponse(
                s.getId(),
                s.getProduct().getId(),
                s.getProduct().getName(),
                s.getProduct().getSku(),
                s.getLocation().getId(),
                s.getLocation().getName(),
                s.getLocation().getCode(),
                s.getLocation().getWarehouse().getId(),
                s.getLocation().getWarehouse().getName(),
                s.getQuantity()
        );
    }
}
