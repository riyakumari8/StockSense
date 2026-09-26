package com.stocksense.dto;

import com.stocksense.entity.DeliveryOrder;
import com.stocksense.entity.DeliveryStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DeliveryOrderDto {

    private Long id;
    private String deliveryNumber;
    private String customerName;
    private String customerReference;
    private WarehouseDto sourceWarehouse;
    private LocationDto sourceLocation;
    private DeliveryStatus status;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime pickedAt;
    private LocalDateTime packedAt;
    private LocalDateTime validatedAt;
    private LocalDateTime cancelledAt;
    private List<DeliveryOrderItemDto> items = new ArrayList<>();

    public DeliveryOrderDto() {
    }

    public static DeliveryOrderDto fromEntity(DeliveryOrder entity) {
        DeliveryOrderDto dto = new DeliveryOrderDto();
        dto.setId(entity.getId());
        dto.setDeliveryNumber(entity.getDeliveryNumber());
        dto.setCustomerName(entity.getCustomerName());
        dto.setCustomerReference(entity.getCustomerReference());
        if (entity.getSourceWarehouse() != null) {
            dto.setSourceWarehouse(WarehouseDto.fromEntity(entity.getSourceWarehouse()));
        }
        if (entity.getSourceLocation() != null) {
            dto.setSourceLocation(LocationDto.fromEntity(entity.getSourceLocation()));
        }
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setPickedAt(entity.getPickedAt());
        dto.setPackedAt(entity.getPackedAt());
        dto.setValidatedAt(entity.getValidatedAt());
        dto.setCancelledAt(entity.getCancelledAt());
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(DeliveryOrderItemDto::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeliveryNumber() {
        return deliveryNumber;
    }

    public void setDeliveryNumber(String deliveryNumber) {
        this.deliveryNumber = deliveryNumber;
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

    public WarehouseDto getSourceWarehouse() {
        return sourceWarehouse;
    }

    public void setSourceWarehouse(WarehouseDto sourceWarehouse) {
        this.sourceWarehouse = sourceWarehouse;
    }

    public LocationDto getSourceLocation() {
        return sourceLocation;
    }

    public void setSourceLocation(LocationDto sourceLocation) {
        this.sourceLocation = sourceLocation;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
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

    public LocalDateTime getPickedAt() {
        return pickedAt;
    }

    public void setPickedAt(LocalDateTime pickedAt) {
        this.pickedAt = pickedAt;
    }

    public LocalDateTime getPackedAt() {
        return packedAt;
    }

    public void setPackedAt(LocalDateTime packedAt) {
        this.packedAt = packedAt;
    }

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public List<DeliveryOrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<DeliveryOrderItemDto> items) {
        this.items = items;
    }
}
