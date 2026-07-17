'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getTokenFromStorage, removeUserFromStorage } from '@/hooks/useAuth';
import { useLocale } from 'next-intl';

const LOCK_TIMEOUT = 15 * 60 * 1000;
const LOGOUT_TIMEOUT = 30 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';

interface ActivityState {
  isLocked: boolean;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
  unlockError: string;
  lastActivity: number;
}

const defaultActivity: ActivityState = {
  isLocked: false,
  lock: () => {},
  unlock: async () => false,
  unlockError: '',
  lastActivity: Date.now(),
};

const ActivityContext = createContext<ActivityState>(defaultActivity);

export function useActivity(): ActivityState {
  return useContext(ActivityContext);
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locale = useLocale();

  const forceLogout = useCallback(() => {
    sessionStorage.clear();
    removeUserFromStorage();
    window.location.href = `/${locale}/login?reason=timeout`;
  }, [locale]);

  const resetTimers = useCallback(() => {
    setLastActivity(Date.now());
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    lockTimerRef.current = setTimeout(() => {
      const token = getTokenFromStorage();
      if (token) {
        setIsLocked(true);
        // Démarrer le timer de déconnexion (palier 2)
        logoutTimerRef.current = setTimeout(() => {
          forceLogout();
        }, LOGOUT_TIMEOUT - LOCK_TIMEOUT);
      }
    }, LOCK_TIMEOUT);
  }, [forceLogout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll', 'click'];
    const handler = () => { if (!isLocked) resetTimers(); };
    events.forEach(ev => window.addEventListener(ev, handler, { passive: true }));
    resetTimers();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handler));
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [resetTimers, isLocked]);

  const lock = useCallback(() => {
    setIsLocked(true);
    logoutTimerRef.current = setTimeout(() => {
      forceLogout();
    }, LOGOUT_TIMEOUT - LOCK_TIMEOUT);
  }, [forceLogout]);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const token = getTokenFromStorage();
      if (!token) { setUnlockError('Session expirée'); return false; }

      const res = await fetch(`${API_URL}/auth/unlock-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsLocked(false);
        setUnlockError('');
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        resetTimers();
        return true;
      }

      setUnlockError(data.error || 'Mot de passe incorrect');
      return false;
    } catch {
      setUnlockError('Mot de passe incorrect');
      return false;
    }
  }, [resetTimers]);

  return (
    <ActivityContext.Provider value={{ isLocked, lock, unlock, unlockError, lastActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}
