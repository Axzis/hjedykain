
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a simplified check. In a real app, you'd use a proper auth state.
function getRoleFromLocalStorage() {
  // This is a mock function. A real app would have a more secure way 
  // to determine the user's role and logged-in state.
  return null; 
}

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // This page is now primarily for unauthenticated users.
    // If we could detect a logged-in user, we could redirect them.
    // For now, we'll just show the catalog. To improve, we'd need auth state.
    router.replace('/browse');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading Store...</p>
    </div>
  );
}
