import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export const Toggle = ({ checked, onChange, label, description, className }: ToggleProps) => {
  return (
    <div className={cn("flex items-start", className)}>
      <div className="flex items-center h-5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            checked ? 'bg-blue-600' : 'bg-gray-200'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
      <div className="ml-3 text-sm text-left flex flex-col">
        <span className="font-medium text-gray-900 select-none" onClick={() => onChange(!checked)} style={{ cursor: 'pointer' }}>
          {label}
        </span>
        {description && (
          <span className="text-gray-500">{description}</span>
        )}
      </div>
    </div>
  );
};
