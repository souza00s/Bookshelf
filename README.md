# 📚 Bookshelf

Uma plataforma de doações que conecta doadores a causas e projetos.

## 📋 Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Instalação](#configuração-e-instalação)
- [Como Executar](#como-executar)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 📖 Sobre o Projeto

O **Bookshelf** é uma aplicação web/mobile para gerenciamento de doações, permitindo que usuários se cadastrem, façam login e realizem doações para causas diversas. O projeto é dividido em duas partes:

- **API (Backend)**: Serviço REST responsável pela autenticação (JWT), regras de negócio e persistência de dados (MySQL).
- **Bookshelf (Frontend)**: Interface desenvolvida com Ionic/Angular para web e dispositivos móveis.

## 🚀 Tecnologias

### Backend (API)
- Java 21
- Spring Boot 3.5.5
- Spring Security
- Spring Data JPA
- MySQL
- JWT (JSON Web Token)
- Lombok
- Netty Socket.IO
- Maven (Wrapper incluso: `./mvnw`)

### Frontend (Bookshelf)
- Angular 20
- Ionic 8
- Capacitor 7
- TypeScript 5.8
- RxJS
- Socket.IO Client
- SCSS
- ESLint
- Karma/Jasmine (testes)

## 📁 Estrutura do Projeto

```
Bookshelf/
├── api/                    # Backend (Spring Boot)
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── src/main/resources/application.properties.example
├── bookshelf/              # Frontend (Ionic/Angular)
│   ├── src/
│   ├── angular.json
│   ├── ionic.config.json
│   ├── capacitor.config.ts
│   └── package.json
└── docker-compose.yml      # Infra (MySQL + opcional API)
```

## ✅ Pré-requisitos

- Java JDK 21+
- Node.js 18+ e npm
- Docker e Docker Compose (para subir o MySQL facilmente)
- Git

Opcional (recomendado):
```bash
npm install -g @ionic/cli
```

## ⚙️ Configuração e Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/souza00s/Bookshelf.git
cd Bookshelf
```

### 2. Suba o MySQL com Docker (recomendado)
```bash
docker compose up -d mysql
```
- Isso cria a base `bookshelf` e o usuário `bookshelf` com senha `bookshelf`.
- O serviço fica acessível em `mysql:3306` (para containers) e em `localhost:3306` (na sua máquina).

### 3. Configure o Backend rapidamente
Copie o arquivo de exemplo e ajuste se necessário:
```bash
cp api/src/main/resources/application.properties.example api/src/main/resources/application.properties
```

Use uma das opções no `application.properties`:

- Via Docker Compose (serviço `mysql`):
  ```
  spring.datasource.url=jdbc:mysql://mysql:3306/bookshelf
  spring.datasource.username=bookshelf
  spring.datasource.password=bookshelf
  ```

- MySQL local (sem Docker):
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/bookshelf?createDatabaseIfNotExist=true
  spring.datasource.username=<SEU_USUARIO_MYSQL>
  spring.datasource.password=<SUA_SENHA_MYSQL>
  ```

E mantenha:
```
spring.jpa.hibernate.ddl-auto=update
jwt.secret=<UM_SEGREDO_LOCAL_ALEATORIO_AQUI>
server.port=8080
```

Notas rápidas:
- O Hibernate cria/atualiza tabelas (schema). A base `bookshelf` é criada automaticamente pelo Docker Compose; se usar MySQL local, a opção `?createDatabaseIfNotExist=true` evita criar manualmente.
- Cada pessoa que for rodar localmente deve ter seu próprio `application.properties` (copiado do `.example`).

### 4. Instale dependências

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

## ▶️ Como Executar

### Backend (API)
```bash
cd api
./mvnw spring-boot:run
```
A API estará disponível em: `http://localhost:8080`

Opcional: executar a API via Docker (se estiver habilitada no `docker-compose.yml`):
```bash
docker compose up -d
```

### Frontend (Bookshelf)
```bash
cd bookshelf
npm start
```
A aplicação estará disponível em: `http://localhost:4200`

## 📜 Scripts Disponíveis

### Backend (API)
| Comando | Descrição |
|---------|-----------|
| `./mvnw clean install` | Compila e instala dependências |
| `./mvnw spring-boot:run` | Executa a aplicação |
| `./mvnw test` | Executa testes |

### Frontend (Bookshelf)
| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run test` | Executa testes unitários |
| `npm run lint` | Executa o linter (ESLint) |
| `npm run watch` | Build em watch mode |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit (`git commit -m 'feat: minha feature'`)
4. Push (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

Desenvolvido por [@souza00s](https://github.com/souza00s) & [@Bagreel](https://github.com/Bagreel)
