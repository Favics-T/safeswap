'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Settings, Users, AlertCircle, Hammer } from 'lucide-react';
import { useOrders } from '@/context/OrdersContext';

export interface SidebarProps {
  className?: string;
}

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Production Queue', href: '/dashboard/production-queue', icon: Hammer },
  { label: 'Buyers', href: '/dashboard/buyers', icon: Users },
  { label: 'Disputes', href: '/dashboard/disputes', icon: AlertCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();

  // activeDisputeCount is safe to call here since Sidebar is always rendered
  // inside the OrdersProvider (via DashboardLayout)
  let activeDisputeCount = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useOrders();
    activeDisputeCount = ctx.activeDisputeCount;
  } catch {
    // Outside provider — silently ignore
  }

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className={cn('flex flex-col w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)]', className)}>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);
            const isDisputes = link.label === 'Disputes';

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="flex items-center">
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {link.label}
                </span>
                {isDisputes && activeDisputeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none flex-shrink-0">
                    {activeDisputeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};