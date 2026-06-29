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
  loginMock: () => {},
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
  
  if (!context) {
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
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
    }
  }
}

export function saveTokenToStorage(token: string): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }
}

export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}

export function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    
    const user = JSON.parse(raw) as AuthUser;
    
    if (!user.id || !user.email) {
      console.warn('Données utilisateur invalides dans le stockage');
      removeUserFromStorage();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    removeUserFromStorage();
    return null;
  }
}

export function removeUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
    }
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
    const parts = credential.split('.');
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
      console.warn('Token JWT expiré');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

// ==========================================
// TOKEN VALIDATION
// ==========================================

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeGoogleJwt(token);
    if (!payload || !payload.exp) return true;
    
    // Ajouter une marge de 5 minutes
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const margin = 5 * 60 * 1000; // 5 minutes
    
    return currentTime >= (expirationTime - margin);
  } catch {
    return true;
  }
}

// ==========================================
// API CLIENT CONFIG
// ==========================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
      body: JSON.stringify({ accessToken }),
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
    
    // Sauvegarder aussi en session pour plus de sécurité
    saveUserToStorage(user);

    // Appeler le callback de succès
    onSuccess(user, token);
    
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
    
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
    const decodedCredential = decodeGoogleJwt(response.credential);
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
    
    // Sauvegarder aussi en session
    saveUserToStorage(user);

    // Appeler le callback de succès
    onSuccess(user, token);
    
  } catch (error) {
    console.error('Erreur Google One Tap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
    
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

export function checkAuthState(): { user: AuthUser | null; token: string | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  
  const token = getTokenFromStorage();
  const user = getUserFromStorage();
  
  // Vérifier si le token est expiré
  if (token && isTokenExpired(token)) {
    console.warn('Token expiré, déconnexion...');
    removeUserFromStorage();
    return { user: null, token: null, isAuthenticated: false };
  }
  
  return {
    user,
    token,
    isAuthenticated: !!(token && user),
  };
}