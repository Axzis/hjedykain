
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
import { Home, LogOut, Package, Users, Contact, History, ShoppingCart, Search, Cog } from 'lucide-react';
import Logo from '@/components/common/logo';
import { useMemo } from 'react';

const getTitleFromPathname = (pathname: string): string => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/new-sale')) return 'New Sale';
    if (pathname.startsWith('/admin/browse')) return 'Browse Catalog';
    if (pathname.startsWith('/admin/products')) return 'Manage Products';
    if (pathname.startsWith('/admin/history')) return 'Sales History';
    if (pathname.startsWith('/admin/invoice')) return 'Invoice Detail';
    if (pathname.startsWith('/admin/users')) return 'Manage Staff';
    if (pathname.startsWith('/admin/members')) return 'Manage Members';
    if (pathname.startsWith('/admin/settings')) return 'Master Settings';
    return 'Admin Dashboard';
};


export default function AdminLayout({
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
          <Logo href="/admin" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                <Link href="/admin">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/new-sale')}>
                <Link href="/admin/new-sale">
                  <ShoppingCart />
                  <span>New Sale</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/browse')}>
                <Link href="/admin/browse">
                  <Search />
                  <span>Browse Catalog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')}>
                <Link href="/admin/products">
                  <Package />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/history')}>
                <Link href="/admin/history">
                  <History />
                  <span>Sales History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
                <Link href="/admin/users">
                  <Users />
                  <span>Staff</span>
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
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                <Link href="/admin/settings">
                  <Cog />
                  <span>Settings</span>
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
