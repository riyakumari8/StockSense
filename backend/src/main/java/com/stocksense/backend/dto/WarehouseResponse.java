package com.stocksense.backend.dto;

import com.stocksense.backend.entity.Warehouse;
import com.stocksense.backend.entity.enums.WarehouseStatus;

import java.time.LocalDateTime;

public record WarehouseResponse(
        Long id,
        String name,
        String code,
        String address,
        WarehouseStatus status,
        int locationCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WarehouseResponse from(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getName(),
                warehouse.getCode(),
                warehouse.getAddress(),
                warehouse.getStatus(),
                warehouse.getLocations() != null ? warehouse.getLocations().size() : 0,
                warehouse.getCreatedAt(),
                warehouse.getUpdatedAt()
        );
    }
}
