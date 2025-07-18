

import { Suspense } from 'react';
import InvoicePreview from '@/components/cashier/invoice-preview';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Sale, Member } from '@/lib/types';
import { notFound } from 'next/navigation';

async function getInvoiceData(saleId: string): Promise<{ sale: Sale; member: Member | null }> {
    const saleDocRef = doc(db, 'sales', saleId);
    const saleDocSnap = await getDoc(saleDocRef);

    if (!saleDocSnap.exists()) {
        notFound();
    }

    const sale = { id: saleDocSnap.id, ...saleDocSnap.data() } as Sale;
    let member: Member | null = null;

    if (sale.memberId) {
        const memberDocRef = doc(db, 'members', sale.memberId);
        const memberDocSnap = await getDoc(memberDocRef);
        if (memberDocSnap.exists()) {
            member = { id: memberDocSnap.id, ...memberDocSnap.data() } as Member;
        }
    }

    return { sale, member };
}


export default async function AdminInvoicePage({ searchParams }: { searchParams: { saleId?: string }}) {
    const saleId = searchParams.saleId;

    if (!saleId) {
         return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">Please provide a Sale ID to view an invoice.</h2>
            </div>
        );
    }
    
    const data = await getInvoiceData(saleId);

    return (
        <Suspense fallback={<div>Loading invoice...</div>}>
            <InvoicePreview initialSale={data.sale} initialMember={data.member} />
        </Suspense>
    );
}
