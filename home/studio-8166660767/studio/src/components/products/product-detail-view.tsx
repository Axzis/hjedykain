'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import QrCode from '@/components/common/qr-code';
import ShareButton from '@/components/common/share-button';
import { Layers3, Ruler } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProductDetailView({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState<string>((product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/600x400.png');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border shadow-md mb-4">
            <Image
              src={selectedImage}
              alt={product.name}
              width={800}
              height={600}
              className="h-full w-full object-cover"
              data-ai-hint="fabric detail"
            />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                <button key={index} onClick={() => setSelectedImage(image)} className={cn("aspect-square overflow-hidden rounded-md border-2 transition-all", selectedImage === image ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/50')}>
                    <Image
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                    />
                </button>
                ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-headline font-bold leading-tight">{product.name}</h1>
          {product.category && <Badge variant="secondary" className="mt-2">{product.category}</Badge>}
          <Separator className="my-6" />
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          {product.properties && (
            <>
              <Separator className="my-6" />
              <p className="text-sm text-muted-foreground">{product.properties}</p>
            </>
          )}
          <Separator className="my-6" />
           <div className="grid grid-cols-2 gap-4 mb-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                    <Layers3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{product.stock}</div>
                    <p className="text-xs text-muted-foreground">{product.unitName || 'items'} available</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Price</CardTitle>
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Rp{product.price.toLocaleString('id-ID')}</div>
                    <p className="text-xs text-muted-foreground">per {product.unitName || 'item'}</p>
                </CardContent>
             </Card>
          </div>

          <div className="flex items-center space-x-4">
            <ShareButton productId={product.id} />
            <QrCode productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
