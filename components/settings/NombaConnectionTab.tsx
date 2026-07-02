'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { formatRelativeTime } from '@/lib/format';

export const NombaConnectionTab = () => {
  const { vendor, updateVendorProfile } = useVendor();
  const [isTesting, setIsTesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTestWebhook = () => {
    setIsTesting(true);
    setShowSuccess(false);
    // Placeholder simulation — replace with a real call to the backend
    // dev's webhook test endpoint (e.g. POST /api/webhook/nomba/test)
    // once that route exists.
    setTimeout(() => {
      updateVendorProfile({ lastWebhookReceivedAt: new Date().toISOString() });
      setIsTesting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const isActive = vendor.webhookStatus === 'active';

  return (
    <div className="space-y-6">
      <Card>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Nomba Account</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Sub-account ID</p>
            <p className="font-mono text-sm text-gray-800">{vendor.nombaSubaccountId}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Webhook Status</p>
              <p className="text-sm text-gray-500">
                {isActive
                  ? `Active — last received payment ${formatRelativeTime(vendor.lastWebhookReceivedAt)}`
                  : 'Inactive — no webhook received yet'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" isLoading={isTesting} onClick={handleTestWebhook}>
            Test Webhook Connection
          </Button>
        </div>
        {showSuccess && (
          <div className="mt-4 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Test webhook received successfully
          </div>
        )}
      </Card>
    </div>
  );
};