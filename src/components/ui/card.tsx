'use client';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800/60 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50
        ${hoverable ? 'hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700/50 hover:dark:bg-slate-700/40 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 ${className}`}>{children}</div>;
}
