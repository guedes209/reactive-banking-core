export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly status: TransactionStatus,
    public readonly createdAt: Date = new Date()
  ) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be greater than zero');
    }
  }
}

