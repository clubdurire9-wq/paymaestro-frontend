'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

// Routes accessibles sans onboarding complet
const PUBLIC_ROUTES = ['/login', '/verify-phone', '/kyc', '/'];
const LOCALE_PREFIX = /^\/(fr|en)/;

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { status, loading } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !status) return;

    // Extraire la route sans le préfixe de locale
    const route = pathname.replace(LOCALE_PREFIX, '') || '/';

    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
    if (!status.isAuthenticated && !PUBLIC_ROUTES.includes(route) && route !== '/') {
      router.replace('/fr/login');
      return;
    }

    // Si authentifié mais onboarding incomplet
    if (status.isAuthenticated && !status.canAccessDashboard) {
      // Routes protégées (dashboard, withdraw, history, profile)
      const protectedRoutes = ['/dashboard', '/withdraw', '/history', '/profile', '/admin'];
      
      if (protectedRoutes.some(r => route.startsWith(r))) {
        // Rediriger vers l'étape suivante
        router.replace(`/fr/${status.nextStep}`);
        return;
      }
    }

    // Si onboarding complet et sur login/verify-phone/kyc → rediriger vers dashboard
    if (status.canAccessDashboard && ['/login', '/verify-phone', '/kyc'].includes(route)) {
      router.replace('/fr/dashboard');
    }
  }, [status, loading, pathname, router]);

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