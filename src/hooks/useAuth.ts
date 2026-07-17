'use client';

import { createContext, useContext } from 'react';
import { setMemoryToken, getMemoryToken } from '@/lib/api';
import { logger } from '@/lib/logger';

// ==========================================
// USER TYPES
// ==========================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: 'USER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  googleId?: string;
  joinedAt: string;
  kycStatus?: 'NONE' | 'PENDING_AI' | 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED';
  kycRemainingAttempts?: number;
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
  loginReal: (user: AuthUser) => void;
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
  loginReal: () => {},
  logout: () => {},
  updateUser: () => {},
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

// ==========================================
// AUTH HOOK
// ==========================================

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  
  if (context === defaultAuthState) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}

// ==========================================
// SESSION STORAGE (tab-scoped — pas de persistance cross-tab)
// ==========================================

export const AUTH_STORAGE_KEY = 'pm_auth_user';
export const TOKEN_STORAGE_KEY = 'paymaestro_token';

export function saveUserToStorage(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
    }
  }
}

export function saveTokenToStorage(token: string): void {
  setMemoryToken(token);
}

export function getTokenFromStorage(): string | null {
  return getMemoryToken();
}

export function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    
    const user = JSON.parse(raw) as AuthUser;
    
    if (!user.id || !user.email) {
      logger.warn('Données utilisateur invalides dans le stockage');
      removeUserFromStorage();
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
    removeUserFromStorage();
    return null;
  }
}

export function removeUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      logger.error('Erreur lors de la suppression des données:', error);
    }
  }
  setMemoryToken(null);
}

// ==========================================
// DECODE GOOGLE JWT (client-side only)
// ==========================================

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Format JWT invalide');
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Vérifier l'expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logger.warn('Token JWT expiré');
      return null;
    }
    
    return payload;
  } catch (error) {
    logger.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

// ==========================================
// TOKEN VALIDATION
// ==========================================

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return false;
    
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const margin = 5 * 60 * 1000; // 5 minutes
    
    return currentTime >= (expirationTime - margin);
  } catch {
    return false;
  }
}

// ==========================================
// API CLIENT CONFIG
// ==========================================

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1').replace(/\/$/, '');

interface ApiResponse {
  token?: string;
  user?: AuthUser;
  data?: {
    token?: string;
    user?: AuthUser;
  };
  error?: string;
  message?: string;
}

// ==========================================
// GOOGLE AUTH HANDLER (à utiliser dans ton composant)
// ==========================================

export async function handleGoogleAuthSuccess(
  accessToken: string,
  onSuccess: (user: AuthUser, token: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    // Validation de base
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Token d\'accès invalide');
    }

    // Envoyer le access_token au backend
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, turnstileToken: sessionStorage.getItem('pm_turnstile_token') || undefined }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || `Erreur ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data: ApiResponse = await response.json();
    
    // Gérer différentes structures de réponse possibles
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (!token || !user) {
      throw new Error('Réponse invalide du serveur : token ou utilisateur manquant');
    }

    // Validation des données utilisateur
    if (!user.id || !user.email) {
      throw new Error('Données utilisateur invalides reçues du serveur');
    }

    // Sauvegarder les données
    saveTokenToStorage(token);
    saveUserToStorage(user);

    // Appeler le callback de succès
    onSuccess(user, token);
    
  } catch (error) {
    logger.error('Erreur lors de l\'authentification Google:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    if (onError) {
      onError(errorMessage);
    } else {
      throw error;
    }
  }
}

// ==========================================
// GOOGLE ONE TAP RESPONSE HANDLER
// Pour utilisation avec @react-oauth/google
// ==========================================

export interface GoogleOneTapResponse {
  credential: string;
  clientId?: string;
  select_by?: string;
}

export async function handleGoogleOneTapResponse(
  response: GoogleOneTapResponse,
  onSuccess: (user: AuthUser, token: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    // Validation de base
    if (!response.credential || typeof response.credential !== 'string') {
      throw new Error('Credential Google invalide');
    }

    // Décoder le credential pour vérification locale
    const decodedCredential = decodeJwtPayload(response.credential);
    if (!decodedCredential) {
      throw new Error('Impossible de décoder le credential Google');
    }

    // Envoyer le credential Google au backend
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        credential: response.credential,
        clientId: response.clientId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || `Erreur ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    const data: ApiResponse = await res.json();

    // Extraire token et utilisateur de la réponse
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (!token || !user) {
      throw new Error('Réponse invalide du serveur : token ou utilisateur manquant');
    }

    // Validation des données utilisateur
    if (!user.id || !user.email) {
      throw new Error('Données utilisateur invalides reçues du serveur');
    }

    // Sauvegarder les données
    saveTokenToStorage(token);
    saveUserToStorage(user);

    // Appeler le callback de succès
    onSuccess(user, token);
    
  } catch (error) {
    logger.error('Erreur Google One Tap:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    if (onError) {
      onError(errorMessage);
    } else {
      throw error;
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function isUserOnboarded(user: AuthUser | null): boolean {
  return user?.is_onboarded === true;
}

export function isKYCApproved(user: AuthUser | null): boolean {
  return user?.kycStatus === 'APPROVED';
}

export function isKYCPending(user: AuthUser | null): boolean {
  return user?.kycStatus === 'PENDING_AI' || user?.kycStatus === 'PENDING_HUMAN';
}

export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Utilisateur';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  return user.name || user.email || 'Utilisateur';
}

// ==========================================
// AUTH STATE CHECKER
// ==========================================

export async function restoreSession(): Promise<{ user: AuthUser | null; token: string | null }> {
  try {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1').replace(/\/$/, '');
    const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (!res.ok) return { user: null, token: null };
    const data = await res.json();
    const user = data.user || data.data?.user;
    const token = data.token || data.data?.token;
    if (user && token) {
      setMemoryToken(token);
      return { user, token };
    }
    return { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function checkAuthState(): { user: AuthUser | null; token: string | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  
  const token = getTokenFromStorage();
  const user = getUserFromStorage();
  
  // Vérifier si le token est expiré
  if (token && isTokenExpired(token)) {
    logger.warn('Token expiré, déconnexion...');
    removeUserFromStorage();
    return { user: null, token: null, isAuthenticated: false };
  }
  
  return {
    user,
    token,
    isAuthenticated: !!(token && user),
  };
}