MERGE INTO users (id, first_name, last_name, email, password, role)
KEY(id)
VALUES (1, 'Admin', 'User', 'admin@estore.com', 'admin123', 'ADMIN');

MERGE INTO users (id, first_name, last_name, email, password, role)
KEY(id)
VALUES (2, 'Client', 'User', 'client@estore.com', 'client123', 'CLIENT');

MERGE INTO users (id, first_name, last_name, email, password, role)
KEY(id)
VALUES (3, 'Sara', 'Martin', 'sara.martin@estore.com', 'sara123', 'CLIENT');

MERGE INTO profiles (id, phone, address, city, country, user_id)
KEY(id)
VALUES (1, '+212600000001', '1 Admin Street', 'Casablanca', 'Morocco', 1);

MERGE INTO profiles (id, phone, address, city, country, user_id)
KEY(id)
VALUES (2, '+212600000002', '22 Client Avenue', 'Rabat', 'Morocco', 2);

MERGE INTO profiles (id, phone, address, city, country, user_id)
KEY(id)
VALUES (3, '+212600000003', '7 Market Road', 'Marrakech', 'Morocco', 3);

ALTER TABLE users ALTER COLUMN id RESTART WITH 4;
ALTER TABLE profiles ALTER COLUMN id RESTART WITH 4;
