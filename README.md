# StockSense - Modern Inventory Management System

![StockSense Banner](https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=StockSense+-+Inventory+Intelligence)

StockSense is an enterprise-grade, full-stack Inventory Management System built to handle complex warehouse logistics, real-time stock tracking, and complete auditability. It features a premium, responsive interface inspired by modern macOS design principles and a robust, transaction-safe Spring Boot backend.

## 🌟 Key Features

* **Warehouse & Location Management**: Create and manage physical storage locations with infinite hierarchy support.
* **Internal Stock Transfers**: Safely move inventory between different warehouse locations with atomic database transactions.
* **Stock Adjustments & Reconciliation**: Record physical count differences (Shrinkage, Damage) to keep system records perfectly aligned with reality.
* **Immutable Stock Ledger**: Every single movement, transfer, and adjustment is recorded in an append-only ledger for complete compliance and auditability.
* **Real-time Validations**: Built-in pessimistic locking ensures that high-volume parallel transfers never result in negative stock balances.
* **Premium UI/UX**: Dark-mode native, highly responsive interface built with Tailwind CSS v4 and React.

## 🛠 Technology Stack

### Frontend (Client-side)
* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS v4 (Custom Apple/macOS inspired Design System)
* **Routing**: React Router DOM
* **Icons**: Lucide React
* **HTTP Client**: Axios

### Backend (Server-side)
* **Framework**: Java 21 + Spring Boot 3.x
* **Data Access**: Spring Data JPA & Hibernate
* **Database**: PostgreSQL (Relational Database)
* **Transaction Management**: Spring `@Transactional` + JPA Pessimistic Locking
* **API Architecture**: RESTful Services

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [Node.js](https://nodejs.org/en/) (v18 or higher)
* [Java Development Kit (JDK) 21](https://adoptium.net/)
* [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
* Maven (Optional, wrapper provided)

### 1. Database Setup

Create a new PostgreSQL database named `stocksense`.

```sql
CREATE DATABASE stocksense;
CREATE USER stocksense WITH PASSWORD 'stocksense';
GRANT ALL PRIVILEGES ON DATABASE stocksense TO stocksense;
```

*(Note: If you don't have PostgreSQL installed, the backend is configured to seamlessly switch to an H2 in-memory database by updating `application.properties`)*

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Ensure your `src/main/resources/application.properties` matches your PostgreSQL credentials. Then, run the application using the Maven wrapper:

```bash
# On Windows
.\mvnw spring-boot:run

# On macOS/Linux
./mvnw spring-boot:run
```

The Spring Boot API will start on `http://localhost:8080`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The React application will be available at `http://localhost:5173`. 

## 🏗 Architecture Overview

StockSense is built on a standard N-Tier architecture:
1. **Controller Layer**: Handles REST endpoints, incoming HTTP requests, and basic validation.
2. **Service Layer**: Houses the core business logic. Uses `@Transactional` to ensure multi-step stock movements (e.g. deducting from Location A, adding to Location B, writing to Ledger) happen atomically.
3. **Repository Layer**: Interfaces with PostgreSQL using Spring Data JPA. Utilizes `@Lock(LockModeType.PESSIMISTIC_WRITE)` for concurrency control.

## 🤝 Contributing

This project was built collaboratively as part of a Hackathon. If you wish to contribute:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
