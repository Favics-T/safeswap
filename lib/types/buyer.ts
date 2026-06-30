export type BuyerStatus = 'reliable_payer' | 'partial_payer' | 'has_defaulted';

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: BuyerStatus;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}
