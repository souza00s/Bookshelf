# 📚 Bookshelf

Uma plataforma de doações que conecta doadores a causas e projetos.

<img width="1920" height="1079" alt="image" src="https://github.com/user-attachments/assets/4b01f526-44af-4658-a145-961ff63255e4" />

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

**IMPORTANTE: Configuração de Variáveis de Ambiente (Segurança)**

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cd api
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais **REAIS**:
   ```bash
   # .env (NÃO VERSIONAR - já está no .gitignore)
   DB_PASSWORD=sua_senha_mysql
   MAIL_USERNAME=seu_email@gmail.com
   MAIL_PASSWORD=sua_senha_app_gmail
   JWT_SECRET=sua_chave_jwt_base64
   SOCKET_HOST=localhost
   SOCKET_PORT=8081
   ```

3. O arquivo `application.properties` já está configurado para ler essas variáveis automaticamente usando a sintaxe `${VARIAVEL:valor_padrao}`.

**Opções de Banco de Dados:**

- Via Docker Compose (serviço `mysql`):
  ```
  spring.datasource.url=jdbc:mysql://mysql:3306/bookshelf
  ```

- MySQL local (sem Docker) - padrão em `application.properties`:
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/bookshelf_db?serverTimezone=UTC
  spring.datasource.username=root
  spring.datasource.password=${DB_PASSWORD:}
  ```

Notas rápidas:
- O Hibernate cria/atualiza tabelas (schema) automaticamente com `spring.jpa.hibernate.ddl-auto=update`
- **NUNCA** commite o arquivo `.env` - ele contém suas credenciais privadas e já está no `.gitignore`
- Compartilhe apenas o `.env.example` para que outros desenvolvedores saibam quais variáveis configurar
- A biblioteca `spring-dotenv` carrega automaticamente as variáveis do `.env` ao iniciar a aplicação

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

Desenvolvido com ❤ por [@souza00s](https://github.com/souza00s) & [@Bagreel](https://github.com/Bagreel)
