package com.stocksense.controller;

import com.stocksense.dto.StockLedgerDto;
import com.stocksense.service.StockLedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StockLedgerController {

    private final StockLedgerService ledgerService;

    public StockLedgerController(StockLedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping("/api/ledger")
    public ResponseEntity<List<StockLedgerDto>> getLedger(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String movementType
    ) {
        return ResponseEntity.ok(ledgerService.getLedgerEntries(productId, locationId, movementType));
    }

    @GetMapping("/api/move-history")
    public ResponseEntity<List<StockLedgerDto>> getMoveHistory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String movementType
    ) {
        return ResponseEntity.ok(ledgerService.getLedgerEntries(productId, locationId, movementType));
    }

    @GetMapping("/api/ledger/{id}")
    public ResponseEntity<StockLedgerDto> getLedgerById(@PathVariable Long id) {
        return ResponseEntity.ok(ledgerService.getLedgerById(id));
    }
}
