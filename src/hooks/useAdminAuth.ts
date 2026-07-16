'use client';

import { useState, useCallback } from 'react';
import { api, setAdminToken, getAdminToken } from '@/lib/api';

type AdminAuthStep = 'credentials' | 'setup' | 'otp' | 'success' | 'error';

export function useAdminAuth() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<AdminAuthStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [authenticated, setAuthenticated] = useState<boolean>(() => !!getAdminToken());

  const reset = useCallback(() => {
    setStep('credentials');
    setPassword('');
    setOtp('');
    setName('');
    setMessage('');
    setError('');
  }, []);

  const openModal = useCallback(() => {
    reset();
    setOpen(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  // Étape 1a : login sur compte admin DÉJÀ créé
  const submitCredentials = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res: any = await api.adminAuth.login(email.trim(), password);
      setPendingToken(res.pendingToken);
      setStep('otp');
      setMessage(res.message || 'Code de sécurité envoyé par email.');
    } catch (e: any) {
      // 404 -> aucun compte admin pour cet email -> proposer la création
      if (e?.message && /cr[éez|é]/i.test(e.message)) {
        setStep('setup');
        setError('');
        return;
      }
      setError(e?.message || 'Échec de l\'authentification.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  // Étape 1b : création du compte admin DÉDIÉ (email + mdp séparés)
  const submitSetup = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res: any = await api.adminAuth.setup(email.trim(), password, name.trim());
      setPendingToken(res.pendingToken);
      setStep('otp');
      setMessage(res.message || 'Compte créé. Code de sécurité envoyé.');
    } catch (e: any) {
      setError(e?.message || 'Échec de la création du compte admin.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [email, password, name]);

  const submitOtp = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await api.adminAuth.verifyOtp(pendingToken, otp.trim());
      setAdminToken(res.adminSessionToken);
      setAuthenticated(true);
      setStep('success');
      setTimeout(() => setOpen(false), 800);
    } catch (e: any) {
      setError(e?.message || 'Code OTP invalide.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }, [pendingToken, otp]);

  const logout = useCallback(() => {
    setAdminToken(null);
    setAuthenticated(false);
  }, []);

  return {
    open, step, email, password, name, otp, loading, message, error,
    authenticated,
    setEmail, setPassword, setName, setOtp,
    openModal, closeModal, submitCredentials, submitSetup, submitOtp, logout,
  };
}
