import React from 'react';
import { OrdersProvider } from '@/context/OrdersContext';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrdersProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar activeRoute="Dashboard" />
        {children}
      </div>
    </OrdersProvider>
  );
}
