'use client';

import { usePathname } from 'next/navigation';

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Se for a tela de editor (ex: /editor/123), não limitamos o tamanho
  const isEditor = pathname?.startsWith('/editor') || pathname?.includes('/edit');

  return (
    <header className={`sticky top-4 z-30 mx-auto w-full px-4 sm:px-6 lg:px-8 ${isEditor ? '' : 'max-w-7xl'}`}>
      {children}
    </header>
  );
}
