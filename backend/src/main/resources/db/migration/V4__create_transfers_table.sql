-- Member 4: Internal transfers move stock between two locations.
-- product_id / created_by / validated_by are plain integration-point ids
-- (Product and User modules do not exist in this repository yet).
CREATE TABLE transfers (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reference_number          VARCHAR(30)   NOT NULL,
    product_id                BIGINT        NOT NULL,
    source_warehouse_id        BIGINT        NOT NULL,
    source_location_id         BIGINT        NOT NULL,
    destination_warehouse_id   BIGINT        NOT NULL,
    destination_location_id    BIGINT        NOT NULL,
    quantity                  INTEGER       NOT NULL,
    status                    VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    remarks                   VARCHAR(1000),
    created_by                BIGINT,
    created_at                TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validated_by              BIGINT,
    validated_at              TIMESTAMP,
    CONSTRAINT uq_transfers_reference_number UNIQUE (reference_number),
    CONSTRAINT fk_transfers_source_warehouse FOREIGN KEY (source_warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_transfers_source_location FOREIGN KEY (source_location_id) REFERENCES locations (id),
    CONSTRAINT fk_transfers_destination_warehouse FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_transfers_destination_location FOREIGN KEY (destination_location_id) REFERENCES locations (id),
    CONSTRAINT ck_transfers_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_transfers_status CHECK (status IN ('DRAFT', 'READY', 'DONE', 'CANCELLED')),
    CONSTRAINT ck_transfers_source_destination_distinct CHECK (source_location_id <> destination_location_id)
);

CREATE INDEX idx_transfers_status ON transfers (status);
CREATE INDEX idx_transfers_source_warehouse_id ON transfers (source_warehouse_id);
CREATE INDEX idx_transfers_destination_warehouse_id ON transfers (destination_warehouse_id);
CREATE INDEX idx_transfers_created_at ON transfers (created_at);
