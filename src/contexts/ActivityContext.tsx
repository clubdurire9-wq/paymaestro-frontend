'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getTokenFromStorage } from '@/hooks/useAuth';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const token = getTokenFromStorage();
      if (token) {
        setIsLocked(true);
      }
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll', 'click'];
    const handler = () => { if (!isLocked) resetTimer(); };
    events.forEach(ev => window.addEventListener(ev, handler, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, isLocked]);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const token = getTokenFromStorage();
      if (!token) { setUnlockError('Session expirée'); return false; }

      const res = await fetch(`${API_URL}/auth/step-up`, {
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
        resetTimer();
        return true;
      }

      setUnlockError(data.error || 'Mot de passe incorrect');
      return false;
    } catch {
      setUnlockError('Mot de passe incorrect');
      return false;
    }
  }, [resetTimer]);

  return (
    <ActivityContext.Provider value={{ isLocked, lock, unlock, unlockError, lastActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}
