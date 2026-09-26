-- Member 4: Locations belong to a warehouse. Code must be unique within its warehouse.
CREATE TABLE locations (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    code          VARCHAR(50)   NOT NULL,
    warehouse_id  BIGINT        NOT NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT uq_locations_warehouse_code UNIQUE (warehouse_id, code),
    CONSTRAINT ck_locations_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_locations_warehouse_id ON locations (warehouse_id);
CREATE INDEX idx_locations_code ON locations (code);
