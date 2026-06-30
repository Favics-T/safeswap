'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  MessageCircle,
  Users,
  TrendingUp,
  AlertCircle,
  Inbox,
  X,
} from 'lucide-react';
import { Card, Avatar, Badge, Button, ProgressBar } from '@/components/ui';
import { useOrders } from '@/context/OrdersContext';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Order } from '@/lib/types/order';
import { healthConfig, PaymentHealth } from '@/lib/constants/healthConfig';

// ─── Derived buyer shape ────────────────────────────────────────────────────
interface DerivedBuyer {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  lastOrderDate: string;
  paymentHealth: PaymentHealth;
  orders: Order[];
}

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

function derivePaymentHealth(orders: Order[]): PaymentHealth {
  const now = Date.now();

  // Defaulted: any order still awaiting_payment after 5 days
  const hasDefaulted = orders.some(
    (o) =>
      o.status === 'awaiting_payment' &&
      now - new Date(o.createdAt).getTime() > FIVE_DAYS_MS
  );
  if (hasDefaulted) return 'defaulted';

  const outstanding = orders
    .filter((o) => !['completed', 'cancelled'].includes(o.status))
    .reduce((sum, o) => sum + (o.totalPrice - o.amountPaid), 0);

  if (outstanding > 0) return 'partial';
  return 'reliable';
}

// ─── Slide-over panel (built on top of existing Modal primitives) ────────────
interface BuyerPanelProps {
  buyer: DerivedBuyer;
  onClose: () => void;
  onOrderClick: (id: string) => void;
}

