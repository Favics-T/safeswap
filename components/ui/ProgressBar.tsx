import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0-100
  color?: 'blue' | 'green' | 'amber';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar = ({ value, color = 'blue', showLabel = false, label, className }: ProgressBarProps) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
  };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          {label && <span className="text-gray-700">{label}</span>}
          {showLabel && <span className="text-gray-600">{safeValue}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-2 rounded-full transition-all duration-300 ease-in-out', colors[color])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};
