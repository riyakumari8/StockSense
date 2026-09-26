-- Member 4: Stock = Product x Location, owned here until the Product-owning
-- member's module lands. product_id is intentionally NOT a foreign key yet:
-- there is no products table in this repository. It is an indexed integration
-- point -- once a `products` table exists, its owner (or a follow-up
-- migration) can add: ALTER TABLE stock ADD CONSTRAINT fk_stock_product
-- FOREIGN KEY (product_id) REFERENCES products (id);
CREATE TABLE stock (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id    BIGINT        NOT NULL,
    location_id   BIGINT        NOT NULL,
    quantity      INTEGER       NOT NULL DEFAULT 0,
    version       BIGINT        NOT NULL DEFAULT 0,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_location FOREIGN KEY (location_id) REFERENCES locations (id),
    CONSTRAINT uq_stock_product_location UNIQUE (product_id, location_id),
    CONSTRAINT ck_stock_quantity_non_negative CHECK (quantity >= 0)
);

CREATE INDEX idx_stock_product_id ON stock (product_id);
CREATE INDEX idx_stock_location_id ON stock (location_id);
