'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, CreditCard, Link2, Bell } from 'lucide-react';

export type SettingsTab = 'profile' | 'payment' | 'nomba' | 'notifications';

interface SettingsTabsSidebarProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const tabs: { value: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { value: 'profile', label: 'Business Profile', icon: Building2 },
  { value: 'payment', label: 'Payment Settings', icon: CreditCard },
  { value: 'nomba', label: 'Nomba Connection', icon: Link2 },
  { value: 'notifications', label: 'Notifications', icon: Bell },
];

export const SettingsTabsSidebar = ({ activeTab, onChange }: SettingsTabsSidebarProps) => {
  return (
    <nav className="flex flex-col gap-1 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors border-l-2',
              isActive
                ? 'bg-blue-50 text-blue-700 border-blue-600'
                : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-blue-700' : 'text-gray-400')} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};