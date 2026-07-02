'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsTabsSidebar, SettingsTab } from '@/components/settings/SettingSidebar'
import { BusinessProfileTab } from '@/components/settings/BusinessProfileTab';
import { PaymentSettingsTab } from '@/components/settings/PaymentSettingTab'
import { NombaConnectionTab } from '@/components/settings/NombaConnectionTab';
import { NotificationsTab } from '@/components/settings/NotificationTab'
import { VendorProvider } from '@/context/VendorContext';

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <PageHeader
          title="Settings"
          subtitle="Manage your business profile and platform preferences"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <SettingsTabsSidebar activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="md:col-span-3">
            {activeTab === 'profile' && <BusinessProfileTab />}
            {activeTab === 'payment' && <PaymentSettingsTab />}
            {activeTab === 'nomba' && <NombaConnectionTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <VendorProvider>
      <SettingsContent />
    </VendorProvider>
  );
}