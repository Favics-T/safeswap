export const statusConfig: Record<string, { label: string, colorClass: string, bgClass: string, dotClass: string }> = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    dotClass: 'bg-gray-500',
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    dotClass: 'bg-gray-500',
  },
  deposit_paid: {
    label: 'Deposit Paid',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
    dotClass: 'bg-amber-500',
  },
  awaiting_deposit: {
    label: 'Awaiting Deposit',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
    dotClass: 'bg-amber-500',
  },
  partial_payer: {
    label: 'Partial Payer',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
    dotClass: 'bg-amber-500',
  },
  fully_paid: {
    label: 'Fully Paid',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-100',
    dotClass: 'bg-blue-500',
  },
  in_production: {
    label: 'In Production',
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-100',
    dotClass: 'bg-purple-500',
  },
  shipped: {
    label: 'Shipped',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-100',
    dotClass: 'bg-orange-500',
  },
  completed: {
    label: 'Completed',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-100',
    dotClass: 'bg-green-500',
  },
  reliable_payer: {
    label: 'Reliable Payer',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-100',
    dotClass: 'bg-green-500',
  },
  disputed: {
    label: 'Disputed',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-100',
    dotClass: 'bg-red-500',
  },
  has_defaulted: {
    label: 'Has Defaulted',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-100',
    dotClass: 'bg-red-500',
  },
};
