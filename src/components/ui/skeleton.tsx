// src/components/ui/skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl h-32 w-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-3">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" height={32} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-gray-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / cols}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="text" width={`${100 / cols}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}