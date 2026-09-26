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

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return ProductDto.fromEntity(product);
    }

    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProductDto> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(query).stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = new Product();
        mapRequestToProduct(request, product);

        Product saved = productRepository.save(product);
        return ProductDto.fromEntity(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if (!product.getSku().equalsIgnoreCase(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + request.getSku() + "' already exists");
        }

        mapRequestToProduct(request, product);

        Product updated = productRepository.save(product);
        return ProductDto.fromEntity(updated);
    }

    @Transactional
    public ProductDto updateStockQuantity(Long id, Integer quantityAdjustment) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

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
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setDescription(request.getDescription());
        product.setUnitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure() : "Units");
        product.setCostPrice(request.getCostPrice());
        product.setSalesPrice(request.getSalesPrice());
        product.setQuantityOnHand(request.getQuantityOnHand());
        product.setReorderPoint(request.getReorderPoint());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }
}
