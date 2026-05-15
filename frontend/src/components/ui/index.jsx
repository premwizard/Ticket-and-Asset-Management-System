import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, ...props }) => (
  <div className={cn("card-saas p-6", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const variants = {
    primary: 'btn-saas-primary',
    secondary: 'btn-saas-secondary',
    outline: 'btn-saas-outline',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
    danger: 'bg-neutral-100 dark:bg-neutral-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={cn("btn-base", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
    success: 'bg-neutral-50 text-neutral-900 dark:bg-emerald-950/30 dark:text-emerald-400 border-neutral-200 dark:border-emerald-800/50',
    warning: 'bg-neutral-50 text-neutral-900 dark:bg-amber-950/30 dark:text-amber-400 border-neutral-200 dark:border-amber-800/50',
    danger:  'bg-neutral-50 text-neutral-900 dark:bg-red-950/30 dark:text-red-400 border-neutral-200 dark:border-red-800/50',
    info:    'bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700',
  };

  return (
    <span className={cn("badge-saas", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const Input = ({ className, ...props }) => (
  <input className={cn("input-saas", className)} {...props} />
);
