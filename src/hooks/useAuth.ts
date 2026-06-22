'use client';

import { createContext, useContext } from 'react';

// ==========================================
// USER TYPES
// ==========================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  googleId?: string;
  joinedAt: string;
  kycStatus?: 'NONE' | 'PENDING_AI' | 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED';
  // Onboarding fields
  is_onboarded?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  firstName?: string;
  lastName?: string;
  postName?: string;
  country?: string;
  city?: string;
  idDocumentUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  loginMock: () => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

// ==========================================
// DEFAULT AUTH CONTEXT
// ==========================================

export const defaultAuthState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginMock: () => {},
  logout: () => {},
  updateUser: () => {},
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

// ==========================================
// AUTH HOOK
// ==========================================

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

// ==========================================
// LOCALSTORAGE HELPERS
// ==========================================

export const AUTH_STORAGE_KEY = 'pm_auth_user';

export function saveUserToStorage(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

export function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function removeUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// ==========================================
// MOCK USER (for demo without real Google OAuth)
// ==========================================

export const MOCK_USER: AuthUser = {
  id: 'mock-user-001',
  name: 'Utilisateur Démo',
  email: 'demo@paymaestro.com',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
  googleId: 'mock-google-id',
  joinedAt: new Date('2026-01-15').toISOString(),
  kycStatus: 'NONE',
  is_onboarded: false,
};

// ==========================================
// DECODE GOOGLE JWT (client-side only)
// ==========================================

export function decodeGoogleJwt(credential: string): Record<string, any> | null {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
