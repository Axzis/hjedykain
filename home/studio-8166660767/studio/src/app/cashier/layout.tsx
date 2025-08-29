
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingCart, History, Contact, Search } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useMemo } from 'react';

const getTitleFromPathname = (pathname: string): string => {
    if (pathname === '/cashier' || pathname.startsWith('/cashier/new-sale')) return 'New Sale';
    if (pathname.startsWith('/cashier/browse')) return 'Browse Catalog';
    if (pathname.startsWith('/cashier/members')) return 'Manage Members';
    if (pathname.startsWith('/cashier/history')) return 'Sales History';
    if (pathname.startsWith('/cashier/invoice')) return 'Invoice Detail';
    return 'Cashier POS';
};


export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const headerTitle = useMemo(() => getTitleFromPathname(pathname), [pathname]);


  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo href="/cashier" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/cashier' || pathname.startsWith('/cashier/new-sale')}>
                <Link href="/cashier">
                  <ShoppingCart />
                  <span>New Sale</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/cashier/browse')}>
                <Link href="/cashier/browse">
                  <Search />
                  <span>Browse Catalog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/members')}>
                <Link href="/admin/members">
                  <Contact />
                  <span>Members</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/cashier/history')}>
                <Link href="/cashier/history">
                  <History />
                  <span>Sales History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link href="/login">
              <LogOut />
              <span className="group-data-[state=collapsed]:hidden">Logout</span>
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1">
                <h1 className="text-lg font-semibold font-headline">{headerTitle}</h1>
            </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
