package com.stocksense.service;

import com.stocksense.dto.WarehouseDto;
import com.stocksense.dto.WarehouseRequest;
import com.stocksense.entity.Warehouse;
import com.stocksense.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(WarehouseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + id));
        return WarehouseDto.fromEntity(warehouse);
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Warehouse name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Warehouse code is required");
        }
        String code = request.getCode().trim().toUpperCase();
        if (warehouseRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Warehouse with code '" + code + "' already exists");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.getName().trim());
        warehouse.setCode(code);
        warehouse.setAddress(request.getAddress());
        warehouse.setActive(request.getActive() != null ? request.getActive() : true);

        Warehouse saved = warehouseRepository.save(warehouse);
        return WarehouseDto.fromEntity(saved);
    }

    @Transactional
    public WarehouseDto updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + id));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Warehouse name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Warehouse code is required");
        }

        String code = request.getCode().trim().toUpperCase();
        if (!warehouse.getCode().equalsIgnoreCase(code) && warehouseRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Warehouse with code '" + code + "' already exists");
        }

        warehouse.setName(request.getName().trim());
        warehouse.setCode(code);
        warehouse.setAddress(request.getAddress());
        if (request.getActive() != null) {
            warehouse.setActive(request.getActive());
        }

        Warehouse updated = warehouseRepository.save(warehouse);
        return WarehouseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + id));
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
    }
}
