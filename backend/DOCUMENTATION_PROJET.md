# Documentation complete du projet E-store Microservices

## 1. Introduction

Ce projet est une application e-commerce construite avec une architecture microservices. L'application est divisee en plusieurs services independants. Chaque service gere une partie precise du systeme:

- `customer-service` gere les utilisateurs, les profils, les roles et l'authentification simple.
- `catalog-service` gere les categories et les produits.
- `inventory-service` gere le stock des produits.
- `order-service` gere les commandes.
- `billing-service` gere les factures, les paiements, les echecs et les remboursements.

L'objectif principal est de montrer comment une application e-commerce peut etre organisee en plusieurs services qui communiquent entre eux avec des APIs REST.

## 2. Objectifs du projet

Les objectifs du projet sont:

- Creer une architecture microservices avec Spring Boot.
- Donner a chaque service une responsabilite claire.
- Utiliser une base de donnees H2 separee pour chaque service.
- Exposer des APIs REST testables avec Postman ou Swagger.
- Faire communiquer les services entre eux.
- Gerer les erreurs avec des reponses HTTP claires.
- Fournir des donnees initiales pour tester rapidement le projet.

## 3. Technologies utilisees

| Technologie | Role dans le projet |
| --- | --- |
| Java 21 | Langage principal |
| Spring Boot 3.5.7 | Creation des microservices |
| Spring Web | Creation des controllers REST |
| Spring Data JPA | Acces aux donnees |
| H2 Database | Base de donnees en memoire pour chaque service |
| OpenFeign | Appels HTTP entre microservices |
| Lombok | Reduction du code repetitif |
| Jakarta Validation | Validation des donnees envoyees dans les requetes |
| Maven | Compilation, dependances et tests |
| Postman | Test manuel des APIs |
| Docker Compose | Lancement possible de tous les services |

## 4. Architecture globale

```text
Client / Postman / Swagger
        |
        +--> customer-service  : utilisateurs, profils, roles
        |
        +--> catalog-service   : categories, produits
        |        |
        |        +--> customer-service pour verifier le role ADMIN
        |
        +--> inventory-service : stock produit
        |
        +--> order-service     : commandes
        |        |
        |        +--> customer-service pour verifier le client
        |        +--> catalog-service pour recuperer le prix du produit
        |        +--> inventory-service pour reduire ou augmenter le stock
        |
        +--> billing-service   : factures et paiements
                 |
                 +--> order-service pour recuperer le montant de la commande
```

Chaque microservice possede sa propre base H2. Les donnees ne sont pas partagees directement entre bases. Quand un service a besoin d'une information d'un autre domaine, il appelle l'API REST du service responsable.

## 5. Ports et URLs

| Service | Port | Base URL |
| --- | ---: | --- |
| customer-service | 8081 | `http://localhost:8081` |
| catalog-service | 8082 | `http://localhost:8082` |
| inventory-service | 8083 | `http://localhost:8083` |
| order-service | 8084 | `http://localhost:8084` |
| billing-service | 8085 | `http://localhost:8085` |

Important pour Postman: il ne faut pas mettre d'espace dans l'URL. Par exemple:

```text
Correct  : http://localhost:8084/api/orders
Incorrect: http://localhost:8084 /api/orders
```

## 6. Bases de donnees H2

Chaque service utilise une base H2 en memoire.

| Service | JDBC URL | Console H2 |
| --- | --- | --- |
| customer-service | `jdbc:h2:mem:customerdb` | `http://localhost:8081/h2-console` |
| catalog-service | `jdbc:h2:mem:catalogdb` | `http://localhost:8082/h2-console` |
| inventory-service | `jdbc:h2:mem:inventorydb` | `http://localhost:8083/h2-console` |
| order-service | `jdbc:h2:mem:orderdb` | `http://localhost:8084/h2-console` |
| billing-service | `jdbc:h2:mem:billingdb` | `http://localhost:8085/h2-console` |

Identifiants H2:

```text
User Name: sa
Password : vide
```

Chaque service contient:

- `schema.sql`: creation des tables.
- `data.sql`: insertion des donnees initiales.

## 7. Relation entre les services

### 7.1 customer-service et catalog-service

`catalog-service` appelle `customer-service` pour verifier si un utilisateur est ADMIN avant de creer, modifier ou supprimer une categorie ou un produit.

