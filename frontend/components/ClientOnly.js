'use client';

import { useState, useEffect } from 'react';

/**
 * ClientOnly - A component that only renders its children on the client side.
 * Use this to wrap client-only content that shouldn't be rendered on the server
 * to prevent hydration mismatches.
 * 
 * @param {React.ReactNode} children - The content to render only on the client
 * @param {React.ReactNode} fallback - Optional fallback to show during SSR (defaults to nothing)
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}
