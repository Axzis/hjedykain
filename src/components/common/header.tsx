'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const isAdminOrCashierPath = pathname.startsWith('/admin') || pathname.startsWith('/cashier');

  if (isAdminOrCashierPath) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <User className="mr-2" />
                Login
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
