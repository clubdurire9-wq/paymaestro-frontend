'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface PasswordModalProps {
  onVerify: (password: string) => void;
  onClose: () => void;
}

export function PasswordModal({ onVerify, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!password) { setError('Veuillez entrer votre mot de passe'); return; }
    setLoading(true);
    setError('');
    try {
      await api.wallet.verifyPassword(password);
      onVerify(password);
    } catch (e: any) {
      setError(e.message || 'Mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl dark:shadow-black/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Mot de passe</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Entrez votre mot de passe pour confirmer cette opération.</p>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Votre mot de passe"
            autoFocus
          />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Annuler</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
