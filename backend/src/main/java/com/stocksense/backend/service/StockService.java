package com.stocksense.backend.service;

import com.stocksense.backend.dto.StockResponse;
import com.stocksense.backend.entity.Location;
import com.stocksense.backend.entity.Product;
import com.stocksense.backend.entity.Stock;
import com.stocksense.backend.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockRepository stockRepository;

    public Optional<Stock> getStockForProductAtLocation(Long productId, Long locationId) {
        return stockRepository.findByProductIdAndLocationId(productId, locationId);
    }

    public Long getQuantity(Long productId, Long locationId) {
        return stockRepository.findByProductIdAndLocationId(productId, locationId)
                .map(Stock::getQuantity)
                .orElse(0L);
    }

    public List<StockResponse> getStockByLocation(Long locationId) {
        return stockRepository.findByLocationId(locationId).stream()
                .map(StockResponse::from)
                .toList();
    }

    public List<StockResponse> getStockByWarehouse(Long warehouseId) {
        return stockRepository.findByWarehouseId(warehouseId).stream()
                .map(StockResponse::from)
                .toList();
    }

    public List<StockResponse> getStockByProduct(Long productId) {
        return stockRepository.findByProductId(productId).stream()
                .map(StockResponse::from)
                .toList();
    }

    /**
     * Gets or creates a stock row for a product at a location.
     * Used internally by Transfer and Adjustment services.
     */
    @Transactional
    public Stock getOrCreateStock(Product product, Location location) {
        return stockRepository.findByProductIdAndLocationId(product.getId(), location.getId())
                .orElseGet(() -> {
                    Stock newStock = Stock.builder()
                            .product(product)
                            .location(location)
                            .quantity(0L)
                            .build();
                    return stockRepository.save(newStock);
                });
    }
}
