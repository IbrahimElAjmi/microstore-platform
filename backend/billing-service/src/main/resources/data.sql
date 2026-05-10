MERGE INTO billings (id, order_id, amount, status, payment_method, created_at, paid_at)
KEY(id)
VALUES (1, 1, 7500.0, 'PAID', 'CARD', TIMESTAMP '2026-04-28 10:05:00', TIMESTAMP '2026-04-28 10:06:00');

MERGE INTO billings (id, order_id, amount, status, payment_method, created_at, paid_at)
KEY(id)
VALUES (2, 2, 500.0, 'PAID', 'CASH', TIMESTAMP '2026-04-29 14:35:00', TIMESTAMP '2026-04-29 14:40:00');

MERGE INTO billings (id, order_id, amount, status, payment_method, created_at, paid_at)
KEY(id)
VALUES (3, 3, 450.0, 'PENDING', 'BANK_TRANSFER', TIMESTAMP '2026-04-30 09:20:00', NULL);

ALTER TABLE billings ALTER COLUMN id RESTART WITH 4;
