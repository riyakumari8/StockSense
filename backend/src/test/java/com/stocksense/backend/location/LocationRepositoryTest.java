package com.stocksense.backend.location;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stocksense.backend.common.Status;
import com.stocksense.backend.warehouse.Warehouse;
import com.stocksense.backend.warehouse.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Verifies the Location entity mapping matches V2__create_locations_table.sql,
 * that a location's warehouse FK is enforced, and that the location code is
 * unique per-warehouse (not globally).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class LocationRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LocationRepository locationRepository;

    private Warehouse persistWarehouse(String code) {
        return warehouseRepository.save(new Warehouse("Warehouse " + code, code, null, Status.ACTIVE));
    }

    @Test
    void savesAndReloadsALocationUnderItsWarehouse() {
        Warehouse warehouse = persistWarehouse("MAIN-WH");

        Location saved = locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        Location found = locationRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getWarehouse().getId()).isEqualTo(warehouse.getId());
        assertThat(found.getCode()).isEqualTo("RACK-A");
    }

    @Test
    void sameCodeIsAllowedAcrossDifferentWarehouses() {
        Warehouse mainWh = persistWarehouse("MAIN-WH");
        Warehouse prodWh = persistWarehouse("PROD-WH");

        locationRepository.save(new Location("Rack A", "RACK-A", mainWh, Status.ACTIVE));
        locationRepository.saveAndFlush(new Location("Rack A", "RACK-A", prodWh, Status.ACTIVE));

        assertThat(locationRepository.existsByWarehouseIdAndCode(mainWh.getId(), "RACK-A")).isTrue();
        assertThat(locationRepository.existsByWarehouseIdAndCode(prodWh.getId(), "RACK-A")).isTrue();
    }

    @Test
    void rejectsDuplicateCodeWithinSameWarehouse() {
        Warehouse warehouse = persistWarehouse("MAIN-WH");
        locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        locationRepository.flush();

        assertThatThrownBy(() -> {
            locationRepository.save(new Location("Rack A Duplicate", "RACK-A", warehouse, Status.ACTIVE));
            locationRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void findsAllLocationsForAWarehouse() {
        Warehouse warehouse = persistWarehouse("MAIN-WH");
        locationRepository.save(new Location("Rack A", "RACK-A", warehouse, Status.ACTIVE));
        locationRepository.save(new Location("Rack B", "RACK-B", warehouse, Status.ACTIVE));

        assertThat(locationRepository.findByWarehouseId(warehouse.getId())).hasSize(2);
    }
}
