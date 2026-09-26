package com.stocksense.dto;

import com.stocksense.entity.MovementType;
import com.stocksense.entity.StockLedger;

import java.time.LocalDateTime;

public class StockLedgerDto {
    private Long id;
    private ProductDto product;
    private LocationDto location;
    private MovementType movementType;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;

    public StockLedgerDto() {
    }

    public static StockLedgerDto fromEntity(StockLedger ledger) {
        if (ledger == null) return null;
        StockLedgerDto dto = new StockLedgerDto();
        dto.setId(ledger.getId());
        dto.setProduct(ProductDto.fromEntity(ledger.getProduct()));
        dto.setLocation(LocationDto.fromEntity(ledger.getLocation()));
        dto.setMovementType(ledger.getMovementType());
        dto.setQuantity(ledger.getQuantity());
        dto.setQuantityBefore(ledger.getQuantityBefore());
        dto.setQuantityAfter(ledger.getQuantityAfter());
        dto.setReferenceType(ledger.getReferenceType());
        dto.setReferenceId(ledger.getReferenceId());
        dto.setNotes(ledger.getNotes());
        dto.setPerformedBy(ledger.getPerformedBy());
        dto.setCreatedAt(ledger.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProductDto getProduct() {
        return product;
    }

    public void setProduct(ProductDto product) {
        this.product = product;
    }

    public LocationDto getLocation() {
        return location;
    }

    public void setLocation(LocationDto location) {
        this.location = location;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
        this.movementType = movementType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantityBefore() {
        return quantityBefore;
    }

    public void setQuantityBefore(Integer quantityBefore) {
        this.quantityBefore = quantityBefore;
    }

    public Integer getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(Integer quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
