'use client';

import { useHydration } from '@/hooks/useHydration';

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return null;
  }

  return <div className="hidden lg:block">{children}</div>;
}