'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Search, 
  Download, 
  Calendar, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { api, Transaction, LIVE_RATES } from '@/lib/api';

export default function HistoryPage() {
  const t = useTranslations('history');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  // State
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadTransactions() {
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
        setFilteredTransactions(txs);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  // Handle Filtering
  useEffect(() => {
    let result = [...transactions];

    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (currencyFilter !== 'ALL') {
      result = result.filter(t => t.currency === currencyFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        t => t.id.toLowerCase().includes(term) || 
             t.phone.includes(term) || 
             (t.reference && t.reference.toLowerCase().includes(term))
      );
    }

    setFilteredTransactions(result);
    setCurrentPage(1); // reset to first page
  }, [statusFilter, currencyFilter, searchTerm, transactions]);

  // Pagination helpers
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'MOBILE_MONEY_SENT':
        return <Badge variant="success">{t(`status.${status}`)}</Badge>;
      case 'PENDING':
        return <Badge variant="warning">{t(`status.${status}`)}</Badge>;
      case 'PAYPAL_APPROVED':
        return <Badge variant="info">PayPal validé</Badge>;
      case 'FAILED':
        return <Badge variant="error">{t(`status.${status}`)}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;

    // Headers
    const headers = ['ID Transaction', 'Date', 'Montant Brut (USD)', 'Montant Net (USD)', 'Montant Recu', 'Devise', 'Taux de Change', 'Telephone', 'Reference Mobile Money', 'Statut'];
    
    // Rows
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleString(),
      t.amountUSD.toFixed(2),
      (t.amountUSD * 0.93).toFixed(2),
      t.receivedAmount,
      t.currency,
      t.exchangeRate,
      t.phone,
      t.reference || '',
      t.status
    ]);

    // Build CSV Content
    const csvContent = 
      'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayMaestro_Retraits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualisez et exportez l&apos;ensemble de vos retraits passés.
          </p>
        </div>
        <Button 
          variant="outline" 
          icon={<Download className="w-4 h-4" />}
          onClick={exportToCSV}
          disabled={filteredTransactions.length === 0}
        >
          {t('export')} CSV
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="border border-slate-100 shadow-sm">
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* Search bar */}
          <div className="sm:col-span-2 relative">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ID, Référence ou Téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
            <Select
              options={[
                { value: 'ALL', label: t('filters.all') },
                { value: 'PENDING', label: t('filters.pending') },
                { value: 'MOBILE_MONEY_SENT', label: t('filters.sent') },
                { value: 'FAILED', label: t('filters.failed') }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {/* Currency Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('filters.currency')}</label>
            <Select
              options={[
                { value: 'ALL', label: 'Toutes les devises' },
                ...LIVE_RATES.map(r => ({ value: r.currency, label: `${r.flag} ${r.currency}` }))
              ]}
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">{tCommon('loading')}</div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-700">{t('empty')}</p>
              <p className="text-xs">Essayez de modifier ou de réinitialiser vos filtres de recherche.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                      <th className="py-4 px-6">{t('table.date')}</th>
                      <th className="py-4 px-6">ID Retrait</th>
                      <th className="py-4 px-6">{t('table.amount')} USD</th>
                      <th className="py-4 px-6">{t('table.received')}</th>
                      <th className="py-4 px-6">Téléphone</th>
                      <th className="py-4 px-6">{t('table.status')}</th>
                      <th className="py-4 px-6 text-right">{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                          {new Date(tx.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{tx.id}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800">${tx.amountUSD.toFixed(2)}</td>
                        <td className="py-4 px-6 font-bold text-slate-950">
                          {formatCurrency(tx.receivedAmount, tx.currency)}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 font-mono">{tx.phone}</td>
                        <td className="py-4 px-6">{getStatusBadge(tx.status)}</td>
                        <td className="py-4 px-6 text-right">
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

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-sm bg-slate-55/20">
                  <span className="text-xs text-slate-400">
                    Page {currentPage} sur {totalPages} ({filteredTransactions.length} résultats)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      {tCommon('previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      {tCommon('next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('detail.title')}
        size="md"
      >
        {selectedTx && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="text-center pb-4 border-b border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('detail.receivedAmount')}</p>
              <h3 className="text-2xl font-bold text-slate-950 mt-1">
                {formatCurrency(selectedTx.receivedAmount, selectedTx.currency)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Initialisé le {new Date(selectedTx.date).toLocaleString()}
              </p>
            </div>

            {/* Financial breakdown */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-slate-500">{t('detail.transactionId')}</div>
              <div className="text-right font-semibold text-slate-900">{selectedTx.id}</div>

              <div className="text-slate-500">{t('detail.paypalOrderId')}</div>
              <div className="text-right font-mono text-xs text-slate-950">{selectedTx.paypalOrderId || '-'}</div>

              <div className="text-slate-500">{t('detail.grossAmount')}</div>
              <div className="text-right font-medium text-slate-950">${selectedTx.amountUSD.toFixed(2)} USD</div>

              <div className="text-slate-500">{t('detail.fee')} (7%)</div>
              <div className="text-right text-red-500 font-medium">-${(selectedTx.amountUSD * 0.07).toFixed(2)} USD</div>

              <div className="text-slate-500">{t('detail.netAmount')}</div>
              <div className="text-right font-semibold text-slate-950">${(selectedTx.amountUSD * 0.93).toFixed(2)} USD</div>

              <div className="text-slate-500">{t('detail.exchangeRate')}</div>
              <div className="text-right font-medium text-slate-950">1 USD = {selectedTx.exchangeRate} {selectedTx.currency}</div>

              <div className="text-slate-500">Téléphone Mobile Money</div>
              <div className="text-right font-semibold text-slate-950">{selectedTx.phone}</div>

              {selectedTx.reference && (
                <>
                  <div className="text-slate-500">{t('detail.flutterwaveReference')}</div>
                  <div className="text-right font-mono text-xs text-slate-950">{selectedTx.reference}</div>
                </>
              )}
            </div>

            {/* Timeline log */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('detail.timeline')}</h4>
              <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
                {selectedTx.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Indicator node */}
                    <span 
                      className={`
                        absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white
                        ${step.status === 'MOBILE_MONEY_SENT' ? 'bg-emerald-500' : ''}
                        ${step.status === 'PENDING' ? 'bg-amber-500' : ''}
                        ${step.status === 'PAYPAL_APPROVED' ? 'bg-sky-500' : ''}
                        ${step.status === 'FAILED' ? 'bg-red-500' : ''}
                      `} 
                    />
                    <p className="text-xs font-semibold text-slate-900">
                      {step.status === 'MOBILE_MONEY_SENT' && 'Fonds envoyés'}
                      {step.status === 'PAYPAL_APPROVED' && 'Paiement PayPal validé'}
                      {step.status === 'PENDING' && 'Transaction initialisée'}
                      {step.status === 'FAILED' && 'Transaction échouée'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Error reason alert */}
            {selectedTx.status === 'FAILED' && selectedTx.errorReason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('detail.error')}</p>
                  <p className="mt-1 text-red-600">{selectedTx.errorReason}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
