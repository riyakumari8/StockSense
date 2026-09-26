package com.stocksense.service;

import com.stocksense.dto.ProductDto;
import com.stocksense.dto.ProductRequest;
import com.stocksense.entity.Category;
import com.stocksense.entity.Product;
import com.stocksense.repository.CategoryRepository;
import com.stocksense.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDto> getAllProducts(String search, Long categoryId) {
        if ((search == null || search.isBlank()) && categoryId == null) {
            return productRepository.findAll().stream()
                    .map(ProductDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return productRepository.filterProducts(search, categoryId).stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        return ProductDto.fromEntity(product);
    }

    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (request.getSku() == null || request.getSku().isBlank()) {
            throw new IllegalArgumentException("SKU / Product Code cannot be empty");
        }
        if (request.getQuantityOnHand() != null && request.getQuantityOnHand() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        if (productRepository.existsBySku(request.getSku().trim())) {
            throw new IllegalArgumentException("Product with SKU '" + request.getSku().trim() + "' already exists");
        }

        Product product = new Product();
        mapRequestToProduct(request, product);

        Product saved = productRepository.save(product);
        return ProductDto.fromEntity(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (request.getSku() == null || request.getSku().isBlank()) {
            throw new IllegalArgumentException("SKU / Product Code cannot be empty");
        }
        if (request.getQuantityOnHand() != null && request.getQuantityOnHand() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        String newSku = request.getSku().trim();
        if (!product.getSku().equalsIgnoreCase(newSku) && productRepository.existsBySku(newSku)) {
            throw new IllegalArgumentException("Product with SKU '" + newSku + "' already exists");
        }

        mapRequestToProduct(request, product);

        Product updated = productRepository.save(product);
        return ProductDto.fromEntity(updated);
    }

    @Transactional
    public ProductDto updateStockQuantity(Long id, Integer quantityAdjustment) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        int newQty = product.getQuantityOnHand() + quantityAdjustment;
        if (newQty < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be reduced below 0");
        }

        product.setQuantityOnHand(newQty);
        Product updated = productRepository.save(product);
        return ProductDto.fromEntity(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        productRepository.delete(product);
    }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim());
        product.setBarcode(request.getBarcode() != null ? request.getBarcode().trim() : null);
        product.setDescription(request.getDescription());
        product.setUnitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure().trim() : "Units");
        product.setCostPrice(request.getCostPrice() != null ? request.getCostPrice() : java.math.BigDecimal.ZERO);
        product.setSalesPrice(request.getSalesPrice() != null ? request.getSalesPrice() : java.math.BigDecimal.ZERO);
        product.setQuantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0);
        product.setReorderPoint(request.getReorderPoint() != null ? request.getReorderPoint() : 10);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }
}
