package com.stocksense.backend.warehouse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stocksense.backend.common.Status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Verifies the Warehouse entity mapping matches V1__create_warehouses_table.sql
 * and that the unique warehouse-code constraint is enforced by the database.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class WarehouseRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Test
    void savesAndReloadsAWarehouse() {
        Warehouse saved = warehouseRepository.save(
                new Warehouse("Main Warehouse", "MAIN-WH", "123 Industrial Ave", Status.ACTIVE));

        Warehouse found = warehouseRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getName()).isEqualTo("Main Warehouse");
        assertThat(found.getCode()).isEqualTo("MAIN-WH");
        assertThat(found.getStatus()).isEqualTo(Status.ACTIVE);
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getUpdatedAt()).isNotNull();
    }

    @Test
    void rejectsDuplicateWarehouseCode() {
        warehouseRepository.save(new Warehouse("Main Warehouse", "MAIN-WH", null, Status.ACTIVE));
        warehouseRepository.flush();

        assertThatThrownBy(() -> {
            warehouseRepository.save(new Warehouse("Second Warehouse", "MAIN-WH", null, Status.ACTIVE));
            warehouseRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void existsByCodeReflectsPersistedState() {
        warehouseRepository.save(new Warehouse("Production Warehouse", "PROD-WH", null, Status.ACTIVE));

        assertThat(warehouseRepository.existsByCode("PROD-WH")).isTrue();
        assertThat(warehouseRepository.existsByCode("UNKNOWN-WH")).isFalse();
    }
}
