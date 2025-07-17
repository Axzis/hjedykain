import Link from 'next/link';
import { Scissors } from 'lucide-react';

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="StitchPOS Home">
      <Scissors className="h-6 w-6 text-primary" />
      <span className="text-xl font-headline font-bold text-foreground">
        StitchPOS
      </span>
    </Link>
  );
}
