'use client';

import React from 'react';
import { Card, Toggle } from '@/components/ui';
import { useVendor } from '@/context/VendorContext';

export const NotificationsTab = () => {
  const { vendor, updateNotificationPref } = useVendor();
  const { notificationPrefs } = vendor;

  return (
    <Card className="space-y-6">
      <Toggle
        checked={notificationPrefs.emailOnPayment}
        onChange={(checked) => updateNotificationPref('emailOnPayment', checked)}
        label="Email me when a payment is received"
        description="Get notified the moment a buyer pays into escrow."
      />
      <Toggle
        checked={notificationPrefs.emailOnDispute}
        onChange={(checked) => updateNotificationPref('emailOnDispute', checked)}
        label="Email me when a dispute is raised"
        description="Stay on top of disputes before the auto-resolve timer runs out."
      />
      <Toggle
        checked={notificationPrefs.smsOnUrgentDispute}
        onChange={(checked) => updateNotificationPref('smsOnUrgentDispute', checked)}
        label="SMS alerts for urgent disputes"
        description="Receive a text message for disputes nearing auto-resolution."
      />
      <Toggle
        checked={notificationPrefs.weeklyDigest}
        onChange={(checked) => updateNotificationPref('weeklyDigest', checked)}
        label="Weekly summary report"
        description="A digest of orders, payments, and disputes every week."
      />
    </Card>
  );
};