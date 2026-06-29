'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

// Routes accessibles sans onboarding complet
const PUBLIC_ROUTES = ['/login', '/login/password', '/login/2fa', '/login/location', '/onboarding', '/onboarding/password', '/kyc', '/'];
const LOCALE_PREFIX = /^\/(fr|en)/;

// Routes sensibles nécessitant un KYC valide
const SENSITIVE_ROUTES = [
  '/wallet', '/withdraw', '/history', '/cards', '/crypto',
  '/bank', '/referral', '/payment-page', '/developer', '/admin',
  '/profile', '/dashboard',
];

function getRemainingKYCAttempts(): number {
  if (typeof window === 'undefined') return 3;
  const stored = localStorage.getItem('paymaestro_kyc_attempts');
  const used = stored ? parseInt(stored, 10) : 0;
  return Math.max(0, 3 - used);
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { status, loading } = useOnboarding();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !status) return;

    // Extraire la route sans le préfixe de locale
    const route = pathname.replace(LOCALE_PREFIX, '') || '/';

    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
    if (!status.isAuthenticated && !PUBLIC_ROUTES.includes(route) && route !== '/') {
      router.replace(`/${locale}/login`);
      return;
    }

    // Si authentifié mais onboarding incomplet
    if (status.isAuthenticated && !status.canAccessDashboard) {
      // Routes protégées (dashboard, withdraw, history, profile)
      const protectedRoutes = ['/dashboard', '/withdraw', '/history', '/profile', '/admin'];
      
      if (protectedRoutes.some(r => route.startsWith(r))) {
        // Rediriger vers l'étape suivante
        router.replace(`/${locale}/${status.nextStep}`);
        return;
      }
    }

    // Blocage définitif si KYC rejeté ET tentatives épuisées
    if (
      status.isAuthenticated &&
      status.kycStatus === 'REJECTED' &&
      getRemainingKYCAttempts() === 0 &&
      SENSITIVE_ROUTES.some(r => route.startsWith(r))
    ) {
      router.replace(`/${locale}/kyc`);
      return;
    }

    // Si onboarding complet et sur login → rediriger vers dashboard
    if (status.canAccessDashboard && route === '/login') {
      router.replace(`/${locale}/dashboard`);
    }
  }, [status, loading, pathname, locale, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}