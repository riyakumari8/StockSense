package com.stocksense.repository;

import com.stocksense.entity.DeliveryOrder;
import com.stocksense.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {

    List<DeliveryOrder> findByStatus(DeliveryStatus status);

    List<DeliveryOrder> findBySourceWarehouseId(Long warehouseId);

    boolean existsByDeliveryNumber(String deliveryNumber);

    @Query("SELECT d FROM DeliveryOrder d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:warehouseId IS NULL OR d.sourceWarehouse.id = :warehouseId) AND " +
           "(:search IS NULL OR LOWER(d.deliveryNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.customerReference) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<DeliveryOrder> searchDeliveries(
            @Param("status") DeliveryStatus status,
            @Param("warehouseId") Long warehouseId,
            @Param("search") String search
    );
}
