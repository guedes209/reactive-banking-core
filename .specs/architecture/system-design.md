# System Architecture

## Architectural Style
- **Modular Monolith:** Single deployable unit, internally divided by strict domain boundaries.
- **Clean Architecture:** Domain logic isolated from frameworks and infrastructure.
- **Event-Driven Architecture (EDA):** Asynchronous communication between bounded contexts using Apache Kafka.
- **CQRS & Event Sourcing:** Separation of read and write models. State is derived from an append-only log of events.

## Tech Stack
- **Backend:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL
- **Message Broker:** Apache Kafka
- **Testing:** Jest

## Module Boundaries
1. **Ledger Module (Write Model):** Handles financial truth, Event Sourcing, balances.
2. **Risk Module:** Analyzes transactions asynchronously for fraud.
3. **Query/Statement Module (Read Model):** CQRS read-optimized views.

