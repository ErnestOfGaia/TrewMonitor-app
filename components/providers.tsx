'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState, useEffect } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green animate-pulse">Initializing...</div>
      </div>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}
