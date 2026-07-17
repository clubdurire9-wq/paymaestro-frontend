'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export interface TurnstileRef {
  execute: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        appearance?: 'always' | 'execute' | 'interaction-only';
      }) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({ onVerify, onExpire }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      execute: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.execute(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey || !containerRef.current) return;

      const renderWidget = () => {
        if (!window.turnstile || !containerRef.current) return;
        if (widgetIdRef.current) {
          try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'expired-callback': onExpire,
          theme: 'dark',
          appearance: 'execute',
        });
      };

      if (!window.turnstile) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        renderWidget();
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        }
      };
    }, [onVerify, onExpire]);

    return <div ref={containerRef} />;
  }
);

Turnstile.displayName = 'Turnstile';
export default Turnstile;
