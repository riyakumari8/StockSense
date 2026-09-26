package com.stocksense.dto;

import com.stocksense.entity.StockTransfer;
import com.stocksense.entity.TransferStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class StockTransferDto {
    private Long id;
    private String transferNumber;
    private LocationDto sourceLocation;
    private LocationDto destinationLocation;
    private TransferStatus status;
    private String reference;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
    private List<TransferItemDto> items = new ArrayList<>();

    public StockTransferDto() {
    }

    public static StockTransferDto fromEntity(StockTransfer transfer) {
        if (transfer == null) return null;
        StockTransferDto dto = new StockTransferDto();
        dto.setId(transfer.getId());
        dto.setTransferNumber(transfer.getTransferNumber());
        dto.setSourceLocation(LocationDto.fromEntity(transfer.getSourceLocation()));
        dto.setDestinationLocation(LocationDto.fromEntity(transfer.getDestinationLocation()));
        dto.setStatus(transfer.getStatus());
        dto.setReference(transfer.getReference());
        dto.setNotes(transfer.getNotes());
        dto.setCreatedBy(transfer.getCreatedBy());
        dto.setCreatedAt(transfer.getCreatedAt());
        dto.setValidatedAt(transfer.getValidatedAt());

        if (transfer.getItems() != null) {
            dto.setItems(
                transfer.getItems().stream()
                        .map(TransferItemDto::fromEntity)
                        .collect(Collectors.toList())
            );
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransferNumber() {
        return transferNumber;
    }

    public void setTransferNumber(String transferNumber) {
        this.transferNumber = transferNumber;
    }

    public LocationDto getSourceLocation() {
        return sourceLocation;
    }

    public void setSourceLocation(LocationDto sourceLocation) {
        this.sourceLocation = sourceLocation;
    }

    public LocationDto getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(LocationDto destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public void setStatus(TransferStatus status) {
        this.status = status;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }

    public List<TransferItemDto> getItems() {
        return items;
    }

    public void setItems(List<TransferItemDto> items) {
        this.items = items;
    }
}
