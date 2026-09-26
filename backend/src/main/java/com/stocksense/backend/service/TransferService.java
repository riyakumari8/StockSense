package com.stocksense.backend.service;

import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.dto.TransferRequest;
import com.stocksense.backend.dto.TransferResponse;
import com.stocksense.backend.entity.*;
import com.stocksense.backend.entity.enums.MovementType;
import com.stocksense.backend.entity.enums.TransferStatus;
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
public class TransferService {

    private final TransferRepository transferRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final StockRepository stockRepository;
    private final StockLedgerRepository stockLedgerRepository;

    public PageResponse<TransferResponse> getAllTransfers(
            TransferStatus status, Long warehouseId,
            LocalDateTime startDate, LocalDateTime endDate,
            int page, int pageSize, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<Transfer> transferPage = transferRepository.findAllFiltered(
                status, warehouseId, startDate, endDate,
                PageRequest.of(page, pageSize, sort));

        return new PageResponse<>(
                transferPage.getContent().stream().map(TransferResponse::from).toList(),
                transferPage.getNumber(),
                transferPage.getSize(),
                transferPage.getTotalElements(),
                transferPage.getTotalPages()
        );
    }

    public TransferResponse getTransferById(Long id) {
        Transfer transfer = transferRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found."));
        return TransferResponse.from(transfer);
    }

    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        // Validate entities exist
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found."));
        Warehouse sourceWarehouse = warehouseRepository.findById(request.sourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found."));
        Location sourceLocation = locationRepository.findById(request.sourceLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Source location not found."));
        Warehouse destWarehouse = warehouseRepository.findById(request.destinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found."));
        Location destLocation = locationRepository.findById(request.destinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found."));

        // Validate location belongs to warehouse
        if (!sourceLocation.getWarehouse().getId().equals(sourceWarehouse.getId())) {
            throw new InvalidOperationException("Source location does not belong to the selected warehouse.");
        }
        if (!destLocation.getWarehouse().getId().equals(destWarehouse.getId())) {
            throw new InvalidOperationException("Destination location does not belong to the selected warehouse.");
        }

        // Validate source != destination
        if (sourceLocation.getId().equals(destLocation.getId())) {
            throw new InvalidOperationException("Source and destination locations cannot be the same.");
        }

        // Generate reference number
        String refNumber = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Transfer transfer = Transfer.builder()
                .referenceNumber(refNumber)
                .product(product)
                .sourceWarehouse(sourceWarehouse)
                .sourceLocation(sourceLocation)
                .destinationWarehouse(destWarehouse)
                .destinationLocation(destLocation)
                .quantity(request.quantity())
                .status(TransferStatus.DRAFT)
                .remarks(request.remarks())
                .createdBy("System") // TODO: Replace with authenticated user
                .build();

        transfer = transferRepository.save(transfer);

        // Reload with full details for response
        transfer = transferRepository.findByIdWithDetails(transfer.getId()).orElseThrow();
        return TransferResponse.from(transfer);
    }

    /**
     * Validates and executes the transfer atomically.
     * Uses pessimistic locking to prevent concurrent stock modifications.
     * The entire operation is ONE transaction — any failure causes full rollback.
     */
    @Transactional
    public TransferResponse validateTransfer(Long id) {
        Transfer transfer = transferRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found."));

        // Prevent duplicate validation
        if (transfer.getStatus() == TransferStatus.DONE) {
            throw new DuplicateResourceException("Transfer has already been completed.");
        }
        if (transfer.getStatus() == TransferStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot validate a cancelled transfer.");
        }

        Long productId = transfer.getProduct().getId();
        Long sourceLocationId = transfer.getSourceLocation().getId();
        Long destLocationId = transfer.getDestinationLocation().getId();
        Long quantity = transfer.getQuantity();

        // Lock source stock row (pessimistic write lock)
        Stock sourceStock = stockRepository.findByProductIdAndLocationIdForUpdate(productId, sourceLocationId)
                .orElseThrow(() -> new InsufficientStockException("No stock found at source location."));

        // Validate sufficient quantity
        if (sourceStock.getQuantity() < quantity) {
            throw new InsufficientStockException(sourceStock.getQuantity(), quantity);
        }

        // Lock destination stock row (or create if not exists)
        Stock destStock = stockRepository.findByProductIdAndLocationIdForUpdate(productId, destLocationId)
                .orElse(null);

        if (destStock == null) {
            destStock = Stock.builder()
                    .product(transfer.getProduct())
                    .location(transfer.getDestinationLocation())
                    .quantity(0L)
                    .build();
            destStock = stockRepository.save(destStock);
        }

        // Capture previous quantities for ledger
        Long sourcePrevQty = sourceStock.getQuantity();
        Long destPrevQty = destStock.getQuantity();

        // Execute the transfer atomically
        sourceStock.setQuantity(sourceStock.getQuantity() - quantity);
        destStock.setQuantity(destStock.getQuantity() + quantity);

        stockRepository.save(sourceStock);
        stockRepository.save(destStock);

        // Create source ledger entry (stock decreased)
        StockLedger sourceLedger = StockLedger.builder()
                .product(transfer.getProduct())
                .warehouse(transfer.getSourceWarehouse())
                .sourceLocation(transfer.getSourceLocation())
                .destinationLocation(transfer.getDestinationLocation())
                .movementType(MovementType.TRANSFER)
                .referenceType("TRANSFER")
                .referenceId(transfer.getId())
                .quantity(-quantity)
                .previousQuantity(sourcePrevQty)
                .resultingQuantity(sourceStock.getQuantity())
                .performedBy("System") // TODO: Replace with authenticated user
                .remarks(transfer.getRemarks())
                .build();
        stockLedgerRepository.save(sourceLedger);

        // Create destination ledger entry (stock increased)
        StockLedger destLedger = StockLedger.builder()
                .product(transfer.getProduct())
                .warehouse(transfer.getDestinationWarehouse())
                .sourceLocation(transfer.getSourceLocation())
                .destinationLocation(transfer.getDestinationLocation())
                .movementType(MovementType.TRANSFER)
                .referenceType("TRANSFER")
                .referenceId(transfer.getId())
                .quantity(quantity)
                .previousQuantity(destPrevQty)
                .resultingQuantity(destStock.getQuantity())
                .performedBy("System")
                .remarks(transfer.getRemarks())
                .build();
        stockLedgerRepository.save(destLedger);

        // Mark transfer as DONE
        transfer.setStatus(TransferStatus.DONE);
        transfer.setValidatedBy("System");
        transfer.setValidatedAt(LocalDateTime.now());
        transferRepository.save(transfer);

        return TransferResponse.from(transfer);
    }

    @Transactional
    public TransferResponse cancelTransfer(Long id) {
        Transfer transfer = transferRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found."));

        if (transfer.getStatus() == TransferStatus.DONE) {
            throw new InvalidOperationException("Cannot cancel a completed transfer.");
        }
        if (transfer.getStatus() == TransferStatus.CANCELLED) {
            throw new InvalidOperationException("Transfer is already cancelled.");
        }

        transfer.setStatus(TransferStatus.CANCELLED);
        transferRepository.save(transfer);

        return TransferResponse.from(transfer);
    }
}
