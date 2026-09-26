package com.stocksense.backend.adjustment;

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
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * Reconciles system quantity with a physical count for one product at one
 * location. {@code difference} is always {@code physicalQuantity -
 * systemQuantity}, computed by the service layer -- callers never supply it
 * directly.
 *
 * <p>{@code productId}, {@code createdBy} and {@code approvedBy} are
 * integration-point ids -- the Product and User modules do not exist in
 * this repository yet.</p>
 */
@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 30)
    private String referenceNumber;

    /** Integration point: Product module does not exist yet. */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "system_quantity", nullable = false)
    private Integer systemQuantity;

    @Column(name = "physical_quantity", nullable = false)
    private Integer physicalQuantity;

    @Column(nullable = false)
    private Integer difference;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AdjustmentStatus status = AdjustmentStatus.DRAFT;

    /** Integration point: User module does not exist yet. */
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Integration point: User module does not exist yet. */
    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    protected StockAdjustment() {
        // JPA
    }

    public StockAdjustment(String referenceNumber, Long productId, Warehouse warehouse,
                            Location location, Integer systemQuantity, Integer physicalQuantity,
                            String reason, Long createdBy) {
        this.referenceNumber = referenceNumber;
        this.productId = productId;
        this.warehouse = warehouse;
        this.location = location;
        this.systemQuantity = systemQuantity;
        this.physicalQuantity = physicalQuantity;
        this.difference = physicalQuantity - systemQuantity;
        this.reason = reason;
        this.createdBy = createdBy;
        this.status = AdjustmentStatus.DRAFT;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void markDone(Long approvedBy) {
        this.status = AdjustmentStatus.DONE;
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
    }

    public void markCancelled() {
        this.status = AdjustmentStatus.CANCELLED;
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

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public Location getLocation() {
        return location;
    }

    public Integer getSystemQuantity() {
        return systemQuantity;
    }

    public Integer getPhysicalQuantity() {
        return physicalQuantity;
    }

    public Integer getDifference() {
        return difference;
    }

    public String getReason() {
        return reason;
    }

    public AdjustmentStatus getStatus() {
        return status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }
}
