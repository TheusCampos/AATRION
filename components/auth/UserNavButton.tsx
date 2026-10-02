'use client';

import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';

export function UserNavButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full bg-muted/60" />;
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonPopoverCard: 'shadow-2xl border border-border',
          userButtonAvatarBox: 'h-9 w-9 ring-1 ring-border',
        },
      }}
      showName={false}
    />
  );
}
