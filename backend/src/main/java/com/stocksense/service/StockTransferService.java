package com.stocksense.service;

import com.stocksense.dto.StockTransferDto;
import com.stocksense.dto.StockTransferRequest;
import com.stocksense.dto.TransferItemRequest;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StockTransferService {

    private final StockTransferRepository transferRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final ProductStockRepository productStockRepository;
    private final StockLedgerRepository ledgerRepository;

    public StockTransferService(
            StockTransferRepository transferRepository,
            LocationRepository locationRepository,
            ProductRepository productRepository,
            ProductStockRepository productStockRepository,
            StockLedgerRepository ledgerRepository) {
        this.transferRepository = transferRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.productStockRepository = productStockRepository;
        this.ledgerRepository = ledgerRepository;
    }

    public List<StockTransferDto> getAllTransfers(String status, Long locationId) {
        return transferRepository.filterTransfers(status, locationId).stream()
                .map(StockTransferDto::fromEntity)
                .collect(Collectors.toList());
    }

    public StockTransferDto getTransferById(Long id) {
        StockTransfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock transfer not found with ID: " + id));
        return StockTransferDto.fromEntity(transfer);
    }

    @Transactional
    public StockTransferDto createTransfer(StockTransferRequest request, String createdBy) {
        if (request.getSourceLocationId() == null || request.getDestinationLocationId() == null) {
            throw new IllegalArgumentException("Source and Destination locations are required");
        }
        if (request.getSourceLocationId().equals(request.getDestinationLocationId())) {
            throw new IllegalArgumentException("Source and Destination locations cannot be the same");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Transfer items list cannot be empty");
        }

        Location source = locationRepository.findById(request.getSourceLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Source location not found with ID: " + request.getSourceLocationId()));

        Location destination = locationRepository.findById(request.getDestinationLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination location not found with ID: " + request.getDestinationLocationId()));

        StockTransfer transfer = new StockTransfer();
        transfer.setTransferNumber("TRF-" + System.currentTimeMillis() % 1000000);
        transfer.setSourceLocation(source);
        transfer.setDestinationLocation(destination);
        transfer.setStatus(TransferStatus.DRAFT);
        transfer.setReference(request.getReference());
        transfer.setNotes(request.getNotes());
        transfer.setCreatedBy(createdBy != null ? createdBy : "System");

        for (TransferItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid transfer item product or quantity");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            TransferItem item = new TransferItem(product, itemReq.getQuantity());
            transfer.addItem(item);
        }

        StockTransfer saved = transferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }

    @Transactional
    public StockTransferDto validateTransfer(Long id, String username) {
        StockTransfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock transfer not found with ID: " + id));

        if (transfer.getStatus() != TransferStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT transfers can be validated. Current status: " + transfer.getStatus());
        }

        Location source = transfer.getSourceLocation();
        Location destination = transfer.getDestinationLocation();

        if (source.getId().equals(destination.getId())) {
            throw new IllegalArgumentException("Source and Destination locations cannot be the same");
        }

        for (TransferItem item : transfer.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();

            // 1. Source Location Stock Check & Decrease
            ProductStock srcStock = productStockRepository.findByProductIdAndLocationId(product.getId(), source.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product '" + product.getName() + "' has no stock recorded at source location '" + source.getName() + "'"));

            if (srcStock.getQuantity() < qty) {
                throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() + "' at source location '" + source.getName() + "' (Available: " + srcStock.getQuantity() + ", Requested: " + qty + ")");
            }

            int srcBefore = srcStock.getQuantity();
            int srcAfter = srcBefore - qty;
            srcStock.setQuantity(srcAfter);
            productStockRepository.save(srcStock);

            // 2. Destination Location Stock Increase
            ProductStock dstStock = productStockRepository.findByProductIdAndLocationId(product.getId(), destination.getId())
                    .orElseGet(() -> new ProductStock(product, destination, 0));

            int dstBefore = dstStock.getQuantity();
            int dstAfter = dstBefore + qty;
            dstStock.setQuantity(dstAfter);
            productStockRepository.save(dstStock);

            // 3. Create StockLedger Entries
            // Source decrease entry
            StockLedger srcLedger = new StockLedger();
            srcLedger.setProduct(product);
            srcLedger.setLocation(source);
            srcLedger.setMovementType(MovementType.TRANSFER);
            srcLedger.setQuantity(-qty);
            srcLedger.setQuantityBefore(srcBefore);
            srcLedger.setQuantityAfter(srcAfter);
            srcLedger.setReferenceType("TRANSFER");
            srcLedger.setReferenceId(transfer.getId());
            srcLedger.setNotes("Transfer " + transfer.getTransferNumber() + " to " + destination.getName());
            srcLedger.setPerformedBy(username != null ? username : transfer.getCreatedBy());
            ledgerRepository.save(srcLedger);

            // Destination increase entry
            StockLedger dstLedger = new StockLedger();
            dstLedger.setProduct(product);
            dstLedger.setLocation(destination);
            dstLedger.setMovementType(MovementType.TRANSFER);
            dstLedger.setQuantity(qty);
            dstLedger.setQuantityBefore(dstBefore);
            dstLedger.setQuantityAfter(dstAfter);
            dstLedger.setReferenceType("TRANSFER");
            dstLedger.setReferenceId(transfer.getId());
            dstLedger.setNotes("Transfer " + transfer.getTransferNumber() + " from " + source.getName());
            dstLedger.setPerformedBy(username != null ? username : transfer.getCreatedBy());
            ledgerRepository.save(dstLedger);
        }

        transfer.setStatus(TransferStatus.VALIDATED);
        transfer.setValidatedAt(LocalDateTime.now());
        StockTransfer saved = transferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }

    @Transactional
    public StockTransferDto cancelTransfer(Long id) {
        StockTransfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock transfer not found with ID: " + id));

        if (transfer.getStatus() != TransferStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT transfers can be cancelled");
        }

        transfer.setStatus(TransferStatus.CANCELLED);
        StockTransfer saved = transferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }
}
