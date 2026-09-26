package com.stocksense.service;

import com.stocksense.dto.*;
import com.stocksense.entity.Delivery;
import com.stocksense.entity.DeliveryItem;
import com.stocksense.entity.DeliveryStatus;
import com.stocksense.entity.Product;
import com.stocksense.entity.StockLedger;
import com.stocksense.repository.DeliveryItemRepository;
import com.stocksense.repository.DeliveryRepository;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.StockLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryItemRepository deliveryItemRepository;
    private final ProductRepository productRepository;
    private final StockLedgerRepository stockLedgerRepository;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           DeliveryItemRepository deliveryItemRepository,
                           ProductRepository productRepository,
                           StockLedgerRepository stockLedgerRepository) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryItemRepository = deliveryItemRepository;
        this.productRepository = productRepository;
        this.stockLedgerRepository = stockLedgerRepository;
    }

    public List<DeliveryDto> getAllDeliveries(String search, DeliveryStatus status) {
        List<Delivery> deliveries;
        boolean hasSearch = (search != null && !search.trim().isEmpty());

        if (hasSearch && status != null) {
            deliveries = deliveryRepository.searchDeliveriesWithStatus(search.trim(), status);
        } else if (hasSearch) {
            deliveries = deliveryRepository.searchDeliveries(search.trim());
        } else if (status != null) {
            deliveries = deliveryRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            deliveries = deliveryRepository.findAllByOrderByCreatedAtDesc();
        }

        return deliveries.stream()
                .map(DeliveryDto::fromEntity)
                .collect(Collectors.toList());
    }

    public DeliveryDto getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));
        return DeliveryDto.fromEntity(delivery);
    }

    @Transactional
    public DeliveryDto createDelivery(DeliveryRequest request) {
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name cannot be blank");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Delivery must contain at least one product item");
        }

        // Consolidate duplicate products if any
        Map<Long, Integer> productQuantities = new LinkedHashMap<>();
        for (DeliveryItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new IllegalArgumentException("Product ID is required for each delivery item");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }
            productQuantities.merge(itemReq.getProductId(), itemReq.getQuantity(), Integer::sum);
        }

        Delivery delivery = new Delivery();
        delivery.setCustomerName(request.getCustomerName().trim());
        delivery.setDeliveryNumber(generateUniqueDeliveryNumber());
        delivery.setStatus(DeliveryStatus.DRAFT);

        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            Long productId = entry.getKey();
            Integer qty = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

            DeliveryItem item = new DeliveryItem(delivery, product, qty);
            delivery.addItem(item);
        }

        Delivery saved = deliveryRepository.save(delivery);
        return DeliveryDto.fromEntity(saved);
    }

    @Transactional
    public DeliveryDto pickDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));

        if (delivery.getStatus() != DeliveryStatus.DRAFT) {
            throw new IllegalStateException("Delivery must be in DRAFT status to be picked. Current status: " + delivery.getStatus());
        }

        // Verify all products exist and check stock availability
        for (DeliveryItem item : delivery.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product " + item.getProduct().getName() + " no longer exists"));

            if (product.getQuantityOnHand() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName() + 
                        " (Required: " + item.getQuantity() + ", Available: " + product.getQuantityOnHand() + ")");
            }
        }

        // Do NOT decrease stock during Pick
        delivery.setStatus(DeliveryStatus.PICKED);
        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryDto.fromEntity(updated);
    }

    @Transactional
    public DeliveryDto packDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));

        if (delivery.getStatus() != DeliveryStatus.PICKED) {
            throw new IllegalStateException("Delivery must be PICKED before packing. Current status: " + delivery.getStatus());
        }

        // Do NOT decrease stock during Pack
        delivery.setStatus(DeliveryStatus.PACKED);
        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryDto.fromEntity(updated);
    }

    @Transactional
    public DeliveryDto validateDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));

        if (delivery.getStatus() == DeliveryStatus.VALIDATED) {
            throw new IllegalStateException("Delivery has already been validated.");
        }

        if (delivery.getStatus() != DeliveryStatus.PACKED) {
            throw new IllegalStateException("Delivery must be PACKED before validation. Current status: " + delivery.getStatus());
        }

        // First pass: verify sufficient stock for ALL items before making any modifications
        for (DeliveryItem item : delivery.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product " + item.getProduct().getName() + " no longer exists"));

            if (product.getQuantityOnHand() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName() + 
                        " (Required: " + item.getQuantity() + ", Available: " + product.getQuantityOnHand() + ")");
            }
        }

        // Second pass: decrease stock and write to StockLedger transactionally
        for (DeliveryItem item : delivery.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId()).get();
            int previousStock = product.getQuantityOnHand();
            int newStock = previousStock - item.getQuantity();

            product.setQuantityOnHand(newStock);
            productRepository.save(product);

            StockLedger ledgerEntry = new StockLedger(
                    product,
                    -item.getQuantity(),
                    "DELIVERY",
                    delivery.getDeliveryNumber(),
                    "Delivery order " + delivery.getDeliveryNumber() + " validated for customer: " + delivery.getCustomerName(),
                    previousStock,
                    newStock
            );
            stockLedgerRepository.save(ledgerEntry);
        }

        // Update status to VALIDATED
        delivery.setStatus(DeliveryStatus.VALIDATED);
        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryDto.fromEntity(updated);
    }

    @Transactional
    public DeliveryDto cancelDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));

        if (delivery.getStatus() == DeliveryStatus.VALIDATED) {
            throw new IllegalStateException("Cannot cancel an already validated delivery.");
        }

        if (delivery.getStatus() == DeliveryStatus.CANCELLED) {
            throw new IllegalStateException("Delivery is already cancelled.");
        }

        delivery.setStatus(DeliveryStatus.CANCELLED);
        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryDto.fromEntity(updated);
    }

    public List<StockLedgerDto> getLedgerEntriesByDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));
        return stockLedgerRepository.findByReferenceOrderByTimestampDesc(delivery.getDeliveryNumber()).stream()
                .map(StockLedgerDto::fromEntity)
                .collect(Collectors.toList());
    }

    private String generateUniqueDeliveryNumber() {
        String datePrefix = "DEL-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        int randomSuffix;
        String candidate;
        do {
            randomSuffix = 1000 + new Random().nextInt(9000);
            candidate = datePrefix + randomSuffix;
        } while (deliveryRepository.existsByDeliveryNumber(candidate));
        return candidate;
    }
}
