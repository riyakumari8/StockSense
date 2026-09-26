package com.stocksense.service;

import com.stocksense.dto.SupplierDto;
import com.stocksense.dto.SupplierRequest;
import com.stocksense.entity.Supplier;
import com.stocksense.repository.ReceiptRepository;
import com.stocksense.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ReceiptRepository receiptRepository;

    public SupplierService(SupplierRepository supplierRepository, ReceiptRepository receiptRepository) {
        this.supplierRepository = supplierRepository;
        this.receiptRepository = receiptRepository;
    }

    public List<SupplierDto> getAllSuppliers(String search) {
        return supplierRepository.filterSuppliers(search).stream()
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
        if (request.getSupplierName() == null || request.getSupplierName().trim().isEmpty()) {
            throw new IllegalArgumentException("Supplier name cannot be empty");
        }

        Supplier supplier = new Supplier();
        mapRequestToSupplier(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(saved);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + id));

        if (request.getSupplierName() == null || request.getSupplierName().trim().isEmpty()) {
            throw new IllegalArgumentException("Supplier name cannot be empty");
        }

        mapRequestToSupplier(request, supplier);
        Supplier updated = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + id));

        long receiptCount = receiptRepository.countBySupplierId(id);
        if (receiptCount > 0) {
            throw new IllegalStateException("Cannot delete supplier '" + supplier.getSupplierName() + 
                    "' because it is linked to " + receiptCount + " receipt(s).");
        }

        supplierRepository.delete(supplier);
    }

    private void mapRequestToSupplier(SupplierRequest request, Supplier supplier) {
        supplier.setSupplierName(request.getSupplierName().trim());
        supplier.setContactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null);
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        supplier.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
    }
}
