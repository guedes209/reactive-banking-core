import { Transaction } from './transaction.value-object.js';

export class RiskRules {
  private static readonly MAX_TRANSACTION_AMOUNT = 10000;

  static isTransactionSafe(transaction: Transaction): boolean {
    if (transaction.amount > this.MAX_TRANSACTION_AMOUNT) {
      return false;
    }
    // Add more pure business rules here if needed, like daily limits
    return true;
  }
}
