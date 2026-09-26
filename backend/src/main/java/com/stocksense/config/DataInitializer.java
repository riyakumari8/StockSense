package com.stocksense.config;

import com.stocksense.entity.Category;
import com.stocksense.entity.Product;
import com.stocksense.entity.Role;
import com.stocksense.entity.User;
import com.stocksense.entity.Delivery;
import com.stocksense.entity.DeliveryItem;
import com.stocksense.entity.DeliveryStatus;
import com.stocksense.entity.StockLedger;
import com.stocksense.repository.CategoryRepository;
import com.stocksense.repository.DeliveryRepository;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.StockLedgerRepository;
import com.stocksense.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final DeliveryRepository deliveryRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           DeliveryRepository deliveryRepository,
                           StockLedgerRepository stockLedgerRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.deliveryRepository = deliveryRepository;
        this.stockLedgerRepository = stockLedgerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Users
        if (!userRepository.existsByEmail("user@example.com")) {
            User testUser = new User();
            testUser.setName("Demo User");
            testUser.setEmail("user@example.com");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setRole(Role.USER);
            testUser.setPhone("+1 (555) 019-2834");
            userRepository.save(testUser);
        }

        if (!userRepository.existsByEmail("admin@stocksense.com")) {
            User adminUser = new User();
            adminUser.setName("StockSense Admin");
            adminUser.setEmail("admin@stocksense.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.ADMIN);
            adminUser.setPhone("+1 (555) 010-9999");
            userRepository.save(adminUser);
        }

        // 2. Seed Categories
        Category catElectronics = categoryRepository.findByName("Electronics & Hardware")
                .orElseGet(() -> categoryRepository.save(new Category("Electronics & Hardware", "ELEC", "Electronic scanners, printers, and handheld devices")));

        Category catWarehouse = categoryRepository.findByName("Warehouse Equipment")
                .orElseGet(() -> categoryRepository.save(new Category("Warehouse Equipment", "WHEQP", "Heavy racks, pallet jacks, and material handling gear")));

        Category catPackaging = categoryRepository.findByName("Packaging & Storage")
                .orElseGet(() -> categoryRepository.save(new Category("Packaging & Storage", "PKG", "Storage bins, cardboard boxes, ESD foam, and labels")));

        Category catFurniture = categoryRepository.findByName("Industrial Furniture")
                .orElseGet(() -> categoryRepository.save(new Category("Industrial Furniture", "FRN", "Ergonomic workbenches and heavy-duty storage cabinets")));

        // 3. Seed Products
        if (productRepository.count() == 0) {
            saveProduct("Enterprise 2D Barcode Scanner", "SCN-2D-001", "890123456701", "Wireless handheld 2D barcode scanner with charging dock", catElectronics, "Units", new BigDecimal("120.00"), new BigDecimal("185.00"), 45, 10);
            saveProduct("Industrial Thermal Label Printer", "PRN-TH-002", "890123456702", "High-speed 300dpi thermal transfer shipping label printer", catElectronics, "Units", new BigDecimal("340.00"), new BigDecimal("499.00"), 6, 10); // LOW STOCK
            saveProduct("Heavy Duty Steel Pallet Rack 3-Tier", "RCK-STL-003", "890123456703", "Heavy duty industrial steel pallet rack (3000kg load capacity)", catWarehouse, "Units", new BigDecimal("450.00"), new BigDecimal("650.00"), 18, 5);
            saveProduct("Hydraulic Pallet Jack 2500kg", "JCK-PLT-004", "890123456704", "Heavy duty manual hydraulic pallet truck with polyurethane wheels", catWarehouse, "Units", new BigDecimal("280.00"), new BigDecimal("399.00"), 3, 5); // LOW STOCK
            saveProduct("Stackable Plastic Storage Bins (Pack of 10)", "BIN-PLS-005", "890123456705", "Heavy-duty polypropylene stackable shelf storage bins", catPackaging, "Boxes", new BigDecimal("25.00"), new BigDecimal("45.00"), 240, 30);
            saveProduct("Anti-Static ESD Packing Foam Roll", "FMA-ESD-006", "890123456706", "100m roll of 5mm anti-static protective cushioning foam", catPackaging, "Rolls", new BigDecimal("35.00"), new BigDecimal("60.00"), 8, 15); // LOW STOCK
            saveProduct("Ergonomic Industrial Workstation Desk", "DSK-IND-007", "890123456707", "Height-adjustable ESD workstation with overhead LED light bar", catFurniture, "Units", new BigDecimal("550.00"), new BigDecimal("820.00"), 12, 4);
        }

        // 4. Seed Deliveries
        if (deliveryRepository.count() == 0) {
            Product scanner = productRepository.findBySku("SCN-2D-001").orElse(null);
            Product printer = productRepository.findBySku("PRN-TH-002").orElse(null);
            Product rack = productRepository.findBySku("RCK-STL-003").orElse(null);
            Product jack = productRepository.findBySku("JCK-PLT-004").orElse(null);
            Product bins = productRepository.findBySku("BIN-PLS-005").orElse(null);

            if (scanner != null && printer != null && rack != null) {
                // 1. DRAFT Delivery - Ready to Pick
                Delivery d1 = new Delivery("DEL-20260926-1001", "Acme Distribution Networks");
                d1.setStatus(DeliveryStatus.DRAFT);
                d1.addItem(new DeliveryItem(d1, scanner, 5));
                d1.addItem(new DeliveryItem(d1, bins != null ? bins : printer, 20));
                deliveryRepository.save(d1);

                // 2. PICKED Delivery - Ready to Pack
                Delivery d2 = new Delivery("DEL-20260926-1002", "Global Cargo Solutions");
                d2.setStatus(DeliveryStatus.PICKED);
                d2.addItem(new DeliveryItem(d2, printer, 2));
                deliveryRepository.save(d2);

                // 3. PACKED Delivery - Ready to Validate
                Delivery d3 = new Delivery("DEL-20260926-1003", "Apex Manufacturing Ltd");
                d3.setStatus(DeliveryStatus.PACKED);
                d3.addItem(new DeliveryItem(d3, rack, 2));
                if (jack != null) {
                    d3.addItem(new DeliveryItem(d3, jack, 1));
                }
                deliveryRepository.save(d3);

                // 4. VALIDATED Delivery - Already dispatched with StockLedger entry
                Delivery d4 = new Delivery("DEL-20260926-1004", "Prime Warehousing Hub");
                d4.setStatus(DeliveryStatus.VALIDATED);
                d4.addItem(new DeliveryItem(d4, scanner, 3));
                deliveryRepository.save(d4);

                // Add StockLedger entry for d4
                StockLedger ledger = new StockLedger(
                        scanner,
                        -3,
                        "DELIVERY",
                        "DEL-20260926-1004",
                        "Delivery order DEL-20260926-1004 validated for customer: Prime Warehousing Hub",
                        48,
                        45
                );
                stockLedgerRepository.save(ledger);
            }
        }
    }

    private void saveProduct(String name, String sku, String barcode, String desc, Category category, String uom, BigDecimal cost, BigDecimal sales, int qty, int reorder) {
        Product p = new Product();
        p.setName(name);
        p.setSku(sku);
        p.setBarcode(barcode);
        p.setDescription(desc);
        p.setCategory(category);
        p.setUnitOfMeasure(uom);
        p.setCostPrice(cost);
        p.setSalesPrice(sales);
        p.setQuantityOnHand(qty);
        p.setReorderPoint(reorder);
        productRepository.save(p);
    }
}
