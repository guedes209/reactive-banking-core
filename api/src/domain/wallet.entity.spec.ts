import { describe, it, expect, beforeEach } from 'vitest';
import { Wallet } from './wallet.entity.js';
import { Transaction, TransactionStatus, TransactionType } from './transaction.value-object.js';

describe('Wallet Entity', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet('wallet-1', 'user-1');
  });

  it('should calculate balance correctly from completed transactions', () => {
    const history = [
      new Transaction('t1', 'wallet-1', 100, TransactionType.CREDIT, TransactionStatus.COMPLETED),
      new Transaction('t2', 'wallet-1', 30, TransactionType.DEBIT, TransactionStatus.COMPLETED),
      new Transaction('t3', 'wallet-1', 50, TransactionType.CREDIT, TransactionStatus.PENDING), // Pending should be ignored
      new Transaction('t4', 'wallet-1', 20, TransactionType.DEBIT, TransactionStatus.FAILED)    // Failed should be ignored
    ];

    wallet.loadHistory(history);
    expect(wallet.getBalance()).toBe(70);
  });

  it('should not allow withdrawal if balance is insufficient', () => {
    const history = [
      new Transaction('t1', 'wallet-1', 100, TransactionType.CREDIT, TransactionStatus.COMPLETED)
    ];
    wallet.loadHistory(history);
    
    expect(wallet.canWithdraw(150)).toBe(false);
    expect(wallet.canWithdraw(50)).toBe(true);
  });

  it('should throw an error if transaction amount is negative', () => {
    expect(() => {
      new Transaction('t1', 'w1', -50, TransactionType.CREDIT, TransactionStatus.COMPLETED);
    }).toThrow('Transaction amount must be greater than zero');
  });
});
