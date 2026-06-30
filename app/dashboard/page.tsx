'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ScrollText, 
  TrendingUp, 
  Wallet, 
  Lock, 
  ChevronRight,
  Download,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, ProgressBar, Badge } from '@/components/ui';
import { useOrders } from '@/context/OrdersContext';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { statusConfig } from '@/lib/constants/statusConfig';

export default function DashboardPage() {
  const { vendor, activity, disputeCount } = useOrders();

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalOrders = 124; 
  const totalCollected = 1250000;
  const totalOutstanding = 450000;
  const inEscrow = 820000;

  const readyCount = 8;
  const totalCount = 12;
  const percentage = (readyCount / totalCount) * 100;

  const getActivityStatusColor = (type: string) => {
    switch (type) {
      case 'payment': return statusConfig.deposit_paid.dotClass;
      case 'dispute': return statusConfig.disputed.dotClass;
      case 'completion': return statusConfig.completed.dotClass;
      case 'inquiry': return statusConfig.awaiting_payment.dotClass;
      case 'draft': return statusConfig.cancelled.dotClass;
      default: return 'bg-gray-400';
    }
  };
  
  const getActivityIconBackground = (type: string) => {
    switch (type) {
      case 'payment': return statusConfig.deposit_paid.bgClass;
      case 'dispute': return statusConfig.disputed.bgClass;
      case 'completion': return statusConfig.completed.bgClass;
      case 'inquiry': return statusConfig.awaiting_payment.bgClass;
      case 'draft': return statusConfig.cancelled.bgClass;
      default: return 'bg-gray-100';
    }
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
      <PageHeader
        title={`Welcome back, ${vendor.ownerName}`}
        subtitle={formattedDate}
        action={<Button variant="primary" icon={<Plus className="w-4 h-4" />}>Create New Order</Button>}
      />

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2 relative">
          <div className="text-gray-500 text-sm font-medium">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
          <ScrollText className="w-5 h-5 text-gray-400 absolute right-6 bottom-6" />
        </Card>
        
        <Card className="flex flex-col gap-2 relative">
          <div className="text-gray-500 text-sm font-medium">Total Collected</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
          <div className="flex items-center text-xs text-green-500 font-medium absolute right-6 bottom-6">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12%
          </div>
        </Card>
        
        <Card className="flex flex-col gap-2 relative">
          <div className="text-gray-500 text-sm font-medium">Total Outstanding</div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</div>
          <Wallet className="w-5 h-5 text-amber-500 absolute right-6 bottom-6" />
        </Card>
        
        <Card className="flex flex-col gap-2 relative">
          <div className="text-gray-500 text-sm font-medium">Held in Escrow</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(inEscrow)}</div>
          <Lock className="w-5 h-5 text-blue-500 absolute right-6 bottom-6" />
        </Card>
      </div>

      {/* Production Readiness Section */}
      <Card className="flex flex-col space-y-4">
        <div className="flex justify-between items-start sm:items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Production Readiness</h3>
            <p className="text-sm text-gray-500 mt-1">
              {readyCount} of {totalCount} orders have cleared their deposit threshold
            </p>
          </div>
          <Link href="/production" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
            View Production Queue <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="pt-2">
          <ProgressBar value={percentage} color="blue" />
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
            <span>0% BASELINE</span>
            <span className="text-blue-600 ml-16">{Math.round(percentage)}% READINESS</span>
            <span>100% TARGET</span>
          </div>
        </div>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT — Recent Activity */}
        <Card className="lg:col-span-3 flex flex-col h-[500px]" padding="none">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/activity" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All History
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activity.map((event, index) => (
              <div 
                key={event.id} 
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${index !== activity.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <span className={`flex w-8 h-8 rounded-full items-center justify-center ${getActivityIconBackground(event.type)}`}>
                    <span className={`w-3 h-3 rounded-full ${getActivityStatusColor(event.type)}`} />
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-1">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate flex-1" 
                    dangerouslySetInnerHTML={{ 
                      __html: event.description.replace(/(Order #\d+|₦[\d,]+|Client #\d+|Adaeze T\.|John Okechukwu)/g, '<strong>$1</strong>') 
                    }} 
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT — Quick Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <Button variant="primary" className="w-full flex justify-center items-center" icon={<Plus className="w-4 h-4" />}>
              Create New Order
            </Button>
            <Button variant="outline" className="w-full flex justify-between items-center bg-white hover:bg-gray-50 border-gray-200">
              <span className="flex items-center text-gray-700 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" /> View Disputes
              </span>
              {disputeCount > 0 && <Badge status="disputed" size="sm">{disputeCount}</Badge>}
            </Button>
            <Button variant="outline" className="w-full flex justify-center items-center bg-white hover:bg-gray-50 border-gray-200" icon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
          </Card>

          <Card padding="none" className="bg-blue-600 border-none text-white overflow-hidden relative shadow-md">
            <div className="p-6 relative z-10 flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-bold tracking-wider text-blue-100">SECURE ESCROW BALANCE</span>
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(inEscrow)}
              </div>
              <div className="flex justify-between items-center mt-2">
                <Badge status="completed" size="sm" className="bg-blue-700 text-blue-100 border border-blue-500 hover:bg-blue-700">
                  SafeSwap Protected
                </Badge>
                <Link href="/payouts" className="text-sm font-semibold text-white hover:text-blue-100 flex items-center">
                  Manage Payouts <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Background Shield Logo */}
            <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-500 opacity-30 transform rotate-12" />
          </Card>
          
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
             <div className="bg-white p-1 rounded-full shadow-sm text-blue-600 mt-0.5 flex-shrink-0">
               <ShieldCheck className="w-4 h-4" />
             </div>
             <p className="text-xs text-gray-600 leading-relaxed font-medium">
               Your funds are protected by SafeSwap's multi-signature escrow technology. 
               Guaranteed fair resolution on all disputes.
             </p>
          </div>
        </div>
        
      </div>
    </main>
  );
}
