'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wallet, ArrowDown, ArrowUp, Send, RefreshCw, 
  DollarSign, TrendingUp, TrendingDown,
  Users, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { ALL_COUNTRIES } from '@/data/countries';
import { api } from '@/lib/api';
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

export default function WalletPage() {
  const t = useTranslations();
  const tWallet = useTranslations('wallet');
  const router = useRouter();
  const walletLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'fr';
  const displayCountry = (c: any) => walletLocale === 'en' ? (c.countryEn || c.country) : c.country;
  const { user: _authUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadData();
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
      logger.error('Loading error:', error);
    }
    setLoading(false);
  };

  if (!isMounted) {
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
              {t('wallet.totalDeposited') || 'Total deposited'}
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
              {t('wallet.totalWithdrawn') || 'Total withdrawn'}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ${balance?.totalWithdrawn?.toFixed(2) || '0.00'}
            </p>
            <TrendingDown className="w-4 h-4 text-red-500 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* ACCÈS RAPIDE - Déposer / Retirer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push(`/${locale}/Mobile-Money`)}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-800/50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
        >
          <ArrowDown className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
          <p className="font-bold text-amber-800 dark:text-amber-300">{tWallet('depositMobileMoney')}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">Top up from your Mobile Money account</p>
        </button>
        <button
          onClick={() => router.push(`/${locale}/Mobile-Money?tab=withdraw`)}
          className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-300 dark:border-emerald-800/50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
        >
          <ArrowUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-emerald-800 dark:text-emerald-300">{tWallet('withdrawMobileMoney')}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Withdraw your funds to Mobile Money</p>
        </button>
      </div>

      {/* ACCÈS RAPIDE - PayPal */}
      <button
        onClick={() => router.push(`/${locale}/paypal`)}
        className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-300 dark:border-blue-800/50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
      >
        <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <p className="font-bold text-blue-800 dark:text-blue-300">{tWallet('depositWithdrawPayPal')}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400">Instant deposit and withdrawal to your PayPal account</p>
      </button>

      {/* BOUTON RAPIDE - Transfert PayMaestro → PayMaestro */}
      <button
        onClick={() => router.push(`/${locale}/wallet/transfer?source=pm`)}
        className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-800/50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
      >
        <Users className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <p className="font-bold text-green-800 dark:text-green-300">PayMaestro → PayMaestro Transfer</p>
        <p className="text-sm text-green-600 dark:text-green-400">0% fee — Free!</p>
      </button>

      {/* SOLDES PAR DEVISE — uniquement les devises avec solde > 0 */}
      <Card>
        <CardHeader><CardTitle>Balances by Currency</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto">
            {ALL_COUNTRIES.map(c => (
              <div key={c.code + displayCountry(c)} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <img crossOrigin="anonymous" src={`https://flagcdn.com/w40/${c.countryCode === '+225' ? 'ci' : c.countryCode === '+221' ? 'sn' : c.countryCode === '+237' ? 'cm' : c.countryCode === '+233' ? 'gh' : c.countryCode === '+254' ? 'ke' : c.countryCode === '+234' ? 'ng' : c.countryCode === '+256' ? 'ug' : c.countryCode === '+250' ? 'rw' : c.countryCode === '+255' ? 'tz' : c.countryCode === '+243' ? 'cd' : c.countryCode === '+213' ? 'dz' : c.countryCode === '+20' ? 'eg' : c.countryCode === '+218' ? 'ly' : c.countryCode === '+212' ? 'ma' : c.countryCode === '+249' ? 'sd' : c.countryCode === '+216' ? 'tn' : c.countryCode === '+229' ? 'bj' : c.countryCode === '+226' ? 'bf' : c.countryCode === '+238' ? 'cv' : c.countryCode === '+220' ? 'gm' : c.countryCode === '+224' ? 'gn' : c.countryCode === '+231' ? 'lr' : c.countryCode === '+223' ? 'ml' : c.countryCode === '+222' ? 'mr' : c.countryCode === '+227' ? 'ne' : c.countryCode === '+232' ? 'sl' : c.countryCode === '+228' ? 'tg' : c.countryCode === '+244' ? 'ao' : c.countryCode === '+236' ? 'cf' : c.countryCode === '+235' ? 'td' : c.countryCode === '+242' ? 'cg' : c.countryCode === '+241' ? 'ga' : c.countryCode === '+240' ? 'gq' : c.countryCode === '+239' ? 'st' : c.countryCode === '+257' ? 'bi' : c.countryCode === '+269' ? 'km' : c.countryCode === '+253' ? 'dj' : c.countryCode === '+291' ? 'er' : c.countryCode === '+251' ? 'et' : c.countryCode === '+261' ? 'mg' : c.countryCode === '+265' ? 'mw' : c.countryCode === '+230' ? 'mu' : c.countryCode === '+258' ? 'mz' : c.countryCode === '+248' ? 'sc' : c.countryCode === '+252' ? 'so' : c.countryCode === '+211' ? 'ss' : c.countryCode === '+260' ? 'zm' : c.countryCode === '+263' ? 'zw' : c.countryCode === '+267' ? 'bw' : c.countryCode === '+268' ? 'sz' : c.countryCode === '+266' ? 'ls' : c.countryCode === '+264' ? 'na' : c.countryCode === '+27' ? 'za' : 'ci'}.png`} alt={displayCountry(c)} className="w-8 h-6 rounded shadow-sm mx-auto object-cover" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{c.code}</p>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {(balance as any)?.[c.code]?.toLocaleString('fr-FR') || '0'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing times info */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl">📥</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Deposits</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                PayPal, Mobile Money, Stripe: <span className="font-bold text-green-600 dark:text-green-400">Instant</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                Bank: <span className="font-bold">1-5 business days</span>
              </p>
            </div>

            <div className="space-y-1 border-x border-blue-200 dark:border-blue-800/50 px-4">
              <p className="text-2xl">📤</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Withdrawals</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Mobile Money: <span className="font-bold text-green-600 dark:text-green-400">5 minutes</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                PayPal, Bank: <span className="font-bold">1-2 business days</span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl">🔄</p>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Transfers</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                PM→PM: <span className="font-bold text-green-600 dark:text-green-400">Instant and Free</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                Mobile→Mobile: <span className="font-bold">5 minutes</span>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 text-center">
            <p className="text-[10px] text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1">
              🛡️ All transactions are secure and traceable
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ONGLET HISTORIQUE UNIQUEMENT */}
      <div className="border-b pb-2">
        <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white whitespace-nowrap">
          💳 History
        </span>
      </div>

      {/* HISTORIQUE */}
      <Card>
        <CardHeader>
          <CardTitle>{t('wallet.transactionHistory') || 'Transaction History'}</CardTitle>
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
                        {tx.type === 'DEPOSIT' && 'Deposit'}
                        {tx.type === 'WITHDRAWAL' && 'Withdrawal'}
                        {tx.type === 'CONVERSION' && 'Conversion'}
                        {tx.type === 'TRANSFER' && 'Transfer'}
                        {tx.type === 'WALLET_TO_PAYPAL' && 'Wallet → PayPal'}
                        {tx.type === 'FEE' && 'Fee'}
                        {tx.type === 'MOBILE_MONEY_SENT' && 'Mobile Money'}
                        {tx.type === 'REVERSED' && 'Reversed'}
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
                        Fee: ${Number(tx.fee_usd).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FLUTTERWAVE SUPPRIMÉ — tout en arrière-plan */}
    </div>
  );
}
