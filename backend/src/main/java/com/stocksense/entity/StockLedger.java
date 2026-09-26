package com.stocksense.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ledger", indexes = {
    @Index(name = "idx_ledger_product", columnList = "product_id"),
    @Index(name = "idx_ledger_created_at", columnList = "created_at"),
    @Index(name = "idx_ledger_movement_type", columnList = "movement_type")
})
public class StockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull
    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @NotNull
    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @NotNull
    @Column(name = "resulting_quantity", nullable = false)
    private Integer resultingQuantity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 30)
    private MovementType movementType;

    @Column(length = 50)
    private String reference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    public StockLedger() {
    }

    public StockLedger(Product product, Integer quantityChange, Integer previousQuantity, Integer resultingQuantity, MovementType movementType, String reference, String remarks) {
        this.product = product;
        this.quantityChange = quantityChange;
        this.previousQuantity = previousQuantity;
        this.resultingQuantity = resultingQuantity;
        this.movementType = movementType;
        this.reference = reference;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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
