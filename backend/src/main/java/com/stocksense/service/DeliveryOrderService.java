package com.stocksense.service;

import com.stocksense.dto.DeliveryOrderDto;
import com.stocksense.dto.DeliveryOrderItemRequest;
import com.stocksense.dto.DeliveryOrderRequest;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryOrderService {

    private final DeliveryOrderRepository deliveryOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final ProductStockRepository productStockRepository;
    private final StockLedgerRepository ledgerRepository;

    public DeliveryOrderService(
            DeliveryOrderRepository deliveryOrderRepository,
            WarehouseRepository warehouseRepository,
            LocationRepository locationRepository,
            ProductRepository productRepository,
            ProductStockRepository productStockRepository,
            StockLedgerRepository ledgerRepository
    ) {
        this.deliveryOrderRepository = deliveryOrderRepository;
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.productStockRepository = productStockRepository;
        this.ledgerRepository = ledgerRepository;
    }

    public List<DeliveryOrderDto> getAllDeliveries(String statusStr, Long warehouseId, String search) {
        DeliveryStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                status = DeliveryStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return deliveryOrderRepository.searchDeliveries(status, warehouseId, searchPattern)
                .stream()
                .map(DeliveryOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    public DeliveryOrderDto getDeliveryById(Long id) {
        DeliveryOrder delivery = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery order not found with ID: " + id));
        return DeliveryOrderDto.fromEntity(delivery);
    }

    @Transactional
    public DeliveryOrderDto createDelivery(DeliveryOrderRequest request, String createdBy) {
        Warehouse warehouse = warehouseRepository.findById(request.getSourceWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Source warehouse not found with ID: " + request.getSourceWarehouseId()));

        Location location = locationRepository.findById(request.getSourceLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Source location not found with ID: " + request.getSourceLocationId()));

        if (!location.getWarehouse().getId().equals(warehouse.getId())) {
            throw new IllegalArgumentException("Source location '" + location.getName() + "' does not belong to warehouse '" + warehouse.getName() + "'");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Delivery order must contain at least one product line item");
        }

        DeliveryOrder delivery = new DeliveryOrder();
        delivery.setDeliveryNumber("DEL-" + System.currentTimeMillis() % 1000000);
        delivery.setCustomerName(request.getCustomerName());
        delivery.setCustomerReference(request.getCustomerReference());
        delivery.setSourceWarehouse(warehouse);
        delivery.setSourceLocation(location);
        delivery.setStatus(DeliveryStatus.DRAFT);
        delivery.setNotes(request.getNotes());
        delivery.setCreatedBy(createdBy != null ? createdBy : "System");

        for (DeliveryOrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Product ID and positive quantity (> 0) are required");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            DeliveryOrderItem item = new DeliveryOrderItem(product, itemReq.getQuantity());
            delivery.addItem(item);
        }

        DeliveryOrder saved = deliveryOrderRepository.save(delivery);
        return DeliveryOrderDto.fromEntity(saved);
    }

    @Transactional
    public DeliveryOrderDto pickDelivery(Long id) {
        DeliveryOrder delivery = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery order not found with ID: " + id));

        if (delivery.getStatus() != DeliveryStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT delivery orders can be picked. Current status: " + delivery.getStatus());
        }

        Location sourceLocation = delivery.getSourceLocation();

        // Check stock availability at source location for each item
        for (DeliveryOrderItem item : delivery.getItems()) {
            Product product = item.getProduct();
            ProductStock stock = productStockRepository.findByProductIdAndLocationId(product.getId(), sourceLocation.getId())
                    .orElse(null);

            int currentStock = (stock != null) ? stock.getQuantity() : 0;
            if (currentStock < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() +
                        "' at location '" + sourceLocation.getName() + "'. Required: " + item.getQuantity() +
                        ", Available: " + currentStock);
            }
        }

        delivery.setStatus(DeliveryStatus.PICKED);
        delivery.setPickedAt(LocalDateTime.now());
        DeliveryOrder saved = deliveryOrderRepository.save(delivery);
        return DeliveryOrderDto.fromEntity(saved);
    }

    @Transactional
    public DeliveryOrderDto packDelivery(Long id) {
        DeliveryOrder delivery = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery order not found with ID: " + id));

        if (delivery.getStatus() != DeliveryStatus.PICKED) {
            throw new IllegalArgumentException("Only PICKED delivery orders can be packed. Current status: " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.PACKED);
        delivery.setPackedAt(LocalDateTime.now());
        DeliveryOrder saved = deliveryOrderRepository.save(delivery);
        return DeliveryOrderDto.fromEntity(saved);
    }

    @Transactional
    public DeliveryOrderDto validateDelivery(Long id, String username) {
        DeliveryOrder delivery = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery order not found with ID: " + id));

        if (delivery.getStatus() != DeliveryStatus.PACKED) {
            throw new IllegalArgumentException("Only PACKED delivery orders can be validated. Current status: " + delivery.getStatus());
        }

        Location sourceLocation = delivery.getSourceLocation();

        // 1. Re-check stock availability before deduction
        for (DeliveryOrderItem item : delivery.getItems()) {
            Product product = item.getProduct();
            ProductStock stock = productStockRepository.findByProductIdAndLocationId(product.getId(), sourceLocation.getId())
                    .orElse(null);

            int currentStock = (stock != null) ? stock.getQuantity() : 0;
            if (currentStock < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() +
                        "' at location '" + sourceLocation.getName() + "'. Required: " + item.getQuantity() +
                        ", Available: " + currentStock);
            }
        }

        // 2. Perform Stock Deductions and create Ledger Entries
        for (DeliveryOrderItem item : delivery.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();

            // Deduct location stock (ProductStock)
            ProductStock stock = productStockRepository.findByProductIdAndLocationId(product.getId(), sourceLocation.getId())
                    .orElseThrow(() -> new IllegalStateException("ProductStock missing for product " + product.getName()));

            int beforeQty = stock.getQuantity();
            int afterQty = beforeQty - qty;

            stock.setQuantity(afterQty);
            productStockRepository.save(stock);

            // Deduct global product stock (quantityOnHand)
            product.setQuantityOnHand(Math.max(0, product.getQuantityOnHand() - qty));
            productRepository.save(product);

            // Create StockLedger entry
            StockLedger ledger = new StockLedger();
            ledger.setProduct(product);
            ledger.setLocation(sourceLocation);
            ledger.setMovementType(MovementType.DELIVERY);
            ledger.setQuantity(-qty);
            ledger.setQuantityBefore(beforeQty);
            ledger.setQuantityAfter(afterQty);
            ledger.setReferenceType("DELIVERY");
            ledger.setReferenceId(delivery.getId());
            ledger.setNotes("Delivery " + delivery.getDeliveryNumber() + " to " + delivery.getCustomerName());
            ledger.setPerformedBy(username != null ? username : delivery.getCreatedBy());
            ledgerRepository.save(ledger);
        }

        delivery.setStatus(DeliveryStatus.VALIDATED);
        delivery.setValidatedAt(LocalDateTime.now());
        DeliveryOrder saved = deliveryOrderRepository.save(delivery);
        return DeliveryOrderDto.fromEntity(saved);
    }

    @Transactional
    public DeliveryOrderDto cancelDelivery(Long id) {
        DeliveryOrder delivery = deliveryOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery order not found with ID: " + id));

        if (delivery.getStatus() == DeliveryStatus.VALIDATED || delivery.getStatus() == DeliveryStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel delivery order with status: " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.CANCELLED);
        delivery.setCancelledAt(LocalDateTime.now());
        DeliveryOrder saved = deliveryOrderRepository.save(delivery);
        return DeliveryOrderDto.fromEntity(saved);
    }
}
