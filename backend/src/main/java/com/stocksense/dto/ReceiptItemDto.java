package com.stocksense.dto;

import com.stocksense.entity.ReceiptItem;
import java.math.BigDecimal;

public class ReceiptItemDto {
    private Long id;
    private ProductDto product;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;

    public ReceiptItemDto() {
    }

    public static ReceiptItemDto fromEntity(ReceiptItem item) {
        if (item == null) return null;
        ReceiptItemDto dto = new ReceiptItemDto();
        dto.setId(item.getId());
        dto.setProduct(ProductDto.fromEntity(item.getProduct()));
        dto.setQuantity(item.getQuantity());
        dto.setUnitCost(item.getUnitCost());
        if (item.getQuantity() != null && item.getUnitCost() != null) {
            dto.setTotalCost(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
        } else {
            dto.setTotalCost(BigDecimal.ZERO);
        }
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}
