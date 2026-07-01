'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PayPalSuccessPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMsg('Aucun identifiant de transaction PayPal reçu.');
      return;
    }

    (async () => {
      try {
        const result = await api.payments.capturePayPalDeposit(token);
        setCredits(result.amountCredited);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Erreur lors de la confirmation du paiement.');
      }
    })();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Confirmation du paiement PayPal...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Erreur de confirmation</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{errorMsg}</p>
        <Button onClick={() => router.push(`/${locale}/paypal`)} variant="primary" fullWidth>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-slate-800 text-center overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 py-10 text-white">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Dépôt PayPal réussi !</h2>
        </div>
        <CardContent className="p-8 space-y-4">
          {credits !== null && (
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              +{credits.toFixed(2)} USD crédités sur votre wallet
            </p>
          )}
          <Button variant="primary" fullWidth onClick={() => router.push(`/${locale}/wallet`)}>
            Voir mon wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
