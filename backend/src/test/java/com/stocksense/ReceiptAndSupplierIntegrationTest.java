package com.stocksense;

import com.stocksense.dto.*;
import com.stocksense.entity.*;
import com.stocksense.repository.*;
import com.stocksense.service.ReceiptService;
import com.stocksense.service.SupplierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ReceiptAndSupplierIntegrationTest {

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private ReceiptService receiptService;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockLedgerRepository stockLedgerRepository;

    private Product testProduct1;
    private Product testProduct2;
    private Supplier testSupplier;

    @BeforeEach
    void setUp() {
        // Prepare Category
        Category category = categoryRepository.findByName("Integration Test Category")
                .orElseGet(() -> categoryRepository.save(new Category("Integration Test Category", "TEST_CAT", "Category for integration testing")));

        // Prepare Products
        testProduct1 = productRepository.findBySku("TEST-SKU-001").orElseGet(() -> {
            Product p = new Product();
            p.setName("Steel Rods 10mm");
            p.setSku("TEST-SKU-001");
            p.setCategory(category);
            p.setUnitOfMeasure("kg");
            p.setCostPrice(new BigDecimal("50.00"));
            p.setSalesPrice(new BigDecimal("75.00"));
            p.setQuantityOnHand(100);
            p.setReorderPoint(20);
            return productRepository.save(p);
        });
        testProduct1.setQuantityOnHand(100);
        productRepository.save(testProduct1);

        testProduct2 = productRepository.findBySku("TEST-SKU-002").orElseGet(() -> {
            Product p = new Product();
            p.setName("Steel Sheets 5mm");
            p.setSku("TEST-SKU-002");
            p.setCategory(category);
            p.setUnitOfMeasure("kg");
            p.setCostPrice(new BigDecimal("80.00"));
            p.setSalesPrice(new BigDecimal("110.00"));
            p.setQuantityOnHand(50);
            p.setReorderPoint(15);
            return productRepository.save(p);
        });
        testProduct2.setQuantityOnHand(50);
        productRepository.save(testProduct2);

        // Prepare Supplier
        SupplierRequest suppReq = new SupplierRequest();
        suppReq.setSupplierName("ABC Steel Pvt Ltd " + System.currentTimeMillis());
        suppReq.setContactPerson("Ramesh Kumar");
        suppReq.setEmail("contact@abcsteel.com");
        suppReq.setPhone("+91 9876543210");
        suppReq.setAddress("Industrial Area Phase 2, Mumbai");
        SupplierDto createdSupp = supplierService.createSupplier(suppReq);
        testSupplier = supplierRepository.findById(createdSupp.getId()).orElseThrow();
    }

    @Test
    void testSupplierCrud() {
        // 1. Get Suppliers
        List<SupplierDto> suppliers = supplierService.getAllSuppliers(null);
        assertFalse(suppliers.isEmpty(), "Suppliers list should not be empty");

        // 2. Update Supplier
        SupplierRequest updateReq = new SupplierRequest();
        updateReq.setSupplierName(testSupplier.getSupplierName() + " Updated");
        updateReq.setContactPerson("Suresh Kumar");
        updateReq.setEmail("suresh@abcsteel.com");
        updateReq.setPhone("+91 9123456789");
        updateReq.setAddress("Updated Address");

        SupplierDto updated = supplierService.updateSupplier(testSupplier.getId(), updateReq);
        assertEquals("Suresh Kumar", updated.getContactPerson());
        assertEquals("Updated Address", updated.getAddress());

        // 3. Get by ID
        SupplierDto found = supplierService.getSupplierById(testSupplier.getId());
        assertEquals("Suresh Kumar", found.getContactPerson());
    }

    @Test
    void testCompleteReceiptWorkflowAndStockIncrease() {
        // 1. Initial product stock levels
        int initialStock1 = productRepository.findById(testProduct1.getId()).orElseThrow().getQuantityOnHand();
        int initialStock2 = productRepository.findById(testProduct2.getId()).orElseThrow().getQuantityOnHand();

        assertEquals(100, initialStock1);
        assertEquals(50, initialStock2);

        // 2. Create Receipt in DRAFT
        ReceiptRequest receiptReq = new ReceiptRequest();
        receiptReq.setSupplierId(testSupplier.getId());
        receiptReq.setNotes("Purchase order for steel supplies");
        receiptReq.setItems(List.of(
                new ReceiptItemRequest(testProduct1.getId(), 50, new BigDecimal("50.00")),
                new ReceiptItemRequest(testProduct2.getId(), 25, new BigDecimal("80.00"))
        ));

        ReceiptDto createdReceipt = receiptService.createReceipt(receiptReq);

        assertNotNull(createdReceipt.getId());
        assertNotNull(createdReceipt.getReceiptNumber());
        assertEquals(ReceiptStatus.DRAFT, createdReceipt.getStatus());
        assertEquals(2, createdReceipt.getItems().size());
        assertEquals(75, createdReceipt.getTotalQuantity());

        // Verify stock has NOT increased merely when receipt is created
        int stockAfterCreate1 = productRepository.findById(testProduct1.getId()).orElseThrow().getQuantityOnHand();
        int stockAfterCreate2 = productRepository.findById(testProduct2.getId()).orElseThrow().getQuantityOnHand();
        assertEquals(initialStock1, stockAfterCreate1, "Stock must not change when receipt is created in DRAFT");
        assertEquals(initialStock2, stockAfterCreate2, "Stock must not change when receipt is created in DRAFT");

        // 3. Validate Receipt
        ReceiptDto validatedReceipt = receiptService.validateReceipt(createdReceipt.getId());

        assertEquals(ReceiptStatus.VALIDATED, validatedReceipt.getStatus());
        assertNotNull(validatedReceipt.getValidatedAt());

        // 4. Verify stock has INCREASED accurately
        int stockAfterValidate1 = productRepository.findById(testProduct1.getId()).orElseThrow().getQuantityOnHand();
        int stockAfterValidate2 = productRepository.findById(testProduct2.getId()).orElseThrow().getQuantityOnHand();

        assertEquals(initialStock1 + 50, stockAfterValidate1, "Stock for product 1 should increase by 50 (from 100 to 150)");
        assertEquals(initialStock2 + 25, stockAfterValidate2, "Stock for product 2 should increase by 25 (from 50 to 75)");

        // 5. Verify Stock Ledger has recorded movements
        List<StockLedger> ledgersProduct1 = stockLedgerRepository.findByProductIdOrderByCreatedAtDesc(testProduct1.getId());
        assertFalse(ledgersProduct1.isEmpty(), "Stock ledger should record movement for product 1");

        StockLedger ledger1 = ledgersProduct1.get(0);
        assertEquals(50, ledger1.getQuantityChange());
        assertEquals(initialStock1, ledger1.getPreviousQuantity());
        assertEquals(initialStock1 + 50, ledger1.getResultingQuantity());
        assertEquals(MovementType.RECEIPT, ledger1.getMovementType());
        assertEquals(createdReceipt.getReceiptNumber(), ledger1.getReference());

        List<StockLedger> ledgersProduct2 = stockLedgerRepository.findByProductIdOrderByCreatedAtDesc(testProduct2.getId());
        assertFalse(ledgersProduct2.isEmpty(), "Stock ledger should record movement for product 2");
        StockLedger ledger2 = ledgersProduct2.get(0);
        assertEquals(25, ledger2.getQuantityChange());
        assertEquals(initialStock2, ledger2.getPreviousQuantity());
        assertEquals(initialStock2 + 25, ledger2.getResultingQuantity());
        assertEquals(MovementType.RECEIPT, ledger2.getMovementType());
        assertEquals(createdReceipt.getReceiptNumber(), ledger2.getReference());

        // 6. Try validating TWICE - should fail
        assertThrows(IllegalStateException.class, () -> {
            receiptService.validateReceipt(createdReceipt.getId());
        }, "Validating an already validated receipt must throw an exception");

        // 7. Verify supplier cannot be deleted when it has receipts
        assertThrows(IllegalStateException.class, () -> {
            supplierService.deleteSupplier(testSupplier.getId());
        }, "Cannot delete supplier with existing receipts");
    }

    @Test
    void testInvalidQuantityAndInvalidProduct() {
        // Try creating receipt with quantity <= 0
        ReceiptRequest invalidQtyReq = new ReceiptRequest();
        invalidQtyReq.setSupplierId(testSupplier.getId());
        invalidQtyReq.setItems(List.of(
                new ReceiptItemRequest(testProduct1.getId(), 0, new BigDecimal("50.00"))
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            receiptService.createReceipt(invalidQtyReq);
        }, "Quantity <= 0 must throw IllegalArgumentException");

        // Try creating receipt with invalid product ID
        ReceiptRequest invalidProdReq = new ReceiptRequest();
        invalidProdReq.setSupplierId(testSupplier.getId());
        invalidProdReq.setItems(List.of(
                new ReceiptItemRequest(999999L, 10, new BigDecimal("50.00"))
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            receiptService.createReceipt(invalidProdReq);
        }, "Invalid product ID must throw IllegalArgumentException");
    }
}
