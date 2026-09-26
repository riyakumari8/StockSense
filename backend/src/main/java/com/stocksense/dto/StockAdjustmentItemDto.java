package com.stocksense.dto;

import com.stocksense.entity.StockAdjustmentItem;

public class StockAdjustmentItemDto {
    private Long id;
    private ProductDto product;
    private Integer systemQuantity;
    private Integer physicalQuantity;
    private Integer difference;

    public StockAdjustmentItemDto() {
    }

    public static StockAdjustmentItemDto fromEntity(StockAdjustmentItem item) {
        if (item == null) return null;
        StockAdjustmentItemDto dto = new StockAdjustmentItemDto();
        dto.setId(item.getId());
        dto.setProduct(ProductDto.fromEntity(item.getProduct()));
        dto.setSystemQuantity(item.getSystemQuantity());
        dto.setPhysicalQuantity(item.getPhysicalQuantity());
        dto.setDifference(item.getDifference());
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

    public Integer getSystemQuantity() {
        return systemQuantity;
    }

    public void setSystemQuantity(Integer systemQuantity) {
        this.systemQuantity = systemQuantity;
    }

    public Integer getPhysicalQuantity() {
        return physicalQuantity;
    }

    public void setPhysicalQuantity(Integer physicalQuantity) {
        this.physicalQuantity = physicalQuantity;
    }

    public Integer getDifference() {
        return difference;
    }

    public void setDifference(Integer difference) {
        this.difference = difference;
    }
}
