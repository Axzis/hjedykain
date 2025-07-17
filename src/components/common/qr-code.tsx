'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { QrCode as QrCodeIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function QrCode({ productId }: { productId: string }) {
  const [productUrl, setProductUrl] = useState('');

  useEffect(() => {
    // This ensures window is defined, preventing SSR errors.
    setProductUrl(window.location.href);
  }, [productId]);

  if (!productUrl) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    productUrl
  )}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Show QR Code">
          <QrCodeIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="p-4 text-center">
            <h4 className="font-medium leading-none font-headline mb-2">Scan to Share</h4>
            <p className="text-sm text-muted-foreground mb-4">Point your camera at the code to open this page on another device.</p>
            <div className="flex justify-center">
                <Image src={qrCodeUrl} alt="Product QR Code" width={150} height={150} />
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
