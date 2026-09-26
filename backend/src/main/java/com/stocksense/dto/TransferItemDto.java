package com.stocksense.dto;

import com.stocksense.entity.TransferItem;

public class TransferItemDto {
    private Long id;
    private ProductDto product;
    private Integer quantity;

    public TransferItemDto() {
    }

    public static TransferItemDto fromEntity(TransferItem item) {
        if (item == null) return null;
        TransferItemDto dto = new TransferItemDto();
        dto.setId(item.getId());
        dto.setProduct(ProductDto.fromEntity(item.getProduct()));
        dto.setQuantity(item.getQuantity());
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
}
