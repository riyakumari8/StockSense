package com.stocksense.backend.stock;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProductIdAndLocationId(Long productId, Long locationId);

    List<Stock> findByLocationId(Long locationId);

    List<Stock> findByProductId(Long productId);

    /**
     * Takes a PostgreSQL row-level write lock (SELECT ... FOR UPDATE) on the
     * stock row for (productId, locationId). Must be called from within an
     * existing @Transactional method. This is the concurrency-safety
     * mechanism for transfers and adjustments: two transactions racing on
     * the same (product, location) will serialize here, so a read-check-
     * write of quantity can never race and drive stock negative.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Stock s where s.productId = :productId and s.location.id = :locationId")
    Optional<Stock> lockByProductIdAndLocationId(@Param("productId") Long productId,
                                                  @Param("locationId") Long locationId);
}
