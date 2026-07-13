'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, Search, Loader2, DollarSign,
  AlertCircle, RefreshCw, User, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function AdminRefundsPage() {
  const locale = useLocale();
  const { success, error: toastError } = useToast();

  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadRefunds(); }, []);

  const loadRefunds = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getRefunds();
      setRefunds(data || []);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    }
    setLoading(false);
  };

  const filtered = searchTerm.trim()
    ? refunds.filter(r =>
        String(r.id).includes(searchTerm.trim()) ||
        (r.userEmail || '').toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (r.userName || '').toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (r.notes || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    : refunds;

  const totalRefunded = refunds.reduce((sum, r) => sum + r.amountUSD, 0);

  const formatCurrency = (val: any) => {
    const n = parseFloat(val || 0);
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Loading Error</p>
        <p className="text-sm text-slate-400 mt-1 mb-6">{error}</p>
        <Button onClick={loadRefunds} icon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin`}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-orange-500" />
              Refunds
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {refunds.length} refund(s) — Total: {formatCurrency(totalRefunded)}$
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadRefunds} disabled={loading} icon={
          loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />
        }>
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Refunded</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRefunded)}$</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refunds</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{refunds.length}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {refunds.filter(r => r.notes && !r.notes.includes('PARTIEL')).length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partial</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {refunds.filter(r => r.notes && r.notes.includes('PARTIEL')).length}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, email, user or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(e.currentTarget.value.trim()); }}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <Button onClick={() => setSearchTerm(searchTerm.trim())} icon={<Search className="w-4 h-4" />}>
              <span className="hidden sm:inline">Search</span>
            </Button>
            {searchTerm && (
              <Button variant="ghost" onClick={() => setSearchTerm('')}>
                ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refunds list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              {searchTerm ? 'No matching refunds' : 'No refunds'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? 'Try another search term' : 'Completed refunds will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 text-xs uppercase font-semibold">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">User</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">#{r.id}</td>
                      <td className="py-3 px-5 text-xs text-slate-400">
                        {new Date(r.date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.userName || 'Admin'}</p>
                            <p className="text-xs text-slate-400">{r.userEmail || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(r.amountUSD)}$</p>
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant={r.notes?.includes('PARTIEL') ? 'warning' : 'error'}>
                          {r.notes?.includes('PARTIEL') ? 'Partial' : 'Total'}
                        </Badge>
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant="success">COMPLETED</Badge>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={r.notes}>
                        {r.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}