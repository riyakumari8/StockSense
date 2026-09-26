package com.stocksense.repository;

import com.stocksense.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findBySupplierName(String supplierName);

    Boolean existsBySupplierName(String supplierName);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "s.phone LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY s.supplierName ASC")
    List<Supplier> filterSuppliers(@Param("search") String search);
}
