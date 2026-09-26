package com.stocksense.backend.service;

import com.stocksense.backend.dto.WarehouseRequest;
import com.stocksense.backend.dto.WarehouseResponse;
import com.stocksense.backend.entity.Warehouse;
import com.stocksense.backend.entity.enums.WarehouseStatus;
import com.stocksense.backend.exception.DuplicateResourceException;
import com.stocksense.backend.exception.ResourceNotFoundException;
import com.stocksense.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAllWithLocations().stream()
                .map(WarehouseResponse::from)
                .toList();
    }

    public WarehouseResponse getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findByIdWithLocations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));
        return WarehouseResponse.from(warehouse);
    }

    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Warehouse code already exists.");
        }

        Warehouse warehouse = Warehouse.builder()
                .name(request.name())
                .code(request.code().toUpperCase())
                .address(request.address())
                .status(request.status() != null ? request.status() : WarehouseStatus.ACTIVE)
                .build();

        warehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.from(warehouse);
    }

    @Transactional
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));

        if (warehouseRepository.existsByCodeAndIdNot(request.code(), id)) {
            throw new DuplicateResourceException("Warehouse code already exists.");
        }

        warehouse.setName(request.name());
        warehouse.setCode(request.code().toUpperCase());
        warehouse.setAddress(request.address());
        if (request.status() != null) {
            warehouse.setStatus(request.status());
        }

        warehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.from(warehouse);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));
        warehouse.setStatus(WarehouseStatus.INACTIVE);
        warehouseRepository.save(warehouse);
    }
}
