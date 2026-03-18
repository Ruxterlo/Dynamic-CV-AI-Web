'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalHomeButton() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <Link href="/" className="homeDockButton" aria-label="Go to Home page">
      Home
    </Link>
  );
}
