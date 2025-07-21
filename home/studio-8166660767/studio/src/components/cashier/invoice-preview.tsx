
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Sale, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer } from 'lucide-react';
import Logo from '@/components/common/logo';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemberForm } from '@/components/admin/member-form';


const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2 22l5.25-1.38c1.47.79 3.1 1.25 4.85 1.25 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"></path>
      <path d="M16.51 13.6c-.28-.14-1.65-.82-1.9-.91-.25-.09-.43-.14-.61.14-.18.28-.72.91-.88 1.1-.16.18-.32.2-.59.07-.28-.14-1.17-.43-2.23-1.38-.83-.72-1.38-1.62-1.54-1.89-.16-.28 0-.43.12-.57.13-.13.28-.32.43-.48.14-.16.19-.28.28-.46.09-.18.04-.32-.02-.46-.07-.14-.61-1.47-.83-2.01-.22-.54-.45-.46-.61-.46h-.53c-.18 0-.46.07-.7.35-.25.28-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.95 2.98 4.72 4.18.66.28 1.18.45 1.59.58.58.18 1.11.16 1.52.1.48-.07 1.65-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.12-.25-.18-.52-.32z"></path>
    </svg>
  );

interface InvoicePreviewProps {
    initialSale: Sale;
    initialMember: Member | null;
}

export default function InvoicePreview({ initialSale, initialMember }: InvoicePreviewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    const [sale, setSale] = useState(initialSale);
    const [member, setMember] = useState(initialMember);

    const [isRegisterMemberDialogOpen, setIsRegisterMemberDialogOpen] = useState(false);
    
    const isUserAdmin = pathname.startsWith('/admin');
    const backPath = isUserAdmin ? '/admin/new-sale' : '/cashier';

    const handlePrint = () => {
        window.print();
    };

    const generateAndOpenWhatsAppUrl = (phoneNumber: string, currentSale: Sale) => {
        const itemsText = currentSale.items
          .map(
            (item) =>
              `- ${item.productName}: ${item.quantity} x Rp${item.price.toLocaleString('id-ID')} = Rp${(item.quantity * item.price).toLocaleString('id-ID')}`
          )
          .join('\n');
    
        const message = `
*Invoice from POS Edy Kain*
-------------------------
*Sale ID:* SALE-${currentSale.id.slice(-6).toUpperCase()}
*Date:* ${new Date(currentSale.date).toLocaleDateString('id-ID')}
*Cashier:* ${currentSale.cashierId}

*Items:*
${itemsText}

-------------------------
*Subtotal:* Rp${currentSale.subtotal.toLocaleString('id-ID')}
*Discount:* -Rp${(currentSale.discount ?? 0).toLocaleString('id-ID')}
*Total:* *Rp${currentSale.total.toLocaleString('id-ID')}*

Terima kasih atas kunjungan Anda!
        `;
    
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message.trim())}`;
        
        window.open(whatsappUrl, '_blank');
    }

    const handleShareWhatsApp = () => {
        if (!sale) return;

        if (member && member.phone) {
           generateAndOpenWhatsAppUrl(member.phone, sale);
        } else {
            setIsRegisterMemberDialogOpen(true);
        }
      };

    const handleMemberRegistered = async (newMember: Member) => {
        if (!sale) return;

        try {
            // Update the sale with the new member's info
            const saleRef = doc(db, 'sales', sale.id);
            await updateDoc(saleRef, {
                memberId: newMember.id,
                memberName: newMember.name
            });
            
            // Update local state
            setSale(prevSale => ({ ...prevSale, memberId: newMember.id, memberName: newMember.name }));
            setMember(newMember);

            // Close dialog
            setIsRegisterMemberDialogOpen(false);
            
            // Trigger WhatsApp share
            generateAndOpenWhatsAppUrl(newMember.phone, { ...sale, memberId: newMember.id, memberName: newMember.name });

        } catch (error) {
            console.error("Error updating sale with new member:", error);
            toast({
                title: "Error",
                description: "Could not link new member to the sale. Please try again.",
                variant: "destructive"
            });
        }
    }

    if (!sale) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">Invoice not found.</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <Dialog open={isRegisterMemberDialogOpen} onOpenChange={setIsRegisterMemberDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                    <DialogTitle className="font-headline">Register New Member</DialogTitle>
                    <DialogDescription>
                        To share the invoice via WhatsApp, please register the customer as a member first.
                    </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] p-4 -m-4">
                        <MemberForm onFormSubmit={handleMemberRegistered} />
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center mb-6 no-print">
                <Button variant="outline" onClick={() => router.push(backPath)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    New Sale
                </Button>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleShareWhatsApp}>
                        <WhatsAppIcon />
                        Share
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                 </div>
            </div>
            <div id="printable-invoice-wrapper">
                <Card id="printable-invoice" className="w-full">
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <Logo />
                            <CardDescription>123 Fabric Lane, Textile City, 45678</CardDescription>
                        </div>
                        <div className="text-right">
                            <CardTitle className="font-headline text-3xl">Invoice</CardTitle>
                            <p className="text-muted-foreground">#SALE-{sale.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <h3 className="font-semibold mb-1">Billed To</h3>
                                <p className="text-muted-foreground">{sale.memberName || 'Valued Customer'}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-semibold mb-1">Sale Date</h3>
                                <p className="text-muted-foreground">{new Date(sale.date).toLocaleDateString('id-ID')}</p>
                                <h3 className="font-semibold mb-1 mt-2">Cashier</h3>
                                <p className="text-muted-foreground">{sale.cashierId}</p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60%]">Item</TableHead>
                                    <TableHead className="text-center">Quantity (meters)</TableHead>
                                    <TableHead className="text-center">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items.map((item) => (
                                    <TableRow key={item.productId}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-center">Rp{item.price.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {sale.remark && (
                            <div className="mt-6 text-sm text-muted-foreground">
                                <h4 className="font-semibold text-foreground">Remark:</h4>
                                <p>{sale.remark}</p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>Rp{sale.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                {sale.discount && sale.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>-Rp{sale.discount.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t-2 pt-2 mt-2">
                                    <span>Total</span>
                                    <span>Rp{sale.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="text-center text-xs text-muted-foreground justify-center">
                        <p>Thank you for your business!</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