Exemple:

```text
POST /api/products?requestedBy=1
```

Ici, `requestedBy=1` correspond a l'utilisateur admin. `catalog-service` appelle:

```text
GET http://localhost:8081/api/users/1/role
```

Si le role est `ADMIN`, l'action est acceptee. Sinon, elle est refusee.

### 7.2 order-service avec customer, catalog et inventory

Quand on cree une commande, `order-service` fait plusieurs actions:

1. Appelle `customer-service` pour verifier que le client existe.
2. Appelle `catalog-service` pour recuperer le prix du produit.
3. Calcule le prix total: `prix produit * quantite`.
4. Enregistre la commande dans sa base H2.
5. Appelle `inventory-service` pour diminuer le stock.

### 7.3 billing-service avec order-service

Quand on cree une facture, `billing-service` appelle `order-service` pour verifier que la commande existe et pour recuperer `totalPrice`.

Le client ne saisit pas le montant de la facture. Le montant vient directement de la commande.

## 8. customer-service

### 8.1 Role

`customer-service` gere:

- l'inscription des utilisateurs;
- la connexion simple par email et mot de passe;
- la consultation des utilisateurs;
- la consultation et modification des profils;
- la consultation du role d'un utilisateur.

### 8.2 Entites

`User` contient:

- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `role`
- `profile`

`Profile` contient:

- `id`
- `phone`
- `address`
- `city`
- `country`
- `user`

`Role` contient:

- `CLIENT`
- `ADMIN`

Relation:

```text
User 1 ---- 1 Profile
```

Un utilisateur possede un seul profil. Un profil appartient a un seul utilisateur.

### 8.3 Donnees initiales

| ID | Email | Password | Role |
| ---: | --- | --- | --- |
| 1 | `admin@estore.com` | `admin123` | `ADMIN` |
| 2 | `client@estore.com` | `client123` | `CLIENT` |
| 3 | `sara.martin@estore.com` | `sara123` | `CLIENT` |

### 8.4 Methodes API

#### Register

```text
POST http://localhost:8081/api/auth/register
```

Body:

```json
{
  "firstName": "Ali",
  "lastName": "Amrani",
  "email": "ali@estore.com",
  "password": "ali123",
  "role": "CLIENT"
}
```

Role:

- cree un utilisateur;
- cree automatiquement un profil vide;
- refuse un email deja utilise.

#### Login

```text
POST http://localhost:8081/api/auth/login
```

Body:

```json
{
  "email": "admin@estore.com",
  "password": "admin123"
}
```

Role:

- verifie l'email;
- verifie le mot de passe;
- retourne les informations de l'utilisateur connecte.

#### Lister les utilisateurs

```text
GET http://localhost:8081/api/users
```

#### Recuperer un utilisateur

```text
GET http://localhost:8081/api/users/1
```

#### Recuperer le profil

```text
GET http://localhost:8081/api/users/1/profile
```

#### Modifier le profil

```text
PUT http://localhost:8081/api/users/1/profile
```

Body:

```json
{
  "phone": "+212600000001",
  "address": "1 Admin Street",
  "city": "Casablanca",
  "country": "Morocco"
}
```

#### Recuperer le role

```text
GET http://localhost:8081/api/users/1/role
```

Reponse:

```json
{
  "role": "ADMIN"
}
```

## 9. catalog-service

### 9.1 Role

`catalog-service` gere:

- les categories;
- les produits;
- la recherche des produits;
- le controle ADMIN pour les operations sensibles.

### 9.2 Entites

`Category` contient:

- `id`
- `name`
- `description`
- `products`

`Product` contient:

- `id`
- `name`
- `description`
- `price`
- `imageUrl`
- `category`

Relation:

```text
Category 1 ---- N Product
```

Une categorie peut contenir plusieurs produits. Un produit appartient a une seule categorie.

### 9.3 Donnees initiales

Categories:

| ID | Nom | Description |
| ---: | --- | --- |
| 1 | Electronics | Phones, laptops and accessories |
| 2 | Books | Books and learning materials |
| 3 | Office | Office furniture and supplies |

Produits:

| ID | Nom | Prix | Categorie |
| ---: | --- | ---: | --- |
| 1 | Laptop | 7500.0 | Electronics |
| 2 | Java Book | 250.0 | Books |
| 3 | Wireless Mouse | 150.0 | Electronics |
| 4 | Office Chair | 1200.0 | Office |

