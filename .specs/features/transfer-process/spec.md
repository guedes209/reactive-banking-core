# Specification: Transfer Process (Event-Driven Ledger)

## 1. Overview
The Transfer Process is the core workflow of the Reactive Banking Core. It handles moving funds between internal wallets. It utilizes an event-driven modular monolith approach, segregating the Ledger (Command) from the Fraud Analysis (Stream Processor) and the View (CQRS).

## 2. Requirements (EARS Notation)

### 2.1 Ledger (Wallet Module)
- **Ubiquitous:** The system shall maintain an append-only event store for wallet transactions (Event Sourcing).
- **Event-driven:** When a user requests a transfer, the system shall create a transaction with status `PENDING` and publish a `TransactionRequestedEvent`.
- **Event-driven:** When a `TransactionRiskApprovedEvent` is received, the system shall calculate the new balance, append debit/credit records, and update the transaction status to `COMPLETED`.
- **Event-driven:** When a `TransactionRiskDeniedEvent` is received, the system shall update the transaction status to `FAILED`.
- **Unwanted behavior:** If a wallet has insufficient funds, then the system shall synchronously reject the transfer request before publishing any events.

### 2.2 Fraud / Risk Module
- **Event-driven:** When a `TransactionRequestedEvent` is received, the system shall evaluate the risk rules.
- **Unwanted behavior:** If a transaction exceeds the predefined risk limit (e.g., > 10,000), then the system shall publish a `TransactionRiskDeniedEvent`.
- **Event-driven:** When a transaction passes all risk rules, the system shall publish a `TransactionRiskApprovedEvent`.

### 2.3 Notifications & Analytics (CQRS)
- **Event-driven:** When a transaction is `COMPLETED`, the system shall update the read-optimized projection (Statement view) for both sender and receiver.
- **Event-driven:** When a transaction is `COMPLETED` or `FAILED`, the system shall emit a WebSocket notification to the initiating user.

## 3. Acceptance Criteria
- [ ] Users can request a transfer and receive a `202 Accepted` response immediately (Asynchronous processing).
- [ ] Valid transactions result in accurate balance updates using Event Sourcing logic.
- [ ] Transactions exceeding risk limits are blocked and do not affect the wallet balances.
- [ ] The read-model (CQRS) is updated eventually and reflects the exact state of the event store.
- [ ] 100% test coverage for the Domain logic (Wallet, Rules) without database dependencies.

