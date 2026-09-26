package com.stocksense.dto;

import com.stocksense.entity.DeliveryItem;
import com.stocksense.entity.Product;
import java.math.BigDecimal;

public class DeliveryItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String productBarcode;
    private String unitOfMeasure;
    private BigDecimal salesPrice;
    private BigDecimal subtotal;
    private Integer quantity;
    private Integer currentStock;
    private boolean sufficientStock;

    public DeliveryItemDto() {
    }

    public static DeliveryItemDto fromEntity(DeliveryItem item) {
        if (item == null) return null;
        DeliveryItemDto dto = new DeliveryItemDto();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());

        Product product = item.getProduct();
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSku(product.getSku());
            dto.setProductBarcode(product.getBarcode());
            dto.setUnitOfMeasure(product.getUnitOfMeasure());
            dto.setSalesPrice(product.getSalesPrice());
            dto.setCurrentStock(product.getQuantityOnHand());
            dto.setSufficientStock(product.getQuantityOnHand() >= item.getQuantity());

            if (product.getSalesPrice() != null && item.getQuantity() != null) {
                dto.setSubtotal(product.getSalesPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            } else {
                dto.setSubtotal(BigDecimal.ZERO);
            }
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

    public String getProductBarcode() {
        return productBarcode;
    }

    public void setProductBarcode(String productBarcode) {
        this.productBarcode = productBarcode;
    }

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(String unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public BigDecimal getSalesPrice() {
        return salesPrice;
    }

    public void setSalesPrice(BigDecimal salesPrice) {
        this.salesPrice = salesPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public boolean isSufficientStock() {
        return sufficientStock;
    }

    public void setSufficientStock(boolean sufficientStock) {
        this.sufficientStock = sufficientStock;
    }
}
