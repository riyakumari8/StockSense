package com.stocksense.config;

import com.stocksense.entity.Category;
import com.stocksense.entity.Product;
import com.stocksense.entity.Role;
import com.stocksense.entity.User;
import com.stocksense.repository.CategoryRepository;
import com.stocksense.repository.ProductRepository;
import com.stocksense.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
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
