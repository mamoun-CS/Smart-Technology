'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

export default function AuthProvider({ children }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}