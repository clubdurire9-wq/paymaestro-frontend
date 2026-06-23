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
      const token = localStorage.getItem('paymaestro_token');
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

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${API_URL}/auth/onboarding-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStatus(data.data);
    } catch {
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