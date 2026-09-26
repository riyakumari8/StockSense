package com.stocksense.backend.transfer;

import com.stocksense.backend.location.Location;
import com.stocksense.backend.warehouse.Warehouse;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Moves a quantity of one product from a source location to a destination
 * location. Does not change total inventory. See {@code TransferService}
 * (Phase 3) for the transactional validate workflow.
 *
 * <p>{@code productId}, {@code createdBy} and {@code validatedBy} are
 * integration-point ids -- the Product and User modules do not exist in
 * this repository yet.</p>
 */
@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 30)
    private String referenceNumber;

    /** Integration point: Product module does not exist yet. */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_warehouse_id", nullable = false)
    private Warehouse sourceWarehouse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_location_id", nullable = false)
    private Location sourceLocation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_warehouse_id", nullable = false)
    private Warehouse destinationWarehouse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransferStatus status = TransferStatus.DRAFT;

    @Column(length = 1000)
    private String remarks;

    /** Integration point: User module does not exist yet. */
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Integration point: User module does not exist yet. */
    @Column(name = "validated_by")
    private Long validatedBy;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    protected Transfer() {
        // JPA
    }

    public Transfer(String referenceNumber, Long productId, Warehouse sourceWarehouse,
                     Location sourceLocation, Warehouse destinationWarehouse,
                     Location destinationLocation, Integer quantity, String remarks,
                     Long createdBy) {
        this.referenceNumber = referenceNumber;
        this.productId = productId;
        this.sourceWarehouse = sourceWarehouse;
        this.sourceLocation = sourceLocation;
        this.destinationWarehouse = destinationWarehouse;
        this.destinationLocation = destinationLocation;
        this.quantity = quantity;
        this.remarks = remarks;
        this.createdBy = createdBy;
        this.status = TransferStatus.DRAFT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void markDone(Long validatedBy) {
        this.status = TransferStatus.DONE;
        this.validatedBy = validatedBy;
        this.validatedAt = LocalDateTime.now();
    }

    public void markCancelled() {
        this.status = TransferStatus.CANCELLED;
    }

    public Long getId() {
        return id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public Long getProductId() {
        return productId;
    }

    public Warehouse getSourceWarehouse() {
        return sourceWarehouse;
    }

    public Location getSourceLocation() {
        return sourceLocation;
    }

    public Warehouse getDestinationWarehouse() {
        return destinationWarehouse;
    }

    public Location getDestinationLocation() {
        return destinationLocation;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getValidatedBy() {
        return validatedBy;
    }

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }
}
