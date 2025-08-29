'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // State untuk mengontrol visibilitas sidebar
  // Tampil di dashboard, tersembunyi di halaman lain secara default
  const [isSidebarOpen, setIsSidebarOpen] = useState(pathname === '/admin');

  // Setiap kali path berubah, atur ulang status sidebar
  // Ini memastikan sidebar selalu terbuka di dashboard dan tertutup di tempat lain
  useEffect(() => {
    setIsSidebarOpen(pathname === '/admin');
  }, [pathname]);


  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <Sidebar>
        <SidebarHeader>
          <Logo href="/admin/browse" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                <Link href="/admin">
                  <Home />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/new-sale')}>
                <Link href="/admin/new-sale">
                  <ShoppingCart />
                  New Sale
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/browse')}>
                <Link href="/admin/browse">
                  <Search />
                  Browse Catalog
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')}>
                <Link href="/admin/products">
                  <Package />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/history')}>
                <Link href="/admin/history">
                  <History />
                  Sales History
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
                <Link href="/admin/users">
                  <Users />
                  Staff
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/members')}>
                <Link href="/admin/members">
                  <Contact />
                  Members
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                <Link href="/admin/settings">
                  <Cog />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <Button asChild variant="ghost">
            <Link href="/login">
              <LogOut className="mr-2" />
              Logout
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 sticky top-0 z-30">
            {/* Tombol trigger ini akan selalu ada untuk membuka/menutup sidebar */}
            <SidebarTrigger />
            <div className="flex-1">
                <h1 className="text-lg font-semibold font-headline">Admin Dashboard</h1>
            </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
