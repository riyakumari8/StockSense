-- Member 4: Warehouse master table.
CREATE TABLE warehouses (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    code        VARCHAR(50)     NOT NULL,
    address     VARCHAR(500),
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_warehouses_code UNIQUE (code),
    CONSTRAINT ck_warehouses_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_warehouses_code ON warehouses (code);
