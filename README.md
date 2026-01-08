# 📚 Bookshelf

A donation platform that connects donors to causes and projects.

https://github.com/user-attachments/assets/9d4a1a0e-43c4-45a4-8e1c-6ab36c1b7c81

## 📋 Table of Contents
- [About the Project](#about-the-project)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration and Installation](#configuration-and-installation)
- [How to Run](#how-to-run)
- [Available Scripts](#available-scripts)

## 📖 About the Project

**Bookshelf** is a web application for donation management, allowing users to register, log in, and make donations to various causes. The project is divided into two parts:

- **API (Backend)**: REST service responsible for authentication (JWT), business logic, and data persistence (MySQL).
- **Bookshelf (Frontend)**: Interface developed with Ionic/Angular for web devices.

## 🚀 Technologies

### Backend (API)
- Java 21
- Spring Boot 3.5.5
- Spring Security
- Spring Data JPA
- MySQL
- JWT (JSON Web Token)
- Lombok
- Netty Socket.IO
- Maven (Wrapper included:  `./mvnw`)

### Frontend (Bookshelf)
- Angular 20
- Ionic 8
- Capacitor 7
- TypeScript 5.8
- RxJS
- Socket.IO Client
- SCSS
- ESLint
- Karma/Jasmine (testing)

## 📁 Project Structure

```
Bookshelf/
├── api/                    # Backend (Spring Boot)
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── src/main/resources/application.properties. example
├── bookshelf/              # Frontend (Ionic/Angular)
│   ├── src/
│   ├── angular.json
│   ├── ionic.config.json
│   ├── capacitor.config. ts
│   └── package. json
└── docker-compose. yml      # Infrastructure (MySQL + optional API)
```

## ✅ Prerequisites

- Java JDK 21+
- Node. js 18+ and npm
- Docker and Docker Compose (to easily run MySQL)
- Git

Optional (recommended):
```bash
npm install -g @ionic/cli
```

## ⚙️ Configuration and Installation

### 1. Clone the repository
```bash
git clone https://github.com/souza00s/Bookshelf.git
cd Bookshelf
```

### 2. Start MySQL with Docker (recommended)
```bash
docker compose up -d mysql
```
- This creates the `bookshelf` database and the `bookshelf` user with password `bookshelf`.
- The service is accessible at `mysql:3306` (for containers) and at `localhost:3306` (on your machine).

### 3. Configure the Backend quickly
Copy the example file and adjust if necessary:
```bash
cp api/src/main/resources/application.properties.example api/src/main/resources/application.properties
```

Use one of the options in `application.properties`:

- Via Docker Compose (`mysql` service):
  ```
  spring.datasource.url=jdbc:mysql://mysql:3306/bookshelf
  spring. datasource.username=bookshelf
  spring.datasource.password=bookshelf
  ```

- Local MySQL (without Docker):
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/bookshelf? createDatabaseIfNotExist=true
  spring.datasource. username=<YOUR_MYSQL_USERNAME>
  spring.datasource.password=<YOUR_MYSQL_PASSWORD>
  ```

And keep:
```
spring.jpa.hibernate.ddl-auto=update
jwt.secret=<A_RANDOM_LOCAL_SECRET_HERE>
server. port=8080
```

Quick notes:
- Hibernate creates/updates tables (schema). The `bookshelf` database is created automatically by Docker Compose; if using local MySQL, the `?createDatabaseIfNotExist=true` option avoids manual creation.
- Each person running locally should have their own `application.properties` (copied from `.example`).

### 4. Install dependencies

Backend:
```bash
cd api
./mvnw clean install
```

Frontend:
```bash
cd bookshelf
npm install
```

## ▶️ How to Run

### Backend (API)
```bash
cd api
./mvnw spring-boot:run
```
The API will be available at: `http://localhost:8080`

Optional: run the API via Docker (if enabled in `docker-compose.yml`):
```bash
docker compose up -d
```

### Frontend (Bookshelf)
```bash
cd bookshelf
npm start
```
The application will be available at:  `http://localhost:4200`

## 📜 Available Scripts

### Backend (API)
| Command | Description |
|---------|-----------|
| `./mvnw clean install` | Compiles and installs dependencies |
| `./mvnw spring-boot:run` | Runs the application |
| `./mvnw test` | Runs tests |

### Frontend (Bookshelf)
| Command | Description |
|---------|-----------|
| `npm start` | Starts the development server |
| `npm run build` | Generates production build |
| `npm run test` | Runs unit tests |
| `npm run lint` | Runs the linter (ESLint) |
| `npm run watch` | Build in watch mode |

---

Developed with ❤ by [@souza00s](https://github.com/souza00s) & [@Bagreel](https://github.com/Bagreel)
