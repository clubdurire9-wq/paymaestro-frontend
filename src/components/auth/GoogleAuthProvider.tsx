'use client';

import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import {
  AuthContext,
  AuthUser,
  AuthState,
  MOCK_USER,
  saveUserToStorage,
  saveTokenToStorage,
  getUserFromStorage,
  removeUserFromStorage,
} from '@/hooks/useAuth';
import { api } from '@/lib/api';

// ==========================================
// INNER PROVIDER (a accès au hook Google)
// ==========================================

function InnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Référence vers le resolve de la Promise en attente lors du login Google
  const loginResolveRef = useRef<((u: AuthUser | null) => void) | null>(null);

  // Rehydrate depuis localStorage au montage
  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  // --- updateUser : met à jour les champs utilisateur (onboarding) ---
  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      // Update full name from onboarding fields if provided
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

  // --- Callback de succès Google OAuth ---
  const handleGoogleSuccess = useCallback(async (tokenResponse: { access_token: string }) => {
    setIsLoading(true);
    let authUser: AuthUser | null = null;

    // 1. Essayer le vrai backend PayMaestro
    try {
      const backendRes = await api.auth.google(tokenResponse.access_token);
      const backendStatus = backendRes?.status;
      const loginToken = backendRes?.loginToken;

      if (backendStatus === 'PASSWORD_SETUP_REQUIRED' || backendStatus === 'PASSWORD_REQUIRED') {
        sessionStorage.setItem('pm_login_token', loginToken || '');
        sessionStorage.setItem('pm_login_status', backendStatus);
        sessionStorage.setItem('pm_login_user', JSON.stringify(backendRes?.user || {}));
        setIsLoading(false);
        if (loginResolveRef.current) {
          loginResolveRef.current(null);
          loginResolveRef.current = null;
        }
        return;
      }

      if (backendRes?.data?.user) {
        const u = backendRes.data.user;
        authUser = {
          id: u.id || 'google-user',
          name: u.name || u.email?.split('@')[0] || '',
          email: u.email,
          avatar: u.avatar || u.picture || undefined,
          googleId: u.googleId || undefined,
          joinedAt: u.joinedAt || new Date().toISOString(),
          kycStatus: u.kycStatus || 'NONE',
          is_onboarded: u.is_onboarded ?? false,
          phone: u.phone || u.phoneNumber || undefined,
          phoneVerified: u.phoneVerified ?? u.isPhoneVerified ?? false,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          postName: u.postName || '',
          country: u.country || '',
          city: u.city || '',
        };
        const jwt = backendRes.data.token;
        if (jwt) {
          saveTokenToStorage(jwt);
        }
      }
    } catch (err) {
      console.warn('⚠️ Backend Google auth failed:', err);
    }

    // 2. Fallback : endpoint Google userinfo (si backend indisponible)
    if (!authUser) {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const existingUser = getUserFromStorage();
          const wasOnboarded = existingUser?.email === profile.email ? existingUser.is_onboarded : false;
          authUser = {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
            googleId: profile.sub,
            joinedAt: new Date().toISOString(),
            kycStatus: 'NONE',
            is_onboarded: wasOnboarded || false,
            firstName: profile.given_name || '',
            lastName: profile.family_name || '',
          };
        }
      } catch {
        console.warn('⚠️ Impossible de récupérer le profil Google');
      }
    }

    if (authUser) {
      setUser(authUser);
      saveUserToStorage(authUser);
    } else {
      console.warn('❌ Aucun utilisateur après Google auth');
    }
    setIsLoading(false);

    if (loginResolveRef.current) {
      loginResolveRef.current(authUser);
      loginResolveRef.current = null;
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    console.warn('Google login annulé ou échoué');
    setIsLoading(false);
    if (loginResolveRef.current) {
      loginResolveRef.current(null);
      loginResolveRef.current = null;
    }
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  // --- login() : déclenche la popup Google et retourne une Promise ---
  const login = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      loginResolveRef.current = () => resolve();
      googleLogin();
      // Sécurité : timeout 30s pour éviter le blocage infini
      setTimeout(() => {
        if (loginResolveRef.current) {
          console.warn('⏱️ Google OAuth timeout — déverrouillage');
          setIsLoading(false);
          loginResolveRef.current(null);
          loginResolveRef.current = null;
        }
      }, 30000);
    });
  }, [googleLogin]);

  // --- loginMock() : connexion instantanée (démo sans compte Google) ---
  const loginMock = useCallback(() => {
    const mockUser = { ...MOCK_USER, is_onboarded: false };
    setUser(mockUser);
    saveUserToStorage(mockUser);
    saveTokenToStorage('mock-token-paymaestro');
  }, []);

  // --- loginReal() : connexion réelle (après validation mot de passe/2FA) ---
  const loginReal = useCallback((realUser: AuthUser) => {
    setUser(realUser);
    saveUserToStorage(realUser);
  }, []);

  // --- logout() ---
  const logout = useCallback(() => {
    removeUserFromStorage();
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginMock,
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
    // Pas de clé → mode mock uniquement
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </GoogleOAuthProvider>
  );
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

  const loginMock = useCallback(() => {
    const mockUser = { ...MOCK_USER, is_onboarded: false };
    setUser(mockUser);
    saveUserToStorage(mockUser);
    saveTokenToStorage('mock-token-paymaestro');
  }, []);

  const logout = useCallback(() => {
    removeUserFromStorage();
    setUser(null);
  }, []);

  // Sans clé Google, login() = loginMock()
  const login = useCallback(async () => {
    loginMock();
  }, [loginMock]);

  const loginReal = useCallback(() => {}, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginMock,
    loginReal,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}