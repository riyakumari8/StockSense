package com.stocksense.service;

import com.stocksense.dto.StockLedgerDto;
import com.stocksense.entity.MovementType;
import com.stocksense.entity.StockLedger;
import com.stocksense.repository.StockLedgerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockLedgerService {

    private final StockLedgerRepository ledgerRepository;

    public StockLedgerService(StockLedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
    }

    public List<StockLedgerDto> getLedgerEntries(Long productId, Long locationId, String movementType) {
        MovementType typeEnum = null;
        if (movementType != null && !movementType.isBlank()) {
            try {
                typeEnum = MovementType.valueOf(movementType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid enum filter
            }
        }

        return ledgerRepository.filterLedger(productId, locationId, typeEnum).stream()
                .map(StockLedgerDto::fromEntity)
                .collect(Collectors.toList());
    }

    public StockLedgerDto getLedgerById(Long id) {
        StockLedger ledger = ledgerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ledger entry not found with ID: " + id));
        return StockLedgerDto.fromEntity(ledger);
    }
}
