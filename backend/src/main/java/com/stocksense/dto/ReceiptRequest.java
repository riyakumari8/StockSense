package com.stocksense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ReceiptRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String receiptNumber;

    private String notes;

    @NotEmpty(message = "Receipt must contain at least one product item")
    @Valid
    private List<ReceiptItemRequest> items;

    public ReceiptRequest() {
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<ReceiptItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ReceiptItemRequest> items) {
        this.items = items;
    }
}
