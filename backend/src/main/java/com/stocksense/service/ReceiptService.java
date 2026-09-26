package com.stocksense.service;

import com.stocksense.dto.ReceiptDto;
import com.stocksense.dto.ReceiptItemRequest;
import com.stocksense.dto.ReceiptRequest;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final ProductStockRepository productStockRepository;
    private final StockLedgerRepository ledgerRepository;

    public ReceiptService(
            ReceiptRepository receiptRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            LocationRepository locationRepository,
            ProductRepository productRepository,
            ProductStockRepository productStockRepository,
            StockLedgerRepository ledgerRepository) {
        this.receiptRepository = receiptRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.productStockRepository = productStockRepository;
        this.ledgerRepository = ledgerRepository;
    }

    public List<ReceiptDto> getAllReceipts(String status, Long supplierId, Long warehouseId, String search) {
        return receiptRepository.filterReceipts(status, supplierId, warehouseId, search).stream()
                .map(ReceiptDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ReceiptDto getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));
        return ReceiptDto.fromEntity(receipt);
    }

    public long countPendingReceipts() {
        return receiptRepository.countPendingReceipts();
    }

    @Transactional
    public ReceiptDto createReceipt(ReceiptRequest request, String createdBy) {
        if (request.getSupplierId() == null) throw new IllegalArgumentException("Supplier ID is required");
        if (request.getWarehouseId() == null) throw new IllegalArgumentException("Warehouse ID is required");
        if (request.getDestinationLocationId() == null) throw new IllegalArgumentException("Destination location ID is required");
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Receipt items list cannot be empty");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + request.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + request.getWarehouseId()));

        Location location = locationRepository.findById(request.getDestinationLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination location not found with ID: " + request.getDestinationLocationId()));

        if (!location.getWarehouse().getId().equals(warehouse.getId())) {
            throw new IllegalArgumentException("Destination location '" + location.getName() + "' does not belong to warehouse '" + warehouse.getName() + "'");
        }

        Receipt receipt = new Receipt();
        receipt.setReceiptNumber("RCV-" + System.currentTimeMillis() % 1000000);
        receipt.setSupplier(supplier);
        receipt.setWarehouse(warehouse);
        receipt.setDestinationLocation(location);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setReference(request.getReference());
        receipt.setNotes(request.getNotes());
        receipt.setCreatedBy(createdBy != null ? createdBy : "System");

        for (ReceiptItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid product or negative/zero receipt quantity");
            }
            if (itemReq.getUnitCost() != null && itemReq.getUnitCost().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Unit cost cannot be negative");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            ReceiptItem item = new ReceiptItem(product, itemReq.getQuantity(), itemReq.getUnitCost());
            receipt.addItem(item);
        }

        Receipt saved = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(saved);
    }

    @Transactional
    public ReceiptDto validateReceipt(Long id, String username) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT receipts can be validated. Current status: " + receipt.getStatus());
        }

        Location destination = receipt.getDestinationLocation();

        for (ReceiptItem item : receipt.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();

            // 1. Update location-level stock (ProductStock)
            ProductStock stock = productStockRepository.findByProductIdAndLocationId(product.getId(), destination.getId())
                    .orElseGet(() -> new ProductStock(product, destination, 0));

            int beforeQty = stock.getQuantity();
            int afterQty = beforeQty + qty;

            stock.setQuantity(afterQty);
            productStockRepository.save(stock);

            // 2. Update global Product stock (quantityOnHand) & costPrice
            product.setQuantityOnHand(product.getQuantityOnHand() + qty);
            if (item.getUnitCost() != null && item.getUnitCost().compareTo(BigDecimal.ZERO) > 0) {
                product.setCostPrice(item.getUnitCost());
            }
            productRepository.save(product);

            // 3. Create StockLedger entry
            StockLedger ledger = new StockLedger();
            ledger.setProduct(product);
            ledger.setLocation(destination);
            ledger.setMovementType(MovementType.RECEIPT);
            ledger.setQuantity(qty);
            ledger.setQuantityBefore(beforeQty);
            ledger.setQuantityAfter(afterQty);
            ledger.setReferenceType("RECEIPT");
            ledger.setReferenceId(receipt.getId());
            ledger.setNotes("Receipt " + receipt.getReceiptNumber() + " from " + receipt.getSupplier().getName());
            ledger.setPerformedBy(username != null ? username : receipt.getCreatedBy());
            ledgerRepository.save(ledger);
        }

        receipt.setStatus(ReceiptStatus.VALIDATED);
        receipt.setValidatedAt(LocalDateTime.now());
        Receipt saved = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(saved);
    }

    @Transactional
    public ReceiptDto cancelReceipt(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT receipts can be cancelled");
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        Receipt saved = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(saved);
    }
}