### 9.4 Methodes API Categories

#### Lister les categories

```text
GET http://localhost:8082/api/categories
```

#### Creer une categorie

```text
POST http://localhost:8082/api/categories?requestedBy=1
```

Body:

```json
{
  "name": "Phones",
  "description": "Smartphones and accessories"
}
```

Condition:

- `requestedBy` doit etre l'id d'un utilisateur ADMIN.

### 9.5 Methodes API Produits

#### Lister les produits

```text
GET http://localhost:8082/api/products
```

#### Chercher par mot-cle

```text
GET http://localhost:8082/api/products?keyword=Laptop
```

#### Filtrer par categorie

```text
GET http://localhost:8082/api/products?categoryId=1
```

#### Recuperer un produit

```text
GET http://localhost:8082/api/products/1
```

#### Creer un produit

```text
POST http://localhost:8082/api/products?requestedBy=1
```

Body:

```json
{
  "name": "Keyboard",
  "description": "Mechanical keyboard",
  "price": 450.0,
  "imageUrl": "https://example.com/keyboard.jpg",
  "categoryId": 1
}
```

#### Modifier un produit

```text
PUT http://localhost:8082/api/products/1?requestedBy=1
```

Body:

```json
{
  "name": "Laptop Pro",
  "description": "Powerful laptop",
  "price": 9000.0,
  "imageUrl": "https://example.com/laptop-pro.jpg",
  "categoryId": 1
}
```

#### Supprimer un produit

```text
DELETE http://localhost:8082/api/products/1?requestedBy=1
```

## 10. inventory-service

### 10.1 Role

`inventory-service` gere:

- la quantite disponible pour chaque produit;
- l'ajout ou la modification du stock;
- la reduction du stock;
- l'augmentation du stock;
- la verification du stock de plusieurs produits.

### 10.2 Entite

`Inventory` contient:

- `id`
- `productId`
- `quantity`

Relation logique:

```text
Product du catalog-service 1 ---- 1 Inventory
```

Il n'y a pas de cle etrangere entre les bases, car chaque service a sa propre base H2. La relation se fait avec `productId`.

### 10.3 Donnees initiales

| Product ID | Quantite |
| ---: | ---: |
| 1 | 20 |
| 2 | 50 |
| 3 | 75 |
| 4 | 12 |

### 10.4 Methodes API

#### Lister le stock de plusieurs produits

```text
GET http://localhost:8083/api/inventory?productIds=1,2,3
```

#### Recuperer le stock d'un produit

```text
GET http://localhost:8083/api/inventory/1
```

#### Creer ou modifier le stock

```text
POST http://localhost:8083/api/inventory/1?quantity=30
```

Role:

- si le stock du produit existe, il remplace la quantite;
- si le stock n'existe pas, il cree une ligne.

#### Reduire le stock

```text
PUT http://localhost:8083/api/inventory/reduce/1?quantity=1
```

ou:

```text
POST http://localhost:8083/api/inventory/reduce/1?quantity=1
```

Role:

- diminue le stock du produit;
- refuse si la quantite est inferieure ou egale a zero;
- refuse si le stock est insuffisant.

#### Augmenter le stock

```text
PUT http://localhost:8083/api/inventory/increase/1?quantity=1
```

ou:

```text
POST http://localhost:8083/api/inventory/increase/1?quantity=1
```

## 11. order-service

### 11.1 Role

`order-service` gere:

- la creation des commandes;
- la consultation des commandes;
- la modification des commandes;
- le changement de statut;
- la suppression des commandes;
- la reservation et restauration du stock.

### 11.2 Entite

`Order` contient:

- `id`
- `customerId`
- `productId`
- `quantity`
- `totalPrice`
- `status`
- `createdAt`

Statuts disponibles:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `DELIVERED`

Relations logiques:

```text
User du customer-service 1 ---- N Order
Product du catalog-service 1 ---- N Order
```

`customerId` pointe vers un utilisateur dans `customer-service`. `productId` pointe vers un produit dans `catalog-service`.

### 11.3 Donnees initiales

| ID | Customer ID | Product ID | Quantite | Total | Statut |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 2 | 1 | 1 | 7500.0 | CONFIRMED |
| 2 | 2 | 2 | 2 | 500.0 | DELIVERED |
| 3 | 3 | 3 | 3 | 450.0 | PENDING |

