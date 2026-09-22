import { Transaction, TransactionStatus, TransactionType } from './transaction.value-object.js';

export class Wallet {
  private transactions: Transaction[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}

  // Hydrate the entity from a stream of past events
  loadHistory(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  // Calculate balance on the fly (Event Sourcing)
  getBalance(): number {
    return this.transactions
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((acc, current) => {
        if (current.type === TransactionType.CREDIT) return acc + current.amount;
        if (current.type === TransactionType.DEBIT) return acc - current.amount;
        return acc;
      }, 0);
  }

  // Domain rule
  canWithdraw(amount: number): boolean {
    return this.getBalance() >= amount;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }
}
