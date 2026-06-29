'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, 
  Send, Loader2, Wallet, Phone, Building, FileText,
  Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminFinancePage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('');
  const [withdrawType, setWithdrawType] = useState<'BANK' | 'MOBILE_MONEY'>('MOBILE_MONEY');
  const [withdrawing, setWithdrawing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [statsRes, historyRes] = await Promise.all([
      fetch(`${API_URL}/admin/finance/revenue/stats`, { headers }),
      fetch(`${API_URL}/admin/finance/revenue/history?months=12`, { headers }),
    ]);
    if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
    if (historyRes.ok) { const d = await historyRes.json(); setHistory(d.data); }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawDest) return;
    setWithdrawing(true);
    await fetch(`${API_URL}/admin/finance/withdraw`, {
      method: 'POST', headers,
      body: JSON.stringify({ amount: parseFloat(withdrawAmount), destination: withdrawDest, destinationType: withdrawType }),
    });
    setWithdrawing(false);
    setShowWithdraw(false);
    setWithdrawAmount('');
    setWithdrawDest('');
    loadData();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    const res = await fetch(`${API_URL}/admin/finance/export-pdf`, { headers });
    const d = await res.json();
    
    // Créer le PDF côté client
    const content = `
═══════════════════════════════════
  PAYMAESTRO — RAPPORT FINANCIER
═══════════════════════════════════
Date : ${new Date(d.data.generatedAt).toLocaleDateString('fr-FR')}

📊 RÉSUMÉ
───────────────────────────────────
Aujourd'hui : +${d.data.stats.today}$
Cette semaine : +${d.data.stats.week}$
Ce mois : +${d.data.stats.month}$
Total : +${d.data.stats.total}$

📋 RÉPARTITION
───────────────────────────────────
${d.data.stats.breakdown?.map((b: any) => `${b.type} : ${b.total}$`).join('\n') || 'Aucune'}

📈 HISTORIQUE MENSUEL
───────────────────────────────────
${d.data.history?.map((h: any) => `${new Date(h.month).toLocaleDateString('fr-FR')} : ${h.revenue}$ (${h.transactions} tx)`).join('\n') || 'Aucun'}

═══════════════════════════════════
Généré par PayMaestro le ${new Date().toLocaleString('fr-FR')}
═══════════════════════════════════
    `;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paymaestro_rapport_financier_${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    setExporting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-green-600" />
          Finances PayMaestro
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowWithdraw(true)} icon={<Send className="w-4 h-4" />}>
            Retirer des fonds
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={exporting} icon={<FileText className="w-4 h-4" />}>
            {exporting ? 'Export...' : 'Exporter PDF'}
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Aujourd\'hui', value: `+${stats?.today}$`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Cette semaine', value: `+${stats?.week}$`, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Ce mois', value: `+${stats?.month}$`, icon: TrendingUp, color: 'text-violet-600' },
          { label: 'Total', value: `+${stats?.total}$`, icon: DollarSign, color: 'text-emerald-600' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-slate-500 uppercase">{item.label}</p>
              <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RÉPARTITION */}
      <Card>
        <CardHeader><CardTitle>Répartition des commissions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats?.breakdown?.map((b: any) => (
              <div key={b.type} className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-xs text-slate-500 uppercase">{b.type || 'Autres'}</p>
                <p className="text-xl font-bold text-slate-800">${b.total}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HISTORIQUE */}
      <Card>
        <CardHeader><CardTitle>Historique mensuel (12 mois)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {history.map((h: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm">{new Date(h.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-slate-400">{h.transactions} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />+{h.revenue}$
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODALE RETRAIT */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Retirer des fonds</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Type de retrait</label>
                <div className="flex gap-3 mt-1">
                  <button onClick={() => setWithdrawType('MOBILE_MONEY')}
                    className={`flex-1 p-3 rounded-xl border-2 ${withdrawType === 'MOBILE_MONEY' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}>
                    <Phone className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-semibold">Mobile Money</span>
                  </button>
                  <button onClick={() => setWithdrawType('BANK')}
                    className={`flex-1 p-3 rounded-xl border-2 ${withdrawType === 'BANK' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}>
                    <Building className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-semibold">Banque</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Montant (USD)</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl text-lg font-bold mt-1" placeholder="1000" />
              </div>
              <div>
                <label className="text-sm font-semibold">
                  {withdrawType === 'BANK' ? 'IBAN / Numéro de compte' : 'Numéro Mobile Money'}
                </label>
                <input type="text" value={withdrawDest} onChange={(e) => setWithdrawDest(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl text-sm mt-1" 
                  placeholder={withdrawType === 'BANK' ? 'FR76...' : '+225...'} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowWithdraw(false)}>Annuler</Button>
              <Button fullWidth onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || !withdrawDest}>
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Retirer ${withdrawAmount || '0'}</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}