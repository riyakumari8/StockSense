package com.stocksense.dto;

import com.stocksense.entity.Receipt;
import com.stocksense.entity.ReceiptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ReceiptDto {
    private Long id;
    private String receiptNumber;
    private SupplierDto supplier;
    private WarehouseDto warehouse;
    private LocationDto destinationLocation;
    private ReceiptStatus status;
    private String reference;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
    private BigDecimal totalValue = BigDecimal.ZERO;
    private List<ReceiptItemDto> items = new ArrayList<>();

    public ReceiptDto() {
    }

    public static ReceiptDto fromEntity(Receipt receipt) {
        if (receipt == null) return null;
        ReceiptDto dto = new ReceiptDto();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setSupplier(SupplierDto.fromEntity(receipt.getSupplier()));
        dto.setWarehouse(WarehouseDto.fromEntity(receipt.getWarehouse()));
        dto.setDestinationLocation(LocationDto.fromEntity(receipt.getDestinationLocation()));
        dto.setStatus(receipt.getStatus());
        dto.setReference(receipt.getReference());
        dto.setNotes(receipt.getNotes());
        dto.setCreatedBy(receipt.getCreatedBy());
        dto.setCreatedAt(receipt.getCreatedAt());
        dto.setValidatedAt(receipt.getValidatedAt());

        BigDecimal total = BigDecimal.ZERO;
        if (receipt.getItems() != null) {
            List<ReceiptItemDto> itemDtos = receipt.getItems().stream()
                    .map(ReceiptItemDto::fromEntity)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
            for (ReceiptItemDto item : itemDtos) {
                if (item.getTotalCost() != null) {
                    total = total.add(item.getTotalCost());
                }
            }
        }
        dto.setTotalValue(total);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public SupplierDto getSupplier() {
        return supplier;
    }

    public void setSupplier(SupplierDto supplier) {
        this.supplier = supplier;
    }

    public WarehouseDto getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(WarehouseDto warehouse) {
        this.warehouse = warehouse;
    }

    public LocationDto getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(LocationDto destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public ReceiptStatus getStatus() {
        return status;
    }

    public void setStatus(ReceiptStatus status) {
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

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public List<ReceiptItemDto> getItems() {
        return items;
    }

    public void setItems(List<ReceiptItemDto> items) {
        this.items = items;
    }
}
