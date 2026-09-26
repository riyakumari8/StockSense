-- Member 4: Stock ledger is the append-only audit trail of every stock
-- movement. Rows are never updated or deleted by the application -- there
-- is deliberately no UPDATE/DELETE-capable repository method for this table.
CREATE TABLE stock_ledger (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id               BIGINT        NOT NULL,
    warehouse_id             BIGINT,
    source_location_id       BIGINT,
    destination_location_id  BIGINT,
    movement_type            VARCHAR(20)   NOT NULL,
    reference_type           VARCHAR(20)   NOT NULL,
    reference_id             BIGINT        NOT NULL,
    quantity                 INTEGER       NOT NULL,
    previous_quantity        INTEGER       NOT NULL,
    resulting_quantity       INTEGER       NOT NULL,
    performed_by             BIGINT,
    created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks                  VARCHAR(1000),
    CONSTRAINT fk_stock_ledger_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_stock_ledger_source_location FOREIGN KEY (source_location_id) REFERENCES locations (id),
    CONSTRAINT fk_stock_ledger_destination_location FOREIGN KEY (destination_location_id) REFERENCES locations (id),
    CONSTRAINT ck_stock_ledger_movement_type CHECK (movement_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'))
);

CREATE INDEX idx_stock_ledger_product_id ON stock_ledger (product_id);
CREATE INDEX idx_stock_ledger_created_at ON stock_ledger (created_at);
CREATE INDEX idx_stock_ledger_movement_type ON stock_ledger (movement_type);
CREATE INDEX idx_stock_ledger_reference ON stock_ledger (reference_type, reference_id);
