'use client';

import { cn } from '@/lib';

export default function Loading({ 
  size = 'md', 
  className,
  fullScreen = false 
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm z-50">
        <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-brand-red', sizes[size], className)} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-brand-red', sizes[size])} />
    </div>
  );
}

// Skeleton Component for loading states
export function Skeleton({ 
  className,
  variant = 'text' 
}) {
  const variants = {
    text: 'skeleton-text',
    avatar: 'skeleton-avatar',
    image: 'skeleton-image',
    title: 'skeleton-title',
    button: 'h-10 w-24',
  };

  return (
    <div className={cn('skeleton', variants[variant], className)} />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="card p-0">
      <Skeleton variant="image" className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" />
        <Skeleton className="w-1/2" />
        <Skeleton className="w-1/3" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr className="border-b border-gray-100 dark:border-dark-600">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton />
        </td>
      ))}
    </tr>
  );
}