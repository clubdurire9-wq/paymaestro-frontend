'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export type OnboardingStep = 'login' | 'verify-phone' | 'kyc' | 'dashboard';

interface OnboardingStatus {
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  kycStatus: string;
  canAccessDashboard: boolean;
  nextStep: OnboardingStep;
}

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    const token = sessionStorage.getItem('paymaestro_token');
    try {
      if (!token) {
        setStatus({
          isAuthenticated: false,
          isPhoneVerified: false,
          kycStatus: 'NONE',
          canAccessDashboard: false,
          nextStep: 'login',
        });
        setLoading(false);
        return;
      }

      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1').replace(/\/$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_URL}/auth/onboarding-status`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      setStatus(data.data);
    } catch (err) {
      // Si le token existe mais l'API est injoignable (Render cold start, timeout),
      // on ne présume pas que l'utilisateur peut accéder au dashboard.
      // Les pages individuelles vérifieront via /auth/me ou useAuth.
      if (token) {
        setStatus({
          isAuthenticated: true,
          isPhoneVerified: false,
          kycStatus: 'NONE',
          canAccessDashboard: false,
          nextStep: 'kyc',
        });
      } else {
        setStatus({
          isAuthenticated: false,
          isPhoneVerified: false,
          kycStatus: 'NONE',
          canAccessDashboard: false,
          nextStep: 'login',
        });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refresh: fetchStatus };
}