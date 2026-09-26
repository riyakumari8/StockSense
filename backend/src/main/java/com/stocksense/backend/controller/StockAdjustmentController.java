package com.stocksense.backend.controller;

import com.stocksense.backend.dto.AdjustmentRequest;
import com.stocksense.backend.dto.AdjustmentResponse;
import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.entity.enums.AdjustmentStatus;
import com.stocksense.backend.service.StockAdjustmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/adjustments")
@RequiredArgsConstructor
public class StockAdjustmentController {

    private final StockAdjustmentService adjustmentService;

    @GetMapping
    public ResponseEntity<PageResponse<AdjustmentResponse>> getAllAdjustments(
            @RequestParam(required = false) AdjustmentStatus status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(adjustmentService.getAllAdjustments(
                status, warehouseId, locationId, productId, startDate, endDate,
                page, pageSize, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdjustmentResponse> getAdjustmentById(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.getAdjustmentById(id));
    }

    @PostMapping
    public ResponseEntity<AdjustmentResponse> createAdjustment(@Valid @RequestBody AdjustmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adjustmentService.createAdjustment(request));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<AdjustmentResponse> validateAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.validateAdjustment(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<AdjustmentResponse> cancelAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.cancelAdjustment(id));
    }
}
