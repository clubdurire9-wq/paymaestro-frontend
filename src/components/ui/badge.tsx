// src/components/ui/badge.tsx
import React from 'react';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'violet';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
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
  className = '',
}: BadgeProps) {
  return (
    <span
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
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label="Supprimer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}