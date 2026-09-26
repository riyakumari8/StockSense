package com.stocksense.backend.ledger;

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
 * One immutable row in the inventory audit trail. Every completed transfer
 * and adjustment creates exactly one of these, in the same transaction as
 * the stock mutation it describes.
 *
 * <p><b>Immutability is enforced in code, not just by convention:</b> this
 * class exposes no setters and {@code StockLedgerRepository} extends
 * neither a save-for-update path nor any delete method beyond what
 * {@code JpaRepository} provides by default -- and nothing in this module
 * ever calls {@code save} on an entity fetched from this repository, only
 * on newly constructed instances. Do not add setters here.</p>
 *
 * <p>{@code productId} and {@code performedBy} are integration-point ids --
 * the Product and User modules do not exist in this repository yet.</p>
 *
 * <p>{@code warehouseId} semantics: for a TRANSFER this is the source
 * warehouse (the single row records both legs via source/destination
 * location, so one warehouse is picked as the primary context for
 * filtering); for an ADJUSTMENT it is simply the adjustment's warehouse.</p>
 */
@Entity
@Table(name = "stock_ledger")
public class StockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_location_id")
    private Location sourceLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id")
    private Location destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    /**
     * What kind of document caused this entry (currently always mirrors
     * movementType for rows Member 4 writes: "TRANSFER" or "ADJUSTMENT").
     */
    @Column(name = "reference_type", nullable = false, length = 20)
    private String referenceType;

    /** Primary key of the Transfer or StockAdjustment that caused this entry. */
    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "resulting_quantity", nullable = false)
    private Integer resultingQuantity;

    /** Integration point: User module does not exist yet. */
    @Column(name = "performed_by")
    private Long performedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 1000)
    private String remarks;

    protected StockLedger() {
        // JPA
    }

    public StockLedger(Long productId, Warehouse warehouse, Location sourceLocation,
                        Location destinationLocation, MovementType movementType,
                        String referenceType, Long referenceId, Integer quantity,
                        Integer previousQuantity, Integer resultingQuantity,
                        Long performedBy, String remarks) {
        this.productId = productId;
        this.warehouse = warehouse;
        this.sourceLocation = sourceLocation;
        this.destinationLocation = destinationLocation;
        this.movementType = movementType;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.resultingQuantity = resultingQuantity;
        this.performedBy = performedBy;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public Location getSourceLocation() {
        return sourceLocation;
    }

    public Location getDestinationLocation() {
        return destinationLocation;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public Integer getResultingQuantity() {
        return resultingQuantity;
    }

    public Long getPerformedBy() {
        return performedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getRemarks() {
        return remarks;
    }
}
