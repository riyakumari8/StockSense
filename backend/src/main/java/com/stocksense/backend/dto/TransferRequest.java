package com.stocksense.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TransferRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotNull(message = "Source warehouse ID is required")
        Long sourceWarehouseId,

        @NotNull(message = "Source location ID is required")
        Long sourceLocationId,

        @NotNull(message = "Destination warehouse ID is required")
        Long destinationWarehouseId,

        @NotNull(message = "Destination location ID is required")
        Long destinationLocationId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than 0")
        Long quantity,

        String remarks
) {}
