package com.stocksense.backend.controller;

import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.dto.TransferRequest;
import com.stocksense.backend.dto.TransferResponse;
import com.stocksense.backend.entity.enums.TransferStatus;
import com.stocksense.backend.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    public ResponseEntity<PageResponse<TransferResponse>> getAllTransfers(
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(transferService.getAllTransfers(
                status, warehouseId, startDate, endDate, page, pageSize, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.getTransferById(id));
    }

    @PostMapping
    public ResponseEntity<TransferResponse> createTransfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.createTransfer(request));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<TransferResponse> validateTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.validateTransfer(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<TransferResponse> cancelTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.cancelTransfer(id));
    }
}
