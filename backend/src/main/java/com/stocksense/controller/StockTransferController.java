package com.stocksense.controller;

import com.stocksense.dto.StockTransferDto;
import com.stocksense.dto.StockTransferRequest;
import com.stocksense.service.StockTransferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class StockTransferController {

    private final StockTransferService transferService;

    public StockTransferController(StockTransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<List<StockTransferDto>> getAllTransfers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long locationId
    ) {
        return ResponseEntity.ok(transferService.getAllTransfers(status, locationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockTransferDto> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.getTransferById(id));
    }

    @PostMapping
    public ResponseEntity<StockTransferDto> createTransfer(
            @Valid @RequestBody StockTransferRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.createTransfer(request, username));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<StockTransferDto> validateTransfer(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.ok(transferService.validateTransfer(id, username));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<StockTransferDto> cancelTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.cancelTransfer(id));
    }
}
