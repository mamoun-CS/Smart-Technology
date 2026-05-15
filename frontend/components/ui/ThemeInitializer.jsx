'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store';

export default function ThemeInitializer() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    if (initializeTheme) {
      initializeTheme();
    }
  }, [initializeTheme]);

  return null;
}
