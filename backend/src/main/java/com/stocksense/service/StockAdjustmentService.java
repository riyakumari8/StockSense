package com.stocksense.service;

import com.stocksense.dto.StockAdjustmentDto;
import com.stocksense.dto.StockAdjustmentItemRequest;
import com.stocksense.dto.StockAdjustmentRequest;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final ProductStockRepository productStockRepository;
    private final StockLedgerRepository ledgerRepository;

    public StockAdjustmentService(
            StockAdjustmentRepository adjustmentRepository,
            LocationRepository locationRepository,
            ProductRepository productRepository,
            ProductStockRepository productStockRepository,
            StockLedgerRepository ledgerRepository) {
        this.adjustmentRepository = adjustmentRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.productStockRepository = productStockRepository;
        this.ledgerRepository = ledgerRepository;
    }

    public List<StockAdjustmentDto> getAllAdjustments() {
        return adjustmentRepository.findAll().stream()
                .map(StockAdjustmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public StockAdjustmentDto getAdjustmentById(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock adjustment not found with ID: " + id));
        return StockAdjustmentDto.fromEntity(adjustment);
    }

    @Transactional
    public StockAdjustmentDto createAdjustment(StockAdjustmentRequest request, String createdBy) {
        if (request.getLocationId() == null) {
            throw new IllegalArgumentException("Location ID is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Adjustment items list cannot be empty");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID: " + request.getLocationId()));

        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setAdjustmentNumber("ADJ-" + System.currentTimeMillis() % 1000000);
        adjustment.setLocation(location);
        adjustment.setStatus(AdjustmentStatus.DRAFT);
        adjustment.setReason(request.getReason());
        adjustment.setNotes(request.getNotes());
        adjustment.setCreatedBy(createdBy != null ? createdBy : "System");

        for (StockAdjustmentItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getPhysicalQuantity() == null || itemReq.getPhysicalQuantity() < 0) {
                throw new IllegalArgumentException("Invalid product or negative physical quantity");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            int sysQty = productStockRepository.findByProductIdAndLocationId(product.getId(), location.getId())
                    .map(ProductStock::getQuantity)
                    .orElse(0);

            StockAdjustmentItem item = new StockAdjustmentItem(product, sysQty, itemReq.getPhysicalQuantity());
            adjustment.addItem(item);
        }

        StockAdjustment saved = adjustmentRepository.save(adjustment);
        return StockAdjustmentDto.fromEntity(saved);
    }

    @Transactional
    public StockAdjustmentDto validateAdjustment(Long id, String username) {
        StockAdjustment adjustment = adjustmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock adjustment not found with ID: " + id));

        if (adjustment.getStatus() != AdjustmentStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT adjustments can be validated");
        }

        Location location = adjustment.getLocation();

        for (StockAdjustmentItem item : adjustment.getItems()) {
            Product product = item.getProduct();
            ProductStock currentStock = productStockRepository.findByProductIdAndLocationId(product.getId(), location.getId())
                    .orElseGet(() -> new ProductStock(product, location, 0));

            int systemBefore = currentStock.getQuantity();
            int physicalAfter = item.getPhysicalQuantity();
            int diff = physicalAfter - systemBefore;

            // Update location stock
            currentStock.setQuantity(physicalAfter);
            productStockRepository.save(currentStock);

            // Update global product stock
            int newGlobalStock = product.getQuantityOnHand() + diff;
            if (newGlobalStock < 0) {
                throw new IllegalArgumentException("Stock adjustment would result in negative global stock for product '" + product.getName() + "'");
            }
            product.setQuantityOnHand(newGlobalStock);
            productRepository.save(product);

            // Item internal state sync
            item.setSystemQuantity(systemBefore);
            item.setPhysicalQuantity(physicalAfter);
            item.setDifference(diff);

            // Create StockLedger Record
            StockLedger ledger = new StockLedger();
            ledger.setProduct(product);
            ledger.setLocation(location);
            ledger.setMovementType(MovementType.ADJUSTMENT);
            ledger.setQuantity(diff);
            ledger.setQuantityBefore(systemBefore);
            ledger.setQuantityAfter(physicalAfter);
            ledger.setReferenceType("ADJUSTMENT");
            ledger.setReferenceId(adjustment.getId());
            ledger.setNotes(adjustment.getReason() != null ? adjustment.getReason() : "Stock Adjustment " + adjustment.getAdjustmentNumber());
            ledger.setPerformedBy(username != null ? username : adjustment.getCreatedBy());
            ledgerRepository.save(ledger);
        }

        adjustment.setStatus(AdjustmentStatus.VALIDATED);
        adjustment.setValidatedAt(LocalDateTime.now());
        StockAdjustment saved = adjustmentRepository.save(adjustment);
        return StockAdjustmentDto.fromEntity(saved);
    }

    @Transactional
    public StockAdjustmentDto cancelAdjustment(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock adjustment not found with ID: " + id));

        if (adjustment.getStatus() != AdjustmentStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT adjustments can be cancelled");
        }

        adjustment.setStatus(AdjustmentStatus.CANCELLED);
        StockAdjustment saved = adjustmentRepository.save(adjustment);
        return StockAdjustmentDto.fromEntity(saved);
    }
}
