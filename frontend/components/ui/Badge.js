'use client';

import { cn } from '../../lib/utils';

export default function Badge({ 
  children, 
  variant = 'default',
  className 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-gray-200',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    primary: 'badge-primary',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}