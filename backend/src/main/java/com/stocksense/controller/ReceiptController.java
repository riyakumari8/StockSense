package com.stocksense.controller;

import com.stocksense.dto.ReceiptDto;
import com.stocksense.dto.ReceiptRequest;
import com.stocksense.service.ReceiptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    public ResponseEntity<List<ReceiptDto>> getAllReceipts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(receiptService.getAllReceipts(status, supplierId, warehouseId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptDto> getReceiptById(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.getReceiptById(id));
    }

    @PostMapping
    public ResponseEntity<ReceiptDto> createReceipt(
            @Valid @RequestBody ReceiptRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.status(HttpStatus.CREATED).body(receiptService.createReceipt(request, username));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<ReceiptDto> validateReceipt(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.ok(receiptService.validateReceipt(id, username));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReceiptDto> cancelReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.cancelReceipt(id));
    }
}
