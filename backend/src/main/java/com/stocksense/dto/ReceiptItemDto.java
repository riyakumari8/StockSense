package com.stocksense.dto;

import com.stocksense.entity.ReceiptItem;
import java.math.BigDecimal;

public class ReceiptItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String categoryName;
    private String unitOfMeasure;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public ReceiptItemDto() {
    }

    public static ReceiptItemDto fromEntity(ReceiptItem item) {
        if (item == null) return null;
        ReceiptItemDto dto = new ReceiptItemDto();
        dto.setId(item.getId());
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setProductSku(item.getProduct().getSku());
            if (item.getProduct().getCategory() != null) {
                dto.setCategoryName(item.getProduct().getCategory().getName());
            }
            dto.setUnitOfMeasure(item.getProduct().getUnitOfMeasure());
        }
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        if (item.getUnitPrice() != null && item.getQuantity() != null) {
            dto.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        } else {
            dto.setSubtotal(BigDecimal.ZERO);
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(String unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
