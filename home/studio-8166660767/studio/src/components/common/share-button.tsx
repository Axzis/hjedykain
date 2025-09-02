
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShareButton({ productId }: { productId: string }) {
  const { toast } = useToast();
  const [productUrl, setProductUrl] = useState('');
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    // This ensures window is defined, preventing SSR errors.
    setProductUrl(`${window.location.origin}/products/${productId}`);
    setInIframe(window.self !== window.top);
  }, [productId]);


  const handleShare = async () => {
    const shareData = {
      title: 'Check out this fabric!',
      text: `I found this amazing fabric at AZ - Pos.`,
      url: productUrl,
    };

    const copyToClipboard = async () => {
       try {
        await navigator.clipboard.writeText(productUrl);
        toast({
          title: 'Link Copied!',
          description: 'Product link copied to your clipboard.',
        });
      } catch (err) {
        toast({
          title: 'Failed to Copy',
          description: 'Could not copy link to clipboard.',
          variant: 'destructive',
        });
      }
    }

    if (navigator.share && !inIframe) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
        // If share fails, it might be due to transient permission issues,
        // so we can fall back to clipboard as a last resort.
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support the Web Share API or when in an iframe
      copyToClipboard();
    }
  };

  if (!productUrl) return null;

  return (
    <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share Product">
      <Share2 />
    </Button>
  );
}
