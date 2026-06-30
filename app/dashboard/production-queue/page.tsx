'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers,
  Clock,
  DollarSign,
  CheckCheck,
  MessageCircle,
  Check,
  PackageOpen,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { Card, Button, Badge, ProgressBar, Avatar } from '@/components/ui';
import { useOrders } from '@/context/OrdersContext';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/types/order';

export default function ProductionQueuePage() {
  const { orders, updateOrderStatus } = useOrders();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  // --- Derived data ---
  const readyOrders = useMemo<Order[]>(() => {
    return orders.filter((o) => {
      if (['in_production', 'shipped', 'completed', 'cancelled'].includes(o.status)) return false;
      if (o.status === 'fully_paid') return true;
      if (o.status === 'deposit_paid') {
        const threshold = (o.totalPrice * o.depositThresholdPct) / 100;
        return o.amountPaid >= threshold;
      }
      return false;
    });
  }, [orders]);

  const awaitingDepositOrders = useMemo<Order[]>(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      if (o.paymentType !== 'deposit_balance') return false;
      if (o.status !== 'awaiting_payment') return false;
      const threshold = (o.totalPrice * o.depositThresholdPct) / 100;
      return o.amountPaid < threshold;
    });
  }, [orders]);

  const readyValue = useMemo(
    () => readyOrders.reduce((acc, o) => acc + o.totalPrice, 0),
    [readyOrders]
  );

  // --- Checkbox logic ---
  const allSelected = readyOrders.length > 0 && selectedIds.length === readyOrders.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : readyOrders.map((o) => o.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- Bulk action ---
  const handleBulkMarkInProduction = useCallback(() => {
    selectedIds.forEach((id) => updateOrderStatus(id, 'in_production'));
    setSelectedIds([]);
    setBulkSuccess(true);
    setTimeout(() => setBulkSuccess(false), 1500);
  }, [selectedIds, updateOrderStatus]);

  // --- Individual action ---
  const handleMarkInProduction = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateOrderStatus(id, 'in_production');
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  // --- WhatsApp reminder ---
  const handleSendReminder = (order: Order, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const threshold = (order.totalPrice * order.depositThresholdPct) / 100;
    const amountNeeded = threshold - order.amountPaid;
    const message = `Hi ${order.buyerName}, friendly reminder that your deposit of ${formatCurrency(amountNeeded)} is still needed to start production on your order for "${order.itemName}". Please pay to: ${order.virtualAccountNumber} (${order.virtualBankName}).`;
    window.open(
      `https://wa.me/${order.buyerPhone.replace(/^\+/, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const statCards = [
    {
      label: 'Ready to Produce',
      value: readyOrders.length,
      icon: <CheckCheck className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-50',
      valueColor: 'text-green-700',
      accent: 'border-l-4 border-green-500',
    },
    {
      label: 'Awaiting Deposit',
      value: awaitingDepositOrders.length,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-700',
      accent: 'border-l-4 border-amber-500',
    },
    {
      label: 'Est. Production Value',
      value: formatCurrency(readyValue),
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-700',
      accent: 'border-l-4 border-blue-500',
    },
  ];

  return (
    <main className="flex-1 w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 text-left">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              Production Queue
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage orders that are cleared for production and track pending deposits.
            </p>
          </div>

          {/* Bulk Action Button */}
          <Button
            variant="primary"
            disabled={selectedIds.length === 0}
            onClick={handleBulkMarkInProduction}
            icon={bulkSuccess ? <Check className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
            className={bulkSuccess ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
          >
            {bulkSuccess
              ? '✓ Updated'
              : selectedIds.length > 0
              ? `Mark ${selectedIds.length} as In Production`
              : 'Mark as In Production'}
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className={`flex items-center gap-4 ${card.accent}`} padding="md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── READY TO PRODUCE SECTION ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Ready to Produce</h2>
              {readyOrders.length > 0 && (
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                  {readyOrders.length}
                </span>
              )}
            </div>

            {/* Select All */}
            {readyOrders.length > 0 && (
              <label
                className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Select All
              </label>
            )}
          </div>

          {readyOrders.length === 0 ? (
            <Card className="py-14 flex flex-col items-center justify-center text-center border-dashed">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No orders ready yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Orders will appear here once they're fully paid or their deposit threshold is met.
              </p>
              <Link href="/dashboard/orders" className="mt-4">
                <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  View Orders
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {readyOrders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                const depositThreshold = (order.totalPrice * order.depositThresholdPct) / 100;
                const paidPct = order.totalPrice > 0 ? Math.round((order.amountPaid / depositThreshold) * 100) : 0;

                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block group">
                    <Card
                      padding="none"
                      className={`p-5 hover:shadow-md transition-all cursor-pointer border-2 ${
                        isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {/* Card top row: checkbox + badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(order.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {order.itemName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">#{order.id}</p>
                          </div>
                        </div>
                        {/* Green "Ready" pill — composed without modifying OrderStatus */}
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ml-2">
                          Ready
                        </span>
                      </div>

                      {/* Buyer */}
                      <div className="flex items-center gap-2 mb-4 ml-7">
                        <Avatar name={order.buyerName} size="sm" />
                        <span className="text-sm font-medium text-gray-700">{order.buyerName}</span>
                      </div>

                      {/* Payment line */}
                      <div className="ml-7 mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>
                            <span className="font-semibold text-gray-900">{formatCurrency(order.amountPaid)}</span>
                            {' '}of {formatCurrency(order.totalPrice)}
                          </span>
                          <span className="font-semibold text-green-600">{Math.min(paidPct, 100)}% threshold met</span>
                        </div>
                        <ProgressBar
                          value={Math.min((order.amountPaid / order.totalPrice) * 100, 100)}
                          color="green"
                        />
                      </div>

                      {/* Action button */}
                      <div className="mt-4 ml-7">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleMarkInProduction(order.id, e)}
                          icon={<CheckCheck className="w-3.5 h-3.5" />}
                        >
                          Mark as In Production
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── AWAITING DEPOSIT SECTION ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Awaiting Deposit</h2>
            {awaitingDepositOrders.length > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                {awaitingDepositOrders.length}
              </span>
            )}
          </div>

          {awaitingDepositOrders.length === 0 ? (
            <Card className="py-14 flex flex-col items-center justify-center text-center border-dashed">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No orders waiting on deposit</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                All deposit-based orders have either cleared their threshold or been completed.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {awaitingDepositOrders.map((order) => {
                const threshold = (order.totalPrice * order.depositThresholdPct) / 100;
                const amountNeeded = Math.max(0, threshold - order.amountPaid);
                const progressPct = threshold > 0 ? (order.amountPaid / threshold) * 100 : 0;

                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block group">
                    <Card
                      padding="none"
                      className="p-5 hover:shadow-md transition-all cursor-pointer border-2 border-gray-100 hover:border-amber-200"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {order.itemName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">#{order.id}</p>
                        </div>
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ml-2">
                          Awaiting Deposit
                        </span>
                      </div>

                      {/* Buyer */}
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar name={order.buyerName} size="sm" />
                        <span className="text-sm font-medium text-gray-700">{order.buyerName}</span>
                      </div>

                      {/* Threshold info */}
                      <div className="bg-amber-50 rounded-lg p-3 mb-3 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Threshold</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(threshold)}{' '}
                            <span className="text-gray-400 font-normal">({order.depositThresholdPct}%)</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Still needed</span>
                          <span className="font-bold text-amber-700">{formatCurrency(amountNeeded)}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>{formatCurrency(order.amountPaid)} paid</span>
                          <span>{Math.round(progressPct)}% of deposit</span>
                        </div>
                        <ProgressBar value={progressPct} color="amber" />
                      </div>

                      {/* Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSendReminder(order, e)}
                        icon={<MessageCircle className="w-3.5 h-3.5 text-green-600" />}
                      >
                        Send Reminder
                      </Button>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
