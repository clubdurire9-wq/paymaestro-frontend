'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2, CheckCircle2, AlertTriangle, ArrowDown, ArrowUp, Phone, Snowflake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FrozenModal } from '@/components/FrozenModal';
import { ALL_COUNTRIES, CountryData } from '@/data/countries';
import { api } from '@/lib/api';
import { PasswordModal } from '@/components/wallet/PasswordModal';

interface WalletTx {
  id: number;
  type: string;
  amount_currency: number;
  currency_code: string;
  status: string;
}

interface Currency {
  code: string;
  flag: string;
  rate: number;
  symbol: string;
}

const currencies: Currency[] = [
  { code: 'USD', flag: '🇺🇸', rate: 1, symbol: '$' },
  { code: 'EUR', flag: '🇪🇺', rate: 0.92, symbol: '€' },
  { code: 'GBP', flag: '🇬🇧', rate: 0.79, symbol: '£' },
  { code: 'XOF', flag: '🇨🇮', rate: 575, symbol: 'FCFA' },
  { code: 'XAF', flag: '🇨🇲', rate: 610, symbol: 'FCFA' },
  { code: 'CDF', flag: '🇨🇩', rate: 2800, symbol: 'FC' },
  { code: 'KES', flag: '🇰🇪', rate: 130, symbol: 'KSh' },
  { code: 'NGN', flag: '🇳🇬', rate: 1550, symbol: '₦' },
  { code: 'GHS', flag: '🇬🇭', rate: 13.50, symbol: 'GH₵' },
  { code: 'UGX', flag: '🇺🇬', rate: 3850, symbol: 'USh' },
  { code: 'RWF', flag: '🇷🇼', rate: 1300, symbol: 'FRw' },
  { code: 'TZS', flag: '🇹🇿', rate: 2500, symbol: 'TSh' },
  { code: 'ZAR', flag: '🇿🇦', rate: 18.50, symbol: 'R' },
  { code: 'EGP', flag: '🇪🇬', rate: 48, symbol: 'E£' },
  { code: 'MAD', flag: '🇲🇦', rate: 10, symbol: 'MAD' },
  { code: 'DZD', flag: '🇩🇿', rate: 135, symbol: 'DA' },
  { code: 'TND', flag: '🇹🇳', rate: 3.10, symbol: 'DT' },
  { code: 'AOA', flag: '🇦🇴', rate: 830, symbol: 'Kz' },
  { code: 'ZMW', flag: '🇿🇲', rate: 27, symbol: 'ZK' },
  { code: 'MWK', flag: '🇲🇼', rate: 1700, symbol: 'MK' },
  { code: 'MZN', flag: '🇲🇿', rate: 64, symbol: 'MT' },
  { code: 'MGA', flag: '🇲🇬', rate: 4500, symbol: 'Ar' },
  { code: 'ETB', flag: '🇪🇹', rate: 57, symbol: 'Br' },
  { code: 'SOS', flag: '🇸🇴', rate: 570, symbol: 'Sh.So.' },
  { code: 'GMD', flag: '🇬🇲', rate: 68, symbol: 'D' },
  { code: 'CVE', flag: '🇨🇻', rate: 101, symbol: 'Esc' },
  { code: 'MUR', flag: '🇲🇺', rate: 46, symbol: 'Rs' },
  { code: 'BWP', flag: '🇧🇼', rate: 13.60, symbol: 'P' },
];

