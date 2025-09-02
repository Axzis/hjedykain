
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/browse');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading Store...</p>
    </div>
  );
}
