# 🚀 Reactive Banking Core

Um motor de transações financeiras (Core Banking) altamente escalável, focado em alta disponibilidade e performance. Construído com **Node.js, NestJS, Apache Kafka e PostgreSQL**, este projeto implementa um fluxo assíncrono para validação de risco e atualização de saldos, suportando picos massivos de concorrência.

Em testes de estresse locais (`autocannon`), a API sustentou a recepção e enfileiramento de **11.000 requisições em 5 segundos (média de 2.200 req/sec)**, mantendo uma latência média de míseros 4ms.

## 🎯 Arquitetura & Diferenciais

Este projeto não é um simples CRUD. Ele foi desenhado para resolver o problema de gargalo comum em sistemas financeiros tradicionais, aplicando padrões de arquitetura de software avançados:

*   **Clean Architecture & Domain-Driven Design (DDD):** Regras de negócios isoladas no núcleo da aplicação.
*   **Event-Driven Architecture (EDA):** A API REST não espera a validação de risco ou a gravação no banco. Ela apenas publica um evento no Kafka e responde imediatamente (Status 201), garantindo resiliência e baixíssima latência.
*   **CQRS (Command Query Responsibility Segregation):** Separação estrita entre o fluxo de escrita (comandos) e o fluxo de leitura (consultas).
*   **Event Sourcing (Ledger):** O banco não guarda apenas o saldo atual. Ele guarda o histórico imutável de absolutamente todas as transações, recalculando e projetando o saldo para uma tabela de leitura otimizada.
*   **Prisma ORM V8 (Beta):** Utilização da versão mais recente e performática do Prisma, totalmente otimizada nativamente para ESM (ECMAScript Modules) e com Queries atômicas.

---

## 💻 Exemplos de Código que Destacam o Projeto

### 1. Desacoplamento Absoluto (Kafka & NestJS)
Ao invés de injetar serviços de banco de dados diretamente no controller, a intenção do usuário é capturada e imediatamente despachada como um evento de domínio para o cluster Kafka.

```typescript
// api/src/application/transfer.use-case.ts
async execute(fromWallet: string, toWallet: string, amount: number) {
  const transactionId = randomUUID();
  
  // A requisição REST termina AQUI. O Kafka assume daqui pra frente.
  this.kafkaClient.emit('transaction.requested', {
    transactionId,
    fromWallet,
    toWallet,
    amount,
    timestamp: new Date().toISOString()
  });

  return { status: 'PENDING', transactionId };
}
```

### 2. CQRS e Event Sourcing (O Padrão Ledger)
Quando o sistema de Risco aprova a transação, o consumidor do Ledger é acordado para registrar a mutação no banco de dados. Ele escreve na tabela imutável `EventStore` e projeta o saldo consolidado na tabela `Statement`.

```typescript
// api/src/application/ledger.consumer.ts
@EventPattern('transaction.risk.approved')
async handleTransactionApproved(@Payload() message: any) {
  // 1. EVENT SOURCING: Salva o evento imutável de DÉBITO
  await db.orm.public.EventStore.create({
    id: `${transactionId}-debit`,
    walletId: fromWallet,
    amount: amount,
    type: 'DEBIT',
    status: 'COMPLETED'
  });

  // 2. CQRS (READ-MODEL): Atualiza a projeção rápida de Saldo para leituras otimizadas na API
  const fromStmt = await db.orm.public.Statement.where({ walletId: fromWallet }).first();
  if (fromStmt) {
    await db.orm.public.Statement.where({ walletId: fromWallet })
      .update({ balance: fromStmt.balance - amount });
  } else {
    await db.orm.public.Statement.create({ walletId: fromWallet, balance: -amount });
  }
}
```

### 3. Regras de Domínio Puras (DDD)
A validação de limites não depende de banco de dados ou frameworks. É puramente TypeScript (Value Objects e Domain Rules), garantindo testes unitários ultrarrápidos e 100% de cobertura.

```typescript
// api/src/domain/risk.rules.ts
export class RiskRules {
  private static readonly MAX_TRANSACTION_LIMIT = 10000;

  static isTransactionSafe(transaction: Transaction): boolean {
    if (transaction.amount > this.MAX_TRANSACTION_LIMIT) {
      return false; // Bloqueio imediato por regras de compliance
    }
    return true;
  }
}
```

---

## 🚀 Como Rodar Localmente

O projeto exige o **Docker** para orquestrar o PostgreSQL 15 e o Apache Kafka (Confluent KRaft).

1. Suba a infraestrutura de dados:
```bash
docker-compose up -d
```

2. Instale as dependências da API:
```bash
cd api
npm install
```

3. (Opcional) Rode o teste de stress com o `autocannon` já incluso no repositório para ver a arquitetura lidando com picos massivos:
```bash
npx autocannon -c 10 -d 5 -m POST -H "Content-Type: application/json" -i stress.json http://localhost:3000/transfer
```

4. Inicie o servidor:
```bash
npm run start:dev
```

## 🧪 Testes
O projeto conta com uma suíte rigorosa rodando sob o **Vitest**:
*   `npm run test` (Testes Unitários do Domínio e Controllers Isolados)
*   `npm run test:e2e` (Testes ponta-a-ponta testando a conexão real com a rede Kafka e o Postgres)
