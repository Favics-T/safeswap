'use client';

import React, { useState } from 'react';
import { Card, Toggle } from '@/components/ui';
import { useVendor } from '@/context/VendorContext';

export const PaymentSettingsTab = () => {
  const { vendor, updateVendorProfile } = useVendor();
  const [localPct, setLocalPct] = useState(vendor.defaultDepositThresholdPct);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPct(Number(e.target.value));
  };

  const handleSliderCommit = () => {
    const clamped = Math.min(Math.max(localPct, 1), 99);
    updateVendorProfile({ defaultDepositThresholdPct: clamped });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900">Default Deposit Threshold</h4>
          <span className="text-sm font-semibold text-blue-600">{localPct}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={99}
          value={localPct}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
        />
        <p className="text-sm text-gray-500 mt-3">
          This is the default deposit % required before an order moves to production.
          You can override this per order.
        </p>
      </Card>

      <Card>
        <Toggle
          checked={vendor.allowFullUpfrontPayment}
          onChange={(checked) => updateVendorProfile({ allowFullUpfrontPayment: checked })}
          label="Allow buyers to pay full amount upfront"
          description="Buyers can skip the deposit and pay the full amount upfront instead."
        />
      </Card>
    </div>
  );
};