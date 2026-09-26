package com.stocksense.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "stock_adjustment_items")
public class StockAdjustmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjustment_id", nullable = false)
    @JsonIgnore
    private StockAdjustment adjustment;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull
    @Column(name = "system_quantity", nullable = false)
    private Integer systemQuantity = 0;

    @NotNull
    @Min(value = 0, message = "Physical quantity cannot be negative")
    @Column(name = "physical_quantity", nullable = false)
    private Integer physicalQuantity = 0;

    @Column(nullable = false)
    private Integer difference = 0;

    public StockAdjustmentItem() {
    }

    public StockAdjustmentItem(Product product, Integer systemQuantity, Integer physicalQuantity) {
        this.product = product;
        this.systemQuantity = systemQuantity;
        this.physicalQuantity = physicalQuantity;
        this.difference = physicalQuantity - systemQuantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StockAdjustment getAdjustment() {
        return adjustment;
    }

    public void setAdjustment(StockAdjustment adjustment) {
        this.adjustment = adjustment;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getSystemQuantity() {
        return systemQuantity;
    }

    public void setSystemQuantity(Integer systemQuantity) {
        this.systemQuantity = systemQuantity;
        this.difference = this.physicalQuantity - this.systemQuantity;
    }

    public Integer getPhysicalQuantity() {
        return physicalQuantity;
    }

    public void setPhysicalQuantity(Integer physicalQuantity) {
        this.physicalQuantity = physicalQuantity;
        this.difference = this.physicalQuantity - this.systemQuantity;
    }

    public Integer getDifference() {
        return difference;
    }

    public void setDifference(Integer difference) {
        this.difference = difference;
    }
}
