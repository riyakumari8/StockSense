package com.stocksense.dto;

import com.stocksense.entity.AdjustmentStatus;
import com.stocksense.entity.StockAdjustment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class StockAdjustmentDto {
    private Long id;
    private String adjustmentNumber;
    private LocationDto location;
    private AdjustmentStatus status;
    private String reason;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;
    private List<StockAdjustmentItemDto> items = new ArrayList<>();

    public StockAdjustmentDto() {
    }

    public static StockAdjustmentDto fromEntity(StockAdjustment adjustment) {
        if (adjustment == null) return null;
        StockAdjustmentDto dto = new StockAdjustmentDto();
        dto.setId(adjustment.getId());
        dto.setAdjustmentNumber(adjustment.getAdjustmentNumber());
        dto.setLocation(LocationDto.fromEntity(adjustment.getLocation()));
        dto.setStatus(adjustment.getStatus());
        dto.setReason(adjustment.getReason());
        dto.setNotes(adjustment.getNotes());
        dto.setCreatedBy(adjustment.getCreatedBy());
        dto.setCreatedAt(adjustment.getCreatedAt());
        dto.setValidatedAt(adjustment.getValidatedAt());

        if (adjustment.getItems() != null) {
            dto.setItems(
                adjustment.getItems().stream()
                        .map(StockAdjustmentItemDto::fromEntity)
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

    public String getAdjustmentNumber() {
        return adjustmentNumber;
    }

    public void setAdjustmentNumber(String adjustmentNumber) {
        this.adjustmentNumber = adjustmentNumber;
    }

    public LocationDto getLocation() {
        return location;
    }

    public void setLocation(LocationDto location) {
        this.location = location;
    }

    public AdjustmentStatus getStatus() {
        return status;
    }

    public void setStatus(AdjustmentStatus status) {
        this.status = status;
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

    public List<StockAdjustmentItemDto> getItems() {
        return items;
    }

    public void setItems(List<StockAdjustmentItemDto> items) {
        this.items = items;
    }
}