### 11.4 Logique de creation d'une commande

Quand une commande est creee:

1. `order-service` verifie que le client existe dans `customer-service`.
2. `order-service` recupere le produit dans `catalog-service`.
3. Il lit le champ `price` du produit.
4. Il calcule `totalPrice = price * quantity`.
5. Il enregistre la commande.
6. Si le statut n'est pas `CANCELLED`, il appelle `inventory-service` pour reduire le stock.

### 11.5 Methodes API

#### Lister les commandes

```text
GET http://localhost:8084/api/orders
```

#### Filtrer par client

```text
GET http://localhost:8084/api/orders?customerId=2
```

#### Filtrer par statut

```text
GET http://localhost:8084/api/orders?status=PENDING
```

#### Filtrer par client et statut

```text
GET http://localhost:8084/api/orders?customerId=2&status=CONFIRMED
```

#### Recuperer une commande

```text
GET http://localhost:8084/api/orders/1
```

#### Creer une commande

```text
POST http://localhost:8084/api/orders
```

Body:

```json
{
  "customerId": 3,
  "productId": 1,
  "quantity": 1
}
```

Le champ `status` est optionnel. S'il est absent, le statut devient `PENDING`.

Body avec statut:

```json
{
  "customerId": 3,
  "productId": 1,
  "quantity": 1,
  "status": "PENDING"
}
```

Conditions:

- `customerId` doit exister dans `customer-service`;
- `productId` doit exister dans `catalog-service`;
- le produit doit avoir du stock dans `inventory-service`;
- `quantity` doit etre au minimum `1`;
- les services `customer-service`, `catalog-service` et `inventory-service` doivent etre demarres.

#### Modifier une commande

```text
PUT http://localhost:8084/api/orders/1
```

Body:

```json
{
  "customerId": 3,
  "productId": 2,
  "quantity": 2,
  "status": "CONFIRMED"
}
```

Role:

- modifie le client, le produit, la quantite et le statut;
- recalcule le total;
- ajuste le stock selon la difference.

#### Modifier seulement le statut

```text
PATCH http://localhost:8084/api/orders/1/status?status=CANCELLED
```

Si la commande devient `CANCELLED`, le stock est restaure.

#### Supprimer une commande

```text
DELETE http://localhost:8084/api/orders/1
```

Si la commande supprimmee n'est pas `CANCELLED`, le stock est restaure.

## 12. billing-service

### 12.1 Role

`billing-service` gere:

- la creation des factures;
- la consultation des factures;
- le paiement;
- l'echec du paiement;
- le remboursement.

### 12.2 Entite

`Billing` contient:

- `id`
- `orderId`
- `amount`
- `status`
- `paymentMethod`
- `createdAt`
- `paidAt`

Statuts disponibles:

- `PENDING`
- `PAID`
- `FAILED`
- `REFUNDED`

Methodes de paiement:

- `CASH`
- `CARD`
- `BANK_TRANSFER`

Relation logique:

```text
Order du order-service 1 ---- 1 Billing
```

Une commande ne peut avoir qu'une seule facture. La colonne `order_id` est unique.

### 12.3 Donnees initiales

| ID | Order ID | Amount | Statut | Payment Method |
| ---: | ---: | ---: | --- | --- |
| 1 | 1 | 7500.0 | PAID | CARD |
| 2 | 2 | 500.0 | PAID | CASH |
| 3 | 3 | 450.0 | PENDING | BANK_TRANSFER |

### 12.4 Logique de creation d'une facture

Quand une facture est creee:

1. `billing-service` verifie qu'il n'existe pas deja une facture pour la commande.
2. Il appelle `order-service` pour recuperer la commande.
3. Il lit `totalPrice`.
4. Il cree la facture avec le statut `PENDING`.

### 12.5 Methodes API

#### Lister les factures

```text
GET http://localhost:8085/api/billing
```

#### Filtrer par statut

```text
GET http://localhost:8085/api/billing?status=PAID
```

#### Recuperer une facture par ID

```text
GET http://localhost:8085/api/billing/1
```

#### Recuperer la facture d'une commande

```text
GET http://localhost:8085/api/billing/order/1
```

#### Creer une facture

```text
POST http://localhost:8085/api/billing
```

Body:

