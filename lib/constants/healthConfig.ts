export type PaymentHealth = 'reliable' | 'partial' | 'defaulted';

export const healthConfig: Record<PaymentHealth, {
  label: string;
  colorClass: string;
  bgClass: string;
  dotClass: string;
}> = {
  reliable: {
    label: 'Reliable Payer',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-100',
    dotClass: 'bg-green-500',
  },
  partial: {
    label: 'Partial Payer',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
    dotClass: 'bg-amber-500',
  },
  defaulted: {
    label: 'Has Defaulted',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-100',
    dotClass: 'bg-red-500',
  },
};
