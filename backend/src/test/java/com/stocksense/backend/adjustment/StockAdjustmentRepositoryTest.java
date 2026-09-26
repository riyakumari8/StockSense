package com.stocksense.backend.adjustment;

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

/**
 * Verifies the StockAdjustment entity mapping matches
 * V5__create_stock_adjustments_table.sql, and that the entity itself
 * computes difference = physicalQuantity - systemQuantity rather than
 * accepting it from the caller.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StockAdjustmentRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StockAdjustmentRepository adjustmentRepository;

    private Location rackB;

    private void setUp() {
        Warehouse warehouse = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        rackB = locationRepository.save(new Location("Rack B", "RACK-B", warehouse, Status.ACTIVE));
    }

    @Test
    void computesNegativeDifferenceForAShortCount() {
        setUp();

        StockAdjustment saved = adjustmentRepository.save(new StockAdjustment(
                "ADJ-000001", 2001L, rackB.getWarehouse(), rackB, 30, 27, "Cycle count", null));

        StockAdjustment found = adjustmentRepository.findByReferenceNumber("ADJ-000001").orElseThrow();
        assertThat(found.getDifference()).isEqualTo(-3);
        assertThat(found.getStatus()).isEqualTo(AdjustmentStatus.DRAFT);
    }

    @Test
    void computesPositiveDifferenceForASurplusCount() {
        setUp();

        StockAdjustment saved = adjustmentRepository.save(new StockAdjustment(
                "ADJ-000002", 2001L, rackB.getWarehouse(), rackB, 100, 110, "Cycle count", null));

        assertThat(saved.getDifference()).isEqualTo(10);
    }

    @Test
    void rejectsNegativePhysicalQuantity() {
        setUp();

        assertThatThrownBy(() -> {
            adjustmentRepository.save(new StockAdjustment(
                    "ADJ-000003", 2001L, rackB.getWarehouse(), rackB, 30, -1, "Cycle count", null));
            adjustmentRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDuplicateReferenceNumber() {
        setUp();
        adjustmentRepository.save(new StockAdjustment(
                "ADJ-000004", 2001L, rackB.getWarehouse(), rackB, 30, 27, "Cycle count", null));
        adjustmentRepository.flush();

        assertThatThrownBy(() -> {
            adjustmentRepository.save(new StockAdjustment(
                    "ADJ-000004", 2002L, rackB.getWarehouse(), rackB, 10, 9, "Cycle count", null));
            adjustmentRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
