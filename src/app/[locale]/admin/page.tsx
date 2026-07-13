'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Headphones,
  Key,
  CreditCard,
  Bitcoin,
  PiggyBank,
  Snowflake,
  FileText,
  BookOpen,
  Shield,
  LifeBuoy,
  Loader2,
  X,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Transaction, KYCDetails } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

type AdminTab = 'overview' | 'kyc' | 'transactions' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const locale = useLocale();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [reviewingKycId, setReviewingKycId] = useState<string | null>(null);
  const [txList, setTxList] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txSearchId, setTxSearchId] = useState('');
  const [txDays, setTxDays] = useState(7);
  const [refundTx, setRefundTx] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundProcessing, setRefundProcessing] = useState(false);

  async function loadDashboard(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const [dashboardResult, pendingKyc] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.listPendingKYC(),
      ]);
      if (dashboardResult) setDashboardData(dashboardResult);
      setKycQueue(pendingKyc || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadTxList(days = txDays, transactionId?: string) {
    setTxLoading(true);
    try {
      const data = await api.admin.getTransactions(days, transactionId || undefined);
      setTxList(data || []);
    } catch {}
    setTxLoading(false);
  }

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTxList(txDays, txSearchId.trim() || undefined);
    }
  }, [activeTab]);

  const handleRefund = async () => {
    if (!refundTx || !refundReason.trim()) return;
    setRefundProcessing(true);
    try {
      const amount = refundAmount.trim() ? parseFloat(refundAmount) : undefined;
      await api.admin.refundTransaction(refundTx.id, { reason: refundReason.trim(), amount });
      success(`Remboursement effectué sur la transaction #${refundTx.id}`);
      setRefundTx(null);
      setRefundReason('');
      setRefundAmount('');
      loadTxList(txDays, txSearchId.trim() || undefined);
    } catch (e: any) {
      error(e.message || 'Erreur de remboursement');
    }
    setRefundProcessing(false);
  };

  const handleApproveKYC = async (userId: string) => {
    setReviewingKycId(userId);
    try {
      await api.admin.reviewKYC(userId, 'APPROVE');
      setKycQueue((prev) => prev.filter((k) => k.userId !== userId && k.id !== userId));
      success('KYC approuvé avec succès !');
    } catch (e: any) { error(e.message); }
    setReviewingKycId(null);
  };

  const handleRejectKYC = async (userId: string) => {
    setReviewingKycId(userId);
    try {
      await api.admin.reviewKYC(userId, 'REJECT');
      setKycQueue((prev) => prev.filter((k) => k.userId !== userId && k.id !== userId));
      error('KYC rejeté.');
    } catch (e: any) { error(e.message); }
    setReviewingKycId(null);
  };

  const handleSearchUsers = async () => {
    const q = searchTerm.trim();
    if (q.length < 2) return;
    setSearching(true);
    setSearchError('');
    setSearchResults(null);
    try {
      const data = await api.admin.searchUsers(q);
      setSearchResults(data || []);
      if (!data || data.length === 0) setSearchError('Aucun utilisateur trouvé');
    } catch (e: any) {
      setSearchResults([]);
      if (e?.name === 'TypeError' && e?.message === 'Failed to fetch') {
        setSearchError('Erreur réseau. Vérifiez votre connexion ou réessayez.');
      } else {
        setSearchError(e?.message || 'Erreur lors de la recherche');
      }
    } finally {
      setSearching(false);
    }
  };

  const tabs: { tab: AdminTab; label: string; icon: React.ElementType }[] = [
    { tab: 'overview', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { tab: 'kyc', label: t('sidebar.kyc'), icon: ShieldCheck },
    { tab: 'transactions', label: t('sidebar.transactions'), icon: BarChart3 },
    { tab: 'users', label: t('sidebar.users'), icon: Users },
  ];
  const links: { href: string; label: string; icon: React.ElementType }[] = [
    { href: `/${locale}/admin/live`, label: 'Live', icon: Activity },
    { href: `/${locale}/admin/disputes`, label: 'Disputes', icon: AlertTriangle },
    { href: `/${locale}/admin/refunds`, label: 'Refunds', icon: RotateCcw },
    { href: `/${locale}/admin/agents`, label: 'Agents', icon: Headphones },
    { href: `/${locale}/admin/api-keys`, label: 'API Keys', icon: Key },
    { href: `/${locale}/admin/cards`, label: 'Cards', icon: CreditCard },
    { href: `/${locale}/admin/crypto`, label: 'Crypto', icon: Bitcoin },
    { href: `/${locale}/admin/finance`, label: 'Finance', icon: PiggyBank },
    { href: `/${locale}/admin/frozen`, label: t('frozenAccounts'), icon: Snowflake },
    { href: `/${locale}/admin/payment-pages`, label: 'Payment Pages', icon: FileText },
    { href: `/${locale}/admin/protocol`, label: 'Protocol', icon: BookOpen },
    { href: `/${locale}/admin/security`, label: 'Security', icon: Shield },
    { href: `/${locale}/admin/support`, label: 'Support', icon: LifeBuoy },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Console de gestion PayMaestro</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-1">Principal</p>
            {tabs.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  activeTab === tab
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {tab === 'kyc' && kycQueue.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {kycQueue.length}
                  </span>
                )}
              </button>
            ))}
            <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-1">Administration</p>
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Refresh indicator */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {dashboardData?.lastRefresh
                    ? `Dernière mise à jour : ${new Date(dashboardData.lastRefresh).toLocaleTimeString('fr-FR')}`
                    : 'Données en temps réel'}
                </p>
                <button
                  onClick={() => loadDashboard(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>

              {/* 6 stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="border-l-4 border-l-violet-600">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilisateurs</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{(dashboardData?.totalUsers || 0).toLocaleString()}</h3>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume total</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      ${parseFloat(dashboardData?.totalVolumeUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KYC en attente</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardData?.pendingKYC ?? kycQueue.length}</h3>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-sky-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{(dashboardData?.totalTransactions || 0).toLocaleString()}</h3>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-rose-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('frozenAccounts')}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{(dashboardData?.frozenAccounts || 0).toLocaleString()}</h3>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenus</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      ${parseFloat(dashboardData?.totalRevenueUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Transactions récentes</CardTitle>
                    <span className="text-xs text-slate-400">
                      {dashboardData?.recentTransactions?.length || 0} sur {dashboardData?.totalTransactions || 0}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) ? (
                    <p className="text-sm text-slate-400 text-center py-8">Aucune transaction récente</p>
                  ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {dashboardData.recentTransactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {tx.userName || tx.userEmail || 'Inconnu'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">#{tx.id}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {tx.phone && <>{tx.phone} — </>}
                            {tx.notes ? (
                              <span className="italic">{tx.notes}</span>
                            ) : (
                              <span>{tx.type} via {tx.method}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-300 mt-0.5">
                            {new Date(tx.date).toLocaleString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            ${parseFloat(tx.amountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <Badge
                            variant={
                              tx.status === 'COMPLETED' || tx.status === 'MOBILE_MONEY_SENT'
                                ? 'success'
                                : tx.status === 'FAILED' || tx.status === 'REFUNDED'
                                ? 'error'
                                : tx.status === 'PENDING'
                                ? 'warning'
                                : 'info'
                            }
                          >
                            {tx.status === 'MOBILE_MONEY_SENT' ? 'COMPLETED' : tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('kyc.title')}</h2>
                <Badge variant="warning">{kycQueue.length} en attente</Badge>
              </div>

              {kycQueue.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">File d&apos;attente vide</p>
                    <p className="text-xs text-slate-400 mt-1">Tous les KYC ont été traités.</p>
                  </CardContent>
                </Card>
              ) : (
                kycQueue.map((kyc: any) => {
                  const kycId = kyc.id || kyc.userId;
                  const kycName = kyc.name || kyc.fullName || kyc.email?.split('@')[0] || 'Utilisateur';
                  return (
                  <Card key={kycId} className="border border-slate-100 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white">{kycName}</h3>
                            {kyc.confidence != null && (
                              <Badge variant="info">Confiance : {kyc.confidence}%</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{kyc.email}</p>
                          <p className="text-xs text-slate-400">
                            Document : <span className="font-medium text-slate-700">{kyc.documentType || kyc.document_type || 'N/A'}</span>
                            {kyc.submittedAt && <> • Soumis le {new Date(kyc.submittedAt).toLocaleString('fr-FR')}</>}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle className="w-4 h-4" />}
                            loading={reviewingKycId === kycId}
                            onClick={() => handleApproveKYC(kyc.userId || kycId)}
                          >
                            {t('kyc.approve')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<XCircle className="w-4 h-4" />}
                            loading={reviewingKycId === kycId}
                            onClick={() => handleRejectKYC(kyc.userId || kycId)}
                          >
                            {t('kyc.reject')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('sidebar.transactions')}</h2>
                <span className="text-xs text-slate-400">{txList.length} résultat(s)</span>
              </div>

              {/* Search + Filter bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher par ID de transaction..."
                        value={txSearchId}
                        onChange={(e) => setTxSearchId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') loadTxList(0, e.currentTarget.value.trim() || undefined);
                        }}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      />
                    </div>
                    <select
                      value={txDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setTxDays(val);
                        loadTxList(val, txSearchId.trim() || undefined);
                      }}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                      <option value={1}>24h</option>
                      <option value={7}>7 jours</option>
                      <option value={30}>30 jours</option>
                      <option value={90}>90 jours</option>
                      <option value={0}>Tout</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={() => loadTxList(txSearchId.trim() ? 0 : txDays, txSearchId.trim() || undefined)}
                      disabled={txLoading}
                    >
                      {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results table */}
              <Card className="border border-slate-100 dark:border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  {txLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    </div>
                  ) : txList.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-slate-400">Aucune transaction trouvée</p>
                      {txSearchId && (
                        <p className="text-xs text-slate-400 mt-1">Essayez un autre ID ou retirez le filtre de recherche</p>
                      )}
                    </div>
                  ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 text-xs uppercase font-semibold">
                          <th className="py-3 px-5">ID</th>
                          <th className="py-3 px-5">Utilisateur</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5">Montant</th>
                          <th className="py-3 px-5">Devise</th>
                          <th className="py-3 px-5">Téléphone</th>
                          <th className="py-3 px-5">Statut</th>
                          <th className="py-3 px-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {txList.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-5 font-semibold text-slate-900 dark:text-white font-mono text-xs">{tx.id}</td>
                            <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">{tx.userName || tx.userEmail || '-'}</td>
                            <td className="py-3 px-5 text-xs text-slate-400">
                              {new Date(tx.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-5 font-bold text-slate-800 dark:text-white">${parseFloat(tx.amountUSD || 0).toFixed(2)}</td>
                            <td className="py-3 px-5 text-slate-600 dark:text-slate-300">{tx.currencyCode || 'USD'}</td>
                            <td className="py-3 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.phone || '-'}</td>
                            <td className="py-3 px-5">
                              <Badge
                                variant={
                                  tx.status === 'COMPLETED' || tx.status === 'MOBILE_MONEY_SENT'
                                    ? 'success'
                                    : tx.status === 'FAILED' || tx.status === 'REFUNDED'
                                    ? 'error'
                                    : tx.status === 'PENDING'
                                    ? 'warning'
                                    : 'info'
                                }
                              >
                                {tx.status === 'MOBILE_MONEY_SENT' ? 'COMPLETED' : tx.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-5">
                              {(tx.status === 'COMPLETED' || tx.status === 'MOBILE_MONEY_SENT') && (
                                <button
                                  onClick={() => { setRefundTx(tx); setRefundAmount(''); setRefundReason(''); }}
                                  className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Rembourser
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('users.title')}</h2>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('users.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchUsers(); }}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      />
                    </div>
                    <Button
                      onClick={handleSearchUsers}
                      disabled={searching || searchTerm.trim().length < 2}
                      size="sm"
                    >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {searchError && (
                <p className="text-xs text-red-500 text-center py-2">{searchError}</p>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((u: any) => (
                    <Card key={u.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name || u.email}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email} {u.phone ? `— ${u.phone}` : ''}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={u.kycStatus === 'APPROVED' ? 'success' : u.kycStatus === 'REJECTED' ? 'error' : 'warning'}>
                              KYC: {u.kycStatus || 'NONE'}
                            </Badge>
                            {u.isBanned && <Badge variant="error">Banni</Badge>}
                            <Badge variant="default">{u.role || 'USER'}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          const params: Record<string, string> = {};
                          if (u.name || u.email) params.name = u.name || u.email;
                          if (u.email) params.email = u.email;
                          if (u.kycStatus) params.kycStatus = u.kycStatus;
                          if (u.phone) params.phone = u.phone;
                          if (u.country) params.country = u.country;
                          if (u.city) params.city = u.city;
                          if (u.role) params.role = u.role;
                          if (u.firstName) params.firstName = u.firstName;
                          if (u.lastName) params.lastName = u.lastName;
                          if (u.middleName) params.middleName = u.middleName;
                          if (u.address) params.address = u.address;
                          if (u.dateOfBirth) params.dateOfBirth = u.dateOfBirth;
                          router.push(`/admin/users/${u.id}?${new URLSearchParams(params)}`);
                        }}>
                          <Eye className="w-4 h-4 mr-1" />Voir
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!searchResults && !searchError && (
                <p className="text-xs text-slate-400 text-center py-4">
                  Utilisez la recherche ci-dessus pour trouver un utilisateur par email, téléphone ou nom.
                </p>
              )}


            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {refundTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !refundProcessing && setRefundTx(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                Remboursement
              </h2>
              <button onClick={() => setRefundTx(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                <p className="text-slate-500 dark:text-slate-400">Transaction <span className="font-mono font-bold text-slate-800 dark:text-white">#{refundTx.id}</span></p>
                <p className="text-slate-500 dark:text-slate-400">
                  Montant original : <span className="font-bold text-slate-800 dark:text-white">{parseFloat(refundTx.amountUSD || 0).toFixed(2)}$</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Utilisateur : <span className="font-semibold text-slate-800 dark:text-white">{refundTx.userName || refundTx.userEmail || '-'}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Montant à rembourser <span className="text-xs text-slate-400 font-normal">(laissez vide pour le total)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    placeholder={parseFloat(refundTx.amountUSD || 0).toFixed(2)}
                    min="0.01"
                    step="0.01"
                    max={refundTx.amountUSD}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Raison du remboursement</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  <option value="">Sélectionnez une raison...</option>
                  <option value="Erreur numéro destinataire">Erreur numéro destinataire</option>
                  <option value="Annulation client">Annulation client</option>
                  <option value="Transaction dupliquée">Transaction dupliquée</option>
                  <option value="Service non délivré">Service non délivré</option>
                  <option value="Litige client">Litige client</option>
                  <option value="Erreur montant">Erreur montant</option>
                  <option value="Frais incorrects">Frais incorrects</option>
                </select>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ou tapez une raison personnalisée..."
                  className="w-full px-4 py-2.5 mt-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setRefundTx(null)} disabled={refundProcessing}>
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleRefund}
                disabled={refundProcessing || !refundReason.trim()}
                icon={refundProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                variant={refundAmount && parseFloat(refundAmount) < parseFloat(refundTx.amountUSD) ? 'primary' : 'danger'}
              >
                {refundProcessing
                  ? 'Processing...'
                  : `${refundAmount && parseFloat(refundAmount) < parseFloat(refundTx.amountUSD) ? 'Remb. partiel' : 'Rembourser total'}${refundAmount ? ` ${parseFloat(refundAmount).toFixed(2)}$` : ''}`
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
