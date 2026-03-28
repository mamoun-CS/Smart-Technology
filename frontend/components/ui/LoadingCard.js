'use client';

import { cn } from '@/lib';

// Loading Card Component for page transitions
export default function LoadingCard({ 
  className,
  variant = 'default'
}) {
  const variants = {
    default: (
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="skeleton-avatar" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-title" />
            <div className="skeleton-text w-2/3" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton-text" />
          <div className="skeleton-text w-5/6" />
          <div className="skeleton-text w-4/6" />
        </div>
      </div>
    ),
    product: (
      <div className="card p-0">
        <div className="skeleton-image aspect-square" />
        <div className="p-4 space-y-3">
          <div className="skeleton-title" />
          <div className="skeleton-text w-1/2" />
          <div className="skeleton-text w-1/3" />
        </div>
      </div>
    ),
    table: (
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton-title w-1/4" />
          <div className="skeleton h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-dark-600">
              <div className="skeleton-avatar" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-text w-1/3" />
                <div className="skeleton-text w-1/4" />
              </div>
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    ),
    form: (
      <div className="card p-6 space-y-6">
        <div className="skeleton-title w-1/3" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="skeleton-text w-1/4" />
            <div className="skeleton h-12 w-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton-text w-1/4" />
            <div className="skeleton h-12 w-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton-text w-1/4" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-24" />
        </div>
      </div>
    ),
    stats: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton-avatar" />
              <div className="skeleton h-6 w-16" />
            </div>
            <div className="skeleton-title w-1/2" />
            <div className="skeleton-text w-2/3" />
          </div>
        ))}
      </div>
    ),
    grid: (
      <div className="grid-products">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card p-0">
            <div className="skeleton-image aspect-square" />
            <div className="p-4 space-y-3">
              <div className="skeleton-title" />
              <div className="skeleton-text w-1/2" />
              <div className="skeleton-text w-1/3" />
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className={cn('animate-fadeIn', className)}>
      {variants[variant]}
    </div>
  );
}

// Page Loading Component - shows multiple loading cards
export function PageLoading({ 
  variant = 'default',
  count = 3,
  className 
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} variant={variant} />
      ))}
    </div>
  );
}

// Navigation Loading Overlay
export function NavigationLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-red" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
      </div>
    </div>
  );
}
