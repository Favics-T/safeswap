import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  activeRoute: string;
}

export const Navbar = ({ activeRoute }: NavbarProps) => {
  const links = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Orders', href: '/orders' },
    { label: 'Production Queue', href: '/production' },
    { label: 'Buyers', href: '/buyers' },
    { label: 'Disputes', href: '/disputes' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">SafeSwap</span>
            </div>
            <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    activeRoute === link.label
                      ? "border-blue-600 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side Profile */}
          <div className="flex items-center">
            <div className="ml-3 relative flex items-center gap-3 cursor-pointer">
              <Avatar name="Business Name" size="sm" />
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-gray-900">Business Name</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
