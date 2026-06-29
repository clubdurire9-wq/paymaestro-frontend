'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  Loader2, 
  Lock, 
  Phone, 
  ShieldCheck, 
  TrendingUp, 
  Wallet,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { usePayPal } from '@/hooks/usePayPal';
import PayPalButton from '@/components/payment/PayPalButton';
import { ALL_COUNTRIES, AVAILABLE_COUNTRIES, COUNTRY_CODES } from '@/data/countries';
import { getFlagUrl } from '@/data/flags';

interface Currency {
  code: string;
  flag: string;
  rate: number;
  countryCode: string;
  operators: string[];
  country: string;
  available: boolean;
}

interface TransactionData {
  id: string;
  paypalOrderId: string;
  transactionId: string;
  amountUSD: number;
  currency: string;
  phone: string;
  receivedAmount: number;
  exchangeRate: number;
  status: 'pending' | 'completed' | 'failed';
}

export default function WithdrawPage() {
  const t = useTranslations('withdraw');
  const locale = useLocale();
  const { success: showSuccess, error: showError } = useToast();
  const { loading, error, step: paypalStep, createOrder, captureOrder, reset } = usePayPal();

  const currencies: Currency[] = ALL_COUNTRIES as any;
  const countryCodesList: { code: string; country: string; flag: string }[] = COUNTRY_CODES as any;
  const firstAvailable = AVAILABLE_COUNTRIES[0] as any;

  const [flowStep, setFlowStep] = useState<'form' | 'paypal' | 'success' | 'error'>('form');
  const [paypalData, setPaypalData] = useState<any>(null);
  const [currency, setCurrency] = useState<Currency>(firstAvailable);
  const [amount, setAmount] = useState('100');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(firstAvailable.countryCode);
  const [operator, setOperator] = useState(firstAvailable.operators[0]);
  const [createdTx, setCreatedTx] = useState<TransactionData | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const netAmount = amountNum * 0.93;
  const receivedAmount = Math.floor(netAmount * currency.rate);

  useEffect(() => {
    setOperator(currency.operators[0]);
  }, [currency]);

  useEffect(() => {
    setCountryCode(currency.countryCode);
  }, [currency]);

  const handleStartWithdraw = async () => {
    if (!amountNum || amountNum < 10 || amountNum > 2000) {
      showError('Le montant doit être compris entre 10$ et 2000$ USD');
      return;
    }
    if (!phone || phone.length < 8) {
      showError('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
    const userEmail = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('pm_auth_user') || '{}').email || '' : '';
    try {
      const result = await createOrder({
        amountUSD: amountNum,
        currencyCode: currency.code,
        phoneNumber: fullPhone,
        userEmail,
      });
      if (result) {
        setPaypalData(result);
        setFlowStep('paypal');
      }
    } catch (err: any) {
      showError('Erreur lors de la création de la commande PayPal');
    }
  };

  const handlePayPalSuccess = async (data: any) => {
    try {
      const result = await captureOrder(data.paypalOrderId, paypalData.transactionId);
      if (result?.success) {
        const tx: TransactionData = {
          id: `TX-${paypalData.transactionId || Math.floor(100000 + Math.random() * 900000)}`,
          paypalOrderId: data.paypalOrderId,
          transactionId: String(paypalData.transactionId),
          amountUSD: amountNum,
          currency: currency.code,
          phone: `${countryCode}${phone.replace(/\D/g, '')}`,
          receivedAmount: receivedAmount,
          exchangeRate: currency.rate,
          status: 'completed',
        };
        setCreatedTx(tx);
        showSuccess('Retrait initié avec succès !');
        setFlowStep('success');
      } else {
        throw new Error('Capture failed');
      }
    } catch (err: any) {
      showError('Le paiement PayPal a échoué.');
      setFlowStep('error');
    }
  };

  const handlePayPalCancel = () => { setFlowStep('form'); reset(); };
  const handlePayPalError = () => { showError('Erreur PayPal'); setFlowStep('error'); };
  const handleReset = () => { setFlowStep('form'); reset(); setAmount('100'); setPhone(''); };

  // SUCCÈS
  if (flowStep === 'success' && createdTx) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-white text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 py-10 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">{t('success.title') || 'Retrait initié !'}</h2>
          </div>
          <CardContent className="p-8 space-y-4">
            <p className="text-sm">Vous allez recevoir <strong>{receivedAmount.toLocaleString('fr-FR')} {currency.code}</strong></p>
            <Button variant="primary" fullWidth onClick={handleReset}>Faire un autre retrait</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ERREUR
  if (flowStep === 'error') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erreur de paiement</h1>
        <p className="text-gray-600 mb-8">{error || 'Une erreur est survenue.'}</p>
        <Button onClick={handleReset} variant="primary" fullWidth>Réessayer</Button>
      </div>
    );
  }

  // PAYPAL
  if (flowStep === 'paypal' && paypalData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => { setFlowStep('form'); reset(); }} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
            <CardTitle className="flex items-center gap-2 text-xl"><Lock className="w-5 h-5" />Paiement PayPal</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex justify-between mb-2"><span>Montant :</span><span className="font-bold">${amountNum.toFixed(2)} USD</span></div>
              <div className="flex justify-between"><span>Vous recevrez :</span><span className="font-bold text-emerald-600">{receivedAmount.toLocaleString('fr-FR')} {currency.code}</span></div>
            </div>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <PayPalButton paypalOrderId={paypalData.paypalOrderId} transactionId={paypalData.transactionId} amount={amountNum} currency="USD" onSuccess={handlePayPalSuccess} onError={handlePayPalError} onCancel={handlePayPalCancel} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // FORMULAIRE
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('title') || 'Retrait Mobile Money'}</h1>
        <p className="text-sm text-slate-500 mt-1">Transférez vos fonds instantanément vers votre compte Mobile Money.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-slate-100 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-violet-600/5 to-indigo-600/5 border-b border-slate-100 py-5">
              <CardTitle className="flex items-center gap-2 text-violet-600"><Wallet className="w-5 h-5" />Calculateur de Retrait</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* SÉLECTION DEVISE - 54 PAYS */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">1. Choisissez votre devise</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                  {currencies.map((c) => (
                    <button
                      key={`${c.code}-${c.country}`}
                      type="button"
                      onClick={() => { if (c.available) { setCurrency(c); setCountryCode(c.countryCode); setOperator(c.operators[0]); } }}
                      disabled={!c.available}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        !c.available ? 'opacity-40 cursor-not-allowed border-dashed border-gray-300 bg-gray-50' :
                        currency.code === c.code && currency.country === c.country ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-sm scale-105' :
                        'border-slate-200 text-slate-600 bg-white hover:border-violet-200'
                      }`}
                      title={c.available ? c.country : `${c.country} - Bientôt disponible`}
                    >
                      <img src={getFlagUrl(c.countryCode)} alt={c.country} className="w-6 h-4 object-cover rounded-sm" />
                      <span className="text-[10px] font-bold">{c.code}</span>
                      <span className="text-[8px] text-gray-400 truncate max-w-[60px]">{c.country}</span>
                      {!c.available && <span className="text-[7px] bg-yellow-100 text-yellow-700 px-1 rounded font-medium">Bientôt</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* MONTANT */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">2. Montant à retirer (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-10 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500" placeholder="100" min="10" max="2000" />
                </div>
                <div className="flex justify-between mt-2"><span className="text-xs text-slate-400">Min: 10 USD</span><span className="text-xs text-slate-400">Max: 2 000 USD</span></div>
              </div>

              {/* TÉLÉPHONE */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">3. Numéro Mobile Money</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="px-3 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {countryCodesList.map((c: any) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <div className="sm:col-span-3">
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="0123456789" />
                  </div>
                </div>
              </div>

              {/* OPÉRATEUR */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Opérateur Mobile</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currency.operators.map((op) => (
                    <button key={op} type="button" onClick={() => setOperator(op)} className={`p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${operator === op ? 'border-violet-600 bg-violet-50 text-violet-900' : 'border-slate-200 text-slate-600 hover:border-violet-200'}`}>{op}</button>
                  ))}
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-medium">{error}</div>}
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <Button onClick={handleStartWithdraw} variant="primary" fullWidth size="lg" disabled={loading || !phone || !amountNum || amountNum < 10}>
              {loading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Création...</span> : <span className="flex items-center gap-2"><Lock className="w-5 h-5" />Payer avec PayPal - ${amountNum.toFixed(2)} USD</span>}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Paiement sécurisé par PayPal</span></div>
          </div>
        </div>

        {/* PANNEAU LATÉRAL */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl">
            <div className="p-6 sm:p-8 space-y-8 relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Aperçu du retrait</span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Taux Garanti</span>
              </div>
              <div className="space-y-1 relative z-10">
                <span className="text-xs text-slate-400 uppercase font-semibold">Vous recevrez</span>
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-violet-300 bg-clip-text text-transparent">{receivedAmount.toLocaleString('fr-FR')} {currency.code}</h2>
                <p className="text-xs text-slate-400 mt-1">Taux : 1 USD = {currency.rate} {currency.code}</p>
              </div>
              <div className="border-t border-white/10 pt-6 space-y-3.5 text-sm text-slate-300 relative z-10">
                <div className="flex justify-between"><span>Montant brut :</span><span className="font-semibold text-white">${amountNum.toFixed(2)} USD</span></div>
                <div className="flex justify-between"><span className="text-red-300">Frais (7%) :</span><span className="font-semibold text-red-400">-${(amountNum * 0.07).toFixed(2)} USD</span></div>
                <div className="flex justify-between border-t border-white/5 pt-3.5"><span className="text-slate-400">Montant net :</span><span className="font-bold text-white">${netAmount.toFixed(2)} USD</span></div>
                <div className="flex justify-between"><span>Arrivée estimée :</span><span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />Moins de 5 min</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}