package com.stocksense.backend.ledger;

import static org.assertj.core.api.Assertions.assertThat;

import com.stocksense.backend.common.Status;
import com.stocksense.backend.location.Location;
import com.stocksense.backend.location.LocationRepository;
import com.stocksense.backend.warehouse.Warehouse;
import com.stocksense.backend.warehouse.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

/**
 * Verifies the StockLedger entity mapping matches
 * V6__create_stock_ledger_table.sql and that the filtered search query
 * behaves correctly. There is deliberately no test (and no production
 * code) for updating or deleting a ledger row -- see the class comment on
 * {@link StockLedger}.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StockLedgerRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StockLedgerRepository stockLedgerRepository;

    @Test
    void recordsATransferMovementWithBeforeAndAfterQuantities() {
        Warehouse warehouse = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        Location rackA = locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        Location rackB = locationRepository.save(new Location("Rack B", "RACK-B", warehouse, Status.ACTIVE));

        StockLedger entry = stockLedgerRepository.save(new StockLedger(
                1001L, warehouse, rackA, rackB, MovementType.TRANSFER,
                "TRANSFER", 1L, -30, 100, 70, null, "Transfer TRF-000001"));

        StockLedger found = stockLedgerRepository.findById(entry.getId()).orElseThrow();
        assertThat(found.getMovementType()).isEqualTo(MovementType.TRANSFER);
        assertThat(found.getPreviousQuantity()).isEqualTo(100);
        assertThat(found.getResultingQuantity()).isEqualTo(70);
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void searchFiltersByProductWarehouseAndMovementType() {
        Warehouse warehouse = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        Location rackA = locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        Location rackB = locationRepository.save(new Location("Rack B", "RACK-B", warehouse, Status.ACTIVE));

        stockLedgerRepository.save(new StockLedger(
                1001L, warehouse, rackA, rackB, MovementType.TRANSFER, "TRANSFER", 1L,
                -30, 100, 70, null, null));
        stockLedgerRepository.save(new StockLedger(
                1001L, warehouse, rackB, null, MovementType.ADJUSTMENT, "ADJUSTMENT", 1L,
                -3, 30, 27, null, null));

        var transfersOnly = stockLedgerRepository.search(
                1001L, warehouse.getId(), null, MovementType.TRANSFER, null, null, PageRequest.of(0, 20));

        assertThat(transfersOnly.getTotalElements()).isEqualTo(1);
        assertThat(transfersOnly.getContent().get(0).getMovementType()).isEqualTo(MovementType.TRANSFER);

        var allForWarehouse = stockLedgerRepository.search(
                null, warehouse.getId(), null, null, null, null, PageRequest.of(0, 20));

        assertThat(allForWarehouse.getTotalElements()).isEqualTo(2);
    }
}
