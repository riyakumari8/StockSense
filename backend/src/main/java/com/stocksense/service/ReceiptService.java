package com.stocksense.service;

import com.stocksense.dto.ReceiptDto;
import com.stocksense.dto.ReceiptItemRequest;
import com.stocksense.dto.ReceiptRequest;
import com.stocksense.entity.*;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.ReceiptItemRepository;
import com.stocksense.repository.ReceiptRepository;
import com.stocksense.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptItemRepository receiptItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final StockLedgerService stockLedgerService;

    public ReceiptService(
            ReceiptRepository receiptRepository,
            ReceiptItemRepository receiptItemRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            StockLedgerService stockLedgerService
    ) {
        this.receiptRepository = receiptRepository;
        this.receiptItemRepository = receiptItemRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.stockLedgerService = stockLedgerService;
    }

    public List<ReceiptDto> getAllReceipts(String search, ReceiptStatus status, Long supplierId) {
        return receiptRepository.filterReceipts(search, status, supplierId).stream()
                .map(ReceiptDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ReceiptDto getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));
        return ReceiptDto.fromEntity(receipt);
    }

    @Transactional
    public ReceiptDto createReceipt(ReceiptRequest request) {
        if (request.getSupplierId() == null) {
            throw new IllegalArgumentException("Supplier ID is required");
        }
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + request.getSupplierId()));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Receipt must contain at least one product item");
        }

        // Validate items and generate receipt number
        String receiptNumber = request.getReceiptNumber();
        if (receiptNumber == null || receiptNumber.trim().isEmpty()) {
            receiptNumber = generateNextReceiptNumber();
        } else {
            receiptNumber = receiptNumber.trim().toUpperCase();
            if (receiptRepository.existsByReceiptNumber(receiptNumber)) {
                throw new IllegalArgumentException("Receipt with number '" + receiptNumber + "' already exists");
            }
        }

        Receipt receipt = new Receipt();
        receipt.setReceiptNumber(receiptNumber);
        receipt.setSupplier(supplier);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setNotes(request.getNotes());

        for (ReceiptItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new IllegalArgumentException("Product ID is required for each receipt item");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getCostPrice();

            ReceiptItem item = new ReceiptItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            receipt.addItem(item);
        }

        Receipt saved = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(saved);
    }

    @Transactional
    public ReceiptDto updateReceipt(Long id, ReceiptRequest request) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT receipts can be modified. Current status: " + receipt.getStatus());
        }

        if (request.getSupplierId() == null) {
            throw new IllegalArgumentException("Supplier ID is required");
        }
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + request.getSupplierId()));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Receipt must contain at least one product item");
        }

        receipt.setSupplier(supplier);
        receipt.setNotes(request.getNotes());

        // Clear existing items and replace with new ones
        receipt.getItems().clear();

        for (ReceiptItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new IllegalArgumentException("Product ID is required for each receipt item");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getCostPrice();

            ReceiptItem item = new ReceiptItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            receipt.addItem(item);
        }

        Receipt updated = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(updated);
    }

    @Transactional
    public ReceiptDto validateReceipt(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));

        // 1. Check status is DRAFT
        if (receipt.getStatus() == ReceiptStatus.VALIDATED) {
            throw new IllegalStateException("Receipt #" + receipt.getReceiptNumber() + " is already validated");
        }
        if (receipt.getStatus() == ReceiptStatus.CANCELLED) {
            throw new IllegalStateException("Cannot validate cancelled receipt #" + receipt.getReceiptNumber());
        }
        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT receipts can be validated");
        }

        if (receipt.getItems() == null || receipt.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot validate receipt with no product items");
        }

        // 2. Validate products and increase stock, record stock ledger movement
        for (ReceiptItem item : receipt.getItems()) {
            Product product = item.getProduct();
            if (product == null || product.getId() == null) {
                throw new IllegalArgumentException("Invalid product attached to receipt item");
            }
            // Fetch fresh managed product
            Product managedProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + product.getId()));

            int quantityToAdd = item.getQuantity();
            if (quantityToAdd <= 0) {
                throw new IllegalArgumentException("Invalid quantity: " + quantityToAdd + " for product " + managedProduct.getName());
            }

            int prevQty = managedProduct.getQuantityOnHand() != null ? managedProduct.getQuantityOnHand() : 0;
            int newQty = prevQty + quantityToAdd;

            // Increase product stock
            managedProduct.setQuantityOnHand(newQty);
            productRepository.save(managedProduct);

            // Record movement in StockLedger
            String remarks = "Receipt " + receipt.getReceiptNumber() + " validated from supplier " + receipt.getSupplier().getSupplierName();
            stockLedgerService.recordMovement(
                    managedProduct,
                    quantityToAdd,
                    prevQty,
                    newQty,
                    MovementType.RECEIPT,
                    receipt.getReceiptNumber(),
                    remarks
            );
        }

        // 3. Mark receipt as VALIDATED
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
            throw new IllegalStateException("Only DRAFT receipts can be cancelled. Current status: " + receipt.getStatus());
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        Receipt saved = receiptRepository.save(receipt);
        return ReceiptDto.fromEntity(saved);
    }

    @Transactional
    public void deleteReceipt(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found with ID: " + id));

        if (receipt.getStatus() == ReceiptStatus.VALIDATED) {
            throw new IllegalStateException("Cannot delete a VALIDATED receipt as it has already affected inventory stock.");
        }

        receiptRepository.delete(receipt);
    }

    private synchronized String generateNextReceiptNumber() {
        Optional<Receipt> latestReceipt = receiptRepository.findTopByOrderByIdDesc();
        long nextId = latestReceipt.map(r -> r.getId() + 1).orElse(1L);
        return String.format("RCV-%04d", nextId);
    }
}
