MERGE INTO orders (id, customer_id, product_id, quantity, total_price, status, created_at)
KEY(id)
VALUES (1, 2, 1, 1, 7500.0, 'CONFIRMED', TIMESTAMP '2026-04-28 10:00:00');

MERGE INTO orders (id, customer_id, product_id, quantity, total_price, status, created_at)
KEY(id)
VALUES (2, 2, 2, 2, 500.0, 'DELIVERED', TIMESTAMP '2026-04-29 14:30:00');

MERGE INTO orders (id, customer_id, product_id, quantity, total_price, status, created_at)
KEY(id)
VALUES (3, 3, 3, 3, 450.0, 'PENDING', TIMESTAMP '2026-04-30 09:15:00');

ALTER TABLE orders ALTER COLUMN id RESTART WITH 4;
