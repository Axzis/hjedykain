
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the public product catalog page.
  // This is a server-side redirect, which is faster than a client-side one.
  redirect('/browse');
}
