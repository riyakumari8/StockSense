package com.stocksense.backend.service;

import com.stocksense.backend.dto.PageResponse;
import com.stocksense.backend.dto.StockLedgerResponse;
import com.stocksense.backend.entity.enums.MovementType;
import com.stocksense.backend.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;

    public PageResponse<StockLedgerResponse> getLedgerEntries(
            Long productId, Long warehouseId, Long locationId,
            MovementType movementType,
            LocalDateTime startDate, LocalDateTime endDate,
            int page, int pageSize) {

        var ledgerPage = stockLedgerRepository.findAllFiltered(
                productId, warehouseId, locationId, movementType,
                startDate, endDate,
                PageRequest.of(page, pageSize, Sort.by("createdAt").descending()));

        return new PageResponse<>(
                ledgerPage.getContent().stream().map(StockLedgerResponse::from).toList(),
                ledgerPage.getNumber(),
                ledgerPage.getSize(),
                ledgerPage.getTotalElements(),
                ledgerPage.getTotalPages()
        );
    }
}
