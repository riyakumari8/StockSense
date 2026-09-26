package com.stocksense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class DeliveryOrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerReference;

    @NotNull(message = "Source warehouse ID is required")
    private Long sourceWarehouseId;

    @NotNull(message = "Source location ID is required")
    private Long sourceLocationId;

    private String notes;

    @NotEmpty(message = "Delivery order must contain at least one product line item")
    @Valid
    private List<DeliveryOrderItemRequest> items = new ArrayList<>();

    public DeliveryOrderRequest() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerReference() {
        return customerReference;
    }

    public void setCustomerReference(String customerReference) {
        this.customerReference = customerReference;
    }

    public Long getSourceWarehouseId() {
        return sourceWarehouseId;
    }

    public void setSourceWarehouseId(Long sourceWarehouseId) {
        this.sourceWarehouseId = sourceWarehouseId;
    }

    public Long getSourceLocationId() {
        return sourceLocationId;
    }

    public void setSourceLocationId(Long sourceLocationId) {
        this.sourceLocationId = sourceLocationId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<DeliveryOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<DeliveryOrderItemRequest> items) {
        this.items = items;
    }
}
