'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, AuthUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function LoginPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const { success: toastSuccess, error: showError } = useToast();
  const { loginReal } = useAuth();

  const [loginToken, setLoginToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'password' | '2fa' | 'location'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newGeo, setNewGeo] = useState<{ country: string; city: string; region: string; isp: string; ip: string } | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('pm_login_token');
    const userRaw = sessionStorage.getItem('pm_login_user');
    const status = sessionStorage.getItem('pm_login_status');

    console.log('🔍 DEBUG login/password mount — token:', token ? 'OK' : 'MANQUANT');
    console.log('🔍 DEBUG login/password mount — status:', status);
    console.log('🔍 DEBUG login/password mount — userRaw:', userRaw);

    if (!token) {
      console.log('🔍 DEBUG login/password mount — PAS DE TOKEN, redirect /login');
      router.replace(`/${locale}/login`);
      return;
    }

    setLoginToken(token);

    if (status === '2FA_REQUIRED') {
      console.log('🔍 DEBUG login/password mount → step: 2fa');
      setStep('2fa');
    } else if (status === 'NEW_LOCATION_REQUIRED') {
      console.log('🔍 DEBUG login/password mount → step: location');
      const geoRaw = sessionStorage.getItem('pm_login_geo');
      if (geoRaw) {
        try { setNewGeo(JSON.parse(geoRaw)); } catch { /* ignore */ }
      }
      setStep('location');
    } else if (status === 'PASSWORD_REQUIRED') {
      console.log('🔍 DEBUG login/password mount → step: password');
      setStep('password');
    } else {
      console.log('🔍 DEBUG login/password mount — STATUS INCONNU "'+status+'", redirect /login');
      router.replace(`/${locale}/login`);
      return;
    }

    try {
      const user = userRaw ? JSON.parse(userRaw) : {};
      setUserEmail(user.email || '');
    } catch { /* ignore */ }
  }, [locale, router]);

  const handleCompleteSuccess = (res: any) => {
    console.log('🔍 DEBUG handleCompleteSuccess — APPELÉE, token reçu:', res.token ? res.token.slice(0, 30) + '...' : 'MANQUANT');
    const u = res.user;
    const authUser: AuthUser = {
      id: u.id || '',
      name: u.name || u.email?.split('@')[0] || '',
      email: u.email || '',
      avatar: u.avatar || u.picture || undefined,
      googleId: u.googleId || undefined,
      joinedAt: u.joinedAt || new Date().toISOString(),
      kycStatus: u.kycStatus || u.kyc_status || 'NONE',
      is_onboarded: u.is_onboarded ?? false,
      phone: u.phone || u.phoneNumber || undefined,
      phoneVerified: u.phoneVerified ?? u.isPhoneVerified ?? false,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      postName: u.postName || '',
      country: u.country || '',
      city: u.city || '',
    };
    sessionStorage.setItem('paymaestro_token', res.token);
    console.log('🔍 DEBUG handleCompleteSuccess — token stocké dans sessionStorage:', sessionStorage.getItem('paymaestro_token') ? 'OK' : 'MANQUANT');
    sessionStorage.setItem('pm_auth_user', JSON.stringify(authUser));
    loginReal(authUser);
    toastSuccess('Connexion réussie');
    console.log('🔍 DEBUG handleCompleteSuccess — navigation vers dashboard...');
    window.location.href = `/${locale}/dashboard`;
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 DEBUG handleSubmitPassword — CLIC submit, password.length:', password.length, 'loginToken:', loginToken ? loginToken.slice(0, 20) + '...' : 'MANQUANT');
    if (!password) { setError('Veuillez entrer votre mot de passe'); return; }
    setError('');
    setLoading(true);

    try {
      console.log('🔍 DEBUG handleSubmitPassword — appel API completeLogin...');
      const res = await api.auth.completeLogin({ loginToken, password });
      console.log('🔍 DEBUG handleSubmitPassword — réponse API:', JSON.stringify(res).slice(0, 200));

      if (res.status === '2FA_REQUIRED') {
        if (res.loginToken) sessionStorage.setItem('pm_login_token', res.loginToken);
        sessionStorage.setItem('pm_login_status', '2FA_REQUIRED');
        setStep('2fa');
        setLoading(false);
        return;
      }

      if (res.status === 'NEW_LOCATION_REQUIRED') {
        sessionStorage.setItem('pm_login_token', res.loginToken);
        sessionStorage.setItem('pm_login_status', 'NEW_LOCATION_REQUIRED');
        setNewGeo(res.geo || null);
        setStep('location');
        setLoading(false);
        return;
      }

      if (res.token && res.user) {
        handleCompleteSuccess(res);
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Mot de passe incorrect');
    }
    setLoading(false);
  };

  const handleSubmit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode) { setError('Veuillez entrer le code 2FA'); return; }
    setError('');
    setLoading(true);

    const currentToken = sessionStorage.getItem('pm_login_token') || loginToken;

    try {
      const res = await api.auth.completeLogin({ loginToken: currentToken, twoFactorCode });

      if (res.status === 'NEW_LOCATION_REQUIRED') {
        sessionStorage.setItem('pm_login_token', res.loginToken);
        sessionStorage.setItem('pm_login_status', 'NEW_LOCATION_REQUIRED');
        setNewGeo(res.geo || null);
        setStep('location');
        setLoading(false);
        return;
      }

      if (res.token && res.user) {
        handleCompleteSuccess(res);
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Code 2FA invalide');
    }
    setLoading(false);
  };

  const handleConfirmLocation = async () => {
    setError('');
    setLoading(true);

    const currentToken = sessionStorage.getItem('pm_login_token') || loginToken;

    try {
      const res = await api.auth.confirmLocation(currentToken);

      if (res.token && res.user) {
        handleCompleteSuccess(res);
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Erreur de confirmation');
    }
    setLoading(false);
  };

  if (!loginToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {step === 'password' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
                  <ShieldCheck className="w-7 h-7 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Vérification du mot de passe</h1>
                {userEmail && (
                  <p className="text-sm text-slate-400">
                    Connecté en tant que <span className="text-violet-300">{userEmail}</span>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Entrez votre mot de passe"
                      autoFocus
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier'}
                </button>
              </form>
            </>
          )}

          {step === '2fa' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
                  <ShieldCheck className="w-7 h-7 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Authentification à deux facteurs</h1>
                <p className="text-sm text-slate-400">
                  Saisissez le code généré par votre application d&apos;authentification
                </p>
              </div>

              <form onSubmit={handleSubmit2FA} className="space-y-5">
                <div>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={e => { setTwoFactorCode(e.target.value); setError(''); }}
                    placeholder="000 000"
                    autoFocus
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-[0.5em] px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length < 6}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier le code'}
                </button>
              </form>
            </>
          )}

          {step === 'location' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4">
                  <MapPin className="w-7 h-7 text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Nouvelle localisation détectée</h1>
                <p className="text-sm text-slate-400">
                  Nous avons détecté une connexion depuis une localisation inconnue.
                  Veuillez confirmer qu&apos;il s&apos;agit bien de vous.
                </p>
              </div>

              {newGeo && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Pays :</span> {newGeo.country}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Ville :</span> {newGeo.city}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Région :</span> {newGeo.region}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Fournisseur :</span> {newGeo.isp}</p>
                  <p className="text-slate-300"><span className="text-slate-500">IP :</span> {newGeo.ip}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleConfirmLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Confirmer ma position</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
