MERGE INTO inventory (id, product_id, quantity)
KEY(id)
VALUES (1, 1, 20);

MERGE INTO inventory (id, product_id, quantity)
KEY(id)
VALUES (2, 2, 50);

MERGE INTO inventory (id, product_id, quantity)
KEY(id)
VALUES (3, 3, 75);

MERGE INTO inventory (id, product_id, quantity)
KEY(id)
VALUES (4, 4, 12);

ALTER TABLE inventory ALTER COLUMN id RESTART WITH 5;
