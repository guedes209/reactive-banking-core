import { describe, it, expect } from 'vitest';
import { RiskRules } from './risk.rules.js';
import { Transaction, TransactionStatus, TransactionType } from './transaction.value-object.js';

describe('Risk Rules', () => {
  it('should deny transaction if amount exceeds max limit', () => {
    const tx = new Transaction('t1', 'w1', 15000, TransactionType.DEBIT, TransactionStatus.PENDING);
    expect(RiskRules.isTransactionSafe(tx)).toBe(false);
  });

  it('should approve transaction if amount is within limits', () => {
    const tx = new Transaction('t2', 'w1', 5000, TransactionType.DEBIT, TransactionStatus.PENDING);
    expect(RiskRules.isTransactionSafe(tx)).toBe(true);
  });
});
