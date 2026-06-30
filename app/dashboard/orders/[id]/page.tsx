import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function OrderPlaceholder() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full text-left">
      <PageHeader 
        title="Order Detail" 
        action={
          <Link href="/dashboard/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        } 
      />
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        Order Detail Placeholder
      </div>
    </div>
  );
}
