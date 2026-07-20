'use client';

import React from 'react';
import { ShieldAlert, Mail, Lock, KeyRound, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useAdminAuth } from '@/hooks/AdminAuthContext';

export function AdminAuthModal() {
  const {
    open, step, email, password, name, otp, loading, message, error,
    setEmail, setPassword, setName, setOtp,
    closeModal, submitCredentials, submitSetup, submitOtp,
  } = useAdminAuth();

  return (
    <Modal isOpen={open} onClose={closeModal} title="Administration PayMaestro" size="md" showCloseButton={step !== 'otp'}>
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Zone sécurisée. Utilisez vos <strong>identifiants d&apos;administration dédiés</strong> (Email admin + Mot de passe admin), strictement distincts de votre compte utilisateur standard.
            </p>
        </div>

        {step === 'credentials' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Email du compte ADMIN dédié</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@paymaestro.com"
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Entrez l&apos;adresse email spécifiquement créée pour l&apos;administration. Elle doit être différente de celle de votre compte principal.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mot de passe ADMIN dédié</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !loading) submitCredentials(); }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Ce mot de passe est strictement lié au compte admin. Il sera demandé à chaque accès à la console d&apos;administration.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              onClick={submitCredentials}
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              {loading ? 'Vérification...' : 'Continuer'}
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30">
              <KeyRound className="w-5 h-5 text-violet-500 shrink-0" />
              <p className="text-sm text-violet-700 dark:text-violet-300">
                Aucun compte d&apos;administration n&apos;existe pour cet email. Créez votre <strong>compte admin dédié</strong> (email + mot de passe séparés).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Email d&apos;administration dédié</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.votrenom@paymaestro.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Doit être différent de votre email utilisateur.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Nom (optionnel)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l'administrateur"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mot de passe admin (12+ caractères)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !loading) submitSetup(); }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Min. 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitSetup}
                disabled={loading || !email || !password}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {loading ? 'Création...' : 'Créer le compte admin'}
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-violet-500" />
              {message}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Code de vérification (OTP)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && !loading) submitOtp(); }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl tracking-[0.5em] text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Le code expire dans 5 minutes et ne peut être utilisé qu&apos;une seule fois.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitOtp}
                disabled={loading || otp.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {loading ? 'Validation...' : 'Valider'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-slate-700 dark:text-slate-200 font-medium">Authentification réussie. Accès administrateur autorisé.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
