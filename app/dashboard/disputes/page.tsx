'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  MessageCircle,
  ChevronRight,
  Send,
  Bot,
  X,
  AlertTriangle,
  Scale,
  FileText,
} from 'lucide-react';
import { Tabs, Card, Badge, Button, Avatar, ProgressBar, Textarea } from '@/components/ui';
import { useOrders } from '@/context/OrdersContext';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Dispute } from '@/lib/types/dispute';

// ── Countdown hook — ticks every 60s, auto-resolves at zero ─────────────────
function useCountdown(autoReleaseAt: string, onExpire: () => void) {
  const [remaining, setRemaining] = useState(() => {
    const ms = new Date(autoReleaseAt).getTime() - Date.now();
    return Math.max(0, ms);
  });
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;

    const tick = () => {
      const ms = new Date(autoReleaseAt).getTime() - Date.now();
      const r = Math.max(0, ms);
      setRemaining(r);
      if (r === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [autoReleaseAt, onExpire]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, expired: remaining === 0 };
}

// ── Single active dispute card ───────────────────────────────────────────────
interface ActiveCardProps {
  dispute: Dispute;
  onView: () => void;
  onAutoResolve: () => void;
}

function ActiveDisputeCard({ dispute, onView, onAutoResolve }: ActiveCardProps) {
  const { orders } = useOrders();
  const order = orders.find(o => o.id === dispute.orderId);
  const { hours, minutes, expired } = useCountdown(dispute.autoReleaseAt, onAutoResolve);

  return (
    <Card padding="none" className="p-5 border-l-4 border-red-400 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link
                href={`/dashboard/orders/${dispute.orderId}`}
                className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {order?.itemName ?? 'Unknown Order'}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">
                Order #{dispute.orderId} • Raised {formatRelativeTime(dispute.createdAt)}
              </p>
            </div>
            {/* Countdown pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              expired ? 'bg-red-100 text-red-700' :
              hours < 6 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {expired ? 'Auto-resolving…' : `Auto-resolves in ${hours}h ${minutes}m`}
            </span>
          </div>

          {/* Parties */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Avatar name={order?.buyerName ?? '?'} size="sm" />
              <span className="text-gray-700 font-medium">{order?.buyerName}</span>
              <span className="text-gray-400 text-xs">(Buyer)</span>
            </div>
            <span className="text-gray-300">vs</span>
            <div className="flex items-center gap-2">
              <Avatar name="You" size="sm" />
              <span className="text-gray-700 font-medium">You</span>
              <span className="text-gray-400 text-xs">(Vendor)</span>
            </div>
          </div>

          {/* Reason quote */}
          <blockquote className="border-l-4 border-gray-200 pl-3 py-1 bg-gray-50 rounded-r-lg text-sm text-gray-600 italic">
            "{dispute.buyerReason.slice(0, 160)}{dispute.buyerReason.length > 160 ? '…' : ''}"
          </blockquote>

          {/* Tier badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              dispute.tier === 'negotiation'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              <Scale className="w-3 h-3" />
              {dispute.tier === 'negotiation' ? 'Tier 1 — Direct Negotiation' : 'Tier 2 — Admin Review'}
            </span>
            {order && (
              <span className="text-xs font-bold text-gray-700">{formatCurrency(order.totalPrice)}</span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex items-start sm:items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={onView}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            View Full Dispute
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ── Dispute Detail Modal (slide-over style) ──────────────────────────────────
interface DetailModalProps {
  dispute: Dispute;
  onClose: () => void;
}

function DisputeDetailModal({ dispute, onClose }: DetailModalProps) {
  const { orders, addDisputeMessage, resolveDispute } = useOrders();
  const order = orders.find(o => o.id === dispute.orderId);

  const [messageText, setMessageText] = useState('');
  const [adminNotes, setAdminNotes] = useState(dispute.adminNotes ?? '');
  const [resolving, setResolving] = useState<'vendor' | 'buyer' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dispute.messages.length]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    addDisputeMessage(dispute.id, 'vendor', messageText.trim());
    setMessageText('');
  };

  // Demo: simulate buyer reply
  const handleSimulateBuyerReply = () => {
    const canned = [
      "I still haven't received anything. This is unacceptable!",
      "Can we please resolve this? I just want my money back.",
      "The tracking number still shows no updates. Please help.",
    ];
    const text = canned[Math.floor(Math.random() * canned.length)];
    addDisputeMessage(dispute.id, 'buyer', text);
  };

  const handleResolve = (decision: 'resolved_vendor' | 'resolved_buyer') => {
    if (!adminNotes.trim()) return;
    setResolving(decision === 'resolved_vendor' ? 'vendor' : 'buyer');
    setTimeout(() => {
      resolveDispute(dispute.id, decision, adminNotes);
      onClose();
    }, 500);
  };

  const isPending = dispute.adminDecision === 'pending';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-bold text-gray-900">Dispute {dispute.id}</h2>
              <p className="text-xs text-gray-500">Order #{dispute.orderId} • {order?.itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Order summary strip */}
          {order && (
            <Card padding="sm" className="bg-gray-50 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Item: </span>
                <span className="font-semibold text-gray-900">{order.itemName}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount: </span>
                <span className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</span>
              </div>
              <div>
                <span className="text-gray-500">Buyer: </span>
                <span className="font-semibold text-gray-900">{order.buyerName}</span>
              </div>
              <div>
                <span className="text-gray-500">Vendor: </span>
                <span className="font-semibold text-gray-900">You</span>
              </div>
              <Badge status={order.status} size="sm" />
            </Card>
          )}

          {/* Evidence comparison: Vendor vs Buyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="sm" className="border-blue-100 bg-blue-50/30">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Your Evidence
              </h4>
              {order?.dispatchProofUrl ? (
                <img src={order.dispatchProofUrl} alt="Dispatch proof" className="w-full h-28 object-cover rounded-lg mb-2 border border-blue-100" />
              ) : (
                <div className="w-full h-20 bg-blue-100/60 rounded-lg mb-2 flex items-center justify-center text-xs text-blue-500">
                  No image uploaded
                </div>
              )}
              <p className="text-xs text-gray-600 italic">
                {order?.dispatchNote ?? 'No dispatch note provided.'}
              </p>
            </Card>

            <Card padding="sm" className="border-red-100 bg-red-50/20">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Buyer's Claim
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">"{dispute.buyerReason}"</p>
            </Card>
          </div>

          {/* Message thread */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Message Thread</h4>
              {/* Demo helper */}
              <button
                onClick={handleSimulateBuyerReply}
                className="text-xs text-gray-400 border border-dashed border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Bot className="w-3 h-3" /> Simulate Buyer Reply
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {dispute.messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No messages yet.</p>
              )}
              {dispute.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'vendor'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'vendor' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            {isPending && (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Type your response…"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Send
                </Button>
              </div>
            )}
          </div>

          {/* Admin Decision Panel */}
          {isPending && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50/50">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-gray-600" /> Admin Decision
              </h4>
              <p className="text-xs text-gray-500">
                Add your reasoning before ruling. This note will be recorded as the official resolution.
              </p>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Document your decision rationale here… (required)"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  disabled={!adminNotes.trim() || resolving !== null}
                  isLoading={resolving === 'vendor'}
                  onClick={() => handleResolve('resolved_vendor')}
                >
                  ✓ Rule: Release to Vendor
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={!adminNotes.trim() || resolving !== null}
                  isLoading={resolving === 'buyer'}
                  onClick={() => handleResolve('resolved_buyer')}
                >
                  ↩ Rule: Refund Buyer
                </Button>
              </div>
            </div>
          )}

          {/* Resolved state summary */}
          {!isPending && (
            <Card padding="sm" className={`${dispute.adminDecision === 'resolved_vendor' ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`w-5 h-5 ${dispute.adminDecision === 'resolved_vendor' ? 'text-green-600' : 'text-red-500'}`} />
                <span className="font-semibold text-gray-900">
                  {dispute.adminDecision === 'resolved_vendor' ? 'Resolved — Funds Released to Vendor' : 'Resolved — Buyer Refunded'}
                </span>
              </div>
              {dispute.adminNotes && (
                <p className="text-sm text-gray-600 italic border-l-4 border-gray-300 pl-3">"{dispute.adminNotes}"</p>
              )}
              {dispute.resolvedAt && (
                <p className="text-xs text-gray-500 mt-2">Resolved {formatRelativeTime(dispute.resolvedAt)}</p>
              )}
            </Card>
          )}

        </div>
      </div>
    </>
  );
}

// ── Main Disputes Page ───────────────────────────────────────────────────────
export default function DisputesPage() {
  const { disputes, orders, resolveDispute } = useOrders();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const activeDisputes = disputes.filter(d => d.adminDecision === 'pending');
  const resolvedDisputes = disputes.filter(d => d.adminDecision !== 'pending');

  const displayed =
    activeTab === 'active' ? activeDisputes :
    activeTab === 'resolved' ? resolvedDisputes :
    disputes;

  const selectedDispute = selectedDisputeId ? disputes.find(d => d.id === selectedDisputeId) : null;

  // Stable auto-resolve callback per dispute
  const makeAutoResolve = useCallback((id: string) => () => {
    resolveDispute(id, 'resolved_vendor', 'Auto-resolved: no buyer response within 48 hours.');
  }, [resolveDispute]);

  const tabs = [
    { label: 'Active', value: 'active', count: activeDisputes.length },
    { label: 'Resolved', value: 'resolved', count: resolvedDisputes.length },
    { label: 'All', value: 'all', count: disputes.length },
  ];

  return (
    <main className="flex-1 w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 text-left">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Disputes
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Resolve disagreements between you and your buyers.</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* ── Active tab content ── */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeDisputes.length === 0 ? (
              <Card className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No active disputes</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  All clear! When a buyer raises a dispute, it will appear here.
                </p>
              </Card>
            ) : (
              activeDisputes.map(dispute => (
                <ActiveDisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  onView={() => setSelectedDisputeId(dispute.id)}
                  onAutoResolve={makeAutoResolve(dispute.id)}
                />
              ))
            )}
          </div>
        )}

        {/* ── Resolved tab content ── */}
        {activeTab === 'resolved' && (
          <div>
            {resolvedDisputes.length === 0 ? (
              <Card className="py-14 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500">No resolved disputes yet.</p>
              </Card>
            ) : (
              <Card padding="none" className="overflow-hidden shadow-sm border-gray-200">
                <div className="hidden md:grid grid-cols-[120px_minmax(120px,1fr)_minmax(120px,1fr)_180px_140px_140px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div>ORDER ID</div>
                  <div>BUYER</div>
                  <div>ITEM</div>
                  <div>RESOLUTION</div>
                  <div>AMOUNT</div>
                  <div>DATE</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {resolvedDisputes.map(dispute => {
                    const order = orders.find(o => o.id === dispute.orderId);
                    const isVendorWin = dispute.adminDecision === 'resolved_vendor';
                    return (
                      <div key={dispute.id} className="grid grid-cols-1 md:grid-cols-[120px_minmax(120px,1fr)_minmax(120px,1fr)_180px_140px_140px] gap-4 px-6 py-4 items-center text-sm">
                        <div>
                          <Link href={`/dashboard/orders/${dispute.orderId}`} className="font-mono text-blue-600 hover:underline text-xs font-semibold">
                            #{dispute.orderId}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar name={order?.buyerName ?? '?'} size="sm" />
                          <span className="font-medium text-gray-900 truncate">{order?.buyerName ?? '—'}</span>
                        </div>
                        <div className="truncate text-gray-900 font-medium">{order?.itemName ?? '—'}</div>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isVendorWin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isVendorWin ? '✓ Funds Released' : '↩ Refunded to Buyer'}
                          </span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {order ? formatCurrency(order.totalPrice) : '—'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {dispute.resolvedAt
                            ? new Date(dispute.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
                  Showing {resolvedDisputes.length} of {resolvedDisputes.length} resolved disputes
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── All tab content ── */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <Card className="py-14 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500">No disputes found.</p>
              </Card>
            ) : (
              <>
                {activeDisputes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active ({activeDisputes.length})</h3>
                    {activeDisputes.map(dispute => (
                      <ActiveDisputeCard
                        key={dispute.id}
                        dispute={dispute}
                        onView={() => setSelectedDisputeId(dispute.id)}
                        onAutoResolve={makeAutoResolve(dispute.id)}
                      />
                    ))}
                  </div>
                )}
                {resolvedDisputes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Resolved ({resolvedDisputes.length})</h3>
                    <Card padding="none" className="overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {resolvedDisputes.map(dispute => {
                          const order = orders.find(o => o.id === dispute.orderId);
                          const isVendorWin = dispute.adminDecision === 'resolved_vendor';
                          return (
                            <div key={dispute.id} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
                              <Link href={`/dashboard/orders/${dispute.orderId}`} className="font-mono text-blue-600 hover:underline text-xs font-semibold">
                                #{dispute.orderId}
                              </Link>
                              <span className="text-gray-900 font-medium flex-1 truncate">{order?.itemName}</span>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                isVendorWin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {isVendorWin ? '✓ Released' : '↩ Refunded'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* Dispute Detail slide-over */}
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          onClose={() => setSelectedDisputeId(null)}
        />
      )}
    </main>
  );
}
