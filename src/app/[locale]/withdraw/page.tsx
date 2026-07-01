'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Wallet, Loader2, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePayPal } from '@/hooks/usePayPal';
import PayPalButton from '@/components/payment/PayPalButton';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function WithdrawPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'fr';
  const { user } = useAuth();
  const { loading: paypalLoading, error: paypalError, createOrder, captureOrder, reset: resetPayPal } = usePayPal();

  const [amount, setAmount] = useState('100');
  const [step, setStep] = useState<'form' | 'paypal' | 'success' | 'error'>('form');
  const [paypalData, setPaypalData] = useState<any>(null);

  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.05;
  const netAmount = amountNum - fee;

  const handleStart = async () => {
    if (!amountNum || amountNum < 10 || amountNum > 2000) return;
    const userEmail = user?.email || '';
    try {
      const result = await createOrder({
        amountUSD: amountNum,
        currencyCode: 'XOF',
        phoneNumber: '+2250100000000',
        userEmail,
      });
      if (result) {
        setPaypalData(result);
        setStep('paypal');
      }
    } catch {
      setStep('error');
    }
  };

  const handlePayPalSuccess = async (data: any) => {
    try {
      const result = await captureOrder(data.paypalOrderId, paypalData?.transactionId);
      if (result?.success) {
        await api.wallet.deposit(amountNum, 'PAYPAL');
        setStep('success');
      } else {
        throw new Error('Capture failed');
      }
    } catch {
      setStep('error');
    }
  };

  const handleReset = () => { setStep('form'); resetPayPal(); setAmount('100'); };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Card className="border-0 shadow-xl rounded-3xl bg-white text-center overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 py-10 text-white">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Dépôt PayPal réussi !</h2>
          </div>
          <CardContent className="p-8 space-y-4">
            <p className="text-sm">${netAmount.toFixed(2)} USD crédités sur votre wallet.</p>
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
        <h1 className="text-2xl font-bold mb-2">Erreur de paiement</h1>
        <p className="text-gray-600 mb-8">{paypalError || 'Une erreur est survenue.'}</p>
        <Button onClick={handleReset} variant="primary" fullWidth>Réessayer</Button>
      </div>
    );
  }

  if (step === 'paypal' && paypalData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 text-sm space-y-2">
              <div className="flex justify-between"><span>Montant :</span><span className="font-bold">${amountNum.toFixed(2)} USD</span></div>
              <div className="flex justify-between"><span>Frais (5%) :</span><span className="text-red-500 font-bold">-${fee.toFixed(2)} USD</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold">Crédité sur wallet :</span><span className="font-bold text-emerald-600">${netAmount.toFixed(2)} USD</span></div>
            </div>
            {paypalLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <PayPalButton paypalOrderId={paypalData.paypalOrderId} transactionId={paypalData.transactionId} amount={amountNum} currency="USD" onSuccess={handlePayPalSuccess} onError={() => setStep('error')} onCancel={() => { setStep('form'); resetPayPal(); }} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dépôt PayPal vers Wallet</h1>
        <p className="text-sm text-slate-500 mt-1">Payez via PayPal et les fonds arrivent sur votre wallet PayMaestro.</p>
      </div>
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Montant (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-2xl text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="100" min="10" max="2000" />
            </div>
            <div className="flex justify-between mt-1"><span className="text-xs text-slate-400">Min: 10 USD</span><span className="text-xs text-slate-400">Max: 2 000 USD</span></div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span>Frais de dépôt (5%)</span><span className="font-semibold text-red-500">-${fee.toFixed(2)} USD</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><span className="font-bold">Sur votre wallet</span><span className="font-extrabold text-violet-600">${netAmount.toFixed(2)} USD</span></div>
          </div>

          {paypalError && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">{paypalError}</div>}

          <Button onClick={handleStart} variant="primary" fullWidth size="lg" disabled={paypalLoading || !amountNum || amountNum < 10}>
            {paypalLoading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Création...</span> : <span className="flex items-center gap-2"><Lock className="w-5 h-5" />Payer avec PayPal - ${amountNum.toFixed(2)} USD</span>}
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Paiement sécurisé par PayPal</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
