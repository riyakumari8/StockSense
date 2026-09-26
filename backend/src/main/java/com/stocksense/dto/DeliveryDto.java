package com.stocksense.dto;

import com.stocksense.entity.Delivery;
import com.stocksense.entity.DeliveryStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DeliveryDto {

    private Long id;
    private String deliveryNumber;
    private String customerName;
    private DeliveryStatus status;
    private Integer totalItems;
    private Integer totalQuantity;
    private BigDecimal totalAmount;
    private List<DeliveryItemDto> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DeliveryDto() {
    }

    public static DeliveryDto fromEntity(Delivery delivery) {
        if (delivery == null) return null;
        DeliveryDto dto = new DeliveryDto();
        dto.setId(delivery.getId());
        dto.setDeliveryNumber(delivery.getDeliveryNumber());
        dto.setCustomerName(delivery.getCustomerName());
        dto.setStatus(delivery.getStatus());
        dto.setCreatedAt(delivery.getCreatedAt());
        dto.setUpdatedAt(delivery.getUpdatedAt());

        if (delivery.getItems() != null) {
            List<DeliveryItemDto> itemDtos = delivery.getItems().stream()
                    .map(DeliveryItemDto::fromEntity)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
            dto.setTotalItems(itemDtos.size());

            int totalQty = itemDtos.stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            dto.setTotalQuantity(totalQty);

            BigDecimal totalAmt = itemDtos.stream()
                    .map(item -> item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalAmount(totalAmt);
        } else {
            dto.setTotalItems(0);
            dto.setTotalQuantity(0);
            dto.setTotalAmount(BigDecimal.ZERO);
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeliveryNumber() {
        return deliveryNumber;
    }

    public void setDeliveryNumber(String deliveryNumber) {
        this.deliveryNumber = deliveryNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<DeliveryItemDto> getItems() {
        return items;
    }

    public void setItems(List<DeliveryItemDto> items) {
        this.items = items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
