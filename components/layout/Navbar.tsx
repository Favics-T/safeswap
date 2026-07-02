'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui';

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-blue-600">SafeSwap</span>
          </div>

          <div className="flex items-center">
            <div className="ml-3 relative flex items-center gap-3 cursor-pointer">
              <Avatar name="Adaeze" size="sm" />
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-gray-900">Adaeze Creations</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};