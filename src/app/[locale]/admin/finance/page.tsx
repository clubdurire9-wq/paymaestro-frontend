'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  DollarSign, TrendingUp, ArrowUp, ArrowDown,
  Send, Loader2, Wallet, Phone, Building, FileText, FileDown,
  Calendar, AlertCircle, X, RefreshCw, History
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function AdminFinancePage() {
  const locale = useLocale();
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('');
  const [withdrawType, setWithdrawType] = useState<'BANK' | 'MOBILE_MONEY'>('MOBILE_MONEY');
  const [withdrawing, setWithdrawing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, historyData] = await Promise.all([
        api.finance.getRevenueStats(),
        api.finance.getRevenueHistory(12),
      ]);
      setStats(statsData);
      setHistory(historyData || []);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    }
    setLoading(false);
  };

  const loadPayouts = async () => {
    setPayoutsLoading(true);
    try {
      const data = await api.admin.getLiveActivity();
      setPayouts((data || []).filter((tx: any) => tx.type === 'WITHDRAWAL' || tx.method === 'BANK_TRANSFER'));
    } catch {}
    setPayoutsLoading(false);
  };

  useEffect(() => {
    if (showWithdraw) loadPayouts();
  }, [showWithdraw]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawDest) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toastError('Montant invalide');
      return;
    }
    setWithdrawing(true);
    try {
      await api.finance.withdraw({ amount, destination: withdrawDest, destinationType: withdrawType });
      success(`Withdrawal of ${amount}$ completed`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawDest('');
      loadData();
    } catch (e: any) {
      toastError(e.message || 'Erreur lors du retrait');
    }
    setWithdrawing(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const d = await api.finance.exportPDF();
      const s = d.stats || {};
      const h = d.history || [];

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const violet = '#7c3aed';
      const violetLight = '#ede9fe';
      const gray = '#64748b';
      const dark = '#1e293b';
      const green = '#059669';
      const blue = '#2563eb';
      const amber = '#d97706';

      const footer = () => {
        const pages = (doc as any).getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setDrawColor('#e2e8f0');
          doc.setLineWidth(0.3);
          doc.line(margin, pageH - 18, pageW - margin, pageH - 18);
          doc.setFontSize(7);
          doc.setTextColor('#94a3b8');
          doc.text('PayMaestro — Confidential financial report', margin, pageH - 10);
          doc.text(`Page ${i} / ${pages}`, pageW - margin, pageH - 10, { align: 'right' });
           doc.text(`Generated on ${new Date().toLocaleString('fr-FR')}`, pageW - margin, pageH - 5, { align: 'right' });
        }
        doc.setPage(pages);
      };

      const addSectionTitle = (label: string, y: number) => {
        doc.setFontSize(13);
        doc.setTextColor(dark);
        doc.setFont(undefined, 'bold');
        doc.text(label, margin, y);
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(violet);
        doc.setLineWidth(0.8);
        doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
        return y + 9;
      };

      const formatEuro = (val: any) => {
        const n = parseFloat(val || 0);
        return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
      };

      // ========================================
      // PAGE 1 — HEADER BANNER
      // ========================================
      // Violet gradient banner
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageW, 55, 'F');
      doc.setFillColor(139, 92, 246);
      doc.rect(0, 0, pageW, 55, 'F');

      // Company name on banner
      doc.setFontSize(28);
      doc.setTextColor('#ffffff');
      doc.setFont(undefined, 'bold');
      doc.text('PayMaestro', margin, 22);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
        doc.text('Financial report', margin, 33);
      doc.setFontSize(8);
      doc.text(new Date(d.generatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }), margin, 42);

      // Logo circle
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(255, 255, 255);
      doc.circle(pageW - margin - 10, 27, 14, 'F');
      doc.setFontSize(16);
      doc.setTextColor(violet);
      doc.setFont(undefined, 'bold');
      doc.text('PM', pageW - margin - 15, 31);

      // ========================================
      // KEY METRICS — 4 cards
      // ========================================
      let y = 68;
      doc.setFontSize(8);
      doc.setTextColor(gray);
      doc.setFont(undefined, 'normal');
      doc.text('Key indicators', margin, y);

      const cards = [
        { label: "Aujourd'hui", value: formatEuro(s.today), color: green, bg: '#ecfdf5' },
        { label: 'Cette semaine', value: formatEuro(s.week), color: blue, bg: '#eff6ff' },
        { label: 'Ce mois', value: formatEuro(s.month), color: violet, bg: violetLight },
        { label: 'Total', value: formatEuro(s.total), color: amber, bg: '#fffbeb' },
      ];

      const cardW = (pageW - margin * 2 - 6) / 4;
      y += 3;

      cards.forEach((card, i) => {
        const x = margin + i * (cardW + 2);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor('#e2e8f0');
        doc.roundedRect(x, y, cardW, 22, 2, 2, 'FD');
        // Top color bar
        doc.setFillColor(parseInt(card.color.slice(1, 3), 16), parseInt(card.color.slice(3, 5), 16), parseInt(card.color.slice(5, 7), 16));
        doc.rect(x, y, cardW, 2.5, 'F');
        // Label
        doc.setFontSize(6);
        doc.setTextColor(gray);
        doc.setFont(undefined, 'normal');
        doc.text(card.label, x + 2, y + 8);
        // Value
        doc.setFontSize(9);
        doc.setTextColor(card.color);
        doc.setFont(undefined, 'bold');
        doc.text(card.value, x + 2, y + 18);
      });

      y += 32;

      // ========================================
      // BREAKDOWN TABLE
      // ========================================
      y = addSectionTitle('Commission breakdown', y);

      const breakdownData = (s.breakdown || []).map((b: any) => [b.type || 'Other', formatEuro(b.total)]);
      if (breakdownData.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(gray);
        doc.setFont(undefined, 'normal');
        doc.text('No commissions recorded', margin, y + 6);
        y += 16;
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          tableWidth: pageW - margin * 2,
          theme: 'grid',
          headStyles: { fillColor: '#7c3aed', textColor: '#ffffff', fontStyle: 'bold', fontSize: 8, halign: 'left' },
          bodyStyles: { fontSize: 8, textColor: dark },
          alternateRowStyles: { fillColor: '#f8fafc' },
          columns: [
            { header: 'Commission type', dataKey: 'type' },
            { header: 'Amount', dataKey: 'amount' },
          ],
          body: breakdownData.map((row: string[]) => ({
            type: row[0],
            amount: { content: row[1], styles: { halign: 'right', fontStyle: 'bold' } },
          })),
          foot: [{
            type: { content: 'Total', styles: { fontStyle: 'bold', fontSize: 8 } },
            amount: { content: breakdownData.reduce((sum: number, r: string[]) => sum + parseFloat(r[1].replace(/\s/g, '').replace('$', '')), 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' $', styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: violet } },
          }],
          footStyles: { fillColor: violetLight, textColor: violet },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ========================================
      // MONTHLY HISTORY TABLE + BAR CHART
      // ========================================
      if (y > 210) { doc.addPage(); y = 30; }
      y = addSectionTitle('Monthly history (12 months)', y);

      if (h.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(gray);
        doc.text('No history available', margin, y + 6);
      } else {
        // --- BAR CHART ---
        const chartTop = y + 2;
        const chartH = 45;
        const chartBottom = chartTop + chartH;
        const chartLeft = margin;
        const chartRight = pageW - margin;
        const chartW = chartRight - chartLeft;

        const revenues = h.map((r: any) => parseFloat(r.revenue || 0));
        const maxRev = Math.max(...revenues, 1);
        const barW = Math.max(4, Math.min(12, (chartW - (revenues.length - 1) * 1.5) / revenues.length));

        // Axis line
        doc.setDrawColor('#e2e8f0');
        doc.setLineWidth(0.3);
        doc.line(chartLeft, chartBottom, chartRight, chartBottom);

        // Bars
        revenues.forEach((rev: number, i: number) => {
          const barH = (rev / maxRev) * (chartH - 8);
          const x = chartLeft + i * (barW + 1.5);
          const yBar = chartBottom - barH;

          doc.setFillColor(139, 92, 246);
          doc.roundedRect(x, yBar, barW, barH, 1, 1, 'F');

          // Value on top
          doc.setFontSize(5);
          doc.setTextColor(dark);
          doc.setFont(undefined, 'bold');
          doc.text(rev.toLocaleString('fr-FR'), x + barW / 2, yBar - 1, { align: 'center' });

          // Month label
          doc.setFontSize(5);
          doc.setTextColor(gray);
          doc.setFont(undefined, 'normal');
          const monthLabel = new Date(h[i].month).toLocaleDateString('fr-FR', { month: 'short' });
          doc.text(monthLabel, x + barW / 2, chartBottom + 4, { align: 'center', angle: 0 });
        });

        y = chartBottom + 14;

        // --- HISTORY TABLE ---
        if (y > 230) { doc.addPage(); y = 30; }

        const historyRows = h.map((hItem: any) => [
          new Date(hItem.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          hItem.transactions.toString(),
          { content: formatEuro(hItem.revenue), styles: { halign: 'right', fontStyle: 'bold', textColor: green } },
        ]);

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          tableWidth: pageW - margin * 2,
          theme: 'grid',
          headStyles: { fillColor: '#7c3aed', textColor: '#ffffff', fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 8, textColor: dark },
          alternateRowStyles: { fillColor: '#f8fafc' },
          columns: [
            { header: 'Month', dataKey: 'month' },
            { header: 'Transactions', dataKey: 'tx' },
            { header: 'Revenue', dataKey: 'revenue' },
          ],
          body: historyRows.map((row: any[]) => ({
            month: row[0],
            tx: { content: row[1], styles: { halign: 'center' } },
            revenue: row[2],
          })),
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ========================================
      // SUMMARY BOX
      // ========================================
      if (y > 250) { doc.addPage(); y = 30; }
      doc.setDrawColor(violet);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(violet);
      doc.setFont(undefined, 'bold');
      doc.text('NET RESULT', margin + 4, y + 9);

      doc.setFontSize(8);
      doc.setTextColor(gray);
      doc.setFont(undefined, 'normal');
      doc.text('Total commissions collected over the period', margin + 4, y + 18);

      doc.setFontSize(16);
      doc.setTextColor(violet);
      doc.setFont(undefined, 'bold');
      doc.text(formatEuro(s.total), pageW - margin - 4, y + 18, { align: 'right' });

      // ===== FOOTER =====
      footer();
      doc.save(`paymaestro_rapport_financier_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e: any) {
      toastError(e.message || "Erreur d'export");
    }
    setExporting(false);
  };

  const formatCurrency = (val: any) => {
    const n = parseFloat(val || 0);
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Erreur de chargement</p>
        <p className="text-sm text-slate-400 mt-1 mb-6">{error}</p>
        <Button onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            PayMaestro Finances
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue, commissions and withdrawals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWithdraw(true)} icon={<Send className="w-4 h-4" />}>
            Withdraw funds
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={exporting} icon={<FileDown className="w-4 h-4" />}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {exporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aujourd'hui", value: stats?.today, icon: TrendingUp, color: 'text-emerald-500', border: 'border-l-emerald-500' },
          { label: 'Cette semaine', value: stats?.week, icon: TrendingUp, color: 'text-blue-500', border: 'border-l-blue-500' },
          { label: 'Ce mois', value: stats?.month, icon: TrendingUp, color: 'text-violet-500', border: 'border-l-violet-500' },
          { label: 'Total', value: stats?.total, icon: DollarSign, color: 'text-amber-500', border: 'border-l-amber-500' },
        ].map((item, i) => (
          <Card key={i} className={`border-l-4 ${item.border}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className={`text-2xl font-extrabold mt-1 ${item.color}`}>
                +{formatCurrency(item.value)}$
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission breakdown + Monthly history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {(!stats?.breakdown || stats.breakdown.length === 0) ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">No commissions recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.breakdown.map((b: any) => (
                  <div key={b.type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{b.type || 'Other'}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(b.total)}$</p>
                  </div>
                ))}
                {/* Total row */}
                <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                  <p className="text-sm font-bold text-violet-700 dark:text-violet-300">Total commissions</p>
                  <p className="text-lg font-extrabold text-violet-700 dark:text-violet-300">
                    {formatCurrency(stats.breakdown.reduce((sum: number, b: any) => sum + parseFloat(b.total || 0), 0))}$
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly history */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly history (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No history</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {history.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {new Date(h.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">{h.transactions} transaction(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />+{formatCurrency(h.revenue)}$
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !withdrawing && setShowWithdraw(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw funds</h2>
              <button onClick={() => setShowWithdraw(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Type selector */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Type de retrait</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'MOBILE_MONEY' as const, icon: Phone, label: 'Mobile Money' },
                    { type: 'BANK' as const, icon: Building, label: 'Virement bancaire' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setWithdrawType(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        withdrawType === type
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${withdrawType === type ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${withdrawType === type ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Montant (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {withdrawType === 'BANK' ? 'IBAN / Account number' : 'Mobile Money number'}
                </label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  placeholder={withdrawType === 'BANK' ? 'FR76 3000 2001 2345 6789' : '+225 07 00 00 00 00'}
                />
              </div>

              {/* Recent payouts */}
              {payouts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent withdrawals</p>
                  </div>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {payouts.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="font-mono">-{formatCurrency(p.amountUSD)}$</span>
                        <span>{p.method} — {new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" fullWidth onClick={() => setShowWithdraw(false)} disabled={withdrawing}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount || !withdrawDest}
                  icon={withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  {withdrawing ? 'Processing...' : `Withdraw ${withdrawAmount ? formatCurrency(withdrawAmount) : '0'}$`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}