```json
{
  "orderId": 4,
  "paymentMethod": "CARD"
}
```

Conditions:

- `orderId` doit exister dans `order-service`;
- il ne doit pas deja y avoir une facture pour cette commande;
- `order-service` doit etre demarre.

#### Marquer une facture comme payee

```text
PUT http://localhost:8085/api/billing/3/pay
```

Role:

- passe la facture a `PAID`;
- renseigne `paidAt`.

#### Marquer une facture comme echouee

```text
PUT http://localhost:8085/api/billing/3/fail
```

Condition:

- seulement une facture non payee et non remboursee peut etre marquee `FAILED`.

#### Rembourser une facture

```text
PUT http://localhost:8085/api/billing/1/refund
```

Condition:

- seule une facture `PAID` peut etre remboursee.

Si la facture est `PENDING`, l'API retourne une erreur car une facture non payee ne peut pas etre remboursee.

## 13. Scenario complet avec Postman

Avant de tester, demarrer les services dans cet ordre:

1. customer-service
2. catalog-service
3. inventory-service
4. order-service
5. billing-service

### 13.1 Verifier les donnees de base

Verifier l'admin:

```text
GET http://localhost:8081/api/users/1
```

Verifier un produit:

```text
GET http://localhost:8082/api/products/1
```

Verifier le stock:

```text
GET http://localhost:8083/api/inventory/1
```

### 13.2 Creer une commande

```text
POST http://localhost:8084/api/orders
```

Body:

```json
{
  "customerId": 3,
  "productId": 1,
  "quantity": 1
}
```

Reponse attendue:

```json
{
  "id": 4,
  "customerId": 3,
  "productId": 1,
  "quantity": 1,
  "totalPrice": 7500.0,
  "status": "PENDING"
}
```

### 13.3 Verifier que le stock a diminue

```text
GET http://localhost:8083/api/inventory/1
```

### 13.4 Creer une facture pour la commande

```text
POST http://localhost:8085/api/billing
```

Body:

```json
{
  "orderId": 4,
  "paymentMethod": "CARD"
}
```

### 13.5 Payer la facture

```text
PUT http://localhost:8085/api/billing/4/pay
```

### 13.6 Rembourser la facture

```text
PUT http://localhost:8085/api/billing/4/refund
```

## 14. Gestion des erreurs

Chaque service possede un gestionnaire global d'erreurs.

Exemples:

| Code | Signification | Exemple |
| ---: | --- | --- |
| 400 | Requete invalide | quantite negative, stock insuffisant |
| 401 | Non autorise | login incorrect |
| 403 | Interdit | un CLIENT veut creer un produit |
| 404 | Introuvable | produit, client ou commande inexistant |
| 409 | Conflit | email deja utilise, facture deja creee |
| 500 | Erreur interne | erreur non prevue ou service externe indisponible |

Si `order-service` retourne `Internal server error`, verifier souvent:

- URL sans espace;
- `customer-service` demarre sur le port `8081`;
- `catalog-service` demarre sur le port `8082`;
- `inventory-service` demarre sur le port `8083`;
- le client existe;
- le produit existe;
- le stock existe.

## 15. DTO utilises

Le projet utilise des DTO pour ne pas exposer directement les entites JPA.

DTO principaux:

- `UserResponse`
- `ProfileResponse`
- `CategoryResponse`
- `ProductResponse`
- `InventoryResponse`
- `OrderResponse`
- `BillingResponse`
- `RegisterRequest`
- `LoginRequest`
- `ProfileDTO`
- `CategoryDTO`
- `ProductDTO`
- `OrderRequest`
- `BillingRequest`

Avantages:

- cacher les champs sensibles comme `password`;
- eviter les problemes de relations JPA dans le JSON;
- rendre les reponses plus propres;
- controler exactement ce qui est envoye au client.

## 16. Lancement manuel

Lancer chaque service dans un terminal different.

Customer:

```powershell
cd customer-service
.\mvnw.cmd spring-boot:run
```

Catalog:

```powershell
cd catalog-service
.\mvnw.cmd spring-boot:run
```

Inventory:

```powershell
cd inventory-service
..\catalog-service\mvnw.cmd -f pom.xml spring-boot:run
```

Order:

```powershell
cd order-service
.\mvnw.cmd spring-boot:run
```

Billing:

