import { Payment } from './payment';

export type OrderStatus = 
  | 'awaiting_payment' 
  | 'deposit_paid' 
  | 'fully_paid' 
  | 'in_production' 
  | 'shipped' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

export interface Order {
  id: string;
  itemName: string;
  itemDescription: string;
  buyerName: string;
  buyerPhone: string;
  totalPrice: number;
  depositThresholdPct: number;
  paymentType: 'full_upfront' | 'deposit_balance';
  amountPaid: number;
  virtualAccountNumber: string;
  virtualBankName: string;
  status: OrderStatus;
  dispatchProofUrl?: string;
  dispatchNote?: string;
  dispatchUploadedAt?: string;
  createdAt: string;
  payments: Payment[];
  overpaymentAmount?: number;
  creditNote?: string;
}
