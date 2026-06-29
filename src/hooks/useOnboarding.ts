'use client';

import { useState, useEffect, useCallback } from 'react';

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
    try {
      const token = sessionStorage.getItem('paymaestro_token');
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

      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
      console.log('🔍 DEBUG useOnboarding — URL:', `${API_URL}/auth/onboarding-status`);
      console.log('🔍 DEBUG useOnboarding — token:', token ? token.slice(0, 30) + '...' : 'MANQUANT');
      const res = await fetch(`${API_URL}/auth/onboarding-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('🔍 DEBUG useOnboarding — res.status:', res.status);
      const data = await res.json();
      console.log('🔍 DEBUG useOnboarding — data reçue:', JSON.stringify(data).slice(0, 200));
      setStatus(data.data);
    } catch (err) {
      console.error('🔍 DEBUG useOnboarding — ERREUR fetch:', err);
      setStatus({
        isAuthenticated: false,
        isPhoneVerified: false,
        kycStatus: 'NONE',
        canAccessDashboard: false,
        nextStep: 'login',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refresh: fetchStatus };
}