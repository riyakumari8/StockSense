package com.stocksense.dto;

import com.stocksense.entity.MovementType;
import com.stocksense.entity.StockLedger;
import java.time.LocalDateTime;

public class StockLedgerDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityChange;
    private Integer previousQuantity;
    private Integer resultingQuantity;
    private MovementType movementType;
    private String reference;
    private LocalDateTime createdAt;
    private String remarks;

    public StockLedgerDto() {
    }

    public static StockLedgerDto fromEntity(StockLedger ledger) {
        if (ledger == null) return null;
        StockLedgerDto dto = new StockLedgerDto();
        dto.setId(ledger.getId());
        if (ledger.getProduct() != null) {
            dto.setProductId(ledger.getProduct().getId());
            dto.setProductName(ledger.getProduct().getName());
            dto.setProductSku(ledger.getProduct().getSku());
        }
        dto.setQuantityChange(ledger.getQuantityChange());
        dto.setPreviousQuantity(ledger.getPreviousQuantity());
        dto.setResultingQuantity(ledger.getResultingQuantity());
        dto.setMovementType(ledger.getMovementType());
        dto.setReference(ledger.getReference());
        dto.setCreatedAt(ledger.getCreatedAt());
        dto.setRemarks(ledger.getRemarks());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(Integer previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public Integer getResultingQuantity() {
        return resultingQuantity;
    }

    public void setResultingQuantity(Integer resultingQuantity) {
        this.resultingQuantity = resultingQuantity;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
        this.movementType = movementType;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
