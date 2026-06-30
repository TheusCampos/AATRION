'use client';

import { usePathname } from 'next/navigation';

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith('/editor') || pathname?.includes('/edit');

  return (
    <header className={`sticky top-4 z-30 mx-auto w-full px-4 sm:px-6 lg:px-8 ${isEditor ? '' : 'max-w-7xl'}`}>
      {children}
    </header>
  );
}
