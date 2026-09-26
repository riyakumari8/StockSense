package com.stocksense.backend.service;

import com.stocksense.backend.dto.LocationRequest;
import com.stocksense.backend.dto.LocationResponse;
import com.stocksense.backend.entity.Location;
import com.stocksense.backend.entity.Warehouse;
import com.stocksense.backend.entity.enums.LocationStatus;
import com.stocksense.backend.exception.DuplicateResourceException;
import com.stocksense.backend.exception.ResourceNotFoundException;
import com.stocksense.backend.repository.LocationRepository;
import com.stocksense.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;

    public List<LocationResponse> getAllLocations(Long warehouseId) {
        List<Location> locations;
        if (warehouseId != null) {
            locations = locationRepository.findByWarehouseIdWithWarehouse(warehouseId);
        } else {
            locations = locationRepository.findAllWithWarehouse();
        }
        return locations.stream().map(LocationResponse::from).toList();
    }

    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findByIdWithWarehouse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        return LocationResponse.from(location);
    }

    @Transactional
    public LocationResponse createLocation(LocationRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));

        if (locationRepository.existsByWarehouseIdAndCode(request.warehouseId(), request.code())) {
            throw new DuplicateResourceException("Location code already exists in this warehouse.");
        }

        Location location = Location.builder()
                .name(request.name())
                .code(request.code().toUpperCase())
                .warehouse(warehouse)
                .status(request.status() != null ? request.status() : LocationStatus.ACTIVE)
                .build();

        location = locationRepository.save(location);
        return LocationResponse.from(location);
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findByIdWithWarehouse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found."));

        if (locationRepository.existsByWarehouseIdAndCodeAndIdNot(request.warehouseId(), request.code(), id)) {
            throw new DuplicateResourceException("Location code already exists in this warehouse.");
        }

        location.setName(request.name());
        location.setCode(request.code().toUpperCase());
        location.setWarehouse(warehouse);
        if (request.status() != null) {
            location.setStatus(request.status());
        }

        location = locationRepository.save(location);
        return LocationResponse.from(location);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        location.setStatus(LocationStatus.INACTIVE);
        locationRepository.save(location);
    }
}
