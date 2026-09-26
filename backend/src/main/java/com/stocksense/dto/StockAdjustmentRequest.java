package com.stocksense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class StockAdjustmentRequest {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    private String reason;
    private String notes;

    @NotEmpty(message = "Adjustment items cannot be empty")
    @Valid
    private List<StockAdjustmentItemRequest> items = new ArrayList<>();

    public StockAdjustmentRequest() {
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<StockAdjustmentItemRequest> getItems() {
        return items;
    }

    public void setItems(List<StockAdjustmentItemRequest> items) {
        this.items = items;
    }
}
