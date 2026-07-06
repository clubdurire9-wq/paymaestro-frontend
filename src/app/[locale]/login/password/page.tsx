'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, MapPin, CheckCircle, Mail, KeyRound } from 'lucide-react';
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
  const [is2FAOTP, setIs2FAOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newGeo, setNewGeo] = useState<{ country: string; city: string; region: string; isp: string; ip: string } | null>(null);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetVerified, setResetVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('pm_login_token');
    const userRaw = sessionStorage.getItem('pm_login_user');
    const status = sessionStorage.getItem('pm_login_status');

    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    setLoginToken(token);

    if (status === '2FA_REQUIRED' || status === '2FA_OTP_REQUIRED') {
      setIs2FAOTP(status === '2FA_OTP_REQUIRED');
      setStep('2fa');
    } else if (status === 'NEW_LOCATION_REQUIRED') {
      const geoRaw = sessionStorage.getItem('pm_login_geo');
      if (geoRaw) {
        try { setNewGeo(JSON.parse(geoRaw)); } catch { /* ignore */ }
      }
      setStep('location');
    } else if (status === 'PASSWORD_REQUIRED') {
      setStep('password');
    } else {
      router.replace(`/${locale}/login`);
      return;
    }

    try {
      const user = userRaw ? JSON.parse(userRaw) : {};
      setUserEmail(user.email || '');
    } catch { /* ignore */ }
  }, [locale, router]);

  const handleCompleteSuccess = (res: any) => {
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
    toastSuccess('Connexion réussie');
    window.location.href = `/${locale}/dashboard`;
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Veuillez entrer votre mot de passe'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await api.auth.completeLogin({ loginToken, password });

      if (res.status === '2FA_REQUIRED' || res.status === '2FA_OTP_REQUIRED') {
        if (res.loginToken) sessionStorage.setItem('pm_login_token', res.loginToken);
        sessionStorage.setItem('pm_login_status', res.status);
        setIs2FAOTP(res.status === '2FA_OTP_REQUIRED');
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

  const handleSendResetCode = async () => {
    setLoading(true);
    try {
      await api.auth.forgotPassword(userEmail);
      setResetSent(true);
      toastSuccess('Code de réinitialisation envoyé par email');
    } catch (e: any) { showError(e.message); }
    setLoading(false);
  };

  const handleVerifyResetCode = async () => {
    if (!resetCode) { showError('Entrez le code reçu par email'); return; }
    setLoading(true);
    try {
      await api.auth.verifyResetCode(userEmail, resetCode);
      setResetVerified(true);
      toastSuccess('Code vérifié');
    } catch (e: any) { showError(e.message); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword) { showError('Nouveau mot de passe requis'); return; }
    if (!PASSWORD_REGEX.test(newPassword)) { showError('Min. 8 car., 1 maj., 1 min., 1 chiffre, 1 spé.'); return; }
    if (newPassword !== confirmPassword) { showError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      await api.auth.resetPassword(userEmail, resetCode, newPassword, confirmPassword);
      toastSuccess('Mot de passe réinitialisé avec succès');
      setShowForgot(false);
      setResetSent(false);
      setResetVerified(false);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) { showError(e.message); }
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

          {step === 'password' && !showForgot && (
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

                <p className="text-center text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setError(''); }}
                    className="text-violet-400 hover:underline font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </p>
              </form>
            </>
          )}

          {step === 'password' && showForgot && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
                  <KeyRound className="w-7 h-7 text-violet-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Réinitialisation du mot de passe</h1>
                <p className="text-sm text-slate-400">
                  {!resetSent ? 'Un code vous sera envoyé par email' : resetVerified ? 'Définissez votre nouveau mot de passe' : `Code envoyé à ${userEmail}`}
                </p>
              </div>

              {!resetSent && (
                <div className="space-y-5">
                  <p className="text-sm text-slate-400 text-center">
                    Un code <span className="text-violet-300 font-mono">PM_ReinXXXXXX</span> sera envoyé à votre adresse email.
                  </p>
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-sm text-red-400">{error}</p></div>}
                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-5 h-5" /> Envoyer le code</>}
                  </button>
                </div>
              )}

              {resetSent && !resetVerified && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Code de réinitialisation</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={e => { setResetCode(e.target.value); setError(''); }}
                      placeholder="PM_ReinXXXXXX"
                      autoFocus
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-center font-mono tracking-wider"
                    />
                  </div>
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-sm text-red-400">{error}</p></div>}
                  <button
                    type="button"
                    onClick={handleVerifyResetCode}
                    disabled={loading || !resetCode}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier le code'}
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    Vous n&apos;avez pas reçu le code ?{' '}
                    <button type="button" onClick={handleSendResetCode} className="text-violet-400 hover:underline">Renvoyer</button>
                  </p>
                </div>
              )}

              {resetVerified && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 8 car., 1 maj., 1 min., 1 chiffre, 1 spé."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-sm text-red-400">{error}</p></div>}
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-base font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Réinitialiser le mot de passe'}
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    <button type="button" onClick={() => { setShowForgot(false); setResetSent(false); setResetVerified(false); setResetCode(''); setNewPassword(''); setConfirmPassword(''); }} className="text-slate-400 hover:underline">
                      Retour à la connexion
                    </button>
                  </p>
                </div>
              )}
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
                  {is2FAOTP
                    ? 'Un code à 6 chiffres vous a été envoyé par email'
                    : 'Saisissez le code généré par votre application d\'authentification'}
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
                {is2FAOTP && (
                  <p className="text-center text-xs text-slate-500">
                    Vous n&apos;avez pas reçu le code ?{' '}
                    <button
                      type="button"
                      onClick={async () => {
                        const currentToken = sessionStorage.getItem('pm_login_token') || loginToken;
                        try {
                          await api.twoFactor.sendLoginOTP?.();
                          toastSuccess('Nouveau code envoyé par email');
                        } catch { /* ignore */ }
                      }}
                      className="text-violet-400 hover:underline"
                    >
                      Renvoyer
                    </button>
                  </p>
                )}
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
