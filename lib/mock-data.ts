import { Order } from './types/order';
import { ActivityEvent } from './types/activity';
import { Vendor } from './types/vendor';

export const mockVendor: Vendor = {
  id: 'v-001',
  businessName: 'Vendor Business Name',
  ownerName: 'Adaeze',
  email: 'adaeze@example.com',
  phone: '08012345678',
  address: 'Lagos, Nigeria',
  isVerified: true,
  joinedAt: '2025-01-01T00:00:00Z',
};

export const mockOrders: Order[] = [
  {
    id: '1042',
    itemName: 'Bulk Fabric',
    itemDescription: '50 yards of Ankara fabric',
    buyerName: 'Adaeze T.',
    buyerPhone: '08087654321',
    totalPrice: 50000,
    depositThresholdPct: 30,
    paymentType: 'deposit_balance',
    amountPaid: 15000,
    virtualAccountNumber: '1234567890',
    virtualBankName: 'SafeBank',
    status: 'deposit_paid',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    payments: [],
  },
  {
    id: '1039',
    itemName: 'Custom Furniture',
    itemDescription: 'Living room set',
    buyerName: 'Emeka U.',
    buyerPhone: '08123456789',
    totalPrice: 450000,
    depositThresholdPct: 100,
    paymentType: 'full_upfront',
    amountPaid: 450000,
    virtualAccountNumber: '0987654321',
    virtualBankName: 'SafeBank',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    payments: [],
  },
];

export const mockActivity: ActivityEvent[] = [
  {
    id: 'a1',
    type: 'payment',
    description: 'Adaeze T. paid ₦15,000 deposit for Order #1042',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    orderId: '1042',
  },
  {
    id: 'a2',
    type: 'dispute',
    description: 'Dispute raised by Client #002 regarding shipping delay',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
    orderId: '1040',
  },
  {
    id: 'a3',
    type: 'completion',
    description: 'Order #1039 completed and funds marked for release',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    orderId: '1039',
  },
  {
    id: 'a4',
    type: 'payment',
    description: 'Payout of ₦450,000 initiated to bank account',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'a5',
    type: 'inquiry',
    description: 'New inquiry received from John Okechukwu',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 'a6',
    type: 'draft',
    description: 'Order #1045 draft created by System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    orderId: '1045',
  },
];
