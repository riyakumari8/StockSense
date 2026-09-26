package com.stocksense.dto;

import com.stocksense.entity.StockLedger;
import java.time.LocalDateTime;

public class StockLedgerDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityChange;
    private String movementType;
    private String reference;
    private String description;
    private Integer previousStock;
    private Integer newStock;
    private LocalDateTime timestamp;

    public StockLedgerDto() {
    }

    public static StockLedgerDto fromEntity(StockLedger ledger) {
        if (ledger == null) return null;
        StockLedgerDto dto = new StockLedgerDto();
        dto.setId(ledger.getId());
        dto.setQuantityChange(ledger.getQuantityChange());
        dto.setMovementType(ledger.getMovementType());
        dto.setReference(ledger.getReference());
        dto.setDescription(ledger.getDescription());
        dto.setPreviousStock(ledger.getPreviousStock());
        dto.setNewStock(ledger.getNewStock());
        dto.setTimestamp(ledger.getTimestamp());

        if (ledger.getProduct() != null) {
            dto.setProductId(ledger.getProduct().getId());
            dto.setProductName(ledger.getProduct().getName());
            dto.setProductSku(ledger.getProduct().getSku());
        }
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

    public String getMovementType() {
        return movementType;
    }

    public void setMovementType(String movementType) {
        this.movementType = movementType;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPreviousStock() {
        return previousStock;
    }

    public void setPreviousStock(Integer previousStock) {
        this.previousStock = previousStock;
    }

    public Integer getNewStock() {
        return newStock;
    }

    public void setNewStock(Integer newStock) {
        this.newStock = newStock;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
