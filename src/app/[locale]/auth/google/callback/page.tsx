'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, saveTokenToStorage } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

export default function GoogleCallbackPage() {
  const locale = useLocale();
  const router = useRouter();
  const { loginReal } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Google login cancelled or denied.');
      return;
    }

    if (!accessToken) {
      setError('No access token received from Google.');
      return;
    }

    (async () => {
      try {
        const res = await api.auth.google(accessToken);

        const loginToken = res?.loginToken;
        const status = res?.status;

        // Si un mot de passe est requis/setup, rediriger vers la page appropriée
        if (status === 'PASSWORD_SETUP_REQUIRED' || status === 'PASSWORD_REQUIRED') {
          sessionStorage.setItem('pm_login_token', loginToken || '');
          sessionStorage.setItem('pm_login_status', status);
          sessionStorage.setItem('pm_login_user', JSON.stringify(res?.user || {}));

          if (status === 'PASSWORD_SETUP_REQUIRED') {
            router.replace(`/${locale}/onboarding/password`);
          } else {
            router.replace(`/${locale}/login/password`);
          }
          return;
        }

        // Authentification complète
        if (res?.data?.user) {
          const u = res.data.user;
          const authUser = {
            id: u.id || 'google-user',
            name: u.name || u.email?.split('@')[0] || '',
            email: u.email,
            role: u.role || 'USER',
            avatar: u.avatar || u.picture || undefined,
            googleId: u.googleId || undefined,
            joinedAt: u.joinedAt || new Date().toISOString(),
            kycStatus: u.kycStatus || 'NONE',
            is_onboarded: u.is_onboarded ?? false,
            phone: u.phone || u.phoneNumber || undefined,
            phoneVerified: u.phoneVerified ?? u.isPhoneVerified ?? false,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            postName: u.postName || '',
            country: u.country || '',
            city: u.city || '',
          };
          const jwt = res.data.token;
          if (jwt) saveTokenToStorage(jwt);
          loginReal(authUser);

          // Enregistrer le code de parrainage si présent
          const refCode = sessionStorage.getItem('pm_referral_code');
          if (refCode && jwt) {
            api.referral.register(refCode).catch(() => {});
            sessionStorage.removeItem('pm_referral_code');
          }

          router.replace(`/${locale}/dashboard`);
          return;
        }

        // Fallback : utilisateur complet sans data.user
        setError('Unexpected server response. Contact support.');
      } catch (err: any) {
        logger.error('Erreur callback Google:', err);
        setError(err?.message || 'Google authentication error.');
      }
    })();
  }, [locale, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Connection Failed</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <a
            href={`/${locale}/login`}
            className="inline-block px-6 py-3 bg-violet-600 text-white rounded-2xl text-sm font-semibold hover:bg-violet-500 transition"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Verifying your Google account...</p>
      </div>
    </div>
  );
}
