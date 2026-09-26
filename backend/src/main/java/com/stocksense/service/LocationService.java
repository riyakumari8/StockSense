package com.stocksense.service;

import com.stocksense.dto.LocationDto;
import com.stocksense.dto.LocationRequest;
import com.stocksense.entity.Location;
import com.stocksense.entity.Warehouse;
import com.stocksense.repository.LocationRepository;
import com.stocksense.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;

    public LocationService(LocationRepository locationRepository, WarehouseRepository warehouseRepository) {
        this.locationRepository = locationRepository;
        this.warehouseRepository = warehouseRepository;
    }

    public List<LocationDto> getAllLocations(Long warehouseId) {
        if (warehouseId != null) {
            return locationRepository.findByWarehouseId(warehouseId).stream()
                    .map(LocationDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return locationRepository.findAll().stream()
                .map(LocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public LocationDto getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID: " + id));
        return LocationDto.fromEntity(location);
    }

    @Transactional
    public LocationDto createLocation(LocationRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Location name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Location code is required");
        }
        if (request.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID is required");
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + request.getWarehouseId()));

        String code = request.getCode().trim().toUpperCase();
        if (locationRepository.existsByWarehouseIdAndCode(warehouse.getId(), code)) {
            throw new IllegalArgumentException("Location code '" + code + "' already exists in warehouse '" + warehouse.getName() + "'");
        }

        Location location = new Location();
        location.setName(request.getName().trim());
        location.setCode(code);
        location.setWarehouse(warehouse);
        location.setDescription(request.getDescription());
        location.setActive(request.getActive() != null ? request.getActive() : true);

        Location saved = locationRepository.save(location);
        return LocationDto.fromEntity(saved);
    }

    @Transactional
    public LocationDto updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID: " + id));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Location name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Location code is required");
        }
        if (request.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID is required");
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + request.getWarehouseId()));

        String code = request.getCode().trim().toUpperCase();
        if ((!location.getWarehouse().getId().equals(warehouse.getId()) || !location.getCode().equalsIgnoreCase(code))
                && locationRepository.existsByWarehouseIdAndCode(warehouse.getId(), code)) {
            throw new IllegalArgumentException("Location code '" + code + "' already exists in warehouse '" + warehouse.getName() + "'");
        }

        location.setName(request.getName().trim());
        location.setCode(code);
        location.setWarehouse(warehouse);
        location.setDescription(request.getDescription());
        if (request.getActive() != null) {
            location.setActive(request.getActive());
        }

        Location updated = locationRepository.save(location);
        return LocationDto.fromEntity(updated);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID: " + id));
        location.setActive(false);
        locationRepository.save(location);
    }
}
