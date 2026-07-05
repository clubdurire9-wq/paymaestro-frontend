import React from 'react';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'violet';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const variants = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50',
  error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/50',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50',
  default: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600/50',
  violet: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700/50',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  removable = false,
  onRemove,
  onClick,
  className = '',
}: BadgeProps) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
      {removable && (
        <span
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Supprimer"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </Tag>
  );
}
