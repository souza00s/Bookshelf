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

- **API (Backend)**: Serviço REST responsável pela autenticação (JWT), regras de negócio e persistência de dados. 
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
- Maven

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
│   └── mvnw
├── bookshelf/              # Frontend (Ionic/Angular)
│   ├── src/
│   ├── angular.json
│   ├── ionic.config.json
│   ├── capacitor.config.ts
│   └── package.json
└── README.md
```

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado: 

- **Java JDK 21** ou superior
- **Node.js 18+** e **npm**
- **MySQL 8+**
- **Git**
- **Ionic CLI** (opcional, mas recomendado):
  ```bash
  npm install -g @ionic/cli
  ```

## ⚙️ Configuração e Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/souza00s/Bookshelf.git
cd Bookshelf
```

### 2. Configure o banco de dados MySQL
Crie um banco de dados para a aplicação:
```sql
CREATE DATABASE bookshelf;
```

### 3. Configure as variáveis de ambiente do Backend
No diretório `api/src/main/resources/`, configure o arquivo `application.properties` ou `application.yml`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookshelf
spring.datasource. username=seu_usuario
spring.datasource. password=sua_senha
spring. jpa.hibernate.ddl-auto=update
jwt.secret=sua_chave_secreta_jwt
server.port=8080
```

### 4. Instale as dependências

**Backend:**
```bash
cd api
./mvnw clean install
```

**Frontend:**
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
A API estará disponível em:  `http://localhost:8080`

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
| `./mvnw clean install` | Compila e instala as dependências |
| `./mvnw spring-boot:run` | Executa a aplicação |
| `./mvnw test` | Executa os testes |

### Frontend (Bookshelf)
| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run test` | Executa os testes unitários |
| `npm run lint` | Executa o linter (ESLint) |
| `npm run watch` | Build com watch mode |

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos: 

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

Desenvolvido por [@souza00s](https://github.com/souza00s) & [@Bagreel](https://github.com/Bagreel)