function BuyerPanel({ buyer, onClose, onOrderClick }: BuyerPanelProps) {
  const health = healthConfig[buyer.paymentHealth];
  const sortedOrders = [...buyer.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleWhatsApp = () => {
    const msg = `Hi ${buyer.name}, this is a message from SafeSwap regarding your orders.`;
    window.open(
      `https://wa.me/${buyer.phone.replace(/^\+/, '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel — right side */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-4">
            <Avatar name={buyer.name} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{buyer.name}</h2>
              <p className="text-sm text-gray-500">{buyer.phone}</p>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${health.bgClass} ${health.colorClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${health.dotClass}`} />
                {health.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* WhatsApp CTA */}
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            icon={<MessageCircle className="w-4 h-4 text-green-600" />}
            className="w-full"
          >
            Message on WhatsApp
          </Button>

          {/* 4 stat mini-cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm" className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{buyer.totalOrders}</p>
            </Card>
            <Card padding="sm" className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(buyer.totalSpent)}</p>
            </Card>
            <Card padding="sm" className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className={`text-xl font-bold truncate ${buyer.outstandingBalance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                {formatCurrency(buyer.outstandingBalance)}
              </p>
            </Card>
            <Card padding="sm" className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Health</p>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full self-start ${health.bgClass} ${health.colorClass}`}
              >
                {health.label}
              </span>
            </Card>
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Order History
            </h3>
            {sortedOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {sortedOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => onOrderClick(order.id)}
                    className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {order.itemName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">#{order.id}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{formatRelativeTime(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      <Badge status={order.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BuyersPage() {
  const router = useRouter();
  const { orders } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'outstanding'>('recent');
  const [filterPill, setFilterPill] = useState<'all' | 'reliable' | 'outstanding'>('all');
  const [selectedBuyerPhone, setSelectedBuyerPhone] = useState<string | null>(null);

  // 1. Derive buyers from orders grouped by phone
  const allBuyers = useMemo<DerivedBuyer[]>(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      if (!map.has(order.buyerPhone)) map.set(order.buyerPhone, []);
      map.get(order.buyerPhone)!.push(order);
    }

    return Array.from(map.entries()).map(([phone, buyerOrders]) => {
      const name = buyerOrders[0].buyerName;
      const totalSpent = buyerOrders.reduce((s, o) => s + o.amountPaid, 0);
      const outstandingBalance = buyerOrders
        .filter((o) => !['completed', 'cancelled'].includes(o.status))
        .reduce((s, o) => s + Math.max(0, o.totalPrice - o.amountPaid), 0);
      const lastOrderDate = buyerOrders.reduce((latest, o) =>
        o.createdAt > latest ? o.createdAt : latest, buyerOrders[0].createdAt
      );
      const paymentHealth = derivePaymentHealth(buyerOrders);

      return {
        name,
        phone,
        totalOrders: buyerOrders.length,
        totalSpent,
        outstandingBalance,
        lastOrderDate,
        paymentHealth,
        orders: buyerOrders,
      };
    });
  }, [orders]);

  // 2+3. Search + Sort + Filter pill — combined
  const displayedBuyers = useMemo(() => {
    let list = allBuyers;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) => b.name.toLowerCase().includes(q) || b.phone.includes(q)
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'outstanding') return b.outstandingBalance - a.outstandingBalance;
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    });

    // Pill filter
    if (filterPill === 'reliable') list = list.filter((b) => b.paymentHealth === 'reliable');
    if (filterPill === 'outstanding') list = list.filter((b) => b.outstandingBalance > 0);

    return list;
  }, [allBuyers, searchQuery, sortBy, filterPill]);

  const selectedBuyer = selectedBuyerPhone
    ? displayedBuyers.find((b) => b.phone === selectedBuyerPhone) ??
      allBuyers.find((b) => b.phone === selectedBuyerPhone)
    : null;

  const handleOrderClick = (id: string) => {
    setSelectedBuyerPhone(null);
    router.push(`/dashboard/orders/${id}`);
  };

  // Pill counts
  const reliableCount = allBuyers.filter((b) => b.paymentHealth === 'reliable').length;
  const outstandingCount = allBuyers.filter((b) => b.outstandingBalance > 0).length;

  const pillClass = (active: boolean) =>
    `whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-colors border ${
      active
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    }`;

  const pillCount = (count: number, active: boolean) => (
    <span className={`ml-1 text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>
      ({count})
    </span>
  );

  return (
    <main className="flex-1 w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 text-left">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Buyers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            All buyers derived from your order history — always up to date.
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4 border-l-4 border-blue-500" padding="md">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Buyers</p>
              <p className="text-2xl font-bold text-blue-700">{allBuyers.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-green-500" padding="md">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reliable Payers</p>
              <p className="text-2xl font-bold text-green-700">{reliableCount}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-amber-500" padding="md">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">With Outstanding Balance</p>
              <p className="text-2xl font-bold text-amber-700">{outstandingCount}</p>
            </div>
          </Card>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="spent">Highest Spent</option>
            <option value="outstanding">Outstanding Balance</option>
          </select>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button className={pillClass(filterPill === 'all')} onClick={() => setFilterPill('all')}>
            All {pillCount(allBuyers.length, filterPill === 'all')}
          </button>
          <button className={pillClass(filterPill === 'reliable')} onClick={() => setFilterPill('reliable')}>
            Reliable Payers {pillCount(reliableCount, filterPill === 'reliable')}
          </button>
          <button className={pillClass(filterPill === 'outstanding')} onClick={() => setFilterPill('outstanding')}>
            Has Outstanding Balance {pillCount(outstandingCount, filterPill === 'outstanding')}
          </button>
        </div>

        {/* Table */}
        <Card padding="none" className="overflow-hidden shadow-sm border-gray-200">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[minmax(200px,2fr)_80px_140px_160px_140px_100px_44px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>Buyer</div>
            <div>Orders</div>
            <div>Total Spent</div>
            <div>Outstanding</div>
            <div>Health</div>
            <div>Last Order</div>
            <div />
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {displayedBuyers.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">No buyers match your search</h3>
                <p className="text-sm text-gray-500">Try adjusting filters or clearing the search.</p>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setFilterPill('all'); }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              displayedBuyers.map((buyer) => {
                const health = healthConfig[buyer.paymentHealth];
                return (
                  <button
                    key={buyer.phone}
                    onClick={() => setSelectedBuyerPhone(buyer.phone)}
                    className="w-full text-left hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden flex items-center gap-4 px-5 py-4">
                      <Avatar name={buyer.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{buyer.name}</p>
                        <p className="text-xs text-gray-500">{buyer.phone}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium text-gray-700">{buyer.totalOrders} orders</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-medium text-gray-700">{formatCurrency(buyer.totalSpent)}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${health.bgClass} ${health.colorClass}`}>
                        {health.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:grid grid-cols-[minmax(200px,2fr)_80px_140px_160px_140px_100px_44px] gap-4 px-6 py-4 items-center text-sm">
                      {/* Buyer cell */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={buyer.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{buyer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{buyer.phone}</p>
                        </div>
                      </div>

                      <div className="font-semibold text-gray-900">{buyer.totalOrders}</div>

                      <div className="font-semibold text-gray-900">{formatCurrency(buyer.totalSpent)}</div>

                      <div className={`font-semibold ${buyer.outstandingBalance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {formatCurrency(buyer.outstandingBalance)}
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${health.bgClass} ${health.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${health.dotClass}`} />
                          {health.label}
                        </span>
                      </div>

                      <div className="text-gray-500 text-xs">{formatRelativeTime(buyer.lastOrderDate)}</div>

                      <div className="flex justify-end">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Table footer */}
          {displayedBuyers.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-white text-xs text-gray-500">
              Showing {displayedBuyers.length} of {allBuyers.length} buyers
            </div>
          )}
        </Card>
      </div>

      {/* Buyer Profile Slide-over */}
      {selectedBuyer && (
        <BuyerPanel
          buyer={selectedBuyer}
          onClose={() => setSelectedBuyerPhone(null)}
          onOrderClick={handleOrderClick}
        />
      )}
    </main>
  );
}
