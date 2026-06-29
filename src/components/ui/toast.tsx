'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    wrapper: 'bg-emerald-950/95 border-emerald-700/50 shadow-emerald-900/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-50',
    bar: 'bg-emerald-500',
  },
  error: {
    wrapper: 'bg-red-950/95 border-red-700/50 shadow-red-900/30',
    icon: 'text-red-400',
    text: 'text-red-50',
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'bg-amber-950/95 border-amber-700/50 shadow-amber-900/30',
    icon: 'text-amber-400',
    text: 'text-amber-50',
    bar: 'bg-amber-500',
  },
  info: {
    wrapper: 'bg-slate-900/95 border-slate-700/50 shadow-slate-900/30',
    icon: 'text-violet-400',
    text: 'text-slate-50',
    bar: 'bg-violet-500',
  },
};

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const Icon = icons[type];
  const s = styles[type];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`
        relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl
        backdrop-blur-md
        ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-2 scale-95'}
        transition-all duration-300 ease-out
        ${s.wrapper}
      `}
      style={{ animation: isVisible ? 'toastIn 0.35s ease-out forwards' : 'toastOut 0.3s ease-in forwards' }}
    >
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} transition-all duration-100 ease-linear rounded-full`}
        style={{ width: `${progress}%` }}
      />

      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.icon}`} />
      <p className={`text-sm font-medium flex-1 leading-snug ${s.text}`}>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className={`shrink-0 hover:opacity-70 transition-opacity ${s.text}`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
