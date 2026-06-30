import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Settings, Users, AlertCircle, Hammer } from 'lucide-react';

export interface SidebarProps {
  activeRoute: string;
  className?: string;
}

export const Sidebar = ({ activeRoute, className }: SidebarProps) => {
  const links = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Production Queue', href: '/production', icon: Hammer },
    { label: 'Buyers', href: '/buyers', icon: Users },
    { label: 'Disputes', href: '/disputes', icon: AlertCircle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col w-64 border-r border-gray-200 bg-white h-screen", className)}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
        <span className="text-xl font-bold text-blue-600">SafeSwap</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeRoute === link.label;
            
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon 
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                  )} 
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
