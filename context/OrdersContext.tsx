'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, OrderStatus } from '@/lib/types/order';
import { ActivityEvent } from '@/lib/types/activity';
import { Vendor } from '@/lib/types/vendor';
import { Payment } from '@/lib/types/payment';
import { Dispute, DisputeMessage } from '@/lib/types/dispute';
import { mockOrders, mockActivity, mockVendor, mockDisputes } from '@/lib/mock-data';

export type NewOrderPayload = Omit<Order, 'id' | 'createdAt' | 'virtualAccountNumber' | 'virtualBankName' | 'amountPaid' | 'status' | 'payments' | 'overpaymentAmount' | 'creditNote'>;

interface OrdersContextType {
  orders: Order[];
  activity: ActivityEvent[];
  vendor: Vendor;
  disputes: Dispute[];
  activeDisputeCount: number;
  /** @alias activeDisputeCount — kept for backward compatibility */
  disputeCount: number;
  addOrder: (order: NewOrderPayload) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  recordPayment: (id: string, amount: number) => void;
  resolveOverpayment: (id: string, action: 'refund' | 'credit') => void;
  addDispatchProof: (id: string, url: string, note?: string) => void;
  confirmDelivery: (id: string) => void;
  raiseDispute: (orderId: string, buyerReason: string) => void;
  addDisputeMessage: (disputeId: string, sender: 'buyer' | 'vendor', text: string) => void;
  resolveDispute: (disputeId: string, decision: 'resolved_vendor' | 'resolved_buyer', adminNotes: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activity, setActivity] = useState<ActivityEvent[]>(mockActivity);
  const [vendor] = useState<Vendor>(mockVendor);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);

  const activeDisputeCount = disputes.filter(d => d.adminDecision === 'pending').length;

  const logActivity = (type: ActivityEvent['type'], description: string, orderId?: string) => {
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
        payments: [newPayment, ...(o.payments || [])],
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
      return { ...o, dispatchProofUrl: url, dispatchNote: note, dispatchUploadedAt: new Date().toISOString() };
    }));
    logActivity('completion', `Dispatch proof uploaded for Order #${id}`, id);
  };

  const confirmDelivery = (id: string) => {
    updateOrderStatus(id, 'completed');
  };

  // ── Dispute functions ──────────────────────────────────────────────────────

  const raiseDispute = (orderId: string, buyerReason: string) => {
    const newDispute: Dispute = {
      id: `D-${orderId}`,
      orderId,
      raisedBy: 'buyer',
      buyerReason,
      tier: 'negotiation',
      adminDecision: 'pending',
      autoReleaseAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setDisputes(prev => [newDispute, ...prev]);
    updateOrderStatus(orderId, 'disputed');
    logActivity('dispute', `Dispute raised on Order #${orderId}`, orderId);
  };

  const addDisputeMessage = (disputeId: string, sender: 'buyer' | 'vendor', text: string) => {
    const newMsg: DisputeMessage = {
      id: `m-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };
    setDisputes(prev => prev.map(d =>
      d.id === disputeId ? { ...d, messages: [...d.messages, newMsg] } : d
    ));
  };

  const resolveDispute = (disputeId: string, decision: 'resolved_vendor' | 'resolved_buyer', adminNotes: string) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;

    setDisputes(prev => prev.map(d =>
      d.id === disputeId
        ? { ...d, adminDecision: decision, adminNotes, resolvedAt: new Date().toISOString() }
        : d
    ));

    if (decision === 'resolved_vendor') {
      // Release funds — mark order completed
      updateOrderStatus(dispute.orderId, 'completed');
      logActivity('completion', `Dispute D-${dispute.orderId} resolved in vendor's favor — funds released`, dispute.orderId);
    } else {
      // Refund buyer — mark order cancelled and add refund payment entry
      const order = orders.find(o => o.id === dispute.orderId);
      if (order) {
        const refundPayment: Payment = {
          id: `p-${Date.now()}`,
          amount: order.amountPaid,
          type: 'refund',
          nombaTransactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        };
        setOrders(prev => prev.map(o =>
          o.id === dispute.orderId
            ? { ...o, status: 'cancelled', payments: [refundPayment, ...(o.payments || [])] }
            : o
        ));
      }
      logActivity('dispute', `Dispute D-${dispute.orderId} resolved in buyer's favor — refund initiated`, dispute.orderId);
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders, activity, vendor, disputes, activeDisputeCount,
      disputeCount: activeDisputeCount,
      addOrder, updateOrderStatus, recordPayment, resolveOverpayment, addDispatchProof, confirmDelivery,
      raiseDispute, addDisputeMessage, resolveDispute,
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
