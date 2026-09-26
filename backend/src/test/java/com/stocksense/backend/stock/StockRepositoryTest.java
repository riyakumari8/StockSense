package com.stocksense.backend.stock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stocksense.backend.common.Status;
import com.stocksense.backend.location.Location;
import com.stocksense.backend.location.LocationRepository;
import com.stocksense.backend.warehouse.Warehouse;
import com.stocksense.backend.warehouse.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verifies the Stock entity mapping matches V3__create_stock_table.sql: the
 * (productId, locationId) uniqueness, the non-negative quantity check
 * constraint, and that the pessimistic-lock lookup used by the transfer/
 * adjustment services (Phase 3) returns the expected row.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StockRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StockRepository stockRepository;

    private Location persistLocation() {
        Warehouse warehouse = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        return locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
    }

    @Test
    void savesAndReloadsStockForAProductAtALocation() {
        Location location = persistLocation();

        Stock saved = stockRepository.save(new Stock(1001L, location, 100));
        Stock found = stockRepository.findByProductIdAndLocationId(1001L, location.getId()).orElseThrow();

        assertThat(found.getId()).isEqualTo(saved.getId());
        assertThat(found.getQuantity()).isEqualTo(100);
        assertThat(found.getVersion()).isNotNull();
    }

    @Test
    void rejectsDuplicateProductLocationPair() {
        Location location = persistLocation();
        stockRepository.save(new Stock(1001L, location, 100));
        stockRepository.flush();

        assertThatThrownBy(() -> {
            stockRepository.save(new Stock(1001L, location, 50));
            stockRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsNegativeQuantityAtTheDatabaseLevel() {
        Location location = persistLocation();

        assertThatThrownBy(() -> {
            stockRepository.save(new Stock(1001L, location, -5));
            stockRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @Transactional
    void lockByProductIdAndLocationIdReturnsTheRow() {
        Location location = persistLocation();
        stockRepository.saveAndFlush(new Stock(1001L, location, 100));

        Stock locked = stockRepository.lockByProductIdAndLocationId(1001L, location.getId()).orElseThrow();

        assertThat(locked.getQuantity()).isEqualTo(100);
    }
}
