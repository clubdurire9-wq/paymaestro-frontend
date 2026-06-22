'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

/**
 * Onboarding guard hook.
 * - If user is authenticated but not onboarded → redirect to /onboarding/phone
 * - If user is not authenticated → redirect to /login
 * - Returns { allowed, isLoading } to let pages decide whether to render
 */
export function useOnboardingGuard(): { allowed: boolean; isLoading: boolean } {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated → redirect to login
    if (!isAuthenticated || !user) {
      router.replace(`/${locale}/login`);
      return;
    }

    // Authenticated but not onboarded → redirect to onboarding
    if (!user.is_onboarded) {
      // Don't redirect if already on an onboarding page
      const isOnboardingPage = pathname.includes('/onboarding');
      if (!isOnboardingPage) {
        // Check if phone is verified first
        if (user.phoneVerified) {
          router.replace(`/${locale}/onboarding/setup`);
        } else {
          router.replace(`/${locale}/onboarding/phone`);
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, locale, pathname]);

  if (isLoading) return { allowed: false, isLoading: true };
  if (!isAuthenticated) return { allowed: false, isLoading: false };
  if (!user?.is_onboarded) return { allowed: false, isLoading: false };

  return { allowed: true, isLoading: false };
}
