package com.stocksense.service;

import com.stocksense.dto.StockLedgerDto;
import com.stocksense.entity.MovementType;
import com.stocksense.entity.Product;
import com.stocksense.entity.StockLedger;
import com.stocksense.repository.StockLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;

    public StockLedgerService(StockLedgerRepository stockLedgerRepository) {
        this.stockLedgerRepository = stockLedgerRepository;
    }

    public List<StockLedgerDto> getStockLedgerEntries(Long productId, MovementType movementType) {
        return stockLedgerRepository.filterLedger(productId, movementType).stream()
                .map(StockLedgerDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockLedger recordMovement(
            Product product,
            Integer quantityChange,
            Integer previousQuantity,
            Integer resultingQuantity,
            MovementType movementType,
            String reference,
            String remarks
    ) {
        StockLedger entry = new StockLedger(
                product,
                quantityChange,
                previousQuantity,
                resultingQuantity,
                movementType,
                reference,
                remarks
        );
        return stockLedgerRepository.save(entry);
    }
}
