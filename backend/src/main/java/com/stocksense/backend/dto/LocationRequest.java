package com.stocksense.backend.dto;

import com.stocksense.backend.entity.enums.LocationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LocationRequest(
        @NotBlank(message = "Location name is required")
        String name,

        @NotBlank(message = "Location code is required")
        @Size(max = 50, message = "Location code must be at most 50 characters")
        String code,

        @NotNull(message = "Warehouse ID is required")
        Long warehouseId,

        LocationStatus status
) {}
