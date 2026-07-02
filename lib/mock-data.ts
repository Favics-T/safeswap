import { Order } from './types/order';
import { ActivityEvent } from './types/activity';
import { Vendor } from './types/vendor';
import { Dispute } from './types/dispute';

export const mockVendor: Vendor = {
  id: 'v-001',
  ownerName: 'Adaeze',
  businessName: 'Adaeze Creations',
  email: 'adaeze@example.com',
  phone: '08012345678',
  defaultDepositThresholdPct: 50,
  allowFullUpfrontPayment: true,
  nombaSubaccountId: 'a13e4-8c4f-ff7fd18e463a',
  webhookStatus: 'active',
  notificationPrefs: {
    emailOnPayment: true,
    emailOnDispute: true,
    smsOnUrgentDispute: false,
    weeklyDigest: true,
  },
};

export const mockOrders: Order[] = [
  {
    id: '1042',
    itemName: 'Bulk Ankara Fabric',
    itemDescription: '50 yards of Ankara fabric',
    buyerName: 'Adaeze T.',
    buyerPhone: '08087654321',
    totalPrice: 50000,
    depositThresholdPct: 30,
    paymentType: 'deposit_balance',
    amountPaid: 15000,
    virtualAccountNumber: '1234567890',
    virtualBankName: 'Nomba',
    status: 'deposit_paid',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    payments: [],
  },
  {
    id: '1039',
    itemName: 'Custom Furniture Set',
    itemDescription: 'Living room set',
    buyerName: 'Emeka U.',
    buyerPhone: '08123456789',
    totalPrice: 450000,
    depositThresholdPct: 100,
    paymentType: 'full_upfront',
    amountPaid: 450000,
    virtualAccountNumber: '0987654321',
    virtualBankName: 'Nomba',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    payments: [],
  },
  {
    id: '1055',
    itemName: 'Premium Leather Satchel',
    itemDescription: 'Handcrafted leather bag',
    buyerName: 'Chidi Adebayo',
    buyerPhone: '08031122334',
    totalPrice: 85000,
    depositThresholdPct: 50,
    paymentType: 'deposit_balance',
    amountPaid: 85000,
    virtualAccountNumber: '1122334455',
    virtualBankName: 'Nomba',
    status: 'disputed',
    dispatchProofUrl: '',
    dispatchNote: 'Shipped via GIG Logistics. Tracking number: GIG-99021-H. Should arrive within 48 hours.',
    dispatchUploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    payments: [],
  },
  {
    id: '1061',
    itemName: 'Ergonomic Office Chair',
    itemDescription: 'High-back mesh chair',
    buyerName: 'Fatima Musa',
    buyerPhone: '08055667788',
    totalPrice: 120000,
    depositThresholdPct: 50,
    paymentType: 'deposit_balance',
    amountPaid: 120000,
    virtualAccountNumber: '2233445566',
    virtualBankName: 'Nomba',
    status: 'disputed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    payments: [],
  },
];

// Mock disputes — tied to orders 1055 and 1061
export const mockDisputes: Dispute[] = [
  {
    id: 'D-1055',
    orderId: '1055',
    raisedBy: 'buyer',
    buyerReason: 'I have not received the package after 7 days. The tracking number provided shows no movement. I believe the vendor did not actually ship the item and wants to keep my money.',
    vendorResponse: 'I have shipped the item as agreed. The tracking number GIG-99021-H shows it was dispatched. There are delays with the courier.',
    tier: 'negotiation',
    adminDecision: 'pending',
    autoReleaseAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18h from now
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'buyer',
        text: 'I have not received the package after 7 days. Please explain.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
      },
      {
        id: 'm2',
        sender: 'vendor',
        text: 'Hello! The item was shipped on Monday. Here is the tracking number again: GIG-99021-H. Please check with GIG Logistics directly.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      },
      {
        id: 'm3',
        sender: 'buyer',
        text: 'I checked with GIG and they have no record of that tracking number. Something is wrong.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'D-1061',
    orderId: '1061',
    raisedBy: 'buyer',
    buyerReason: 'The chair arrived with a broken armrest and a torn mesh backrest. This is not the quality I paid ₦120,000 for. I want a full refund or a replacement.',
    tier: 'admin_review',
    adminDecision: 'pending',
    autoReleaseAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6h from now (urgent)
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    messages: [
      {
        id: 'm4',
        sender: 'buyer',
        text: 'The chair arrived damaged. Broken armrest and torn mesh. This is unacceptable.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 41).toISOString(),
      },
    ],
  },
];

export const mockActivity: ActivityEvent[] = [
  {
    id: 'a1',
    type: 'payment',
    description: 'Adaeze T. paid ₦15,000 deposit for Order #1042',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    orderId: '1042',
  },
  {
    id: 'a2',
    type: 'dispute',
    description: 'Dispute raised on Order #1055 — Premium Leather Satchel',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    orderId: '1055',
  },
  {
    id: 'a3',
    type: 'dispute',
    description: 'Dispute raised on Order #1061 — Ergonomic Office Chair',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    orderId: '1061',
  },
  {
    id: 'a4',
    type: 'completion',
    description: 'Order #1039 completed and funds marked for release',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    orderId: '1039',
  },
  {
    id: 'a5',
    type: 'payment',
    description: 'Payout of ₦450,000 initiated to bank account',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];
