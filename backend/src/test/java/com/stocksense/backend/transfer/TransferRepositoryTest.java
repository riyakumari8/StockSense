package com.stocksense.backend.transfer;

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
 * Verifies the Transfer entity mapping matches V4__create_transfers_table.sql,
 * including the DB-level checks that quantity must be positive and that
 * source and destination locations must differ. Business-rule tests
 * (insufficient stock, duplicate validation, rollback, concurrency) belong
 * to TransferService tests in Phase 3, once that service exists.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TransferRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TransferRepository transferRepository;

    private Location rackA;
    private Location rackB;

    private void setUpRacks() {
        Warehouse warehouse = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        rackA = locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        rackB = locationRepository.save(new Location("Rack B", "RACK-B", warehouse, Status.ACTIVE));
    }

    @Test
    void savesAndReloadsADraftTransfer() {
        setUpRacks();

        Transfer saved = transferRepository.save(new Transfer(
                "TRF-000001", 1001L, rackA.getWarehouse(), rackA,
                rackB.getWarehouse(), rackB, 30, "test transfer", null));

        Transfer found = transferRepository.findByReferenceNumber("TRF-000001").orElseThrow();

        assertThat(found.getId()).isEqualTo(saved.getId());
        assertThat(found.getStatus()).isEqualTo(TransferStatus.DRAFT);
        assertThat(found.getQuantity()).isEqualTo(30);
    }

    @Test
    void rejectsZeroOrNegativeQuantity() {
        setUpRacks();

        assertThatThrownBy(() -> {
            transferRepository.save(new Transfer(
                    "TRF-000002", 1001L, rackA.getWarehouse(), rackA,
                    rackB.getWarehouse(), rackB, 0, null, null));
            transferRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsSameSourceAndDestinationLocation() {
        setUpRacks();

        assertThatThrownBy(() -> {
            transferRepository.save(new Transfer(
                    "TRF-000003", 1001L, rackA.getWarehouse(), rackA,
                    rackA.getWarehouse(), rackA, 10, null, null));
            transferRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsDuplicateReferenceNumber() {
        setUpRacks();
        transferRepository.save(new Transfer(
                "TRF-000004", 1001L, rackA.getWarehouse(), rackA,
                rackB.getWarehouse(), rackB, 10, null, null));
        transferRepository.flush();

        assertThatThrownBy(() -> {
            transferRepository.save(new Transfer(
                    "TRF-000004", 1002L, rackA.getWarehouse(), rackA,
                    rackB.getWarehouse(), rackB, 5, null, null));
            transferRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