function CountrySelect({ value, onChange, className }: { value: CountryData; onChange: (c: CountryData) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const displayName = (c: CountryData) => locale === 'en' ? c.countryEn : c.country;
  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white text-left">
        <img crossOrigin="anonymous" src={`https://flagcdn.com/w20/${value.iso2}.png`} alt={value.country} className="w-5 h-4 rounded object-cover" />
        <span className="flex-1">{displayName(value)}</span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl shadow-lg">
          {ALL_COUNTRIES.map(c => (
            <button key={c.country} type="button" onClick={() => { onChange(c); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white text-left">
              <img crossOrigin="anonymous" src={`https://flagcdn.com/w20/${c.iso2}.png`} alt={c.country} className="w-5 h-4 rounded object-cover" />
              <span>{displayName(c)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileMoneyPage() {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const t = useTranslations('mobileMoney');

  const [mobileCountry, setMobileCountry] = useState<CountryData>(ALL_COUNTRIES[0]);
  const [mobileCurrency, setMobileCurrency] = useState('XOF');
  const [mobileOperator, setMobileOperator] = useState('Orange');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileAmount, setMobileAmount] = useState('');
  const [mobileDepositLoading, setMobileDepositLoading] = useState(false);
  const [mobileDepositMessage, setMobileDepositMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositModalData, setDepositModalData] = useState<{ type: 'success' | 'error'; title: string; message: string; amount?: string } | null>(null);
  const [mobilePendingTxId, setMobilePendingTxId] = useState<number | null>(null);

  const [withdrawCountry, setWithdrawCountry] = useState<CountryData>(ALL_COUNTRIES[0]);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawOperator, setWithdrawOperator] = useState('Orange');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawVerifying, setWithdrawVerifying] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [withdrawRecipientName, setWithdrawRecipientName] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);
  const [showWithdrawResult, setShowWithdrawResult] = useState(false);
  const [withdrawResultData, setWithdrawResultData] = useState<{ type: 'success' | 'error'; title: string; message: string; amount?: string } | null>(null);

  const [frozenData, setFrozenData] = useState<any>(null);
  const [frozenModalOpen, setFrozenModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('paymaestro_token');
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
        const res = await fetch(`${API_URL}/wallet/frozen-status`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success && d.data) setFrozenData(d.data);
      } catch {}
    })();
  }, []);

  const isWithdrawFrozen = frozenData && (frozenData.freezeType === 'ALL' || frozenData.freezeType === 'MOBILE_MONEY');

  function parseDepositError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('invalid_payer_format') || lower.includes('msisdn') || lower.includes('phone number') || lower.includes('too long')) {
      return t('phoneError');
    }
    if (lower.includes('insufficient') || lower.includes('solde insuffisant')) {
      return t('insufficientBalance');
    }
    if (lower.includes('timeout') || lower.includes('indisponible') || lower.includes('500') || lower.includes('service')) {
      return t('serviceUnavailable');
    }
    return t('depositGeneralError');
  }

  useEffect(() => {
    if (!mobileCountry) setMobileCountry(ALL_COUNTRIES[0]);
    if (!withdrawCountry) setWithdrawCountry(ALL_COUNTRIES[0]);
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'withdraw') setTab('withdraw');
  }, []);

  useEffect(() => {
    if (!mobilePendingTxId) return;
    let delay = 2000;
    let attempts = 0;
    const maxAttempts = 30;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (++attempts > maxAttempts) {
        setMobilePendingTxId(null);
        setMobileDepositLoading(false);
        setDepositModalData({
          type: 'error',
          title: t('delayExceeded'),
          message: t('delayMessage'),
        });
        setShowDepositModal(true);
        return;
      }
      try {
        const txs = await api.wallet.getTransactions();
        const tx = txs.find((t: WalletTx) => t.id === mobilePendingTxId);
        if (tx) {
          if (tx.status === 'COMPLETED') {
            setMobilePendingTxId(null);
            setMobileDepositLoading(false);
            setDepositModalData({
              type: 'success',
              title: t('depositSuccess'),
              message: t('creditedMessage', { amount: tx.amount_currency, currency: tx.currency_code }),
              amount: `${tx.amount_currency} ${tx.currency_code}`,
            });
            setShowDepositModal(true);
            return;
          } else if (tx.status === 'FAILED') {
            setMobilePendingTxId(null);
            setMobileDepositLoading(false);
            setDepositModalData({
              type: 'error',
              title: t('depositFailed'),
              message: t('depositGeneralError'),
            });
            setShowDepositModal(true);
            return;
          }
        }
      } catch { /* ignore polling errors */ }
      delay = Math.min(delay * 1.5, 10000);
      timer = setTimeout(poll, delay);
    };

    timer = setTimeout(poll, delay);
    return () => clearTimeout(timer);
  }, [mobilePendingTxId]);

  const handleMobileDeposit = async () => {
    if (!mobileAmount || !mobilePhone || !mobileCountry) return;
    setMobileDepositLoading(true);
    setMobileDepositMessage(null);
    const currencyToUse = mobileCountry.code;
    try {
      const cleanPhone = mobilePhone.replace(/^0+/, '');
      const result = await api.wallet.depositMobile({
        phoneNumber: `${mobileCountry.countryCode}${cleanPhone}`,
        amountLocal: parseFloat(mobileAmount),
        currencyCode: currencyToUse,
        operator: mobileOperator,
      });
      if (result?.needsRedirect && result?.checkoutUrl) {
        setMobileDepositLoading(false);
        setDepositModalData({
          type: 'error',
          title: t('notAvailable'),
          message: t('notAvailable'),
        });
        setShowDepositModal(true);
        return;
      }
      if (result?.pending) {
        setMobilePendingTxId(result.transactionId);
        setMobileDepositMessage({
          type: 'info',
          text: t('depositRequestSent', { phone: `${mobileCountry.countryCode}${mobilePhone.replace(/^0+/, '')}`, operator: mobileOperator })
        });
        setMobileAmount('');
        setMobilePhone('');
      } else if (result?.completed) {
        setMobileDepositLoading(false);
          setDepositModalData({
            type: 'success',
            title: t('depositSuccess'),
            message: t('creditedMessage', { amount: result.amountLocal, currency: result.currencyCode || mobileCountry.code }),
            amount: `${result.amountLocal} ${result.currencyCode || mobileCountry.code}`,
          });
        setShowDepositModal(true);
        setMobileAmount('');
        setMobilePhone('');
      } else {
        setMobileDepositLoading(false);
        setMobileDepositMessage({
          type: 'success',
          text: t('depositSuccess')
        });
        setMobileAmount('');
        setMobilePhone('');
      }
    } catch (error: any) {
      setMobileDepositLoading(false);
      const msg = error?.message || t('depositGeneralError');
        setDepositModalData({
          type: 'error',
          title: t('depositFailed'),
          message: parseDepositError(msg),
        });
      setShowDepositModal(true);
    }
  };

  const handleMobileWithdrawLookup = async () => {
    if (!withdrawAmount || !withdrawPhone || !withdrawCountry) return;
    if (isWithdrawFrozen) { setFrozenModalOpen(true); return; }
    setWithdrawVerifying(true);
    setWithdrawMessage(null);
    setWithdrawRecipientName(null);
    try {
      const cleanPhone = withdrawPhone.replace(/^0+/, '');
      const fullPhone = `${withdrawCountry.countryCode}${cleanPhone}`;
      const result = await api.wallet.resolveMomo({
        phoneNumber: fullPhone,
        currencyCode: withdrawCountry.code,
        operator: withdrawOperator,
      });
      if (result.verified && result.name) {
        setWithdrawRecipientName(result.name);
      } else {
        setWithdrawRecipientName(null);
        setWithdrawMessage({
          type: 'info',
          text: t('nameNotVerified')
        });
      }
      setShowWithdrawConfirm(true);
    } catch (error: any) {
      setWithdrawRecipientName(null);
      setWithdrawMessage({
        type: 'info',
          text: t('verificationUnavailable')
      });
      setShowWithdrawConfirm(true);
    }
    setWithdrawVerifying(false);
  };

  const handleMobileWithdrawConfirm = async () => {
    if (!withdrawAmount || !withdrawPhone || !withdrawCountry) return;
    setShowWithdrawConfirm(false);
    setShowWithdrawPassword(true);
  };

  const handleMobileWithdrawWithPassword = async (password: string) => {
    if (!withdrawAmount || !withdrawPhone || !withdrawCountry) return;
    setWithdrawLoading(true);
    setWithdrawMessage(null);
    try {
      const stepUp = await api.auth.generateStepUpToken({ password });
      const cleanPhone = withdrawPhone.replace(/^0+/, '');
      const rate = currencies.find(c => c.code === withdrawCountry.code)?.rate || 600;
      const result = await api.wallet.withdrawMobile({
        amountUSD: parseFloat(withdrawAmount),
        currencyCode: withdrawCountry.code,
        phoneNumber: `${withdrawCountry.countryCode}${cleanPhone}`,
        exchangeRate: rate,
        stepUpToken: stepUp.stepUpToken,
        operator: withdrawOperator,
      });
      setShowWithdrawPassword(false);
      setWithdrawResultData({
        type: 'success',
        title: t('withdrawSuccess'),
        message: t('creditedMessage', { amount: parseFloat(withdrawAmount).toFixed(2), currency: `${withdrawCountry.countryCode}${cleanPhone}` }),
        amount: `${(parseFloat(withdrawAmount) * 0.97 * rate).toFixed(2)} ${withdrawCountry.code}`,
      });
      setShowWithdrawResult(true);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setWithdrawRecipientName(null);
      setShowWithdrawConfirm(false);
    } catch (error: any) {
      setShowWithdrawPassword(false);
      setWithdrawResultData({
        type: 'error',
        title: t('withdrawFailed'),
        message: error?.message || t('depositGeneralError'),
      });
      setShowWithdrawResult(true);
    }
    setWithdrawLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('deposit')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'deposit'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ArrowDown className="w-4 h-4 inline mr-1" />{t('depositTab')}
        </button>
        <button
          onClick={() => setTab('withdraw')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'withdraw'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ArrowUp className="w-4 h-4 inline mr-1" />{t('withdrawTab')}
        </button>
      </div>

      {tab === 'deposit' && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('depositTitle')}</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">{t('depositDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('country')}</label>
                <CountrySelect
                  value={mobileCountry}
                  onChange={(c) => { setMobileCountry(c); setMobileCurrency(c.code); setMobileOperator(c.operators[0] || 'Orange'); }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('operator')}</label>
                <select
                  value={mobileOperator}
                  onChange={(e) => setMobileOperator(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-xl text-sm mt-1 dark:bg-slate-800 dark:text-white"
                >
                  {mobileCountry.operators.map((op: string) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('phoneNumber')}</label>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-semibold dark:text-white shrink-0">
                  {mobileCountry.countryCode}
                </span>
                <input
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="991234567"
                  className="flex-1 px-3 py-2 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <input
                type="number"
                value={mobileAmount}
                onChange={(e) => setMobileAmount(e.target.value)}
                placeholder={t('amountCurrency', { currency: mobileCurrency })}
                className="flex-1 px-4 py-3 border dark:border-slate-600 rounded-xl text-lg font-bold dark:bg-slate-800 dark:text-white"
              />
              <Button
                onClick={handleMobileDeposit}
                disabled={mobileDepositLoading || !mobileAmount || !mobilePhone || !!mobilePendingTxId}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mobileDepositLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-2" />
                )}
                {mobileDepositLoading ? t('processing') : t('deposit')}
              </Button>
            </div>

            {mobilePendingTxId ? (
              <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                  {t('pendingOTP')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {t('otpSent')}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  {t('autoCredit')}
                </p>
                <button
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 underline"
                  onClick={() => {
                    setMobilePendingTxId(null);
                    setMobileDepositLoading(false);
                    setMobileDepositMessage(null);
                  }}
                >
                  {t('cancelAndRetry')}
                </button>
              </div>
            ) : null}

            {mobileDepositMessage ? (
              <div className={`rounded-xl p-3 text-sm ${
                mobileDepositMessage.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                  : mobileDepositMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50'
              }`}>
                {mobileDepositMessage.text}
              </div>
            ) : !mobilePendingTxId ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-400 space-y-1">
                <p><strong>{t('fees')}</strong> {t('feeDetail', { percent: '3' })}</p>
                <p><strong>{t('processingTime')}</strong> {t('otpPush')}</p>
                <p className="mt-1">{t('creditInfo')}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {tab === 'withdraw' && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('withdrawTitle')}</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('withdrawDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('country')}</label>
                <CountrySelect
                  value={withdrawCountry}
                  onChange={(c) => { setWithdrawCountry(c); setWithdrawOperator(c.operators[0] || 'Orange'); }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('operator')}</label>
                <select
                  value={withdrawOperator}
                  onChange={(e) => setWithdrawOperator(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-xl text-sm mt-1 dark:bg-slate-800 dark:text-white"
                >
                  {(withdrawCountry?.operators || []).map((op: string) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('withdrawPhone')}</label>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-semibold dark:text-white shrink-0">
                  {withdrawCountry?.countryCode || ''}
                </span>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="991234567"
                  className="flex-1 px-3 py-2 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  {t('amountUSD')}
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl text-lg font-bold dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleMobileWithdrawLookup}
                  disabled={withdrawVerifying || !withdrawAmount || !withdrawPhone || !!isWithdrawFrozen}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawVerifying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 mr-2" />
                  )}
                  {withdrawVerifying ? t('verifying') : t('withdraw')}
                </Button>
              </div>
            </div>

            {withdrawMessage && (
              <div className={`rounded-xl p-3 text-xs ${
                withdrawMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                  : withdrawMessage.type === 'info'
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50'
              }`}>
                {withdrawMessage.text}
              </div>
            )}

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-400 space-y-1">
              <p><strong>{t('fees')}</strong> {t('feeDetail', { percent: '3' })}</p>
              <p><strong>{t('processingTime')}</strong> {t('otpPush')}</p>
              {withdrawAmount && withdrawCountry && (() => {
                const usdAmount = parseFloat(withdrawAmount) || 0;
                const rate = currencies.find(c => c.code === withdrawCountry.code)?.rate || 600;
                const fee = usdAmount * 0.03;
                const netUSD = usdAmount - fee;
                const localAmount = netUSD * rate;
                return (
                  <>
                    <p>{t('fees')} {fee.toFixed(2)} USD</p>
                    <p className="font-bold mt-1">
                      {t('estimatedReceive', { amount: localAmount.toFixed(2), currency: withdrawCountry.code })}
                    </p>
                  </>
                );
              })()}
            </div>

            {showWithdrawConfirm && withdrawCountry && (() => {
              const usdAmount = parseFloat(withdrawAmount) || 0;
              const rate = currencies.find(c => c.code === withdrawCountry.code)?.rate || 600;
              const fee = usdAmount * 0.03;
              const netUSD = usdAmount - fee;
              const localAmount = netUSD * rate;
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Phone className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('confirmTitle')}</h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('recipient')}</span>
                        {withdrawRecipientName ? (
                          <span className="font-semibold text-slate-900 dark:text-white">{withdrawRecipientName}</span>
                        ) : (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{t('unverified')}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('phone')}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{withdrawCountry.countryCode}{withdrawPhone.replace(/^0+/, '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('operator')}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{withdrawOperator}</span>
                      </div>
                      <hr className="border-slate-200 dark:border-slate-700" />
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('amount')}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{usdAmount.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('feeAmount')}</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">-{fee.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>{t('youReceive')}</span>
                        <span>{localAmount.toFixed(2)} {withdrawCountry.code}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowWithdrawConfirm(false); setWithdrawRecipientName(null); }}
                        className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {t('cancel')}
                       </button>
                       <button
                         onClick={handleMobileWithdrawConfirm}
                         disabled={withdrawLoading}
                         className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50"
                       >
                         {withdrawLoading ? t('processing') : t('confirmWithdraw')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {showWithdrawPassword && (
              <PasswordModal
                onVerify={handleMobileWithdrawWithPassword}
                onClose={() => { setShowWithdrawPassword(false); setShowWithdrawConfirm(true); }}
              />
            )}

            {showWithdrawResult && withdrawResultData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center space-y-5 animate-in fade-in zoom-in duration-200">
                  {withdrawResultData.type === 'success' ? (
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${withdrawResultData.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {withdrawResultData.title}
                    </h3>
                    {withdrawResultData.amount && (
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{withdrawResultData.amount}</p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{withdrawResultData.message}</p>
                  </div>
                  <button
                    onClick={() => { setShowWithdrawResult(false); setWithdrawResultData(null); }}
                    className={`w-full py-3 rounded-xl font-medium text-sm text-white transition-colors ${
                      withdrawResultData.type === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
                    }`}
                  >
                    {withdrawResultData.type === 'success' ? t('goToWallet') : t('retry')}
                  </button>
                </div>
              </div>
            )}

            {showDepositModal && depositModalData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center space-y-5 animate-in fade-in zoom-in duration-200">
                  {depositModalData.type === 'success' ? (
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${depositModalData.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {depositModalData.title}
                    </h3>
                    {depositModalData.amount && (
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{depositModalData.amount}</p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{depositModalData.message}</p>
                  </div>
                  <button
                    onClick={() => { setShowDepositModal(false); setDepositModalData(null); }}
                    className={`w-full py-3 rounded-xl font-medium text-sm text-white transition-colors ${
                      depositModalData.type === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
                    }`}
                  >
                    {depositModalData.type === 'success' ? t('goToWallet') : t('retry')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isWithdrawFrozen && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <Snowflake className="w-5 h-5 shrink-0" />
          {t('withdrawFrozen')}
        </div>
      )}

      <FrozenModal isOpen={frozenModalOpen} data={frozenData} onClose={() => setFrozenModalOpen(false)} />
    </div>
  );
}
