'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  className,
  containerClassName,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'input',
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
const Textarea = forwardRef(({
  label,
  error,
  className,
  containerClassName,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'input resize-none',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'select',
          error && 'input-error',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component
const Checkbox = forwardRef(({
  label,
  error,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('flex items-center gap-2', containerClassName)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'w-4 h-4 rounded border-gray-300 dark:border-dark-500 text-brand-red focus:ring-brand-red',
          className
        )}
        {...props}
      />
      {label && (
        <label className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Input, Textarea, Select, Checkbox };
export default Input;