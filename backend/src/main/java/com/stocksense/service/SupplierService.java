package com.stocksense.service;

import com.stocksense.dto.SupplierDto;
import com.stocksense.dto.SupplierRequest;
import com.stocksense.entity.Supplier;
import com.stocksense.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<SupplierDto> getAllSuppliers(String search) {
        if (search != null && !search.isBlank()) {
            return supplierRepository.filterSuppliers(search).stream()
                    .map(SupplierDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return supplierRepository.findAll().stream()
                .map(SupplierDto::fromEntity)
                .collect(Collectors.toList());
    }

    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + id));
        return SupplierDto.fromEntity(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Supplier name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Supplier code is required");
        }
        String code = request.getCode().trim().toUpperCase();
        if (supplierRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Supplier with code '" + code + "' already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setName(request.getName().trim());
        supplier.setCode(code);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setAddress(request.getAddress());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setActive(request.getActive() != null ? request.getActive() : true);

        Supplier saved = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(saved);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + id));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Supplier name is required");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Supplier code is required");
        }

        String code = request.getCode().trim().toUpperCase();
        if (!supplier.getCode().equalsIgnoreCase(code) && supplierRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Supplier with code '" + code + "' already exists");
        }

        supplier.setName(request.getName().trim());
        supplier.setCode(code);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setAddress(request.getAddress());
        supplier.setContactPerson(request.getContactPerson());
        if (request.getActive() != null) {
            supplier.setActive(request.getActive());
        }

        Supplier updated = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
