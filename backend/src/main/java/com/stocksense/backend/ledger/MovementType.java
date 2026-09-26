package com.stocksense.backend.ledger;

/**
 * Classifies a stock ledger entry. RECEIPT and DELIVERY are written by
 * other members' modules; Member 4 is responsible for TRANSFER and
 * ADJUSTMENT entries, but the enum covers all four so the ledger table and
 * its filters work uniformly regardless of which module wrote a row.
 */
public enum MovementType {
    RECEIPT,
    DELIVERY,
    TRANSFER,
    ADJUSTMENT
}
