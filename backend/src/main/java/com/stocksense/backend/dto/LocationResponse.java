package com.stocksense.backend.dto;

import com.stocksense.backend.entity.Location;
import com.stocksense.backend.entity.enums.LocationStatus;

import java.time.LocalDateTime;

public record LocationResponse(
        Long id,
        String name,
        String code,
        Long warehouseId,
        String warehouseName,
        String warehouseCode,
        LocationStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static LocationResponse from(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getCode(),
                location.getWarehouse().getId(),
                location.getWarehouse().getName(),
                location.getWarehouse().getCode(),
                location.getStatus(),
                location.getCreatedAt(),
                location.getUpdatedAt()
        );
    }
}
