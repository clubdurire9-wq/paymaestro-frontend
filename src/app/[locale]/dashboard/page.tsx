'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  History, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Info
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { api, Transaction, LIVE_RATES } from '@/lib/api';
interface Stats {
  totalReceived: number;
  totalTransactions: number;
  successRate: number;
  pendingTransactions: number;
  withdrawalsThisMonth?: number;
  monthlyStats?: { month: string; volumeUSD: number }[];
}
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tHistory = useTranslations('history');
  const tKyc = useTranslations('kyc');
  const locale = useLocale();
  const { user } = useAuth();
  const displayName = user?.name?.split(' ')[0] || 'Utilisateur';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartHoveredIndex, setChartHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, txsData, walletTxs] = await Promise.all([
          api.getStats(),
          api.getTransactions(),
          api.wallet.getTransactions().catch(() => []),
        ]);
        const allTxs = [...(txsData || []), ...(walletTxs || [])];
        allTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStats(statsData);
        setTransactions(allTxs.slice(0, 5));
      } catch (err) {
        logger.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(async () => {
      try {
        const [statsData, txsData, walletTxs] = await Promise.all([
          api.getStats(),
          api.getTransactions(),
          api.wallet.getTransactions().catch(() => []),
        ]);
        const allTxs = [...(txsData || []), ...(walletTxs || [])];
        allTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStats(statsData);
        setTransactions(allTxs.slice(0, 5));
      } catch {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'MOBILE_MONEY_SENT':
        return <Badge variant="success">{tHistory(`status.${status}`)}</Badge>;
      case 'PENDING':
        return <Badge variant="warning">{tHistory(`status.${status}`)}</Badge>;
      case 'PAYPAL_APPROVED':
        return <Badge variant="info">PayPal validé</Badge>;
      case 'FAILED':
        return <Badge variant="error">{tHistory(`status.${status}`)}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const monthNames = locale === 'fr'
    ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = (stats as any)?.monthlyStats?.length
    ? stats.monthlyStats.map((m: any) => ({
        month: monthNames[new Date(m.month).getMonth()] || m.month,
        amount: m.volumeUSD || 0,
      }))
    : [];

  // SVG Chart layout configs
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i * (chartWidth - paddingX * 2)) / (chartData.length - 1);
    const maxAmount = Math.max(...chartData.map(cd => cd.amount)) * 1.1;
    const y = chartHeight - paddingY - (d.amount * (chartHeight - paddingY * 2)) / maxAmount;
    return { x, y, ...d };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('welcome', { name: displayName })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos transferts PayPal vers Mobile Money en temps réel.
          </p>
        </div>
        <Link href={`/${locale}/withdraw`}>
          <Button variant="primary" icon={<ArrowUpRight className="w-4 h-4" />}>
            {t('quickActions.newWithdraw')}
          </Button>
        </Link>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-violet-600">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('stats.totalReceived')}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats?.totalReceived || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('stats.totalTransactions')}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats?.withdrawalsThisMonth ?? 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('stats.successRate')}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats?.successRate.toFixed(1)}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-500 dark:text-sky-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('stats.pendingTransactions')}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats?.pendingTransactions}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart & Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evolution Chart Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('chart.title')}</CardTitle>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Évolution cumulée des retraits (en USD)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </CardHeader>
          <CardContent className="pt-0">
            {/* SVG Chart */}
            <div className="w-full relative">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-700" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-700" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-slate-600" />

                {/* Area under line */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Chart Line */}
                <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Point circles */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={chartHoveredIndex === idx ? 6 : 4} 
                      fill={chartHoveredIndex === idx ? '#7c3aed' : '#ffffff'} 
                      stroke="#7c3aed" 
                      strokeWidth="2" 
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setChartHoveredIndex(idx)}
                      onMouseLeave={() => setChartHoveredIndex(null)}
                    />
                    {/* Month Label */}
                    <text 
                      x={p.x} 
                      y={chartHeight - 4} 
                      fontSize="9" 
                      textAnchor="middle" 
                      fill="#94a3b8"
                      className="font-medium"
                    >
                      {p.month}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Chart Tooltip Fallback */}
              {chartHoveredIndex !== null && (
                <div 
                  className="absolute bg-slate-900 text-white rounded-lg p-2 text-xs shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    left: `${(points[chartHoveredIndex].x / chartWidth) * 100}%`,
                    top: `${(points[chartHoveredIndex].y / chartHeight) * 100 - 25}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <p className="font-semibold">{chartData[chartHoveredIndex].amount} USD</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Rates Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{t('rates.title')}</CardTitle>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {t('rates.updated', { time: '5m' })}
                </p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Info className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {LIVE_RATES.map((rate) => (
                <div key={rate.currency} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2">
                    <img crossOrigin="anonymous" src={`https://flagcdn.com/w40/${rate.iso2}.png`} alt={rate.currency} className="w-6 h-4 rounded shadow-sm object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rate.currency}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[120px] truncate">{rate.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(rate.rate, rate.currency)}
                    </p>
                    <p className="text-[9px] text-emerald-500 dark:text-emerald-400 font-semibold uppercase tracking-wider">Taux réel</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href={`/${locale}/withdraw`}>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-violet-100 dark:hover:border-violet-700/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-200 text-left group">
                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('quickActions.newWithdraw')}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Retirer vos fonds en 5 minutes</p>
                </div>
              </button>
            </Link>

            <Link href={`/${locale}/history`}>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 text-left group">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('quickActions.viewHistory')}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Suivre l&apos;état de vos retraits</p>
                </div>
              </button>
            </Link>

            <Link href={`/${locale}/kyc`}>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-emerald-100 dark:hover:border-emerald-700/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all duration-200 text-left group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('quickActions.verifyKYC')}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Lever la limite de transfert</p>
                </div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recentTransactions.title')}</CardTitle>
          <Link href={`/${locale}/history`} className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline flex items-center gap-1">
            {t('recentTransactions.viewAll')} &rarr;
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 text-xs uppercase font-medium">
                  <th className="py-3 px-4">ID Transaction</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Montant USD</th>
                  <th className="py-3 px-4">Reçu en local</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">{tx.id}</td>
                    <td className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500">
                      {new Date(tx.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">${tx.amountUSD.toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(tx.receivedAmount, tx.currency)}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedTx(tx);
                          setIsModalOpen(true);
                        }}
                      >
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Détail du retrait"
        size="md"
      >
        {selectedTx && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Montant à recevoir</p>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
                {formatCurrency(selectedTx.receivedAmount, selectedTx.currency)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Initialisé le {new Date(selectedTx.date).toLocaleString()}
              </p>
            </div>

            {/* Financial breakdown */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-slate-500 dark:text-slate-400">ID Retrait</div>
              <div className="text-right font-semibold text-slate-900 dark:text-white">{selectedTx.id}</div>

              <div className="text-slate-500 dark:text-slate-400">Montant envoyé (PayPal)</div>
              <div className="text-right font-medium text-slate-950 dark:text-white">${selectedTx.amountUSD.toFixed(2)} USD</div>

              <div className="text-slate-500 dark:text-slate-400">Frais de service PayMaestro (7%)</div>
              <div className="text-right text-red-500 dark:text-red-400 font-medium">-${(selectedTx.amountUSD * 0.07).toFixed(2)} USD</div>

              <div className="text-slate-500 dark:text-slate-400">Taux appliqué</div>
              <div className="text-right font-medium text-slate-950 dark:text-white">1 USD = {selectedTx.exchangeRate} {selectedTx.currency}</div>

              <div className="text-slate-500 dark:text-slate-400">Téléphone Mobile Money</div>
              <div className="text-right font-semibold text-slate-950 dark:text-white">{selectedTx.phone}</div>

              {selectedTx.reference && (
                <>
                  <div className="text-slate-500 dark:text-slate-400">Référence Payout</div>
                  <div className="text-right font-mono text-xs text-slate-900 dark:text-slate-200">{selectedTx.reference}</div>
                </>
              )}

              {selectedTx.flutterwaveReference && (
                <>
                  <div className="text-slate-500 dark:text-slate-400">Réf. Opérateur</div>
                  <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">{selectedTx.flutterwaveReference}</div>
                </>
              )}
            </div>

            {/* Timeline log */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Suivi de transaction</h4>
              <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 ml-2 space-y-4">
                {selectedTx.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Indicator node */}
                    <span 
                      className={`
                        absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-800
                        ${step.status === 'MOBILE_MONEY_SENT' ? 'bg-emerald-500' : ''}
                        ${step.status === 'PENDING' ? 'bg-amber-500' : ''}
                        ${step.status === 'PAYPAL_APPROVED' ? 'bg-sky-500' : ''}
                        ${step.status === 'FAILED' ? 'bg-red-500' : ''}
                      `} 
                    />
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {step.status === 'MOBILE_MONEY_SENT' && 'Fonds envoyés'}
                      {step.status === 'PAYPAL_APPROVED' && 'Paiement PayPal validé'}
                      {step.status === 'PENDING' && 'Transaction initialisée'}
                      {step.status === 'FAILED' && 'Transaction échouée'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Error reason alert */}
            {selectedTx.status === 'FAILED' && selectedTx.errorReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Raison du rejet</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">{selectedTx.errorReason}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}