MERGE INTO categories (id, name, description)
KEY(id)
VALUES (1, 'Electronics', 'Phones, laptops and accessories');

MERGE INTO categories (id, name, description)
KEY(id)
VALUES (2, 'Books', 'Books and learning materials');

MERGE INTO categories (id, name, description)
KEY(id)
VALUES (3, 'Office', 'Office furniture and supplies');

MERGE INTO products (id, name, description, price, image_url, category_id)
KEY(id)
VALUES (1, 'Laptop', 'Student laptop', 7500.0, 'https://example.com/laptop.jpg', 1);

MERGE INTO products (id, name, description, price, image_url, category_id)
KEY(id)
VALUES (2, 'Java Book', 'Beginner Java book', 250.0, 'https://example.com/java-book.jpg', 2);

MERGE INTO products (id, name, description, price, image_url, category_id)
KEY(id)
VALUES (3, 'Wireless Mouse', 'USB wireless mouse', 150.0, 'https://example.com/wireless-mouse.jpg', 1);

MERGE INTO products (id, name, description, price, image_url, category_id)
KEY(id)
VALUES (4, 'Office Chair', 'Ergonomic office chair', 1200.0, 'https://example.com/office-chair.jpg', 3);

ALTER TABLE categories ALTER COLUMN id RESTART WITH 4;
ALTER TABLE products ALTER COLUMN id RESTART WITH 5;
