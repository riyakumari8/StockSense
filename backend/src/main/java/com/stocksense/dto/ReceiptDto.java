package com.stocksense.dto;

import com.stocksense.entity.Receipt;
import com.stocksense.entity.ReceiptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ReceiptDto {
    private Long id;
    private String receiptNumber;
    private SupplierDto supplier;
    private ReceiptStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime validatedAt;
    private List<ReceiptItemDto> items = new ArrayList<>();
    private Integer totalItems = 0;
    private Integer totalQuantity = 0;
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public ReceiptDto() {
    }

    public static ReceiptDto fromEntity(Receipt receipt) {
        if (receipt == null) return null;
        ReceiptDto dto = new ReceiptDto();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setSupplier(SupplierDto.fromEntity(receipt.getSupplier()));
        dto.setStatus(receipt.getStatus());
        dto.setNotes(receipt.getNotes());
        dto.setCreatedAt(receipt.getCreatedAt());
        dto.setUpdatedAt(receipt.getUpdatedAt());
        dto.setValidatedAt(receipt.getValidatedAt());

        if (receipt.getItems() != null) {
            List<ReceiptItemDto> itemDtos = receipt.getItems().stream()
                    .map(ReceiptItemDto::fromEntity)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
            dto.setTotalItems(itemDtos.size());

            int qtySum = 0;
            BigDecimal amountSum = BigDecimal.ZERO;
            for (ReceiptItemDto item : itemDtos) {
                if (item.getQuantity() != null) {
                    qtySum += item.getQuantity();
                }
                if (item.getSubtotal() != null) {
                    amountSum = amountSum.add(item.getSubtotal());
                }
            }
            dto.setTotalQuantity(qtySum);
            dto.setTotalAmount(amountSum);
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public SupplierDto getSupplier() {
        return supplier;
    }

    public void setSupplier(SupplierDto supplier) {
        this.supplier = supplier;
    }

    public ReceiptStatus getStatus() {
        return status;
    }

    public void setStatus(ReceiptStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }

    public List<ReceiptItemDto> getItems() {
        return items;
    }

    public void setItems(List<ReceiptItemDto> items) {
        this.items = items;
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
}
