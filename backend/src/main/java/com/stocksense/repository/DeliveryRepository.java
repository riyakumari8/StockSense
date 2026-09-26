package com.stocksense.repository;

import com.stocksense.entity.Delivery;
import com.stocksense.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByDeliveryNumber(String deliveryNumber);

    boolean existsByDeliveryNumber(String deliveryNumber);

    List<Delivery> findAllByOrderByCreatedAtDesc();

    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);

    @Query("SELECT d FROM Delivery d WHERE " +
           "(LOWER(d.deliveryNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(d.customerName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY d.createdAt DESC")
    List<Delivery> searchDeliveries(@Param("query") String query);

    @Query("SELECT d FROM Delivery d WHERE d.status = :status AND " +
           "(LOWER(d.deliveryNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(d.customerName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY d.createdAt DESC")
    List<Delivery> searchDeliveriesWithStatus(@Param("query") String query, @Param("status") DeliveryStatus status);
}
