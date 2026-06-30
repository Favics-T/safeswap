'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order } from '@/lib/types/order';
import { ActivityEvent } from '@/lib/types/activity';
import { Vendor } from '@/lib/types/vendor';
import { mockOrders, mockActivity, mockVendor } from '@/lib/mock-data';

export type NewOrderPayload = Omit<Order, 'id' | 'createdAt' | 'virtualAccountNumber' | 'virtualBankName' | 'amountPaid' | 'status'>;

interface OrdersContextType {
  orders: Order[];
  activity: ActivityEvent[];
  vendor: Vendor;
  disputeCount: number;
  addOrder: (order: NewOrderPayload) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activity, setActivity] = useState<ActivityEvent[]>(mockActivity);
  const [vendor] = useState<Vendor>(mockVendor);

  const disputeCount = activity.filter(a => a.type === 'dispute').length;

  const addOrder = (payload: NewOrderPayload) => {
    const newOrder: Order = {
      ...payload,
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'awaiting_payment',
      amountPaid: 0,
      virtualAccountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      virtualBankName: 'Nomba',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    
    // Add activity event for new order
    const newActivity: ActivityEvent = {
      id: `a-${Date.now()}`,
      type: 'draft',
      description: `Order #${newOrder.id} draft created by System`,
      timestamp: new Date().toISOString(),
      orderId: newOrder.id,
    };
    
    setActivity((prev) => [newActivity, ...prev]);
  };

  return (
    <OrdersContext.Provider value={{ orders, activity, vendor, disputeCount, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
