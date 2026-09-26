package com.stocksense;

import com.stocksense.dto.DeliveryDto;
import com.stocksense.dto.DeliveryItemRequest;
import com.stocksense.dto.DeliveryRequest;
import com.stocksense.dto.StockLedgerDto;
import com.stocksense.entity.DeliveryStatus;
import com.stocksense.entity.Product;
import com.stocksense.repository.ProductRepository;
import com.stocksense.service.DeliveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DeliveryWorkflowTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Find an existing seeded product or create one
        testProduct = productRepository.findBySku("TEST-SKU-999").orElseGet(() -> {
            Product p = new Product();
            p.setName("High-Grade Steel Screws");
            p.setSku("TEST-SKU-999");
            p.setUnitOfMeasure("Boxes");
            p.setCostPrice(new BigDecimal("15.00"));
            p.setSalesPrice(new BigDecimal("25.00"));
            p.setQuantityOnHand(50);
            p.setReorderPoint(10);
            return productRepository.save(p);
        });
        // Reset stock to 50 for clean testing
        testProduct.setQuantityOnHand(50);
        productRepository.save(testProduct);
    }

    @Test
    @DisplayName("Complete End-to-End Workflow: Draft -> Pick -> Pack -> Validate -> Stock Decreases & Ledger Recorded")
    void testCompleteDeliveryWorkflow() {
        int initialStock = testProduct.getQuantityOnHand();
        int deliveryQty = 10;

        // 1. Create Delivery
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Acme Global Logistics");
        request.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), deliveryQty)));

        DeliveryDto created = deliveryService.createDelivery(request);
        assertNotNull(created.getId());
        assertNotNull(created.getDeliveryNumber());
        assertEquals("Acme Global Logistics", created.getCustomerName());
        assertEquals(DeliveryStatus.DRAFT, created.getStatus());
        assertEquals(1, created.getTotalItems());
        assertEquals(deliveryQty, created.getTotalQuantity());

        // Stock must NOT decrease during creation
        Product afterCreateProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialStock, afterCreateProduct.getQuantityOnHand(), "Stock must not decrease on create");

        // 2. Pick Delivery
        DeliveryDto picked = deliveryService.pickDelivery(created.getId());
        assertEquals(DeliveryStatus.PICKED, picked.getStatus());

        // Stock must NOT decrease during pick
        Product afterPickProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialStock, afterPickProduct.getQuantityOnHand(), "Stock must not decrease on pick");

        // 3. Pack Delivery
        DeliveryDto packed = deliveryService.packDelivery(created.getId());
        assertEquals(DeliveryStatus.PACKED, packed.getStatus());

        // Stock must NOT decrease during pack
        Product afterPackProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialStock, afterPackProduct.getQuantityOnHand(), "Stock must not decrease on pack");

        // 4. Validate Delivery
        DeliveryDto validated = deliveryService.validateDelivery(created.getId());
        assertEquals(DeliveryStatus.VALIDATED, validated.getStatus());

        // Stock MUST decrease ONLY upon validation
        Product afterValidateProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        int expectedStock = initialStock - deliveryQty;
        assertEquals(expectedStock, afterValidateProduct.getQuantityOnHand(), "Stock must decrease upon validation");

        // Stock Ledger entry MUST be recorded
        List<StockLedgerDto> ledgerEntries = deliveryService.getLedgerEntriesByDelivery(created.getId());
        assertFalse(ledgerEntries.isEmpty(), "Stock ledger entry must be recorded");
        StockLedgerDto entry = ledgerEntries.get(0);
        assertEquals(testProduct.getId(), entry.getProductId());
        assertEquals(-deliveryQty, entry.getQuantityChange());
        assertEquals("DELIVERY", entry.getMovementType());
        assertEquals(created.getDeliveryNumber(), entry.getReference());
        assertEquals(initialStock, entry.getPreviousStock());
        assertEquals(expectedStock, entry.getNewStock());
    }

    @Test
    @DisplayName("Invalid transition: Cannot pack a DRAFT delivery without picking")
    void testCannotPackDraftDelivery() {
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Test Customer");
        request.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), 5)));
        DeliveryDto created = deliveryService.createDelivery(request);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            deliveryService.packDelivery(created.getId());
        });
        assertTrue(ex.getMessage().contains("must be PICKED before packing"));
    }

    @Test
    @DisplayName("Invalid transition: Cannot validate a DRAFT or PICKED delivery without packing")
    void testCannotValidateWithoutPacking() {
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Test Customer");
        request.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), 5)));
        DeliveryDto created = deliveryService.createDelivery(request);

        // Cannot validate directly from DRAFT
        IllegalStateException ex1 = assertThrows(IllegalStateException.class, () -> {
            deliveryService.validateDelivery(created.getId());
        });
        assertTrue(ex1.getMessage().contains("must be PACKED before validation"));

        // Pick it, then still cannot validate directly from PICKED
        deliveryService.pickDelivery(created.getId());
        IllegalStateException ex2 = assertThrows(IllegalStateException.class, () -> {
            deliveryService.validateDelivery(created.getId());
        });
        assertTrue(ex2.getMessage().contains("must be PACKED before validation"));
    }

    @Test
    @DisplayName("Invalid transition: Cannot validate an already validated delivery")
    void testCannotValidateTwice() {
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Test Customer");
        request.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), 2)));
        DeliveryDto created = deliveryService.createDelivery(request);

        deliveryService.pickDelivery(created.getId());
        deliveryService.packDelivery(created.getId());
        deliveryService.validateDelivery(created.getId());

        // Second validation must fail
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            deliveryService.validateDelivery(created.getId());
        });
        assertTrue(ex.getMessage().contains("already been validated"));
    }

    @Test
    @DisplayName("Validation fails when stock is insufficient during pick or validation")
    void testInsufficientStockFails() {
        // Attempt to create delivery with quantity exceeding stock
        int currentStock = testProduct.getQuantityOnHand();
        int excessQty = currentStock + 100;

        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Overorder Client");
        request.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), excessQty)));
        DeliveryDto created = deliveryService.createDelivery(request);

        // Picking should fail due to insufficient stock
        IllegalArgumentException pickEx = assertThrows(IllegalArgumentException.class, () -> {
            deliveryService.pickDelivery(created.getId());
        });
        assertTrue(pickEx.getMessage().contains("Insufficient stock for product"));

        // Verify stock has not changed
        Product p = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(currentStock, p.getQuantityOnHand());
    }

    @Test
    @DisplayName("Validation fails on invalid requests (blank customer, zero quantity, invalid product)")
    void testInvalidRequestParameters() {
        // Blank customer
        DeliveryRequest r1 = new DeliveryRequest();
        r1.setCustomerName("   ");
        r1.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), 5)));
        assertThrows(IllegalArgumentException.class, () -> deliveryService.createDelivery(r1));

        // Zero quantity
        DeliveryRequest r2 = new DeliveryRequest();
        r2.setCustomerName("Valid Customer");
        r2.setItems(List.of(new DeliveryItemRequest(testProduct.getId(), 0)));
        assertThrows(IllegalArgumentException.class, () -> deliveryService.createDelivery(r2));

        // Nonexistent product
        DeliveryRequest r3 = new DeliveryRequest();
        r3.setCustomerName("Valid Customer");
        r3.setItems(List.of(new DeliveryItemRequest(999999L, 5)));
        assertThrows(IllegalArgumentException.class, () -> deliveryService.createDelivery(r3));
    }
}
