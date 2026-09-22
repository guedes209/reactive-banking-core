# Tasks: Transfer Process

## Phase 1: Infrastructure & Monolith Setup
- [x] 1.1 Scaffold NestJS Application (Monolith base).
- [x] 1.2 Setup PostgreSQL and Prisma/TypeORM.
- [x] 1.3 Setup Docker Compose with Apache Kafka, Zookeeper, and PostgreSQL.
- [x] 1.4 Setup Vitest for Unit and E2E Testing.

## Phase 2: Domain Layer (Clean Architecture)
- [x] 2.1 Implement `Wallet` Entity and `Transaction` Value Objects (DDD).
- [x] 2.2 Implement Event Sourcing rules for balance calculation (Unit Tests only).
- [x] 2.3 Implement Risk/Fraud domain rules (Unit Tests only).

## Phase 3: Application Layer & Messaging
- [x] 3.1 Implement Kafka Producer and Consumer modules in NestJS.
- [x] 3.2 Implement `TransferUseCase` to initiate transfer and publish `TransactionRequestedEvent`.
- [x] 3.3 Implement Risk Service consumer to validate and publish `Approved`/`Denied` events.
- [x] 3.4 Implement Ledger Consumer to finalize transaction and store Domain Events in Postgres.

## Phase 4: API & CQRS (Execute & Validate)
- [x] 4.1 Implement `POST /transfer` REST Endpoint.
- [x] 4.2 Implement Read-Model Updater (CQRS) to populate statement tables.
- [x] 4.3 Implement `GET /statement` REST Endpoint querying the read-model.
- [x] 4.4 End-to-end integration test validating the entire asynchronous flow.

