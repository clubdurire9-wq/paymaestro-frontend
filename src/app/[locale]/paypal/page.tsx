'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle, Lock, Send, CreditCard, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function PayPalPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'fr';
  const { user } = useAuth();

  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');

  // Dépôt (PayPal → Wallet)
  const [amount, setAmount] = useState('100');
  const [step, setStep] = useState<'form' | 'redirecting' | 'success' | 'error'>('form');
  const [paypalError, setPaypalError] = useState<string | null>(null);

  // Retrait (Wallet → PayPal)
  const [withdrawEmail, setWithdrawEmail] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm' | 'processing' | 'success' | 'error'>('form');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const depositFee = amountNum * 0.05;
  const depositNet = amountNum - depositFee;

  const withdrawAmountNum = parseFloat(withdrawAmount) || 0;
  const withdrawFee = withdrawAmountNum * 0.03;
  const withdrawNet = withdrawAmountNum - withdrawFee;

  const handlePayWithPayPal = async () => {
    if (!amountNum || amountNum < 10 || amountNum > 2000) return;
    setStep('redirecting');
    setPaypalError(null);
    try {
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/${locale}/paypal/success`;
      const cancelUrl = `${baseUrl}/${locale}/paypal`;
      const result = await api.payments.createPayPalDeposit(amountNum, returnUrl, cancelUrl);
      if (!result.approvalUrl) throw new Error('URL d\'approbation PayPal non reçue');
      window.location.href = result.approvalUrl;
    } catch (err: any) {
      setPaypalError(err.message || 'Erreur de communication avec PayPal.');
      setStep('error');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawEmail || !withdrawAmountNum || withdrawAmountNum < 10) return;
    setWithdrawStep('processing');
    setWithdrawError(null);
    try {
      await api.wallet.withdrawPayPal(withdrawEmail, withdrawAmountNum);
      setWithdrawStep('success');
    } catch (err: any) {
      setWithdrawError(err.message || 'Erreur lors du retrait.');
      setWithdrawStep('error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PayPal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez vos transferts PayPal</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('deposit')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'deposit'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ArrowDown className="w-4 h-4 inline mr-1" />Dépôt (Wallet+)
        </button>
        <button
          onClick={() => setTab('withdraw')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'withdraw'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ArrowUp className="w-4 h-4 inline mr-1" />Retrait (Wallet-)
        </button>
      </div>

      {tab === 'deposit' && (
        <>
          {step === 'success' ? (
            <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-slate-800 text-center overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 py-10 text-white">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Dépôt PayPal réussi !</h2>
              </div>
              <CardContent className="p-8 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">Fonds crédités sur votre wallet.</p>
                <Button variant="primary" fullWidth onClick={() => router.push(`/${locale}/wallet`)}>Voir mon wallet</Button>
              </CardContent>
            </Card>
          ) : step === 'error' ? (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erreur de paiement</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">{paypalError || 'Une erreur est survenue.'}</p>
              <Button onClick={() => { setStep('form'); setPaypalError(null); }} variant="primary" fullWidth>Réessayer</Button>
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
              <CardContent className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Montant (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100" min="10" max="2000" />
                  </div>
                  <div className="flex justify-between mt-1"><span className="text-xs text-slate-400">Min: 10 USD</span><span className="text-xs text-slate-400">Max: 2 000 USD</span></div>
                </div>

                {step === 'redirecting' ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 text-sm space-y-2">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Montant :</span><span className="font-bold text-slate-900 dark:text-white">${amountNum.toFixed(2)} USD</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Frais (5%) :</span><span className="text-red-500 font-bold">-${depositFee.toFixed(2)} USD</span></div>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2"><span className="font-bold text-slate-900 dark:text-white">Crédité sur wallet :</span><span className="font-bold text-emerald-600">${depositNet.toFixed(2)} USD</span></div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-8 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Redirection vers PayPal...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 text-sm space-y-2">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Frais de dépôt (5%)</span><span className="font-semibold text-red-500">-${depositFee.toFixed(2)} USD</span></div>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2 text-base"><span className="font-bold text-slate-800 dark:text-slate-200">Sur votre wallet</span><span className="font-extrabold text-blue-600">${depositNet.toFixed(2)} USD</span></div>
                    </div>

                    {paypalError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl text-xs text-red-700 dark:text-red-400">{paypalError}</div>}

                    <Button onClick={handlePayWithPayPal} variant="primary" fullWidth size="lg" disabled={!amountNum || amountNum < 10}>
                      <span className="flex items-center gap-2"><Lock className="w-5 h-5" />Payer avec PayPal - ${amountNum.toFixed(2)} USD</span>
                    </Button>
                  </>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Paiement sécurisé par PayPal</span></div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === 'withdraw' && (
        <>
          {withdrawStep === 'success' ? (
            <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-slate-800 text-center overflow-hidden">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 py-10 text-white">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Retrait PayPal réussi !</h2>
              </div>
              <CardContent className="p-8 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  ${withdrawNet.toFixed(2)} USD envoyés vers {withdrawEmail}
                </p>
                <Button variant="primary" fullWidth onClick={() => router.push(`/${locale}/wallet`)}>Voir mon wallet</Button>
              </CardContent>
            </Card>
          ) : withdrawStep === 'error' ? (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erreur de retrait</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">{withdrawError || 'Une erreur est survenue.'}</p>
              <Button onClick={() => { setWithdrawStep('form'); setWithdrawError(null); }} variant="primary" fullWidth>Réessayer</Button>
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
              <CardContent className="p-6 space-y-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Transférez votre solde wallet vers un compte PayPal. Les fonds sont envoyés directement par PayMaestro.
                </p>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Email PayPal du destinataire</label>
                  <input
                    type="email"
                    value={withdrawEmail}
                    onChange={(e) => setWithdrawEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Montant à envoyer (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      min="10"
                      className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="flex justify-between mt-1"><span className="text-xs text-slate-400">Min: 10 USD</span></div>
                </div>

                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-4 text-sm space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Montant à débiter :</span><span className="font-bold text-slate-900 dark:text-white">${withdrawAmountNum.toFixed(2)} USD</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Frais (3%) :</span><span className="text-red-500 font-bold">-${withdrawFee.toFixed(2)} USD</span></div>
                  <div className="flex justify-between border-t border-violet-200 dark:border-violet-600 pt-2"><span className="font-bold text-slate-900 dark:text-white">Reçu sur PayPal :</span><span className="font-bold text-emerald-600">${withdrawNet.toFixed(2)} USD</span></div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <p><strong>⏱️ Délai :</strong> 1-2 jours ouvrés</p>
                  <p><strong>💰 Frais :</strong> 3% (prélevés sur le montant)</p>
                </div>

                {withdrawError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl text-xs text-red-700 dark:text-red-400">{withdrawError}</div>}

                {withdrawStep === 'processing' ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Envoi du paiement...</p>
                  </div>
                ) : (
                  <Button onClick={handleWithdraw} variant="primary" fullWidth size="lg" disabled={!withdrawEmail || !withdrawAmountNum || withdrawAmountNum < 10}>
                    <span className="flex items-center gap-2"><Send className="w-5 h-5" />Envoyer ${withdrawAmountNum.toFixed(2)} USD</span>
                  </Button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><CreditCard className="w-4 h-4 text-violet-500" /><span>Paiement envoyé par PayMaestro</span></div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
