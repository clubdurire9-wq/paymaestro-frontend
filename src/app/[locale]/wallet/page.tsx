'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wallet, ArrowDown, ArrowUp, Send, RefreshCw, 
  DollarSign, Loader2, TrendingUp, TrendingDown, Building,
  Users, Phone, CreditCard, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { ALL_COUNTRIES, CountryData } from '@/data/countries';
import { api } from '@/lib/api';
import { PasswordModal } from '@/components/wallet/PasswordModal';
import { WithdrawalFeeCalculator } from '@/components/wallet/WithdrawalFeeCalculator';
import { logger } from '@/lib/logger';

interface Balance {
  USD: number;
  EUR: number;
  GBP: number;
  XOF: number;
  XAF: number;
  CDF: number;
  KES: number;
  NGN: number;
  GHS: number;
  UGX: number;
  RWF: number;
  TZS: number;
  ZAR: number;
  EGP: number;
  MAD: number;
  DZD: number;
  TND: number;
  LYD: number;
  SDG: number;
  AOA: number;
  ZMW: number;
  ZWL: number;
  MWK: number;
  MZN: number;
  MGA: number;
  ETB: number;
  SOS: number;
  BIF: number;
  DJF: number;
  GMD: number;
  GNF: number;
  LRD: number;
  SLL: number;
  CVE: number;
  MRU: number;
  STN: number;
  KMF: number;
  SCR: number;
  MUR: number;
  ERN: number;
  SSP: number;
  SZL: number;
  LSL: number;
  NAD: number;
  BWP: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

interface WalletTx {
  id: number;
  type: string;
  method: string;
  amount_usd: number;
  amount_currency: number;
  currency_code: string;
  fee_usd: number;
  status: string;
  notes: string;
  created_at: string;
}

interface Currency {
  code: string;
  flag: string;
  rate: number;
  symbol: string;
}

function CountrySelect({ value, onChange, className }: { value: CountryData; onChange: (c: CountryData) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white text-left">
        <img crossOrigin="anonymous" src={`https://flagcdn.com/w20/${value.iso2}.png`} alt={value.country} className="w-5 h-4 rounded object-cover" />
        <span className="flex-1">{value.country}</span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl shadow-lg">
          {ALL_COUNTRIES.map(c => (
            <button key={c.country} type="button" onClick={() => { onChange(c); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white text-left">
              <img crossOrigin="anonymous" src={`https://flagcdn.com/w20/${c.iso2}.png`} alt={c.country} className="w-5 h-4 rounded object-cover" />
              <span>{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('XOF');
  const [targetCurrency, setTargetCurrency] = useState('XAF');
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [depositDetails, setDepositDetails] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [mobileCountry, setMobileCountry] = useState<CountryData | null>(null);
  const [mobileCurrency, setMobileCurrency] = useState('XOF');
  const [mobileOperator, setMobileOperator] = useState('Orange');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileAmount, setMobileAmount] = useState('');
  const [mobileDepositLoading, setMobileDepositLoading] = useState(false);
  const [mobileDepositMessage, setMobileDepositMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositModalData, setDepositModalData] = useState<{ type: 'success' | 'error'; title: string; message: string; amount?: string } | null>(null);

  function parseDepositError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('invalid_payer_format') || lower.includes('msisdn') || lower.includes('phone number') || lower.includes('too long')) {
      return 'Le numéro de téléphone saisi semble incorrect ou mal formaté. Vérifiez que votre numéro est correct et réessayez.';
    }
    if (lower.includes('insufficient') || lower.includes('solde insuffisant')) {
      return 'Votre solde est insuffisant pour effectuer cette opération.';
    }
    if (lower.includes('timeout') || lower.includes('indisponible') || lower.includes('500') || lower.includes('service')) {
      return 'Une interruption technique temporaire est survenue. Veuillez réessayer dans quelques instants.';
    }
    return 'Une erreur est survenue lors du dépôt. Vérifiez vos informations et réessayez. Si le problème persiste, contactez notre support.';
  }
  const [mobilePendingTxId, setMobilePendingTxId] = useState<number | null>(null);
  // Flutterwave supprimé — tout se fait en arrière-plan

  // Retrait Mobile Money
  const [withdrawCountry, setWithdrawCountry] = useState<CountryData | null>(null);
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

  useEffect(() => {
    setIsMounted(true);
    if (!mobileCountry) {
      setMobileCountry(ALL_COUNTRIES[0]);
    }
    if (!withdrawCountry) {
      setWithdrawCountry(ALL_COUNTRIES[0]);
    }
  }, []);

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

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bal, txs] = await Promise.all([
        api.wallet.getBalance(),
        api.wallet.getTransactions(),
      ]);
      if (bal) setBalance(bal);
      if (txs) setTransactions(txs);
    } catch (error) {
      logger.error('Erreur de chargement:', error);
    }
    setLoading(false);
  };

  // Polling OTP : vérifie le statut d'une transaction Mobile Money en attente (backoff exponentiel)
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
          title: 'Délai dépassé',
          message: 'Le dépôt a pris trop de temps. Veuillez vérifier votre historique.',
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
              title: 'Dépôt réussi !',
              message: `${tx.amount_currency} ${tx.currency_code} ont été crédités sur votre wallet.`,
              amount: `${tx.amount_currency} ${tx.currency_code}`,
            });
            setShowDepositModal(true);
            loadData();
            return;
          } else if (tx.status === 'FAILED') {
            setMobilePendingTxId(null);
            setMobileDepositLoading(false);
            setDepositModalData({
              type: 'error',
              title: 'Dépôt échoué',
              message: 'Le dépôt n\'a pas abouti. Veuillez réessayer.',
            });
            setShowDepositModal(true);
            loadData();
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

  const loadUser = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data);
    } catch (error) {
      logger.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    try {
      await api.wallet.deposit(amt, 'PAYPAL');
      setAmount('');
      loadData();
    } catch (error) {
      logger.error('Erreur de dépôt:', error);
    }
  };

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
          title: 'Méthode non disponible',
          message: 'Le paiement par redirection n\'est pas disponible pour Mobile Money. Veuillez réessayer.',
        });
        setShowDepositModal(true);
        return;
      }
      if (result?.pending) {
        setMobilePendingTxId(result.transactionId);
        setMobileDepositMessage({
          type: 'info',
          text: `📱 Demande envoyée ! Vérifiez votre téléphone ${mobileCountry.countryCode}${mobilePhone.replace(/^0+/, '')} pour confirmer le paiement via ${mobileOperator}. Un push OTP vous a été envoyé.`
        });
        setMobileAmount('');
        setMobilePhone('');
      } else if (result?.completed) {
        setMobileDepositLoading(false);
        setDepositModalData({
          type: 'success',
          title: 'Dépôt réussi !',
          message: `${result.amountLocal} ${result.currencyCode || mobileCountry.code} ont été crédités sur votre wallet.`,
          amount: `${result.amountLocal} ${result.currencyCode || mobileCountry.code}`,
        });
        setShowDepositModal(true);
        setMobileAmount('');
        setMobilePhone('');
        loadData();
      } else {
        setMobileDepositLoading(false);
        setMobileDepositMessage({
          type: 'success',
          text: '✅ Dépôt effectué avec succès !'
        });
        setMobileAmount('');
        setMobilePhone('');
        loadData();
      }
    } catch (error: any) {
      setMobileDepositLoading(false);
      const msg = error?.message || 'Erreur lors du dépôt. Veuillez réessayer.';
      setDepositModalData({
        type: 'error',
        title: 'Dépôt échoué',
        message: parseDepositError(msg),
      });
      setShowDepositModal(true);
    }
  };

  const handleWithdrawToWallet = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const currency = currencies.find(c => c.code === selectedCurrency);
    if (!currency) return;
    try {
      await api.wallet.withdrawToWallet({
        amountUSD: amt,
        targetCurrency: selectedCurrency,
      });
      setAmount('');
      loadData();
    } catch (error) {
      logger.error('Erreur de retrait:', error);
    }
  };

  const handleMobileWithdrawLookup = async () => {
    if (!withdrawAmount || !withdrawPhone || !withdrawCountry) return;
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
          text: `⚠️ Nom non vérifié par l'opérateur. Vérifiez bien le numéro avant de confirmer.`
        });
      }
      setShowWithdrawConfirm(true);
    } catch (error: any) {
      setWithdrawRecipientName(null);
      setWithdrawMessage({
        type: 'info',
        text: `⚠️ Vérification indisponible. Vérifiez bien le numéro avant de confirmer.`
      });
      setShowWithdrawConfirm(true);
    }
    setWithdrawVerifying(false);
  };

  const handleMobileWithdrawConfirm = async () => {
    if (!withdrawAmount || !withdrawPhone || !withdrawCountry) return;
    // Fermer la modale de confirmation et ouvrir la modale mot de passe
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
        title: 'Retrait réussi !',
        message: `Transfert de ${parseFloat(withdrawAmount).toFixed(2)} USD vers ${withdrawCountry.countryCode}${cleanPhone}.`,
        amount: `${(parseFloat(withdrawAmount) * 0.97 * rate).toFixed(2)} ${withdrawCountry.code}`,
      });
      setShowWithdrawResult(true);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setWithdrawRecipientName(null);
      setShowWithdrawConfirm(false);
      loadData();
    } catch (error: any) {
      setShowWithdrawPassword(false);
      setWithdrawResultData({
        type: 'error',
        title: 'Retrait échoué',
        message: error?.message || 'Erreur lors du retrait. Veuillez réessayer.',
      });
      setShowWithdrawResult(true);
    }
    setWithdrawLoading(false);
  };

  const getBalanceForCurrency = (currencyCode: string): number => {
    if (!balance) return 0;
    const key = currencyCode as keyof Balance;
    return typeof balance[key] === 'number' ? balance[key] : 0;
  };

  const getCurrencyInfo = (code: string): Currency => {
    return currencies.find(c => c.code === code) || { code, flag: '💰', rate: 1, symbol: code };
  };

  if (!isMounted || !mobileCountry) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'fr';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Modal de confirmation de dépôt bancaire */}
      {showDepositConfirm && depositDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirmer le dépôt bancaire</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Vérifiez les informations avant de procéder au virement :
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Titulaire :</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{depositDetails.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email :</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{depositDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Frais :</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{depositDetails.fees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Délai :</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">{depositDetails.delay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Devises :</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">{depositDetails.currency}</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 text-xs text-green-800 dark:text-green-400 mb-4">
              ✅ {depositDetails.automatic}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowDepositConfirm(false)}>
                Annuler
              </Button>
              <Button fullWidth onClick={() => setShowDepositConfirm(false)}>
                J'ai compris
              </Button>
            </div>
          </div>
        </div>
      )}

      {false && null}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Wallet className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('wallet.title') || 'Mon Portefeuille'}
        </h1>
      </div>

      {/* SOLDE PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <p className="text-sm opacity-80">{t('wallet.usdBalance') || 'Solde USD'}</p>
            <p className="text-3xl font-bold">${balance?.USD?.toFixed(2) || '0.00'}</p>
            <p className="text-xs mt-2 opacity-60">
              EUR: €{balance?.EUR?.toFixed(2) || '0.00'} | GBP: £{balance?.GBP?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('wallet.totalDeposited') || 'Total déposé'}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ${balance?.totalDeposited?.toFixed(2) || '0.00'}
            </p>
            <TrendingUp className="w-4 h-4 text-green-500 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('wallet.totalWithdrawn') || 'Total retiré'}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ${balance?.totalWithdrawn?.toFixed(2) || '0.00'}
            </p>
            <TrendingDown className="w-4 h-4 text-red-500 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* BOUTON RAPIDE - Transfert PayMaestro → PayMaestro */}
      <button
        onClick={() => router.push(`/${locale}/wallet/transfer?source=pm`)}
        className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-800/50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
      >
        <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <p className="font-bold text-green-800 dark:text-green-300">Transfert PayMaestro → PayMaestro</p>
        <p className="text-sm text-green-600 dark:text-green-400">0% de frais — Gratuit !</p>
      </button>

      {/* SOLDES PAR DEVISE — uniquement les devises avec solde > 0 */}
      <Card>
        <CardHeader><CardTitle>Soldes par devise</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto">
            {ALL_COUNTRIES.map(c => (
              <div key={c.code + c.country} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <img crossOrigin="anonymous" src={`https://flagcdn.com/w40/${c.countryCode === '+225' ? 'ci' : c.countryCode === '+221' ? 'sn' : c.countryCode === '+237' ? 'cm' : c.countryCode === '+233' ? 'gh' : c.countryCode === '+254' ? 'ke' : c.countryCode === '+234' ? 'ng' : c.countryCode === '+256' ? 'ug' : c.countryCode === '+250' ? 'rw' : c.countryCode === '+255' ? 'tz' : c.countryCode === '+243' ? 'cd' : c.countryCode === '+213' ? 'dz' : c.countryCode === '+20' ? 'eg' : c.countryCode === '+218' ? 'ly' : c.countryCode === '+212' ? 'ma' : c.countryCode === '+249' ? 'sd' : c.countryCode === '+216' ? 'tn' : c.countryCode === '+229' ? 'bj' : c.countryCode === '+226' ? 'bf' : c.countryCode === '+238' ? 'cv' : c.countryCode === '+220' ? 'gm' : c.countryCode === '+224' ? 'gn' : c.countryCode === '+231' ? 'lr' : c.countryCode === '+223' ? 'ml' : c.countryCode === '+222' ? 'mr' : c.countryCode === '+227' ? 'ne' : c.countryCode === '+232' ? 'sl' : c.countryCode === '+228' ? 'tg' : c.countryCode === '+244' ? 'ao' : c.countryCode === '+236' ? 'cf' : c.countryCode === '+235' ? 'td' : c.countryCode === '+242' ? 'cg' : c.countryCode === '+241' ? 'ga' : c.countryCode === '+240' ? 'gq' : c.countryCode === '+239' ? 'st' : c.countryCode === '+257' ? 'bi' : c.countryCode === '+269' ? 'km' : c.countryCode === '+253' ? 'dj' : c.countryCode === '+291' ? 'er' : c.countryCode === '+251' ? 'et' : c.countryCode === '+261' ? 'mg' : c.countryCode === '+265' ? 'mw' : c.countryCode === '+230' ? 'mu' : c.countryCode === '+258' ? 'mz' : c.countryCode === '+248' ? 'sc' : c.countryCode === '+252' ? 'so' : c.countryCode === '+211' ? 'ss' : c.countryCode === '+260' ? 'zm' : c.countryCode === '+263' ? 'zw' : c.countryCode === '+267' ? 'bw' : c.countryCode === '+268' ? 'sz' : c.countryCode === '+266' ? 'ls' : c.countryCode === '+264' ? 'na' : c.countryCode === '+27' ? 'za' : 'ci'}.png`} alt={c.country} className="w-8 h-6 rounded shadow-sm mx-auto object-cover" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{c.code}</p>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {(balance as any)?.[c.code]?.toLocaleString('fr-FR') || '0'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* INFORMATIONS DÉLAIS — Rassurer l'utilisateur */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Dépôt */}
            <div className="space-y-1">
              <p className="text-2xl">📥</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Dépôts</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                PayPal, Mobile Money, Stripe : <span className="font-bold text-green-600 dark:text-green-400">Instantané</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                Banque : <span className="font-bold">1-5 jours ouvrés</span>
              </p>
            </div>

            {/* Retrait */}
            <div className="space-y-1 border-x border-blue-200 dark:border-blue-800/50 px-4">
              <p className="text-2xl">📤</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Retraits</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Mobile Money : <span className="font-bold text-green-600 dark:text-green-400">5 minutes</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                PayPal, Banque : <span className="font-bold">1-2 jours ouvrés</span>
              </p>
            </div>

            {/* Transfert */}
            <div className="space-y-1">
              <p className="text-2xl">🔄</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Transferts</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                PM→PM : <span className="font-bold text-green-600 dark:text-green-400">Immédiat et Gratuit</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                Mobile→Mobile : <span className="font-bold">5 minutes</span>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 text-center">
            <p className="text-[10px] text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1">
              🛡️ Toutes les transactions sont sécurisées et traçables
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ONGLETS */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {([
          { id: 'balance' as const, label: '💳 Historique' },
          { id: 'deposit' as const, label: '⬇️ Déposer' },
          { id: 'withdraw' as const, label: '⬆️ Retirer' },

        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-violet-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>



      {/* DÉPOSER */}
      {activeTab === 'deposit' && (
        <div className="space-y-6">
          {/* Dépôt Mobile Money */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dépôt Mobile Money</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Rechargez votre wallet depuis votre compte Mobile Money</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pays</label>
                  <CountrySelect
                    value={mobileCountry}
                    onChange={(c) => { setMobileCountry(c); setMobileCurrency(c.code); setMobileOperator(c.operators[0] || 'Orange'); }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Opérateur</label>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Votre numéro</label>
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
                  placeholder={`Montant en ${mobileCurrency}`}
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
                  {mobileDepositLoading ? 'Traitement...' : 'Déposer'}
                </Button>
              </div>

              {/* Écran d'attente OTP */}
              {mobilePendingTxId ? (
                <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                    En attente de confirmation...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Un push OTP a été envoyé à votre téléphone. <br />
                    Veuillez entrer votre code PIN pour finaliser le paiement.
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400">
                    Dès confirmation, votre wallet sera crédité automatiquement.
                  </p>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 underline"
                    onClick={() => {
                      setMobilePendingTxId(null);
                      setMobileDepositLoading(false);
                      setMobileDepositMessage(null);
                    }}
                  >
                    Annuler et réessayer
                  </button>
                </div>
              ) : null}

              {/* Message info / succès / erreur */}
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
                  <p><strong>💰 Frais :</strong> 3% du montant</p>
                  <p><strong>⏱️ Traitement :</strong> Vous recevrez un push OTP sur votre téléphone</p>
                  <p className="mt-1">Le montant sera crédité en USD sur votre wallet après validation du code PIN.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* RETIRER VERS PORTEFEUILLE */}
      {activeTab === 'withdraw' && (
        <div className="space-y-6">

          {/* Calculateur de frais de retrait */}
          <WithdrawalFeeCalculator usdBalance={balance?.USD || 0} currencies={currencies} />

          {/* Retrait Mobile Money */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Retrait Mobile Money</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Retirez vos fonds vers votre compte Mobile Money</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pays</label>
                  <CountrySelect
                    value={withdrawCountry!}
                    onChange={(c) => { setWithdrawCountry(c); setWithdrawOperator(c.operators[0] || 'Orange'); }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Opérateur</label>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Votre numéro Mobile Money</label>
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
                    Montant (USD)
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
                    disabled={withdrawVerifying || !withdrawAmount || !withdrawPhone}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4 mr-2" />
                    )}
                    {withdrawVerifying ? 'Vérification...' : 'Retirer'}
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
                <p><strong>💰 Frais :</strong> 3% du montant</p>
                <p><strong>⏱️ Délai :</strong> Quelques minutes</p>
                {withdrawAmount && withdrawCountry && (() => {
                  const usdAmount = parseFloat(withdrawAmount) || 0;
                  const rate = currencies.find(c => c.code === withdrawCountry.code)?.rate || 600;
                  const fee = usdAmount * 0.03;
                  const netUSD = usdAmount - fee;
                  const localAmount = netUSD * rate;
                  return (
                    <>
                      <p>Frais : {fee.toFixed(2)} USD</p>
                      <p className="font-bold mt-1">
                        Vous recevrez {localAmount.toFixed(2)} {withdrawCountry.code} sur votre Mobile Money
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* CONFIRMATION RETRAIT */}
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
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirmer le retrait</h3>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bénéficiaire</span>
                          {withdrawRecipientName ? (
                            <span className="font-semibold text-slate-900 dark:text-white">{withdrawRecipientName}</span>
                          ) : (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Non vérifié ⚠️</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Téléphone</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{withdrawCountry.countryCode}{withdrawPhone.replace(/^0+/, '')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Opérateur</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{withdrawOperator}</span>
                        </div>
                        <hr className="border-slate-200 dark:border-slate-700" />
                        <div className="flex justify-between">
                          <span className="text-slate-500">Montant</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{usdAmount.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Frais (3%)</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">-{fee.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>Vous recevez</span>
                          <span>{localAmount.toFixed(2)} {withdrawCountry.code}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowWithdrawConfirm(false); setWithdrawRecipientName(null); }}
                          className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleMobileWithdrawConfirm}
                          disabled={withdrawLoading}
                          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {withdrawLoading ? 'Traitement...' : 'Confirmer le retrait'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modale mot de passe pour confirmer le retrait */}
              {showWithdrawPassword && (
                <PasswordModal
                  onVerify={handleMobileWithdrawWithPassword}
                  onClose={() => { setShowWithdrawPassword(false); setShowWithdrawConfirm(true); }}
                />
              )}

              {/* MODALE RÉSULTAT RETRAIT */}
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
                      {withdrawResultData.type === 'success' ? 'Accéder au portefeuille' : 'Réessayer'}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>



      {/* HISTORIQUE */}
      {activeTab === 'balance' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('wallet.transactionHistory') || 'Historique des transactions'}</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-slate-500">
                  {t('wallet.noTransactions') || 'Aucune transaction'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'DEPOSIT' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : tx.type === 'WITHDRAWAL' || tx.type === 'MOBILE_MONEY_SENT'
                          ? 'bg-red-100 dark:bg-red-900'
                          : tx.type === 'CONVERSION' || tx.type === 'REVERSED'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : tx.type === 'WALLET_TO_PAYPAL'
                          ? 'bg-violet-100 dark:bg-violet-900'
                          : tx.type === 'FEE'
                          ? 'bg-orange-100 dark:bg-orange-900'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {tx.type === 'DEPOSIT' && <ArrowDown className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        {tx.type === 'WITHDRAWAL' && <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400" />}
                        {tx.type === 'CONVERSION' && <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        {tx.type === 'WALLET_TO_PAYPAL' && <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                        {tx.type === 'TRANSFER' && <Send className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                        {tx.type === 'FEE' && <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                        {tx.type === 'MOBILE_MONEY_SENT' && <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400" />}
                        {tx.type === 'REVERSED' && <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm dark:text-white">
                          {tx.type === 'DEPOSIT' && 'Dépôt'}
                          {tx.type === 'WITHDRAWAL' && 'Retrait'}
                          {tx.type === 'CONVERSION' && 'Conversion'}
                          {tx.type === 'TRANSFER' && 'Transfert'}
                          {tx.type === 'WALLET_TO_PAYPAL' && 'Wallet → PayPal'}
                          {tx.type === 'FEE' && 'Frais'}
                          {tx.type === 'MOBILE_MONEY_SENT' && 'Mobile Money'}
                          {tx.type === 'REVERSED' && 'Annulé'}
                          {!['DEPOSIT','WITHDRAWAL','CONVERSION','TRANSFER','WALLET_TO_PAYPAL','FEE','MOBILE_MONEY_SENT','REVERSED'].includes(tx.type) && (tx.type || 'Transaction')}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '—'}
                        </p>
                        {tx.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tx.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : tx.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {tx.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'DEPOSIT' || tx.type === 'CONVERSION' || tx.type === 'REVERSED'
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'CONVERSION' || tx.type === 'REVERSED' ? '+' : '-'}
                        {tx.amount_currency?.toLocaleString('fr-FR') || '0'} {tx.currency_code || ''}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        ${Number(tx.amount_usd || 0).toFixed(2)} USD
                      </p>
                      {Number(tx.fee_usd) > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Frais: ${Number(tx.fee_usd).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODALE RÉSULTAT DÉPÔT */}
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
              {depositModalData.type === 'success' ? 'Accéder au portefeuille' : 'Réessayer'}
            </button>
          </div>
        </div>
      )}

      {/* FLUTTERWAVE SUPPRIMÉ — tout en arrière-plan */}
    </div>
  );
}