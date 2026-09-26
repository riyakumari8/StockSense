package com.stocksense.controller;

import com.stocksense.dto.DeliveryDto;
import com.stocksense.dto.DeliveryRequest;
import com.stocksense.dto.StockLedgerDto;
import com.stocksense.entity.DeliveryStatus;
import com.stocksense.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryDto>> getAllDeliveries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) DeliveryStatus status) {
        return ResponseEntity.ok(deliveryService.getAllDeliveries(search, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDto> getDeliveryById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryDto> createDelivery(@Valid @RequestBody DeliveryRequest request) {
        DeliveryDto created = deliveryService.createDelivery(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/pick")
    public ResponseEntity<DeliveryDto> pickDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.pickDelivery(id));
    }

    @PostMapping("/{id}/pack")
    public ResponseEntity<DeliveryDto> packDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.packDelivery(id));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<DeliveryDto> validateDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.validateDelivery(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<DeliveryDto> cancelDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.cancelDelivery(id));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<List<StockLedgerDto>> getLedgerByDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getLedgerEntriesByDelivery(id));
    }
}
