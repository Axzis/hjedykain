
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InvoicePreview from '@/components/cashier/invoice-preview';

// This component now wraps the client component and provides the search params.
function AdminInvoicePageContent() {
    const searchParams = useSearchParams();
    const saleId = searchParams.get('saleId');

    if (!saleId) {
         return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">Please provide a Sale ID to view an invoice.</h2>
            </div>
        );
    }
    
    return <InvoicePreview saleId={saleId} />;
}


export default function AdminInvoicePage() {
    return (
        <Suspense fallback={<div>Loading invoice...</div>}>
            <AdminInvoicePageContent />
        </Suspense>
    );
}
