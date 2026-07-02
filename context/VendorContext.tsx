'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vendor, NotificationPrefs } from '@/lib/types/vendor';

const mockVendor: Vendor = {
  id: 'vendor_1',
  name: 'Adaeze Okonkwo',
  businessName: 'Adaeze Creations',
  email: 'adaeze@creations.ng',
  phone: '08123456789',
  logoUrl: undefined,
  defaultDepositThresholdPct: 50,
  allowFullUpfrontPayment: true,
  nombaSubaccountId: 'a13e4-8c4f-ff7fd18e463a',
  webhookStatus: 'active',
  lastWebhookReceivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  notificationPrefs: {
    emailOnPayment: true,
    emailOnDispute: true,
    smsOnUrgentDispute: false,
    weeklyDigest: true,
  },
};

interface VendorContextType {
  vendor: Vendor;
  updateVendorProfile: (updates: Partial<Vendor>) => void;
  updateNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendor, setVendor] = useState<Vendor>(mockVendor);

  const updateVendorProfile = (updates: Partial<Vendor>) => {
    setVendor((prev) => ({ ...prev, ...updates }));
  };

  const updateNotificationPref = (key: keyof NotificationPrefs, value: boolean) => {
    setVendor((prev) => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, [key]: value },
    }));
  };

  return (
    <VendorContext.Provider value={{ vendor, updateVendorProfile, updateNotificationPref }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const ctx = useContext(VendorContext);
  if (!ctx) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return ctx;
};