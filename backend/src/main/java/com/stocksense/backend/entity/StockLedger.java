package com.stocksense.backend.entity;

import com.stocksense.backend.entity.enums.MovementType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ledger", indexes = {
        @Index(name = "idx_ledger_product_id", columnList = "product_id"),
        @Index(name = "idx_ledger_warehouse_id", columnList = "warehouse_id"),
        @Index(name = "idx_ledger_created_at", columnList = "createdAt"),
        @Index(name = "idx_ledger_movement_type", columnList = "movementType")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_location_id")
    private Location sourceLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id")
    private Location destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementType movementType;

    @Column(nullable = false, length = 20)
    private String referenceType;

    @Column(nullable = false)
    private Long referenceId;

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private Long previousQuantity;

    @Column(nullable = false)
    private Long resultingQuantity;

    @Column(length = 255)
    private String performedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
