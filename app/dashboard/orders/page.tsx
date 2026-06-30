'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  PackageOpen,
  Filter,
  Download,
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Button, 
  Card, 
  Badge, 
  Input, 
  ProgressBar,
  Modal,
  Textarea,
  Avatar
} from '@/components/ui';
import { useOrders, NewOrderPayload } from '@/context/OrdersContext';
import { formatCurrency } from '@/lib/utils';
import { statusConfig } from '@/lib/constants/statusConfig';
import { OrderStatus } from '@/lib/types/order';

interface OrderFormValues {
  itemName: string;
  itemDescription: string;
  totalPrice: number;
  paymentType: 'full_upfront' | 'deposit_balance';
  depositThresholdPct: number;
  buyerName: string;
  buyerPhone: string;
}

export default function OrdersPage() {
  const { orders, addOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<OrderFormValues>({
    defaultValues: {
      paymentType: 'deposit_balance',
      depositThresholdPct: 50,
    }
  });

  const paymentType = watch('paymentType');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = activeFilter === 'all' || order.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, activeFilter]);

  const allStatuses = Object.keys(statusConfig) as OrderStatus[];

  const onSubmit = (data: OrderFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      addOrder({
        itemName: data.itemName,
        itemDescription: data.itemDescription || '',
        totalPrice: Number(data.totalPrice),
        paymentType: data.paymentType,
        depositThresholdPct: data.paymentType === 'deposit_balance' ? Number(data.depositThresholdPct) : 100,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
      reset();
    }, 600);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderModal = () => (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        if (!isSubmitting) {
          setIsModalOpen(false);
          reset();
        }
      }}
      title="Create New Swap"
      footer={
        <div className="w-full flex justify-between items-center">
          <Button variant="ghost" onClick={() => {
            setIsModalOpen(false);
            reset();
          }} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <ShieldCheck className="w-4 h-4 mr-1" /> Secured by SafeSwap
            </div>
            <Button 
              variant="primary" 
              onClick={handleSubmit(onSubmit)} 
              isLoading={isSubmitting}
            >
              Create Order
            </Button>
          </div>
        </div>
      }
    >
      <div className="text-sm text-gray-500 mb-6 -mt-4">
        Initiate a secure escrow transaction for your buyer.
      </div>
      
      <form className="space-y-6 text-left pb-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input 
            label="Item Name" 
            placeholder="e.g. iPhone 15 Pro Max, Silver" 
            required
            error={errors.itemName?.message}
            {...register('itemName', { 
              required: 'Item name is required', 
              minLength: { value: 2, message: 'Min 2 characters' } 
            })}
          />
          <Textarea
            label="Item Description"
            placeholder="Provide key details about the item's condition, warranty, or delivery terms..."
            error={errors.itemDescription?.message}
            {...register('itemDescription', {
              maxLength: { value: 300, message: 'Max 300 characters' }
            })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Total Price (₦)" 
            placeholder="0.00" 
            prefix="₦"
            type="number"
            required
            error={errors.totalPrice?.message}
            {...register('totalPrice', { 
              required: 'Price is required',
              min: { value: 1, message: 'Must be positive' }
            })}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Payment Type</label>
            <div className="flex gap-4 h-10 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  value="full_upfront" 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                  {...register('paymentType')} 
                />
                Full Payment
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  value="deposit_balance" 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                  {...register('paymentType')} 
                />
                Deposit + Balance
              </label>
            </div>
          </div>
        </div>

        {paymentType === 'deposit_balance' && (
          <Input 
            label="Deposit Percentage (%)" 
            placeholder="50" 
            type="number"
            required
            error={errors.depositThresholdPct?.message}
            {...register('depositThresholdPct', {
              required: 'Required',
              min: { value: 1, message: 'Min 1%' },
              max: { value: 99, message: 'Max 99%' }
            })}
          />
        )}

        <div className="pt-2 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm">Buyer Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Buyer Name" 
              placeholder="Full name of customer" 
              required
              error={errors.buyerName?.message}
              {...register('buyerName', { 
                required: 'Required',
                minLength: { value: 2, message: 'Min 2 characters' }
              })}
            />
            <Input 
              label="Buyer Phone Number" 
              placeholder="+234" 
              required
              error={errors.buyerPhone?.message}
              {...register('buyerPhone', { 
                required: 'Required',
                pattern: {
                  value: /^(\+234|0)[789][01]\d{8}$/,
                  message: 'Invalid Nigerian phone number'
                }
              })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );

  // --- EMPTY STATE ---
  if (orders.length === 0) {
    return (
      <main className="flex-1 w-full bg-gray-50 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
              <p className="text-gray-500 mt-1">Track and manage your secure escrow transactions.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filters</Button>
              <Button variant="outline" icon={<Download className="w-4 h-4" />}>Export CSV</Button>
            </div>
          </div>
          
          <Card className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl shadow-sm border-gray-200">
            <div className="w-24 h-24 bg-blue-50/80 rounded-full flex items-center justify-center mb-6 relative">
              <PackageOpen className="w-10 h-10 text-blue-500" />
              <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h2>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Your order list is currently empty. Create your first secure escrow order to start trading with absolute peace of mind.
            </p>
            <div className="flex gap-4">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                Create New Order
              </Button>
              <Button variant="outline" icon={<BookOpen className="w-4 h-4" />}>
                View Guide
              </Button>
            </div>
          </Card>
          
          {/* Benefit Cards below empty state */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gray-50/50 border-gray-100">
              <ShieldCheck className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Secure Escrow</h4>
              <p className="text-xs text-gray-500">Funds are held securely until both parties are satisfied.</p>
            </Card>
            <Card className="bg-gray-50/50 border-gray-100">
              <Zap className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Fast Processing</h4>
              <p className="text-xs text-gray-500">Quick releases and simple workflow management.</p>
            </Card>
            <Card className="bg-gray-50/50 border-gray-100">
              <HeadphonesIcon className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
              <p className="text-xs text-gray-500">Our dispute resolution team is always here to help.</p>
            </Card>
          </div>
        </div>
        {renderModal()}
      </main>
    );
  }

  // --- POPULATED TABLE STATE ---
  return (
    <main className="flex-1 w-full flex flex-col items-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="w-full max-w-7xl">
        <PageHeader 
          title="Orders" 
          subtitle="Manage all your pre-orders and payments."
          action={
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Create New Order
            </Button>
          } 
        />

        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              placeholder="Search by ID, item or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" icon={<Filter className="w-4 h-4" />} className="flex-1 sm:flex-none bg-white">Filter</Button>
            <Button variant="outline" icon={<Download className="w-4 h-4" />} className="flex-1 sm:flex-none bg-white">Export</Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-2 mb-2 w-full">
          <button
            onClick={() => setActiveFilter('all')}
            className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-colors border ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All <span className={`ml-1 text-xs ${activeFilter === 'all' ? 'text-blue-100' : 'text-gray-400'}`}>{orders.length}</span>
          </button>
          
          {allStatuses.map(status => {
            const count = orders.filter(o => o.status === status).length;
            if (count === 0 && activeFilter !== status) return null;
            
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                  activeFilter === status 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {statusConfig[status].label} <span className={`ml-1 text-xs ${activeFilter === status ? 'text-blue-100' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Table Container */}
        <Card padding="none" className="overflow-hidden border-gray-200 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row */}
              <div className="grid grid-cols-[100px_minmax(150px,1fr)_minmax(150px,1fr)_120px_160px_140px_100px] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 tracking-wider uppercase">
                <div>ORDER ID</div>
                <div>ITEM NAME</div>
                <div>BUYER</div>
                <div>TOTAL PRICE</div>
                <div>PAYMENT PROGRESS</div>
                <div>STATUS</div>
                <div>DATE</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <Search className="w-8 h-8 text-gray-300 mb-3" />
                    <h3 className="text-gray-900 font-medium mb-1">No orders match your search</h3>
                    <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const progressPct = order.totalPrice > 0 ? (order.amountPaid / order.totalPrice) * 100 : 0;
                    const progressColor = order.amountPaid >= order.totalPrice ? 'green' : (order.amountPaid > 0 ? 'blue' : 'amber');
                    
                    return (
                      <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block hover:bg-blue-50/30 transition-colors">
                        <div className="grid grid-cols-[100px_minmax(150px,1fr)_minmax(150px,1fr)_120px_160px_140px_100px] gap-4 px-6 py-4 items-center text-sm">
                          <div className="font-semibold text-gray-900">#{order.id}</div>
                          
                          <div className="font-semibold text-gray-900 line-clamp-2 pr-4">{order.itemName}</div>
                          
                          <div className="flex items-center gap-3 pr-4">
                            <Avatar name={order.buyerName} size="sm" />
                            <span className="font-medium text-gray-900 truncate">{order.buyerName}</span>
                          </div>
                          
                          <div className="font-bold text-gray-900">
                            {formatCurrency(order.totalPrice).replace(/\.\d+$/, '')} {/* Drop decimals to match mockup closely */}
                          </div>
                          
                          <div className="flex flex-col gap-1.5 pr-6">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-gray-900">{formatCurrency(order.amountPaid).replace(/\.\d+$/, '')}</span>
                              <span className="text-gray-500 font-medium">{Math.round(progressPct)}%</span>
                            </div>
                            <ProgressBar value={progressPct} color={progressColor} />
                          </div>
                          
                          <div>
                            <Badge status={order.status} size="sm" className="shadow-sm border border-black/5" />
                          </div>
                          
                          <div className="text-gray-500 text-xs">
                            <div className="flex flex-col">
                              <span>{formatDate(order.createdAt).split(',')[0]}</span>
                              <span>{formatDate(order.createdAt).split(',')[1]?.trim()}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination Footer */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white text-sm text-gray-500">
              <div>
                Showing 1 to {filteredOrders.length} of {orders.length} orders
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 font-medium flex items-center justify-center">2</button>
                <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 font-medium flex items-center justify-center">3</button>
                <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {renderModal()}
    </main>
  );
}
