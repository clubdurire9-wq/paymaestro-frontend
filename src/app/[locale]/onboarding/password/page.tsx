'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, Key, Check, X, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, AuthUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function OnboardingPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const { success: toastSuccess, error: showError } = useToast();
  const { loginReal } = useAuth();
  const tErrors = useTranslations('errors');
  const tAuth = useTranslations('auth');

  const [loginToken, setLoginToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('pm_login_token');
    const userRaw = sessionStorage.getItem('pm_login_user');
    const status = sessionStorage.getItem('pm_login_status');

    if (!token || status !== 'PASSWORD_SETUP_REQUIRED') {
      router.replace(`/${locale}/login`);
      return;
    }

    setLoginToken(token);
    try {
      const user = userRaw ? JSON.parse(userRaw) : {};
      setUserEmail(user.email || '');
    } catch { /* ignore */ }
  }, [locale, router]);

  const checks = [
    { label: 'Min. 8 caractères', test: password.length >= 8 },
    { label: '1 lettre majuscule', test: /[A-Z]/.test(password) },
    { label: '1 lettre minuscule', test: /[a-z]/.test(password) },
    { label: '1 chiffre', test: /\d/.test(password) },
    { label: '1 caractère spécial', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const allValid = checks.every(c => c.test);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) { setError(tErrors('pleaseEnterPassword')); return; }
    if (!allValid) { setError('Le mot de passe ne respecte pas les critères de sécurité'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }

    setError('');
    setLoading(true);

    try {
      const res = await api.auth.completeLogin({ loginToken, createPassword: true, password });

      if (res.status === '2FA_REQUIRED' || res.status === '2FA_OTP_REQUIRED') {
        sessionStorage.setItem('pm_login_token', res.loginToken || loginToken);
        sessionStorage.setItem('pm_login_status', res.status);
        toastSuccess('Mot de passe créé avec succès');
        router.push(`/${locale}/login/password`);
        return;
      }

      if (res.status === 'NEW_LOCATION_REQUIRED') {
        sessionStorage.setItem('pm_login_token', res.loginToken);
        sessionStorage.setItem('pm_login_status', 'NEW_LOCATION_REQUIRED');
        sessionStorage.setItem('pm_login_geo', JSON.stringify(res.geo || {}));
        toastSuccess('Mot de passe créé avec succès');
        router.push(`/${locale}/login/password`);
        return;
      }

      if (res.token && res.user) {
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
        sessionStorage.setItem('pm_auth_user', JSON.stringify(authUser));
        loginReal(authUser);
        toastSuccess(tAuth('loginSuccess'));
        window.location.href = `/${locale}/dashboard`;
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Erreur lors de la création du mot de passe');
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
              <Key className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Créez votre mot de passe</h1>
            {userEmail && (
              <p className="text-sm text-slate-400">
                Pour <span className="text-violet-300">{userEmail}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Créez un mot de passe sécurisé"
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

              <div className="mt-3 space-y-1.5">
                {checks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${check.test ? 'text-green-400' : 'text-slate-500'}`}>
                    {check.test ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Confirmez votre mot de passe"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500/50'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-500/50'
                    : 'border-white/10'
                }`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !allValid || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Créer mon compte</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
