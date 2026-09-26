package com.stocksense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class DeliveryRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotEmpty(message = "Delivery must contain at least one item")
    @Valid
    private List<DeliveryItemRequest> items = new ArrayList<>();

    public DeliveryRequest() {
    }

    public DeliveryRequest(String customerName, List<DeliveryItemRequest> items) {
        this.customerName = customerName;
        this.items = items;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public List<DeliveryItemRequest> getItems() {
        return items;
    }

    public void setItems(List<DeliveryItemRequest> items) {
        this.items = items;
    }
}
