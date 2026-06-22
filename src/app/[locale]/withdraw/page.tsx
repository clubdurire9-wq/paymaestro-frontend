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
  Wallet 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { api, LIVE_RATES, WithdrawSchema } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function WithdrawPage() {
  const t = useTranslations('withdraw');
  const locale = useLocale();
  const { success: showSuccess, error: showError } = useToast();

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Calculator & Phone, Step 2: Success
  const [currency, setCurrency] = useState('XOF');
  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState<string>('Orange');
  const [wallets, setWallets] = useState<any[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTx, setCreatedTx] = useState<any | null>(null);

  // Load user's saved wallets to prefill
  useEffect(() => {
    async function loadWallets() {
      const wList = await api.getWallets();
      setWallets(wList);
      const defaultWallet = wList.find(w => w.isDefault);
      if (defaultWallet) {
        setPhone(defaultWallet.phone.replace(defaultWallet.countryCode, ''));
        setOperator(defaultWallet.operator);
      }
    }
    loadWallets();
  }, []);

  const currentRateObj = LIVE_RATES.find(r => r.currency === currency) || LIVE_RATES[0];
  const rate = currentRateObj.rate;
  const platformFee = amountUSD * 0.07;
  const netAmountUSD = amountUSD - platformFee;
  const receiveAmount = Math.round(netAmountUSD * rate);

  // Map currency to standard country prefix
  const getCountryPrefix = (curr: string) => {
    switch (curr) {
      case 'XOF': return '+225'; // Ivory Coast
      case 'XAF': return '+237'; // Cameroon
      case 'GHS': return '+233'; // Ghana
      case 'KES': return '+254'; // Kenya
      case 'NGN': return '+234'; // Nigeria
      default: return '+225';
    }
  };

  const getOperatorsByCurrency = (curr: string) => {
    switch (curr) {
      case 'XOF': return ['Orange', 'MTN', 'Moov', 'Wave'];
      case 'XAF': return ['MTN', 'Orange'];
      case 'GHS': return ['MTN', 'Airtel', 'Telecel'];
      case 'KES': return ['Safaricom', 'Airtel'];
      case 'NGN': return ['MTN', 'Airtel'];
      default: return ['Orange', 'MTN', 'Wave'];
    }
  };

  const prefix = getCountryPrefix(currency);
  const operators = getOperatorsByCurrency(currency);

  // Auto-detect operator or fallback
  useEffect(() => {
    const ops = getOperatorsByCurrency(currency);
    if (!ops.includes(operator)) {
      setOperator(ops[0]);
    }
  }, [currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const fullPhone = prefix + phone.replace(/\s+/g, '');

    // Validate using Zod
    const validation = WithdrawSchema.safeParse({
      amountUSD,
      currency,
      phone: fullPhone
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'phone') {
          fieldErrors.phone = err.message;
        } else if (err.path[0] === 'amountUSD') {
          fieldErrors.amount = err.message;
        } else {
          fieldErrors.general = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const tx = await api.createOrder({
        amountUSD,
        currency,
        phone: fullPhone
      });
      setCreatedTx(tx);
      showSuccess('Retrait initié avec succès ! Vos fonds seront transférés sous 5 minutes.');
      // Simulate PayPal checkout popup for 2 seconds
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(2);
      }, 2500);
    } catch (err: any) {
      showError('Le paiement PayPal a échoué. Veuillez réessayer.');
      setErrors({ general: 'Le paiement PayPal a échoué. Veuillez réessayer.' });
      setIsSubmitting(false);
    }
  };

  if (step === 2 && createdTx) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-in zoom-in-95 duration-300">
        <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-white text-center">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 py-10 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">{t('success.title')}</h2>
            <p className="text-xs text-violet-100 mt-1">ID Retrait: {createdTx.id}</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              Votre retrait de <strong className="text-slate-800">${createdTx.amountUSD.toFixed(2)} USD</strong> a été initié avec succès. Vous recevrez <strong className="text-violet-600 font-bold">{new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: createdTx.currency }).format(createdTx.receivedAmount)}</strong> sur votre compte Mobile Money au {createdTx.phone}.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Opérateur :</span>
                <span className="font-semibold text-slate-700">{operator}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Commission de service (7%) :</span>
                <span className="font-medium text-slate-700">${(createdTx.amountUSD * 0.07).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Taux appliqué :</span>
                <span className="font-semibold text-slate-800">1 USD = {createdTx.exchangeRate} {createdTx.currency}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href={`/${locale}/history`}>
                <Button variant="primary" fullWidth>
                  {t('success.track')}
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="ghost" fullWidth>
                  Retourner au tableau de bord
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">Transférez vos fonds instantanément vers Mobile Money.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Step-by-Step interactive Calculator (BOLD, BOLD, BOLD Signature Item) */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-lg border-slate-100 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-violet-600/5 to-indigo-600/5 border-b border-slate-100 py-5">
                <CardTitle className="flex items-center gap-2 text-violet-600">
                  <Wallet className="w-5 h-5" />
                  Calculateur de Retrait
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Currency selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    1. {t('steps.currency')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {LIVE_RATES.map((r) => (
                      <button
                        key={r.currency}
                        type="button"
                        onClick={() => setCurrency(r.currency)}
                        className={`
                          p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/20
                          ${currency === r.currency 
                            ? 'border-violet-600 bg-violet-50/50 text-violet-900 shadow-sm' 
                            : 'border-slate-200 text-slate-600 bg-white'
                          }
                        `}
                      >
                        <span className="text-2xl">{r.flag}</span>
                        <span className="text-xs font-bold">{r.currency}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      2. {t('steps.amount')} (USD)
                    </label>
                    <span className="text-xs text-slate-400">
                      Min: $10 | Max: $2000
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={amountUSD || ''}
                      onChange={(e) => setAmountUSD(Number(e.target.value))}
                      className={`
                        w-full pl-9 pr-16 py-4 border-2 rounded-2xl text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                        ${errors.amount ? 'border-red-300 bg-red-50/10' : 'border-slate-200'}
                      `}
                      placeholder="100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 uppercase">USD</span>
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.amount}</p>
                  )}
                </div>

                {/* Phone details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      3. {t('steps.phone')}
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-2xl border-2 border-r-0 border-slate-200 bg-slate-50 text-slate-500 font-bold text-sm">
                        {prefix}
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={`
                          w-full px-4 py-3.5 border-2 rounded-r-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                          ${errors.phone ? 'border-red-300' : 'border-slate-200'}
                        `}
                        placeholder="0748123456"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Opérateur
                    </label>
                    <Select
                      options={operators.map(op => ({ value: op, label: op }))}
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    />
                  </div>
                </div>

                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-medium">
                    {errors.general}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              size="lg"
              loading={isSubmitting}
              icon={<Lock className="w-5 h-5" />}
            >
              {isSubmitting ? t('processing') : t('confirmButton')}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Vos fonds PayPal sont protégés par le protocole SSL 256 bits</span>
            </div>
          </form>
        </div>

        {/* Real-time Conversion Card (STUNNING BOLD visual component) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl">
            <div className="p-6 sm:p-8 space-y-8 relative">
              {/* Background ambient light */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Aperçu du retrait</span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Taux Garanti
                </span>
              </div>

              {/* Bold Signature conversion result */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-semibold">{t('youReceive')}</span>
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-violet-300 bg-clip-text text-transparent">
                  {new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    style: 'currency',
                    currency: currency,
                    maximumFractionDigits: 0
                  }).format(receiveAmount)}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  1 USD = {rate} {currency}
                </p>
              </div>

              {/* Step calculations */}
              <div className="border-t border-white/10 pt-6 space-y-3.5 text-sm text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Montant brut envoyé :</span>
                  <span className="font-semibold text-white">${amountUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-red-300">
                    Frais de service (7%) :
                    <span title="Frais techniques PayMaestro">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </span>
                  </span>
                  <span className="font-semibold text-red-400">-${platformFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                  <span className="text-slate-400 font-medium">Montant net converti :</span>
                  <span className="font-bold text-white">${netAmountUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Arrivée estimée :</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Moins de 5 minutes
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Info Checklist */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-violet-600" />
              Conditions d&apos;utilisation
            </h4>
            <ul className="text-xs text-slate-500 space-y-2.5">
              <li className="flex gap-2">
                <span className="text-violet-600 font-semibold">•</span>
                <span>La transaction PayPal se fait en toute sécurité. Les fonds sont débloqués immédiatement vers votre Mobile Money.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 font-semibold">•</span>
                <span>Assurez-vous que le numéro Mobile Money spécifié soit actif et configuré pour recevoir des fonds.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 font-semibold">•</span>
                <span>Les retraits au-dessus de $150 USD nécessitent que votre profil soit vérifié via notre procédure KYC.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
