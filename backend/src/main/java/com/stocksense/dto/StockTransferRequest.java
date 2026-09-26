package com.stocksense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class StockTransferRequest {

    @NotNull(message = "Source location ID is required")
    private Long sourceLocationId;

    @NotNull(message = "Destination location ID is required")
    private Long destinationLocationId;

    private String reference;
    private String notes;

    @NotEmpty(message = "Transfer items cannot be empty")
    @Valid
    private List<TransferItemRequest> items = new ArrayList<>();

    public StockTransferRequest() {
    }

    public Long getSourceLocationId() {
        return sourceLocationId;
    }

    public void setSourceLocationId(Long sourceLocationId) {
        this.sourceLocationId = sourceLocationId;
    }

    public Long getDestinationLocationId() {
        return destinationLocationId;
    }

    public void setDestinationLocationId(Long destinationLocationId) {
        this.destinationLocationId = destinationLocationId;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<TransferItemRequest> getItems() {
        return items;
    }

    public void setItems(List<TransferItemRequest> items) {
        this.items = items;
    }
}
