'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthContext,
  AuthUser,
  AuthState,
  saveUserToStorage,
  saveTokenToStorage,
  getUserFromStorage,
  removeUserFromStorage,
} from '@/hooks/useAuth';
import { api } from '@/lib/api';

// ==========================================
// PROVIDER PRINCIPAL (avec clé Google)
// ==========================================

function InnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      if (data.firstName || data.lastName) {
        const fn = data.firstName ?? prev.firstName ?? '';
        const pn = data.postName ?? prev.postName ?? '';
        const ln = data.lastName ?? prev.lastName ?? '';
        updated.name = [fn, pn, ln].filter(Boolean).join(' ');
      }
      saveUserToStorage(updated);
      return updated;
    });
  }, []);

  // Redirige vers Google OAuth (flux redirect, pas popup)
  const googleLogin = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const locale = (typeof window !== 'undefined' && window.location.pathname.split('/')[1]) || 'fr';
    const redirectUri = `${window.location.origin}/${locale}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'email profile',
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, []);

  const login = useCallback((): Promise<void> => {
    googleLogin();
    return Promise.resolve();
  }, [googleLogin]);

  const loginReal = useCallback((realUser: AuthUser) => {
    setUser(realUser);
    saveUserToStorage(realUser);
  }, []);

  const logout = useCallback(() => {
    removeUserFromStorage();
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginReal,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// PROVIDER PRINCIPAL
// ==========================================

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return <InnerAuthProvider>{children}</InnerAuthProvider>;
}

// ==========================================
// MOCK AUTH PROVIDER (sans clé Google)
// ==========================================

function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      if (data.firstName || data.lastName) {
        const fn = data.firstName ?? prev.firstName ?? '';
        const pn = data.postName ?? prev.postName ?? '';
        const ln = data.lastName ?? prev.lastName ?? '';
        updated.name = [fn, pn, ln].filter(Boolean).join(' ');
      }
      saveUserToStorage(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    removeUserFromStorage();
    setUser(null);
  }, []);

  const login = useCallback(async () => {
    alert('Configuration Google manquante. Contactez l\'administrateur.');
  }, []);

  const loginReal = useCallback(() => {}, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginReal,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
