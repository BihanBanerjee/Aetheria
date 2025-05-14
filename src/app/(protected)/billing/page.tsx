// src/app/(protected)/billing/page.tsx
import { Suspense } from 'react';
import BillingContent from './BillingContent';

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-8 text-white">Loading billing information...</div>}>
      <BillingContent />
    </Suspense>
  );
}