package com.stocksense.backend.entity;

import com.stocksense.backend.entity.enums.AdjustmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments", indexes = {
        @Index(name = "idx_adjustment_reference", columnList = "referenceNumber", unique = true),
        @Index(name = "idx_adjustment_status", columnList = "status"),
        @Index(name = "idx_adjustment_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private Long systemQuantity;

    @Column(nullable = false)
    private Long physicalQuantity;

    @Column(nullable = false)
    private Long difference;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AdjustmentStatus status = AdjustmentStatus.DRAFT;

    @Column(length = 255)
    private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 255)
    private String approvedBy;

    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = AdjustmentStatus.DRAFT;
    }
}
