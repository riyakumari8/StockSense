package com.stocksense.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdjustmentRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotNull(message = "Warehouse ID is required")
        Long warehouseId,

        @NotNull(message = "Location ID is required")
        Long locationId,

        @NotNull(message = "Physical quantity is required")
        @Min(value = 0, message = "Physical quantity cannot be negative")
        Long physicalQuantity,

        @NotBlank(message = "Reason is required")
        String reason
) {}
