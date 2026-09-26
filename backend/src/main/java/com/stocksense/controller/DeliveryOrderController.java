package com.stocksense.controller;

import com.stocksense.dto.DeliveryOrderDto;
import com.stocksense.dto.DeliveryOrderRequest;
import com.stocksense.service.DeliveryOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryOrderController {

    private final DeliveryOrderService deliveryOrderService;

    public DeliveryOrderController(DeliveryOrderService deliveryOrderService) {
        this.deliveryOrderService = deliveryOrderService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOrderDto>> getAllDeliveries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(deliveryOrderService.getAllDeliveries(status, warehouseId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryOrderDto> getDeliveryById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryOrderService.getDeliveryById(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryOrderDto> createDelivery(
            @Valid @RequestBody DeliveryOrderRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryOrderService.createDelivery(request, username));
    }

    @PostMapping("/{id}/pick")
    public ResponseEntity<DeliveryOrderDto> pickDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryOrderService.pickDelivery(id));
    }

    @PostMapping("/{id}/pack")
    public ResponseEntity<DeliveryOrderDto> packDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryOrderService.packDelivery(id));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<DeliveryOrderDto> validateDelivery(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "System";
        return ResponseEntity.ok(deliveryOrderService.validateDelivery(id, username));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<DeliveryOrderDto> cancelDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryOrderService.cancelDelivery(id));
    }
}
