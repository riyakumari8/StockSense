package com.stocksense.config;

import com.stocksense.entity.*;
import com.stocksense.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final ProductStockRepository productStockRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           WarehouseRepository warehouseRepository,
                           LocationRepository locationRepository,
                           ProductStockRepository productStockRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
        this.productStockRepository = productStockRepository;
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
            saveProduct("Industrial Thermal Label Printer", "PRN-TH-002", "890123456702", "High-speed 300dpi thermal transfer shipping label printer", catElectronics, "Units", new BigDecimal("340.00"), new BigDecimal("499.00"), 6, 10);
            saveProduct("Heavy Duty Steel Pallet Rack 3-Tier", "RCK-STL-003", "890123456703", "Heavy duty industrial steel pallet rack (3000kg load capacity)", catWarehouse, "Units", new BigDecimal("450.00"), new BigDecimal("650.00"), 18, 5);
            saveProduct("Hydraulic Pallet Jack 2500kg", "JCK-PLT-004", "890123456704", "Heavy duty manual hydraulic pallet truck with polyurethane wheels", catWarehouse, "Units", new BigDecimal("280.00"), new BigDecimal("399.00"), 3, 5);
            saveProduct("Stackable Plastic Storage Bins (Pack of 10)", "BIN-PLS-005", "890123456705", "Heavy-duty polypropylene stackable shelf storage bins", catPackaging, "Boxes", new BigDecimal("25.00"), new BigDecimal("45.00"), 240, 30);
            saveProduct("Anti-Static ESD Packing Foam Roll", "FMA-ESD-006", "890123456706", "100m roll of 5mm anti-static protective cushioning foam", catPackaging, "Rolls", new BigDecimal("35.00"), new BigDecimal("60.00"), 8, 15);
            saveProduct("Ergonomic Industrial Workstation Desk", "DSK-IND-007", "890123456707", "Height-adjustable ESD workstation with overhead LED light bar", catFurniture, "Units", new BigDecimal("550.00"), new BigDecimal("820.00"), 12, 4);
        }

        // 4. Seed Warehouses
        Warehouse whMain = warehouseRepository.findByCode("WH-MAIN")
                .orElseGet(() -> warehouseRepository.save(new Warehouse("Central Logistics Hub", "WH-MAIN", "100 Industrial Parkway, Zone A")));

        Warehouse whOverflow = warehouseRepository.findByCode("WH-OFLW")
                .orElseGet(() -> warehouseRepository.save(new Warehouse("Secondary Overflow Depot", "WH-OFLW", "405 Logistics Way, Gate B")));

        // 5. Seed Locations
        Location locRackA = locationRepository.findByWarehouseIdAndCode(whMain.getId(), "RA-01")
                .orElseGet(() -> locationRepository.save(new Location("Main Rack A1", "RA-01", whMain, "Primary pick rack A1")));

        Location locRackB = locationRepository.findByWarehouseIdAndCode(whMain.getId(), "RB-02")
                .orElseGet(() -> locationRepository.save(new Location("Main Rack B2", "RB-02", whMain, "Secondary storage rack B2")));

        Location locProduction = locationRepository.findByWarehouseIdAndCode(whMain.getId(), "PROD-01")
                .orElseGet(() -> locationRepository.save(new Location("Production Assembly Floor", "PROD-01", whMain, "Workstation assembly area")));

        Location locOverflowBulk = locationRepository.findByWarehouseIdAndCode(whOverflow.getId(), "BULK-01")
                .orElseGet(() -> locationRepository.save(new Location("Overflow Bulk Storage 1", "BULK-01", whOverflow, "High-density bulk pallet storage")));

        // 6. Sync ProductStock for all products to default Location (Rack A1)
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            if (productStockRepository.findByProductIdAndLocationId(p.getId(), locRackA.getId()).isEmpty()) {
                productStockRepository.save(new ProductStock(p, locRackA, p.getQuantityOnHand()));
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
