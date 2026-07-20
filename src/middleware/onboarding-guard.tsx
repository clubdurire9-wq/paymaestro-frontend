'use client';

import { useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { AuthContext } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { checkAuthState } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = [
  '/login',
  '/login/password',
  '/login/2fa',
  '/login/location',
  '/',
  '/terms',
  '/privacy',
  '/refund',
  '/auth/google/callback',
  '/contact',
  '/docs',
  '/bot-fight',
];
const LOCALE_PREFIX = /^\/(fr|en)/;

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
  const router = useRouter();
  const locale = useLocale();
  const { status, loading: onboardingLoading } = useOnboarding();

  const auth = checkAuthState();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;

  useEffect(() => {
    if (onboardingLoading || !status) return;

    if (!isAuthenticated || !user) {
      router.replace(`/${locale}/bot-fight`);
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
      (route === '/wallet' || route === '/withdraw' || route === '/history' || route === '/admin')
    ) {
      router.replace(`/${locale}/kyc`);
      return;
    }
  }, [isAuthenticated, user, onboardingLoading, status, locale, router, route]);

  if (onboardingLoading || !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return <>{children}</>;
}
