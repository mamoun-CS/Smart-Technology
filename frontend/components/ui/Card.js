'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Card = forwardRef(({
  children,
  className,
  hover = false,
  padding = 'md',
  ...props
}, ref) => {
  const paddingSizes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'card',
        hover && 'card-hover',
        paddingSizes[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header
const CardHeader = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 border-b border-gray-100 dark:border-dark-600', className)} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

// Card Body
const CardBody = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4', className)} {...props}>
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

// Card Footer
const CardFooter = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 border-t border-gray-100 dark:border-dark-600', className)} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
export default Card;