import React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  label: string;
  value: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => {
  return (
    <div className={cn("border-b border-gray-200 w-full text-left", className)}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span 
                  className={cn(
                    "ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium",
                    isActive 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
