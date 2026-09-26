package com.stocksense.controller;

import com.stocksense.dto.StockLedgerDto;
import com.stocksense.entity.MovementType;
import com.stocksense.service.StockLedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-ledger")
public class StockLedgerController {

    private final StockLedgerService stockLedgerService;

    public StockLedgerController(StockLedgerService stockLedgerService) {
        this.stockLedgerService = stockLedgerService;
    }

    @GetMapping
    public ResponseEntity<List<StockLedgerDto>> getStockLedgerEntries(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) MovementType movementType
    ) {
        return ResponseEntity.ok(stockLedgerService.getStockLedgerEntries(productId, movementType));
    }
}
