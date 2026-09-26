package com.stocksense.backend.controller;

import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.dto.StockLedgerResponse;
import com.stocksense.backend.dto.StockResponse;
import com.stocksense.backend.entity.enums.MovementType;
import com.stocksense.backend.service.StockLedgerService;
import com.stocksense.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockLedgerService;
    private final StockService stockService;

    @GetMapping("/stock-ledger")
    public ResponseEntity<PageResponse<StockLedgerResponse>> getLedgerEntries(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(stockLedgerService.getLedgerEntries(
                productId, warehouseId, locationId, movementType, startDate, endDate, page, pageSize));
    }

    @GetMapping("/stocks")
    public ResponseEntity<List<StockResponse>> getStocks(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long warehouseId) {
        if (productId != null && locationId != null) {
            Long qty = stockService.getQuantity(productId, locationId);
            // Return the single stock item
            var stock = stockService.getStockForProductAtLocation(productId, locationId);
            if (stock.isPresent()) {
                return ResponseEntity.ok(List.of(StockResponse.from(stock.get())));
            }
            return ResponseEntity.ok(List.of());
        }
        if (locationId != null) {
            return ResponseEntity.ok(stockService.getStockByLocation(locationId));
        }
        if (warehouseId != null) {
            return ResponseEntity.ok(stockService.getStockByWarehouse(warehouseId));
        }
        if (productId != null) {
            return ResponseEntity.ok(stockService.getStockByProduct(productId));
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/stocks/quantity")
    public ResponseEntity<Long> getStockQuantity(
            @RequestParam Long productId,
            @RequestParam Long locationId) {
        return ResponseEntity.ok(stockService.getQuantity(productId, locationId));
    }
}
