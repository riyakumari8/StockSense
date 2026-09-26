package com.stocksense.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StockAdjustmentItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Physical quantity is required")
    @Min(value = 0, message = "Physical quantity cannot be negative")
    private Integer physicalQuantity;

    public StockAdjustmentItemRequest() {
    }

    public StockAdjustmentItemRequest(Long productId, Integer physicalQuantity) {
        this.productId = productId;
        this.physicalQuantity = physicalQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getPhysicalQuantity() {
        return physicalQuantity;
    }

    public void setPhysicalQuantity(Integer physicalQuantity) {
        this.physicalQuantity = physicalQuantity;
    }
}
