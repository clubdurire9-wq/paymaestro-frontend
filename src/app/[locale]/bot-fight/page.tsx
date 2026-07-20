'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import Turnstile from '@/components/ui/Turnstile';
import { api } from '@/lib/api';

export default function BotFightPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [status, setStatus] = useState<'idle' | 'verifying' | 'passed' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const turnstileRef = useRef<any>(null);

  const handleTurnstileVerify = useCallback(async (token: string) => {
    setStatus('verifying');
    try {
      const res = await api.auth.verifyTurnstile(token);
      if (res.success) {
        sessionStorage.setItem('paymaestro_bot_pass', 'true');
        setStatus('passed');
        setTimeout(() => router.push(`/${locale}`), 1200);
      } else {
        setStatus('failed');
        setErrorMessage('Échec de vérification');
      }
    } catch (e: any) {
      setStatus('failed');
      setErrorMessage(e?.message || 'Erreur serveur');
    }
  }, [router, locale]);

  useEffect(() => {
    const already = sessionStorage.getItem('paymaestro_bot_pass');
    if (already === 'true') {
      router.replace(`/${locale}`);
    }
  }, [router, locale]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {status === 'passed' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <ShieldCheck className="w-20 h-20 text-green-400" />
          </motion.div>
        ) : status === 'failed' ? (
          <AlertTriangle className="w-16 h-16 text-red-400" />
        ) : (
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="flex items-center justify-center"
          >
            <Loader2 className="w-16 h-16 text-emerald-400 animate-spin" />
          </motion.div>
        )}

        <h1 className="text-2xl font-semibold text-zinc-200">
          {status === 'passed' ? 'Vérifié' : status === 'failed' ? 'Échec' : 'Vérification anti-bot en cours'}
        </h1>

        <p className="text-sm text-zinc-500 max-w-xs text-center leading-relaxed">
          {status === 'passed'
            ? 'Accès autorisé, redirection...'
            : status === 'failed'
              ? errorMessage
              : 'Cloudflare Turnstile vérifie que vous êtes un humain. Cela ne prend que quelques secondes.'}
        </p>

        {status === 'idle' && (
          <div className="mt-4">
            <Turnstile ref={turnstileRef} onVerify={handleTurnstileVerify} />
          </div>
        )}

        {status === 'failed' && (
          <button
            onClick={() => { setStatus('idle'); setErrorMessage(''); }}
            className="mt-4 px-6 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:text-zinc-200 hover:border-zinc-600 transition-colors"
          >
            Réessayer
          </button>
        )}
      </motion.div>
    </div>
  );
}
