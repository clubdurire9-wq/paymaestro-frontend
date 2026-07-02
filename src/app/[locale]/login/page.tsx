'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, Zap, Globe2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const features = [
  { icon: Zap, label: 'Transfert en moins de 5 min' },
  { icon: Shield, label: 'Transactions 100% sécurisées' },
  { icon: Globe2, label: '54 pays africains supportés' },
  { icon: CheckCircle2, label: 'Taux de change en temps réel' },
];

export default function LoginPage() {
  const locale = useLocale();
  const { login, loginMock } = useAuth();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Déjà connecté → rediriger vers dashboard
  useEffect(() => {
    if (sessionStorage.getItem('paymaestro_token')) {
      window.location.href = `/${locale}/dashboard`;
    }
  }, [locale]);

  // Stocker le code de parrainage depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('pm_referral_code', ref);
    }
  }, []);

  // Vrai Google OAuth — ouvre la popup Google
  const handleGoogleLogin = async () => {
    if (!acceptedTerms) return;
    setIsGoogleLoading(true);
    try {
      await login();

      // Ne PAS remettre isGoogleLoading à false ici :
      // le composant sera démonté par la navigation, et le spinner
      // évite un flash visuel pendant la transition.

      // DEBUG
      const debugToken = sessionStorage.getItem('pm_login_token');
      const debugStatus = sessionStorage.getItem('pm_login_status');
      const debugUser = sessionStorage.getItem('pm_login_user');


      // Vérifier si une étape intermédiaire est requise
      const loginStatus = sessionStorage.getItem('pm_login_status');
      if (loginStatus === 'PASSWORD_SETUP_REQUIRED') {
        router.push(`/${locale}/onboarding/password`);
        return;
      }
      if (loginStatus === 'PASSWORD_REQUIRED') {
        router.push(`/${locale}/login/password`);
        return;
      }

      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Erreur Google login:', error);
      setIsGoogleLoading(false);
    }
  };

  // Mode démo — connexion instantanée avec utilisateur vérifié (DEV SEULEMENT)
  const handleDemoLogin = () => {
    setIsDemoLoading(true);

    // Utilisateur démo avec TOUT vérifié
    const demoUser = {
      email: 'demo@paymaestro.com',
      name: 'Démo PayMaestro',
      isPhoneVerified: true,
      kycStatus: 'APPROVED',
      isBanned: false,
      role: 'USER',
    };

    sessionStorage.setItem('pm_auth_user', JSON.stringify(demoUser));
    sessionStorage.setItem('paymaestro_token', 'demo-token-full-access');

    loginMock();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <Image src="/PayMaestro_officiel_logo.png" alt="PayMaestro" width={80} height={80} className="drop-shadow-xl" priority />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">PayMaestro</h1>
          <p className="text-slate-400 text-base">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">Bienvenue !</h2>
          <p className="text-sm text-slate-400 mb-8">
            Connectez-vous avec votre compte Google pour accéder à votre tableau de bord PayMaestro.
          </p>

          {/* Case à cocher conditions */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-slate-400 leading-relaxed">
              J&apos;accepte les{' '}
              <Link href={`/${locale}/terms`} target="_blank" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Conditions d&apos;utilisation
              </Link>{' '}
              et la{' '}
              <Link href={`/${locale}/privacy`} target="_blank" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Politique de confidentialité
              </Link>
            </span>
          </label>

          {/* Vrai bouton Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isDemoLoading || !acceptedTerms}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-800 rounded-2xl text-base font-semibold hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 shadow-md shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isGoogleLoading ? 'Vérification en cours...' : 'Continuer avec Google'}
          </button>

          {!acceptedTerms && (
            <p className="text-xs text-amber-400/80 text-center mt-2">
              Veuillez accepter les conditions pour continuer
            </p>
          )}

          {/* Mode démo — UNIQUEMENT en développement */}
          {isDev && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500 font-medium">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={isGoogleLoading || isDemoLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-2xl text-sm font-medium hover:bg-violet-600/30 hover:border-violet-400/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
              >
                {isDemoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Essayer en mode démo
              </button>
            </>
          )}


        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl"
            >
              <Icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}