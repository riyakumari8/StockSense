-- Member 4: Stock adjustments reconcile system quantity with a physical count.
CREATE TABLE stock_adjustments (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reference_number    VARCHAR(30)   NOT NULL,
    product_id          BIGINT        NOT NULL,
    warehouse_id        BIGINT        NOT NULL,
    location_id         BIGINT        NOT NULL,
    system_quantity     INTEGER       NOT NULL,
    physical_quantity   INTEGER       NOT NULL,
    difference          INTEGER       NOT NULL,
    reason              VARCHAR(500)  NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    created_by          BIGINT,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by         BIGINT,
    approved_at         TIMESTAMP,
    CONSTRAINT uq_stock_adjustments_reference_number UNIQUE (reference_number),
    CONSTRAINT fk_stock_adjustments_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_stock_adjustments_location FOREIGN KEY (location_id) REFERENCES locations (id),
    CONSTRAINT ck_stock_adjustments_physical_non_negative CHECK (physical_quantity >= 0),
    CONSTRAINT ck_stock_adjustments_status CHECK (status IN ('DRAFT', 'DONE', 'CANCELLED'))
);

CREATE INDEX idx_stock_adjustments_status ON stock_adjustments (status);
CREATE INDEX idx_stock_adjustments_warehouse_id ON stock_adjustments (warehouse_id);
CREATE INDEX idx_stock_adjustments_location_id ON stock_adjustments (location_id);
CREATE INDEX idx_stock_adjustments_created_at ON stock_adjustments (created_at);
