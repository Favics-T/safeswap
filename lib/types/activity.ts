export interface ActivityEvent {
  id: string;
  type: 'payment' | 'dispute' | 'completion' | 'inquiry' | 'draft';
  description: string;
  timestamp: string; // ISO string
  orderId?: string;
}
