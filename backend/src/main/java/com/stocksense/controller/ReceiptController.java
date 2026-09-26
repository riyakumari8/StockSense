package com.stocksense.controller;

import com.stocksense.dto.ReceiptDto;
import com.stocksense.dto.ReceiptRequest;
import com.stocksense.entity.ReceiptStatus;
import com.stocksense.service.ReceiptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    public ResponseEntity<List<ReceiptDto>> getAllReceipts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(required = false) Long supplierId
    ) {
        return ResponseEntity.ok(receiptService.getAllReceipts(search, status, supplierId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptDto> getReceiptById(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.getReceiptById(id));
    }

    @PostMapping
    public ResponseEntity<ReceiptDto> createReceipt(@Valid @RequestBody ReceiptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(receiptService.createReceipt(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceiptDto> updateReceipt(
            @PathVariable Long id,
            @Valid @RequestBody ReceiptRequest request
    ) {
        return ResponseEntity.ok(receiptService.updateReceipt(id, request));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<ReceiptDto> validateReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.validateReceipt(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReceiptDto> cancelReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.cancelReceipt(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReceipt(@PathVariable Long id) {
        receiptService.deleteReceipt(id);
        return ResponseEntity.ok(Map.of("message", "Receipt deleted successfully"));
    }
}
