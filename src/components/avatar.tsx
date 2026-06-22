// src/components/ui/avatar.tsx
import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({ src, alt = '', fallback, size = 'md', className = '' }: AvatarProps) {
  const initials = fallback
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full bg-violet-100 text-violet-600 font-semibold
        ${sizes[size]} ${className}
      `}
    >
      {initials || '?'}
    </div>
  );
}