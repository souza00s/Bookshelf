# Copilot Instructions for SIHS2025 Bookshelf API

## Project Overview
- This is a Spring Boot Java REST API for a bookshelf application.
- Main package: `com.bookshelf.api`.
- Key components:
  - **Controllers**: Handle HTTP requests (see `controllers/`).
  - **Models**: Domain entities (`Book.java`, `User.java`).
  - **Repositories**: Spring Data JPA interfaces for persistence (`BookRepository.java`, `UserRepository.java`).
  - **Services**: Business logic layer (`services/`).

## Build & Run
- Use Maven wrapper scripts: `./mvnw` (Linux/macOS) or `mvnw.cmd` (Windows).
- Common commands:
  - Build: `./mvnw clean package` or `mvnw.cmd clean package`
  - Run: `./mvnw spring-boot:run` or `mvnw.cmd spring-boot:run`
  - Test: `./mvnw test` or `mvnw.cmd test`
- Application config: `src/main/resources/application.properties`

## Testing
- Tests are in `src/test/java/com/bookshelf/api/`.
- Main test class: `ApiApplicationTests.java`.
- Test reports: `target/surefire-reports/`.

## Patterns & Conventions
- Follows standard Spring Boot structure.
- Use dependency injection for services and repositories.
- REST endpoints are defined in controller classes.
- Entity classes use JPA annotations for ORM mapping.
- Properties and environment config in `application.properties`.

## Integration Points
- Uses Spring Data JPA for database access.
- External dependencies managed via Maven (`pom.xml`).
- Static resources: `src/main/resources/static/`
- Templates (if any): `src/main/resources/templates/`

## Example: Adding a New Entity
1. Create a model in `models/` (e.g., `Author.java`).
2. Add a repository in `repositories/` (e.g., `AuthorRepository.java`).
3. Add business logic in `services/`.
4. Expose endpoints in a controller in `controllers/`.

## Quick Reference
- Main entry point: `ApiApplication.java`
- Configuration: `application.properties`
- Build tool: Maven (use wrapper scripts)
- Test: `ApiApplicationTests.java`

---
For unclear or missing conventions, ask the user for clarification before making assumptions.
