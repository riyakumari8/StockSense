package com.stocksense.repository;

import com.stocksense.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    Optional<ProductStock> findByProductIdAndLocationId(Long productId, Long locationId);
    List<ProductStock> findByProductId(Long productId);
    List<ProductStock> findByLocationId(Long locationId);
}
