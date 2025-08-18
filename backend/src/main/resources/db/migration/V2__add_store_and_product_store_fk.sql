-- SQL migration for creating 'stores' table and adding store_id to products

CREATE TABLE stores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(512),
    address VARCHAR(512),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

ALTER TABLE products
ADD COLUMN store_id BIGINT,
ADD CONSTRAINT fk_product_store FOREIGN KEY (store_id) REFERENCES stores(id);
