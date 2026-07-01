'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Wallet, Loader2, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PayPalButton from '@/components/payment/PayPalButton';
import { api } from '@/lib/api';

export default function PayPalPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'fr';

  const [amount, setAmount] = useState('100');
  const [step, setStep] = useState<'form' | 'paypal' | 'success' | 'error'>('form');
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.05;
  const netAmount = amountNum - fee;

  const handleStart = () => {
    if (!amountNum || amountNum < 10 || amountNum > 2000) return;
    setStep('paypal');
  };

  const handlePayPalSuccess = async (details: any) => {
    setPaypalProcessing(true);
    try {
      await api.wallet.deposit(amountNum, 'PAYPAL');
      setStep('success');
    } catch {
      setPaypalError('Erreur lors du crédit du wallet. Contactez le support.');
      setStep('error');
    }
    setPaypalProcessing(false);
  };

  const handlePayPalError = () => { setPaypalError('Le paiement PayPal a échoué.'); setStep('error'); };
  const handleReset = () => { setStep('form'); setPaypalError(null); setAmount('100'); };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-slate-800 text-center overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 py-10 text-white">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Dépôt PayPal réussi !</h2>
          </div>
          <CardContent className="p-8 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">${netAmount.toFixed(2)} USD crédités sur votre wallet.</p>
            <Button variant="primary" fullWidth onClick={() => router.push(`/${locale}/wallet`)}>Voir mon wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Erreur de paiement</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{paypalError || 'Une erreur est survenue.'}</p>
        <Button onClick={handleReset} variant="primary" fullWidth>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dépôt PayPal vers Wallet</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Payez via PayPal et les fonds arrivent sur votre wallet PayMaestro.</p>
      </div>
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Montant (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="100" min="10" max="2000" />
            </div>
            <div className="flex justify-between mt-1"><span className="text-xs text-slate-400">Min: 10 USD</span><span className="text-xs text-slate-400">Max: 2 000 USD</span></div>
          </div>

          {step === 'paypal' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Montant :</span><span className="font-bold text-slate-900 dark:text-white">${amountNum.toFixed(2)} USD</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Frais (5%) :</span><span className="text-red-500 font-bold">-${fee.toFixed(2)} USD</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2"><span className="font-bold text-slate-900 dark:text-white">Crédité sur wallet :</span><span className="font-bold text-emerald-600">${netAmount.toFixed(2)} USD</span></div>
              </div>
              {paypalProcessing ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
              ) : (
                <PayPalButton amount={amountNum} currency="USD" onSuccess={handlePayPalSuccess} onError={handlePayPalError} onCancel={() => setStep('form')} />
              )}
            </div>
          ) : (
            <>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Frais de dépôt (5%)</span><span className="font-semibold text-red-500">-${fee.toFixed(2)} USD</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2 text-base"><span className="font-bold text-slate-800 dark:text-slate-200">Sur votre wallet</span><span className="font-extrabold text-violet-600">${netAmount.toFixed(2)} USD</span></div>
              </div>

              {paypalError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl text-xs text-red-700 dark:text-red-400">{paypalError}</div>}

              <Button onClick={handleStart} variant="primary" fullWidth size="lg" disabled={!amountNum || amountNum < 10}>
                <span className="flex items-center gap-2"><Lock className="w-5 h-5" />Payer avec PayPal - ${amountNum.toFixed(2)} USD</span>
              </Button>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Paiement sécurisé par PayPal</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
