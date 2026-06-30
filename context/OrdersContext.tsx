'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, OrderStatus } from '@/lib/types/order';
import { ActivityEvent } from '@/lib/types/activity';
import { Vendor } from '@/lib/types/vendor';
import { Payment } from '@/lib/types/payment';
import { mockOrders, mockActivity, mockVendor } from '@/lib/mock-data';

export type NewOrderPayload = Omit<Order, 'id' | 'createdAt' | 'virtualAccountNumber' | 'virtualBankName' | 'amountPaid' | 'status' | 'payments' | 'overpaymentAmount' | 'creditNote'>;

interface OrdersContextType {
  orders: Order[];
  activity: ActivityEvent[];
  vendor: Vendor;
  disputeCount: number;
  addOrder: (order: NewOrderPayload) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  recordPayment: (id: string, amount: number) => void;
  resolveOverpayment: (id: string, action: 'refund' | 'credit') => void;
  addDispatchProof: (id: string, url: string, note?: string) => void;
  confirmDelivery: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activity, setActivity] = useState<ActivityEvent[]>(mockActivity);
  const [vendor] = useState<Vendor>(mockVendor);

  const disputeCount = activity.filter(a => a.type === 'dispute').length;

  const logActivity = (type: ActivityEvent['type'], description: string, orderId: string) => {
    const newActivity: ActivityEvent = {
      id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      description,
      timestamp: new Date().toISOString(),
      orderId,
    };
    setActivity((prev) => [newActivity, ...prev]);
  };

  const addOrder = (payload: NewOrderPayload) => {
    const newOrder: Order = {
      ...payload,
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'awaiting_payment',
      amountPaid: 0,
      virtualAccountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      virtualBankName: 'Nomba',
      createdAt: new Date().toISOString(),
      payments: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    logActivity('draft', `Order #${newOrder.id} draft created by System`, newOrder.id);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    logActivity('completion', `Order #${id} status updated to ${status}`, id);
  };

  const recordPayment = (id: string, amount: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      
      const newAmountPaid = o.amountPaid + amount;
      const thresholdAmount = o.paymentType === 'deposit_balance' ? (o.totalPrice * o.depositThresholdPct) / 100 : o.totalPrice;
      
      let newStatus = o.status;
      if (newAmountPaid >= o.totalPrice) {
        newStatus = 'fully_paid';
      } else if (newAmountPaid >= thresholdAmount && o.status === 'awaiting_payment') {
        newStatus = 'deposit_paid';
      }

      let type: Payment['type'] = 'deposit';
      if (newAmountPaid >= o.totalPrice && o.amountPaid > 0) type = 'balance';
      if (newAmountPaid > o.totalPrice) type = 'overpayment';

      const overpaymentAmount = Math.max(0, newAmountPaid - o.totalPrice);

      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        amount,
        type,
        nombaTransactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
      };

      logActivity('payment', `Payment of ₦${amount.toLocaleString()} received for Order #${id}`, id);

      return {
        ...o,
        amountPaid: newAmountPaid,
        status: newStatus,
        payments: [newPayment, ...(o.payments || [])], // Put new payments at start
        overpaymentAmount,
      };
    }));
  };

  const resolveOverpayment = (id: string, action: 'refund' | 'credit') => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id || !o.overpaymentAmount) return o;
      
      const surplus = o.overpaymentAmount;
      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        amount: surplus,
        type: action === 'refund' ? 'refund' : 'credit',
        nombaTransactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
      };

      logActivity('payment', `${action === 'refund' ? 'Refunded' : 'Credited'} ₦${surplus.toLocaleString()} overpayment for Order #${id}`, id);

      return {
        ...o,
        overpaymentAmount: 0,
        payments: [newPayment, ...(o.payments || [])],
        creditNote: action === 'credit' ? `₦${surplus.toLocaleString()} credited for future use` : o.creditNote,
      };
    }));
  };

  const addDispatchProof = (id: string, url: string, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      return {
        ...o,
        dispatchProofUrl: url,
        dispatchNote: note,
        dispatchUploadedAt: new Date().toISOString()
      };
    }));
    logActivity('completion', `Dispatch proof uploaded for Order #${id}`, id);
  };

  const confirmDelivery = (id: string) => {
    updateOrderStatus(id, 'completed');
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, activity, vendor, disputeCount, 
      addOrder, updateOrderStatus, recordPayment, resolveOverpayment, addDispatchProof, confirmDelivery 
    }}>
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
