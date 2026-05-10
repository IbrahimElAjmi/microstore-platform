# E-store Microservices

Projet e-store simple organise en 5 domaines:

- `customer-service` : gestion des utilisateurs, login, profils et roles.
- `catalog-service` : gestion des categories et produits.
- `inventory-service` : gestion du stock des produits.
- `order-service` : gestion des commandes et reservation du stock.
- `billing-service` : gestion des factures et paiements.

## Ports

| Service | Port | Base URL |
| --- | ---: | --- |
| customer-service | 8081 | `http://localhost:8081` |
| catalog-service | 8082 | `http://localhost:8082` |
| inventory-service | 8083 | `http://localhost:8083` |
| order-service | 8084 | `http://localhost:8084` |
| billing-service | 8085 | `http://localhost:8085` |

Swagger UI est disponible sur chaque service:

- `http://localhost:8081/swagger-ui/index.html`
- `http://localhost:8082/swagger-ui/index.html`
- `http://localhost:8083/swagger-ui/index.html`
- `http://localhost:8084/swagger-ui/index.html`
- `http://localhost:8085/swagger-ui/index.html`

## Ordre de lancement

Lancer les services dans cet ordre:

1. `customer-service`
2. `catalog-service`
3. `inventory-service`
4. `order-service`
5. `billing-service`

Commandes:

```powershell
cd customer-service
.\mvnw.cmd spring-boot:run
```

Repeter avec chaque dossier de service.

## Lancement avec Docker Compose

Depuis la racine:

```powershell
docker compose up
```

Le fichier [docker-compose.yml](docker-compose.yml) lance les 5 services avec leurs ports.

## Donnees initiales

Au demarrage, le projet cree quelques donnees pour faciliter la demonstration:

- Admin: `admin@estore.com` / `admin123`
- Client: `client@estore.com` / `client123`
- Categories: `Electronics`, `Books`
- Produits: `Laptop`, `Java Book`
- Stocks: produit `1` avec quantite `20`, produit `2` avec quantite `50`

## Collection Postman

Importer [postman_collection.json](postman_collection.json) dans Postman pour tester le parcours:

1. Login admin
2. Creation categorie
3. Creation produit
4. Mise a jour stock
5. Creation commande
6. Creation facture
7. Paiement facture

## Parcours simple de test manuel

1. Creer un admin dans `customer-service`.
2. Creer une categorie dans `catalog-service` avec `requestedBy={adminId}`.
3. Creer un produit dans `catalog-service` avec `requestedBy={adminId}`.
4. Ajouter du stock dans `inventory-service`.
5. Creer une commande dans `order-service`.
6. Creer une facture dans `billing-service`.
7. Marquer la facture comme payee.

## Endpoints principaux

### customer-service

- `POST /api/auth/register` : creer un compte.
- `POST /api/auth/login` : connecter un utilisateur.
- `GET /api/users` : lister les utilisateurs.
- `GET /api/users/{id}` : recuperer un utilisateur.
- `GET /api/users/{id}/profile` : recuperer le profil.
- `PUT /api/users/{id}/profile` : modifier le profil.
- `GET /api/users/{id}/role` : recuperer le role.

### catalog-service

- `GET /api/categories` : lister les categories.
- `POST /api/categories?requestedBy={userId}` : creer une categorie.
- `GET /api/products` : lister/rechercher les produits.
- `GET /api/products/{id}` : recuperer un produit.
- `POST /api/products?requestedBy={userId}` : creer un produit.
- `PUT /api/products/{id}?requestedBy={userId}` : modifier un produit.
- `DELETE /api/products/{id}?requestedBy={userId}` : supprimer un produit.

### inventory-service

- `GET /api/inventory?productIds={id1,id2}` : verifier plusieurs stocks.
- `GET /api/inventory/{productId}` : recuperer un stock.
- `POST /api/inventory/{productId}?quantity={quantity}` : creer/modifier un stock.
- `PUT /api/inventory/reduce/{productId}?quantity={quantity}` : diminuer le stock.
- `PUT /api/inventory/increase/{productId}?quantity={quantity}` : augmenter le stock.

### order-service

- `GET /api/orders` : lister les commandes.
- `GET /api/orders/{id}` : recuperer une commande.
- `POST /api/orders` : creer une commande.
- `PUT /api/orders/{id}` : modifier une commande.
- `PATCH /api/orders/{id}/status?status={status}` : modifier le statut.
- `DELETE /api/orders/{id}` : supprimer une commande.

### billing-service

- `GET /api/billing` : lister les factures.
- `GET /api/billing/{id}` : recuperer une facture.
- `GET /api/billing/order/{orderId}` : recuperer la facture d'une commande.
- `POST /api/billing` : creer une facture.
- `PUT /api/billing/{id}/pay` : marquer comme payee.
- `PUT /api/billing/{id}/fail` : marquer comme echouee.
- `PUT /api/billing/{id}/refund` : rembourser.

## Tests

Depuis la racine:

```powershell
.\run-all-tests.ps1
```

Ou service par service:

```powershell
cd order-service
.\mvnw.cmd test
```

Pour `inventory-service`, qui n'a pas son propre wrapper Maven:

```powershell
cd inventory-service
..\catalog-service\mvnw.cmd -f pom.xml test
```
