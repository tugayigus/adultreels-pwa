'use client';

import { useViewportHeight } from '@/hooks/useViewportHeight';
import { ReactNode } from 'react';

interface ViewportHeightProviderProps {
  children: ReactNode;
}

export function ViewportHeightProvider({ children }: ViewportHeightProviderProps) {
  useViewportHeight();
  return <>{children}</>;
}