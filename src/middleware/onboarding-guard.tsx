'use client';

import { useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { AuthContext } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/login', '/login/password', '/login/2fa', '/login/location', '/', '/terms', '/privacy', '/refund', '/auth/google/callback', '/contact', '/docs', '/bot-fight'];
const LOCALE_PREFIX = /^\/(fr|en)/;

// Routes sensibles nécessitant un KYC valide
const SENSITIVE_ROUTES = [
  '/wallet', '/withdraw', '/paypal', '/history', '/cards', '/crypto',
  '/bank', '/referral', '/payment-page', '/developer', '/admin',
  '/dashboard', '/iban', '/pricing', '/privacy',
  '/terms', '/white-label',
];

function getRemainingKYCAttempts(user: any): number {
  return typeof (user as any)?.kycRemainingAttempts === 'number' ? (user as any).kycRemainingAttempts : 3;
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const route = pathname.replace(LOCALE_PREFIX, '') || '/';
  const isPublicRoute = PUBLIC_ROUTES.includes(route) || route.startsWith('/docs/');

  if (isPublicRoute) {
    return <PublicRouteGuard route={route}>{children}</PublicRouteGuard>;
  }

  return <ProtectedRouteGuard route={route}>{children}</ProtectedRouteGuard>;
}

function PublicRouteGuard({ children, route }: { children: React.ReactNode; route: string }) {
  const { user } = useContext(AuthContext);
  const { status, loading } = useOnboarding();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (loading || !status) return;
    if (status.canAccessDashboard && route === '/login') {
      router.replace(`/${locale}/dashboard`);
    }
  }, [status, loading, locale, router, route]);

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRouteGuard({ children, route }: { children: React.ReactNode; route: string }) {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { status, loading } = useOnboarding();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || loading || !status) return;

    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }

    if (user && !status.canAccessDashboard) {
      const protectedRoutes = ['/dashboard', '/withdraw', '/history', '/admin'];
      if (protectedRoutes.some(r => route.startsWith(r))) {
        router.replace(`/${locale}/${status.nextStep}`);
        return;
      }
    }

    if (
      user &&
      status.kycStatus === 'REJECTED' &&
      getRemainingKYCAttempts(user) === 0 &&
      SENSITIVE_ROUTES.some(r => route.startsWith(r))
    ) {
      router.replace(`/${locale}/kyc`);
      return;
    }
  }, [user, authLoading, status, loading, locale, router, route]);

  if (authLoading || loading || !status) {
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