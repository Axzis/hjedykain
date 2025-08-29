
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const pathname = usePathname();
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://placehold.co/600x400.png';

  const productPath = pathname.includes('/admin') 
    ? `/admin/browse/${product.id}` 
    : pathname.includes('/cashier')
    ? `/cashier/browse/${product.id}`
    : `/browse/${product.id}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={productPath} className="block aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint="fabric swatch"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="font-headline text-lg">
          <Link href={productPath} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="mt-2 text-xl font-semibold text-foreground">
          Rp{product.price.toLocaleString('id-ID')}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="outline">
          <Link href={productPath}>
            View Details
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
