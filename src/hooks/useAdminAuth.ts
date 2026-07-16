'use client';

import { useState, useCallback } from 'react';
import { api, setAdminToken, getAdminToken } from '@/lib/api';

type AdminAuthStep = 'credentials' | 'otp' | 'success' | 'error';

export function useAdminAuth() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<AdminAuthStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Si un admin_session_token est déjà en mémoire, l'accès admin est considéré valide
  const [authenticated, setAuthenticated] = useState<boolean>(() => !!getAdminToken());

  const openModal = useCallback(() => {
    setStep('credentials');
    setPassword('');
    setOtp('');
    setMessage('');
    setError('');
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

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
      setError(e?.message || 'Échec de l\'authentification.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

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
    open, step, email, password, otp, loading, message, error,
    authenticated,
    setEmail, setPassword, setOtp,
    openModal, closeModal, submitCredentials, submitOtp, logout,
  };
}
