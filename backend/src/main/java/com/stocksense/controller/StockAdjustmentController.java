package com.stocksense.controller;

import com.stocksense.dto.StockAdjustmentDto;
import com.stocksense.dto.StockAdjustmentRequest;
import com.stocksense.service.StockAdjustmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adjustments")
public class StockAdjustmentController {

    private final StockAdjustmentService adjustmentService;

    public StockAdjustmentController(StockAdjustmentService adjustmentService) {
        this.adjustmentService = adjustmentService;
    }

    @GetMapping
    public ResponseEntity<List<StockAdjustmentDto>> getAllAdjustments() {
        return ResponseEntity.ok(adjustmentService.getAllAdjustments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockAdjustmentDto> getAdjustmentById(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.getAdjustmentById(id));
    }

    @PostMapping
    public ResponseEntity<StockAdjustmentDto> createAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.status(HttpStatus.CREATED).body(adjustmentService.createAdjustment(request, username));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<StockAdjustmentDto> validateAdjustment(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.ok(adjustmentService.validateAdjustment(id, username));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<StockAdjustmentDto> cancelAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.cancelAdjustment(id));
    }
}
