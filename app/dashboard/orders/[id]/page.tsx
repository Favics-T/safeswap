'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Copy,
  MessageCircle,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Badge, 
  ProgressBar,
  Avatar,
  Stepper,
  Modal,
  Input,
  Textarea
} from '@/components/ui';
import { useOrders } from '@/context/OrdersContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Step } from '@/components/ui/Stepper';
import { statusConfig } from '@/lib/constants/statusConfig';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { orders, vendor, updateOrderStatus, recordPayment, addDispatchProof, confirmDelivery } = useOrders();
  
  const order = orders.find(o => o.id === unwrappedParams.id);

  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Dev Simulate Payment
  const [showSimulatePayment, setShowSimulatePayment] = useState(false);
  const [simulateAmount, setSimulateAmount] = useState('');

  // Dispatch upload state
  const [dispatchFile, setDispatchFile] = useState<File | null>(null);
  const [dispatchPreview, setDispatchPreview] = useState<string>('');
  const [dispatchNoteText, setDispatchNoteText] = useState('');

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (dispatchPreview) URL.revokeObjectURL(dispatchPreview);
    };
  }, [dispatchPreview]);

  if (!order) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">The order you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard/orders">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Derived variables
  const progressPct = order.totalPrice > 0 ? (order.amountPaid / order.totalPrice) * 100 : 0;
  const balance = Math.max(0, order.totalPrice - order.amountPaid);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(order.virtualAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hello ${order.buyerName}, your order for ${order.itemName} is active. Please pay into the SafeSwap Escrow Account: ${order.virtualAccountNumber} (${order.virtualBankName}).`;
    window.open(`https://wa.me/${order.buyerPhone.replace('+', '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSimulatePayment = () => {
    if (!simulateAmount || isNaN(Number(simulateAmount))) return;
    recordPayment(order.id, Number(simulateAmount));
    setShowSimulatePayment(false);
    setSimulateAmount('');
  };

  const handleDispatchUpload = () => {
    if (!dispatchFile) return;
    // In reality, upload to Cloudinary/S3 here
    const url = URL.createObjectURL(dispatchFile);
    addDispatchProof(order.id, url, dispatchNoteText);
  };

  const buyerOrderCount = orders.filter(o => o.buyerPhone === order.buyerPhone).length - 1;

  // Timeline Stepper logic
  const steps: Step[] = [
    {
      label: 'Order Created',
      status: 'complete',
      timestamp: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      label: 'Payment Received',
      status: order.amountPaid > 0 ? 'complete' : (order.status === 'awaiting_payment' ? 'current' : 'upcoming'),
      timestamp: (order.payments && order.payments.length > 0) ? new Date(order.payments[order.payments.length - 1].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined
    },
    {
      label: 'In Production',
      status: ['in_production', 'shipped', 'completed'].includes(order.status) ? 'complete' : (order.status === 'fully_paid' || order.status === 'deposit_paid' ? 'current' : 'upcoming'),
    },
    {
      label: 'Shipped',
      status: ['shipped', 'completed'].includes(order.status) ? 'complete' : (order.status === 'in_production' ? 'current' : 'upcoming'),
      timestamp: order.dispatchUploadedAt ? new Date(order.dispatchUploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined
    },
    {
      label: 'Delivered',
      status: order.status === 'completed' ? 'complete' : (order.status === 'shipped' ? 'current' : 'upcoming'),
    }
  ];

  if (isCancelled) {
    steps.push({ label: 'Cancelled', status: 'complete' });
  } else {
    steps.push({
      label: 'Completed',
      status: order.status === 'completed' ? 'complete' : 'upcoming'
    });
  }

  // Formatting date helper
  const formatDateFull = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <main className="flex-1 w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header & Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <Link href="/dashboard/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Orders / Order #{order.id}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{order.itemName}</h1>
              <Badge status={order.status} />
            </div>
            <p className="text-sm text-gray-500">
              Order ID: #{order.id} • Created {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})} • Buyer: {order.buyerName}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(true)}
              disabled={isCancelled || isCompleted}
            >
              Mark as Cancelled
            </Button>
            
            {order.status === 'fully_paid' && (
              <Button variant="primary" onClick={() => updateOrderStatus(order.id, 'in_production')}>
                Mark as In Production
              </Button>
            )}
            
            {order.status === 'in_production' && (
              <div title={!order.dispatchProofUrl ? "Upload dispatch proof first" : ""}>
                <Button 
                  variant="primary" 
                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                  disabled={!order.dispatchProofUrl}
                >
                  Mark as Shipped
                </Button>
              </div>
            )}

            {order.status === 'shipped' && (
              <Button variant="primary" disabled>
                Awaiting buyer confirmation
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payment Summary */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              <span className="text-sm font-medium text-gray-500">{Math.round(progressPct)}% Completed</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalPrice).replace(/\.\d+$/, '')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Received</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(order.amountPaid).replace(/\.\d+$/, '')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Balance</p>
                <p className="text-2xl font-bold text-amber-500">{formatCurrency(balance).replace(/\.\d+$/, '')}</p>
              </div>
            </div>
            
            <ProgressBar value={progressPct} color={progressPct >= 100 ? 'green' : 'blue'} className="h-2" />
          </Card>

          {/* Escrow Account Panel */}
          <Card className="p-6 border-blue-100 bg-blue-50/30">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ESCROW ACCOUNT ({order.virtualBankName.toUpperCase()})</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
              <div>
                <p className="text-4xl font-bold text-blue-600 tracking-wide">{order.virtualAccountNumber}</p>
                <p className="text-sm text-gray-500 mt-1">Beneficiary: SafeSwap Escrow Account</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCopyAccount} icon={<Copy className="w-4 h-4" />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleWhatsApp} 
                  icon={<MessageCircle className="w-4 h-4" />}
                  className="bg-green-500 hover:bg-green-600 border-green-500 text-white"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-100 flex items-center text-sm text-gray-500">
              <Lock className="w-4 h-4 mr-2 text-gray-400" />
              Funds held securely until delivery is confirmed by the buyer.
            </div>
          </Card>

          {/* Dev Demo Simulators */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowSimulatePayment(!showSimulatePayment)} className="text-xs border-dashed">
              Demo: Simulate Nomba Webhook
            </Button>
            {order.status === 'shipped' && (
              <Button variant="outline" onClick={() => confirmDelivery(order.id)} className="text-xs border-dashed">
                Demo: Simulate Buyer Confirms Receipt
              </Button>
            )}
          </div>

          {showSimulatePayment && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Simulate Payment Received</h4>
              <div className="flex gap-3">
                <Input 
                  placeholder="Amount" 
                  type="number" 
                  value={simulateAmount} 
                  onChange={(e) => setSimulateAmount(e.target.value)} 
                />
                <Button variant="primary" onClick={handleSimulatePayment}>Record</Button>
              </div>
            </Card>
          )}

          {/* Payment History */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Payment History</h3>
            
            {!order.payments || order.payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                No payments received yet
              </div>
            ) : (
              <div className="space-y-6">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="relative pl-6 border-l-2 border-green-500">
                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5 border-2 border-white" />
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-900">{formatCurrency(payment.amount).replace(/\.\d+$/, '')}</span>
                        <span className="text-gray-500 ml-2 capitalize">— {payment.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDateFull(payment.timestamp)}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-100">
                      <div className="flex items-center text-sm text-gray-600 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        {payment.nombaTransactionId}
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Dispatch Proof */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Dispatch Proof</h3>
              {order.status === 'shipped' && <span className="text-sm font-medium text-blue-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Awaiting buyer confirmation</span>}
            </div>

            {order.dispatchProofUrl ? (
              <div className="flex gap-6 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-32 h-32 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative group shadow-sm">
                  <img src={order.dispatchProofUrl} alt="Dispatch proof" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">NOTES FROM VENDOR</h4>
                  <p className="text-gray-900 text-sm italic border-l-4 border-gray-300 pl-3 py-1 bg-white rounded-r-md">"{order.dispatchNote || 'No notes provided.'}"</p>
                  
                  <div className="mt-4 flex gap-4">
                    <Button variant="ghost" className="text-xs text-blue-600 p-0 hover:bg-transparent hover:underline" icon={<FileCheck2 className="w-4 h-4" />}>
                      Edit Dispatch Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  {dispatchPreview ? (
                    <div className="flex flex-col items-center">
                      <img src={dispatchPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg shadow-sm mb-4" />
                      <Button variant="outline" onClick={(e) => { e.preventDefault(); setDispatchFile(null); setDispatchPreview(''); }}>Remove File</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">Click to upload dispatch proof</p>
                      <p className="text-xs text-gray-500 mb-4">PNG, JPG or PDF (max 5MB)</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="dispatch-upload"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setDispatchFile(e.target.files[0]);
                            setDispatchPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                      <label htmlFor="dispatch-upload">
                        <Button variant="outline" className="pointer-events-none">Select File</Button>
                      </label>
                    </div>
                  )}
                </div>
                
                {dispatchPreview && (
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Enter tracking number or delivery notes..."
                      value={dispatchNoteText}
                      onChange={(e) => setDispatchNoteText(e.target.value)}
                    />
                    <Button variant="primary" onClick={handleDispatchUpload}>Save Dispatch Proof</Button>
                  </div>
                )}
              </div>
            )}
          </Card>
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Buyer Information */}
          <Card className="p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">BUYER INFORMATION</h3>
            
            <div className="flex items-center gap-3 mb-6">
              <Avatar name={order.buyerName} size="lg" className="bg-blue-100 text-blue-700 font-bold text-lg" />
              <div>
                <h4 className="font-bold text-gray-900">{order.buyerName}</h4>
                <p className="text-sm text-gray-500">Lagos, Nigeria</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900 flex items-center">
                  {order.buyerPhone.replace(/(\+?\d{4})(\d{3})(\d{4})/, '$1 *** $3')} <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Orders</span>
                <span className="font-medium text-gray-900">{buyerOrderCount} previous orders</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Trust Score</span>
                <span className="font-medium text-green-600">4.8/5.0</span>
              </div>
            </div>
          </Card>

          {/* Order Timeline Stepper */}
          <Card className="p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">ORDER TIMELINE</h3>
            <Stepper steps={steps} />
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-100 bg-red-50/20">
            <button 
              onClick={() => setShowCancelModal(true)}
              className="flex items-center text-red-600 font-medium text-sm hover:underline mb-2"
              disabled={isCancelled || isCompleted}
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Cancel this order
            </button>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cancellation terms may apply as the item has already been created in the system.
            </p>
          </Card>
          
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>Keep Order</Button>
            <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-red-600" onClick={() => {
              updateOrderStatus(order.id, 'cancelled');
              setShowCancelModal(false);
            }}>
              Yes, Cancel Order
            </Button>
          </>
        }
      >
        <p className="text-gray-600">Are you sure you want to cancel order #{order.id}? This action cannot be fully undone and the buyer will be notified.</p>
      </Modal>

    </main>
  );
}
