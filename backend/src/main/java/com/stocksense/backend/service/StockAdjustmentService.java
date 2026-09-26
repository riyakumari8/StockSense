package com.stocksense.backend.service;

import com.stocksense.backend.dto.AdjustmentRequest;
import com.stocksense.backend.dto.AdjustmentResponse;
import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.entity.*;
import com.stocksense.backend.entity.enums.AdjustmentStatus;
import com.stocksense.backend.entity.enums.MovementType;
import com.stocksense.backend.exception.*;
import com.stocksense.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final StockRepository stockRepository;
    private final StockLedgerRepository stockLedgerRepository;

    public PageResponse<AdjustmentResponse> getAllAdjustments(
            AdjustmentStatus status, Long warehouseId, Long locationId, Long productId,
            LocalDateTime startDate, LocalDateTime endDate,
            int page, int pageSize, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<StockAdjustment> adjustmentPage = adjustmentRepository.findAllFiltered(
                status, warehouseId, locationId, productId, startDate, endDate,
                PageRequest.of(page, pageSize, sort));

        return new PageResponse<>(
                adjustmentPage.getContent().stream().map(AdjustmentResponse::from).toList(),
                adjustmentPage.getNumber(),
                adjustmentPage.getSize(),
                adjustmentPage.getTotalElements(),
                adjustmentPage.getTotalPages()
        );
    }

    public AdjustmentResponse getAdjustmentById(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found."));
        return AdjustmentResponse.from(adjustment);
    }

    @Transactional
    public AdjustmentResponse createAdjustment(AdjustmentRequest request) {
        // Validate entities exist
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found."));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));
        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));

        // Validate location belongs to warehouse
        if (!location.getWarehouse().getId().equals(warehouse.getId())) {
            throw new InvalidOperationException("Location does not belong to the selected warehouse.");
        }

        // Get current system quantity
        Long systemQuantity = stockRepository.findByProductIdAndLocationId(product.getId(), location.getId())
                .map(Stock::getQuantity)
                .orElse(0L);

        Long difference = request.physicalQuantity() - systemQuantity;

        // Generate reference number
        String refNumber = "ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        StockAdjustment adjustment = StockAdjustment.builder()
                .referenceNumber(refNumber)
                .product(product)
                .warehouse(warehouse)
                .location(location)
                .systemQuantity(systemQuantity)
                .physicalQuantity(request.physicalQuantity())
                .difference(difference)
                .reason(request.reason())
                .status(AdjustmentStatus.DRAFT)
                .createdBy("System") // TODO: Replace with authenticated user
                .build();

        adjustment = adjustmentRepository.save(adjustment);

        // Reload with details
        adjustment = adjustmentRepository.findByIdWithDetails(adjustment.getId()).orElseThrow();
        return AdjustmentResponse.from(adjustment);
    }

    /**
     * Validates and applies the stock adjustment atomically.
     * Uses pessimistic locking to prevent concurrent modifications.
     */
    @Transactional
    public AdjustmentResponse validateAdjustment(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found."));

        // Prevent duplicate validation
        if (adjustment.getStatus() == AdjustmentStatus.DONE) {
            throw new DuplicateResourceException("Adjustment has already been completed.");
        }
        if (adjustment.getStatus() == AdjustmentStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot validate a cancelled adjustment.");
        }

        Long productId = adjustment.getProduct().getId();
        Long locationId = adjustment.getLocation().getId();

        // Lock stock row
        Stock stock = stockRepository.findByProductIdAndLocationIdForUpdate(productId, locationId)
                .orElse(null);

        if (stock == null) {
            stock = Stock.builder()
                    .product(adjustment.getProduct())
                    .location(adjustment.getLocation())
                    .quantity(0L)
                    .build();
            stock = stockRepository.save(stock);
        }

        Long previousQuantity = stock.getQuantity();
        Long newQuantity = adjustment.getPhysicalQuantity();
        Long difference = newQuantity - previousQuantity;

        // Validate resulting quantity is non-negative
        if (newQuantity < 0) {
            throw new InvalidOperationException("Stock quantity cannot become negative.");
        }

        // Apply adjustment
        stock.setQuantity(newQuantity);
        stockRepository.save(stock);

        // Create ledger entry
        StockLedger ledger = StockLedger.builder()
                .product(adjustment.getProduct())
                .warehouse(adjustment.getWarehouse())
                .sourceLocation(adjustment.getLocation())
                .movementType(MovementType.ADJUSTMENT)
                .referenceType("ADJUSTMENT")
                .referenceId(adjustment.getId())
                .quantity(difference)
                .previousQuantity(previousQuantity)
                .resultingQuantity(newQuantity)
                .performedBy("System") // TODO: Replace with authenticated user
                .remarks(adjustment.getReason())
                .build();
        stockLedgerRepository.save(ledger);

        // Mark as DONE
        adjustment.setStatus(AdjustmentStatus.DONE);
        adjustment.setApprovedBy("System");
        adjustment.setApprovedAt(LocalDateTime.now());

        // Update the stored difference to reflect actual change
        adjustment.setDifference(difference);
        adjustmentRepository.save(adjustment);

        return AdjustmentResponse.from(adjustment);
    }

    @Transactional
    public AdjustmentResponse cancelAdjustment(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found."));

        if (adjustment.getStatus() == AdjustmentStatus.DONE) {
            throw new InvalidOperationException("Cannot cancel a completed adjustment.");
        }
        if (adjustment.getStatus() == AdjustmentStatus.CANCELLED) {
            throw new InvalidOperationException("Adjustment is already cancelled.");
        }

        adjustment.setStatus(AdjustmentStatus.CANCELLED);
        adjustmentRepository.save(adjustment);

        return AdjustmentResponse.from(adjustment);
    }
}
