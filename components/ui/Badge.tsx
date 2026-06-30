import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { statusConfig } from '@/lib/constants/statusConfig';

export interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
  children?: ReactNode;
}

export const Badge = ({ status, size = 'md', className, children }: BadgeProps) => {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, ' '),
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    dotClass: 'bg-gray-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium capitalize',
        config.bgClass,
        config.colorClass,
        sizes[size],
        className
      )}
    >
      <span className={cn('mr-1.5 rounded-full', config.dotClass, dotSizes[size])} />
      {children || config.label}
    </span>
  );
};
