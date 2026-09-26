package com.stocksense.dto;

import com.stocksense.entity.DeliveryOrderItem;

public class DeliveryOrderItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Integer quantity;

    public DeliveryOrderItemDto() {
    }

    public static DeliveryOrderItemDto fromEntity(DeliveryOrderItem item) {
        DeliveryOrderItemDto dto = new DeliveryOrderItemDto();
        dto.setId(item.getId());
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setSku(item.getProduct().getSku());
        }
        dto.setQuantity(item.getQuantity());
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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
