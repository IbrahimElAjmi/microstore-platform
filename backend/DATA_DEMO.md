# Donnees deja stockees au demarrage

Ce fichier liste les donnees creees automatiquement quand les services demarrent.

## customer-service

Base H2:

```text
jdbc:h2:mem:customerdb
```

### Utilisateur admin

```json
{
  "id": 1,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@estore.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Utilisateur client

```json
{
  "id": 2,
  "firstName": "Client",
  "lastName": "User",
  "email": "client@estore.com",
  "password": "client123",
  "role": "CLIENT"
}
```

### Deuxieme client

```json
{
  "id": 3,
  "firstName": "Sara",
  "lastName": "Martin",
  "email": "sara.martin@estore.com",
  "password": "sara123",
  "role": "CLIENT"
}
```

## catalog-service

Base H2:

```text
jdbc:h2:mem:catalogdb
```

### Categories

```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Phones, laptops and accessories"
  },
  {
    "id": 2,
    "name": "Books",
    "description": "Books and learning materials"
  },
  {
    "id": 3,
    "name": "Office",
    "description": "Office furniture and supplies"
  }
]
```

### Produits

```json
[
  {
    "id": 1,
    "name": "Laptop",
    "description": "Student laptop",
    "price": 7500.0,
    "imageUrl": "https://example.com/laptop.jpg",
    "categoryId": 1,
    "categoryName": "Electronics"
  },
  {
    "id": 2,
    "name": "Java Book",
    "description": "Beginner Java book",
    "price": 250.0,
    "imageUrl": "https://example.com/java-book.jpg",
    "categoryId": 2,
    "categoryName": "Books"
  },
  {
    "id": 3,
    "name": "Wireless Mouse",
    "description": "USB wireless mouse",
    "price": 150.0,
    "imageUrl": "https://example.com/wireless-mouse.jpg",
    "categoryId": 1,
    "categoryName": "Electronics"
  },
  {
    "id": 4,
    "name": "Office Chair",
    "description": "Ergonomic office chair",
    "price": 1200.0,
    "imageUrl": "https://example.com/office-chair.jpg",
    "categoryId": 3,
    "categoryName": "Office"
  }
]
```

## inventory-service

Base H2:

```text
jdbc:h2:mem:inventorydb
```

### Stocks

```json
[
  {
    "productId": 1,
    "quantity": 20
  },
  {
    "productId": 2,
    "quantity": 50
  },
  {
    "productId": 3,
    "quantity": 75
  },
  {
    "productId": 4,
    "quantity": 12
  }
]
```

## order-service

Base H2:

```text
jdbc:h2:mem:orderdb
```

### Commandes

```json
[
  {
    "id": 1,
    "customerId": 2,
    "productId": 1,
    "quantity": 1,
    "totalPrice": 7500.0,
    "status": "CONFIRMED"
  },
  {
    "id": 2,
    "customerId": 2,
    "productId": 2,
    "quantity": 2,
    "totalPrice": 500.0,
    "status": "DELIVERED"
  },
  {
    "id": 3,
    "customerId": 3,
    "productId": 3,
    "quantity": 3,
    "totalPrice": 450.0,
    "status": "PENDING"
  }
]
```

## billing-service

Base H2:

```text
jdbc:h2:mem:billingdb
```

### Factures

```json
[
  {
    "id": 1,
    "orderId": 1,
    "amount": 7500.0,
    "status": "PAID",
    "paymentMethod": "CARD"
  },
  {
    "id": 2,
    "orderId": 2,
    "amount": 500.0,
    "status": "PAID",
    "paymentMethod": "CASH"
  },
  {
    "id": 3,
    "orderId": 3,
    "amount": 450.0,
    "status": "PENDING",
    "paymentMethod": "BANK_TRANSFER"
  }
]
```

## Parcours rapide avec ces donnees

1. Utiliser `adminId = 1` pour creer/modifier les categories et produits.
2. Utiliser `clientId = 2` ou `clientId = 3` pour creer une commande.
3. Utiliser `productId = 1`, `2`, `3` ou `4`.
4. Le stock existe deja pour tous les produits de demonstration.

Exemple commande:

```json
{
  "customerId": 2,
  "productId": 1,
  "quantity": 2,
  "status": "PENDING"
}
```

Exemple facture:

```json
{
  "orderId": 1,
  "paymentMethod": "CARD"
}
```
