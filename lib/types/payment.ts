export interface Payment {
  id: string;
  amount: number;
  type: 'deposit' | 'balance' | 'overpayment' | 'refund' | 'credit';
  nombaTransactionId: string;
  timestamp: string;
}
