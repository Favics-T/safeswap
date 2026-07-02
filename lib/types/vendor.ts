export interface NotificationPrefs {
  emailOnPayment: boolean;
  emailOnDispute: boolean;
  smsOnUrgentDispute: boolean;
  weeklyDigest: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  logoUrl?: string;
  defaultDepositThresholdPct: number;
  allowFullUpfrontPayment: boolean;
  nombaSubaccountId: string;
  webhookStatus: 'active' | 'inactive';
  lastWebhookReceivedAt?: string;
  notificationPrefs: NotificationPrefs;
}