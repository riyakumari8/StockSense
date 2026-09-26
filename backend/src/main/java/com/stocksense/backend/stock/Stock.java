package com.stocksense.backend.stock;

import com.stocksense.backend.location.Location;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.LocalDateTime;

/**
 * Current on-hand quantity of one product at one location.
 *
 * <p><b>Ownership note:</b> the project spec assumes a shared {@code Stock}
 * entity, but none exists anywhere in this repository yet, so Member 4 owns
 * it for now. {@code productId} is a plain, unenforced id -- there is no
 * {@code products} table to foreign-key against. If another member
 * introduces a canonical Product/Stock model later, this table's rows can
 * be reconciled/migrated into it; nothing here creates a second source of
 * truth for products.</p>
 *
 * <p><b>Concurrency:</b> {@code quantity} is only ever mutated inside a
 * transaction that has taken a pessimistic write lock on this row (see
 * {@code StockRepository#lockByProductIdAndLocationId}), so two concurrent
 * transfers/adjustments against the same row cannot race. The
 * {@code version} column is kept as a defensive secondary guard.</p>
 */
@Entity
@Table(
        name = "stock",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "location_id"})
)
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Integration point: the Product module does not exist yet in this
     * repository. No FK constraint is enforced at the DB level (see
     * V3__create_stock_table.sql); the id is validated only for
     * non-nullness at the application layer for now.
     */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Stock() {
        // JPA
    }

    public Stock(Long productId, Location location, Integer quantity) {
        this.productId = productId;
        this.location = location;
        this.quantity = quantity != null ? quantity : 0;
    }

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public Location getLocation() {
        return location;
    }

    public Integer getQuantity() {
        return quantity;
    }

    /**
     * Package-private on purpose: quantity must only be mutated by
     * {@code StockService} inside a locked, transactional context.
     */
    void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getVersion() {
        return version;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
