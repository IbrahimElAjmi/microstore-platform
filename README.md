# 🛍️ MicroStore Platform

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A modern, scalable e-commerce platform built with Spring Boot microservices and Angular. Features comprehensive product catalog, customer management, inventory tracking, billing, and order processing with a professional admin dashboard.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular SPA   │    │  API Gateway    │    │   MySQL        │
│   (Frontend)    │◄──►│ (Spring Cloud)  │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────┐
        │         Spring Boot Microservices       │
        │  ┌─────────────┐ ┌───────────────┐ │
        │  │Catalog     │ │Customer      │ │
        │  │Service     │ │Service       │ │
        │  └─────────────┘ └───────────────┘ │
        │  ┌─────────────┐ ┌───────────────┐ │
        │  │Inventory   │ │Billing       │ │
        │  │Service     │ │Service       │ │
        │  └─────────────┘ └───────────────┘ │
        │  ┌─────────────┐                  │
        │  │Order       │                  │
        │  │Service     │                  │
        │  └─────────────┘                  │
        └─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose

### Installation

1. **Clone repository**
```bash
git clone https://github.com/IbrahimElAjmi/microstore-platform.git
cd microstore-platform
```

2. **Backend Setup**
```bash
cd backend
# Start all microservices with Docker
docker-compose up -d
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access the Application**
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:8080

### Default Credentials
- **Admin**: admin@microstore.com / admin123
- **Customer**: customer@microstore.com / customer123

## 📁 Project Structure

```
microstore-platform/
├── frontend/                          # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Core services & models
│   │   │   ├── features/             # Feature modules
│   │   │   │   ├── auth/           # Authentication
│   │   │   │   ├── catalog/        # Product catalog
│   │   │   │   ├── cart/           # Shopping cart
│   │   │   │   ├── orders/         # Order management
│   │   │   │   ├── profile/        # User profile
│   │   │   │   └── admin/         # Admin dashboard
│   │   │   ├── shared/             # Shared components
│   │   │   └── layout/            # Layout components
│   │   ├── assets/                 # Static assets
│   │   └── environments/           # Environment configs
│   ├── public/                     # Public assets
│   ├── package.json
│   └── angular.json
├── backend/                           # Spring Boot Microservices
│   ├── catalog-service/               # Product management
│   ├── customer-service/              # User management
│   ├── inventory-service/             # Stock management
│   ├── billing-service/              # Payment processing
│   ├── order-service/                # Order management
│   └── docker-compose.yml           # Backend orchestration
├── .gitignore
├── docker-compose.yml               # Full stack orchestration
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 21 with TypeScript
- **Styling**: TailwindCSS for responsive design
- **State Management**: RxJS for reactive data flow
- **HTTP Client**: Angular HttpClient with interceptors

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security with JWT
- **Data**: Spring Data JPA with Hibernate

### Infrastructure
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Package Management**: Maven for Java, npm for Angular

## 📦 Microservices

| Service | Port | Responsibility |
|---------|------|------------------|
| **Catalog Service** | 8081 | Product & Category Management |
| **Customer Service** | 8082 | User Authentication & Profiles |
| **Inventory Service** | 8083 | Stock Management |
| **Billing Service** | 8084 | Payment Processing |
| **Order Service** | 8085 | Order Lifecycle Management |

## 🔄 Development Workflow

**For frontend changes:**
```bash
cd frontend
npm install
npm start
```

**For backend changes:**
```bash
cd backend
docker-compose up -d
```

**For full stack development:**
```bash
# Terminal 1: Backend
cd backend && docker-compose up -d

# Terminal 2: Frontend  
cd frontend && npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>⭐ Star this repository if it helped you! ⭐</strong>
</div>
