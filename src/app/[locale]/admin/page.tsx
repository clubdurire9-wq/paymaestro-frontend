'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Transaction, KYCDetails } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

// Mock KYC queue for admin review
const MOCK_KYC_QUEUE = [
  {
    id: 'KYC-001',
    userId: 'U-124',
    name: 'Mamadou Koné',
    email: 'mamadou.kone@example.com',
    documentType: 'passport',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiConfidence: 87,
    status: 'PENDING_HUMAN' as const,
  },
  {
    id: 'KYC-002',
    userId: 'U-125',
    name: 'Amina Traoré',
    email: 'amina.traore@example.com',
    documentType: 'nationalId',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    aiConfidence: 62,
    status: 'PENDING_HUMAN' as const,
  },
  {
    id: 'KYC-003',
    userId: 'U-126',
    name: 'Koffi Asante',
    email: 'koffi.asante@example.com',
    documentType: 'drivingLicense',
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    aiConfidence: 94,
    status: 'PENDING_HUMAN' as const,
  },
];

type AdminTab = 'overview' | 'kyc' | 'transactions' | 'users';

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycQueue, setKycQueue] = useState(MOCK_KYC_QUEUE);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats mock
  const adminStats = {
    totalUsers: 1284,
    totalVolume: 284500,
    pendingKYC: kycQueue.length,
    successRate: 96.4,
  };

  useEffect(() => {
    async function load() {
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleApproveKYC = (id: string) => {
    setKycQueue((prev) => prev.filter((k) => k.id !== id));
    success('KYC approuvé avec succès !');
  };

  const handleRejectKYC = (id: string) => {
    setKycQueue((prev) => prev.filter((k) => k.id !== id));
    error('KYC rejeté.');
  };

  const sidebarItems: { tab: AdminTab; label: string; icon: React.ElementType }[] = [
    { tab: 'overview', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { tab: 'kyc', label: t('sidebar.kyc'), icon: ShieldCheck },
    { tab: 'transactions', label: t('sidebar.transactions'), icon: BarChart3 },
    { tab: 'users', label: t('sidebar.users'), icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Console de gestion PayMaestro</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {sidebarItems.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  activeTab === tab
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-violet-600">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilisateurs</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{adminStats.totalUsers.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12% ce mois</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume total</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">${adminStats.totalVolume.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-2">USD transférés</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KYC en attente</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{adminStats.pendingKYC}</h3>
                    <p className="text-xs text-amber-600 mt-2 font-medium">À valider manuellement</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-sky-500">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de succès</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{adminStats.successRate}%</h3>
                    <p className="text-xs text-slate-400 mt-2">Global sur 30 jours</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Transactions récentes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-slate-50">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{tx.id}</p>
                          <p className="text-xs text-slate-400">{tx.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">${tx.amountUSD}</p>
                          <Badge
                            variant={
                              tx.status === 'MOBILE_MONEY_SENT'
                                ? 'success'
                                : tx.status === 'FAILED'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{t('kyc.title')}</h2>
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
                kycQueue.map((kyc) => (
                  <Card key={kyc.id} className="border border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{kyc.name}</h3>
                            <Badge variant="info">
                              {t('kyc.confidence')} : {kyc.aiConfidence}%
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{kyc.email}</p>
                          <p className="text-xs text-slate-400">
                            Document : <span className="font-medium text-slate-700">{kyc.documentType}</span> •
                            Soumis le {new Date(kyc.submittedAt).toLocaleString('fr-FR')}
                          </p>
                          {kyc.aiConfidence < 70 && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Confiance IA faible — revue manuelle recommandée</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle className="w-4 h-4" />}
                            onClick={() => handleApproveKYC(kyc.id)}
                          >
                            {t('kyc.approve')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<XCircle className="w-4 h-4" />}
                            onClick={() => handleRejectKYC(kyc.id)}
                          >
                            {t('kyc.reject')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">{t('sidebar.transactions')}</h2>
              <Card className="border border-slate-100 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                          <th className="py-3 px-5">ID</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5">Montant</th>
                          <th className="py-3 px-5">Devise</th>
                          <th className="py-3 px-5">Téléphone</th>
                          <th className="py-3 px-5">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-5 font-semibold text-slate-900">{tx.id}</td>
                            <td className="py-3 px-5 text-xs text-slate-400">
                              {new Date(tx.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-5 font-bold text-slate-800">${tx.amountUSD}</td>
                            <td className="py-3 px-5 text-slate-600">{tx.currency}</td>
                            <td className="py-3 px-5 font-mono text-xs text-slate-500">{tx.phone}</td>
                            <td className="py-3 px-5">
                              <Badge
                                variant={
                                  tx.status === 'MOBILE_MONEY_SENT'
                                    ? 'success'
                                    : tx.status === 'FAILED'
                                    ? 'error'
                                    : tx.status === 'PAYPAL_APPROVED'
                                    ? 'info'
                                    : 'warning'
                                }
                              >
                                {tx.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{t('users.title')}</h2>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('users.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mock Users */}
              <Card className="border border-slate-100 overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {[
                      { name: 'Abdoulaye Diallo', email: 'abdoulaye@example.com', kyc: 'APPROVED', totalUSD: 450 },
                      { name: 'Mamadou Koné', email: 'mamadou@example.com', kyc: 'PENDING_HUMAN', totalUSD: 120 },
                      { name: 'Amina Traoré', email: 'amina@example.com', kyc: 'NONE', totalUSD: 0 },
                      { name: 'Koffi Asante', email: 'koffi@example.com', kyc: 'APPROVED', totalUSD: 680 },
                    ]
                      .filter(
                        (u) =>
                          !searchTerm ||
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((u) => (
                        <div
                          key={u.email}
                          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/40 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">${u.totalUSD}</span>
                            <Badge
                              variant={
                                u.kyc === 'APPROVED'
                                  ? 'success'
                                  : u.kyc === 'PENDING_HUMAN'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {u.kyc}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              {t('users.ban')}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
