package com.stocksense.backend.dto;

import com.stocksense.backend.entity.enums.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarehouseRequest(
        @NotBlank(message = "Warehouse name is required")
        String name,

        @NotBlank(message = "Warehouse code is required")
        @Size(max = 50, message = "Warehouse code must be at most 50 characters")
        String code,

        String address,

        WarehouseStatus status
) {}