```powershell
cd billing-service
.\mvnw.cmd spring-boot:run
```

## 17. Lancement des tests

Depuis la racine:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-all-tests.ps1
```

Si PowerShell bloque les scripts, lancer les tests service par service:

```powershell
cd customer-service
.\mvnw.cmd test
```

```powershell
cd catalog-service
.\mvnw.cmd test
```

```powershell
cd inventory-service
..\catalog-service\mvnw.cmd -f pom.xml test
```

```powershell
cd order-service
.\mvnw.cmd test
```

```powershell
cd billing-service
.\mvnw.cmd test
```

## 18. Collection Postman

Le fichier `postman_collection.json` contient un parcours de test:

1. Register admin.
2. Login admin.
3. Create category.
4. Create product.
5. Update stock.
6. Create order.
7. Create billing.
8. Pay billing.
9. List products.
10. List orders.
11. List billings.

Pour tester une requete POST ou PUT:

- choisir la bonne methode HTTP;
- mettre l'URL sans espace;
- aller dans `Body`;
- choisir `raw`;
- choisir `JSON`;
- ajouter `Content-Type: application/json` si necessaire.

## 19. Ordre conseille pour une demonstration

1. Montrer la structure du projet.
2. Montrer les 5 services.
3. Lancer les services.
4. Montrer les bases H2.
5. Tester `GET /api/users`.
6. Tester `GET /api/products`.
7. Tester `GET /api/inventory/1`.
8. Creer une commande.
9. Verifier que le stock diminue.
10. Creer une facture.
11. Payer la facture.
12. Rembourser la facture.

## 20. Limites du projet

Le projet est adapte a une demonstration pedagogique. Il reste volontairement simple.

Limites:

- les mots de passe sont stockes en clair;
- il n'y a pas de JWT;
- il n'y a pas de Spring Security;
- il n'y a pas d'API Gateway;
- il n'y a pas de service discovery;
- il n'y a pas de base de donnees persistante comme MySQL ou PostgreSQL;
- il n'y a pas de transaction distribuee entre microservices.

Ameliorations possibles:

- ajouter Spring Security;
- chiffrer les mots de passe avec BCrypt;
- ajouter JWT;
- ajouter une API Gateway;
- ajouter Eureka ou Consul;
- remplacer H2 par PostgreSQL ou MySQL;
- ajouter un frontend;
- ajouter plus de tests d'integration.

## 21. Conclusion

Ce projet implemente une application e-commerce avec une architecture microservices simple et claire. Chaque service a une responsabilite precise et communique avec les autres services quand c'est necessaire.

Le projet montre les notions importantes suivantes:

- separation des responsabilites;
- bases de donnees independantes;
- APIs REST;
- communication entre services;
- validation des donnees;
- gestion des erreurs;
- initialisation de donnees avec H2;
- tests avec Postman.

Le scenario complet montre le fonctionnement global: un client passe une commande, le stock est reduit, une facture est creee, puis la facture peut etre payee ou remboursee.

## 22. Questions possibles pendant la soutenance

### Pourquoi utiliser les microservices?

Pour separer les responsabilites. Chaque service gere un domaine precis. Cela rend le projet plus organise et plus facile a maintenir.

### Pourquoi chaque service a sa propre base H2?

Dans une architecture microservices, chaque service possede ses propres donnees. Cela evite le couplage direct entre les services.

### Pourquoi utiliser OpenFeign?

OpenFeign facilite les appels HTTP entre services. On declare une interface Java et Spring genere l'appel REST automatiquement.

### Que se passe-t-il quand une commande est creee?

`order-service` verifie le client, recupere le prix du produit, calcule le total, sauvegarde la commande et reduit le stock.

### Que se passe-t-il quand une facture est creee?

`billing-service` appelle `order-service`, recupere le total de la commande et cree une facture avec le statut `PENDING`.

### Pourquoi utiliser des DTO?

Les DTO permettent de controler les donnees envoyees au client. Par exemple, le mot de passe ne doit pas etre retourne dans une reponse JSON.

### Pourquoi H2?

H2 est simple pour les tests et les demonstrations. Il ne demande pas d'installation externe.

### Quelle est la relation entre Product et Inventory?

La relation est logique avec `productId`. `catalog-service` stocke les produits et `inventory-service` stocke les quantites. Il n'y a pas de cle etrangere car les services ont des bases separees.
