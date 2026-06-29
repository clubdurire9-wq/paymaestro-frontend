'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Globe, Ban, Lock, Unlock, Loader2, RefreshCw, Eye, ExternalLink, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminPaymentPagesPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [pages, setPages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [pagesRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/admin/payment-pages`, { headers }),
      fetch(`${API_URL}/admin/payment-pages/stats`, { headers }),
    ]);
    if (pagesRes.ok) setPages((await pagesRes.json()).data || []);
    if (statsRes.ok) setStats((await statsRes.json()).data);
    setLoading(false);
  };

  const handleRevoke = async (userId: string) => {
    const reason = prompt('Motif de révocation :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/payment-pages/${userId}/revoke`, {
      method: 'POST', headers,
      body: JSON.stringify({ reason }),
    });
    loadData();
  };

  const handleFreeze = async (userId: string) => {
    const reason = prompt('Motif du gel :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/payment-pages/${userId}/freeze`, {
      method: 'POST', headers,
      body: JSON.stringify({ reason }),
    });
    loadData();
  };

  const handleUnfreeze = async (userId: string) => {
    await fetch(`${API_URL}/admin/payment-pages/${userId}/unfreeze`, { method: 'POST', headers });
    loadData();
  };

  const handleViewTransactions = async (userId: string) => {
    const res = await fetch(`${API_URL}/admin/payment-pages/${userId}/transactions`, { headers });
    const d = await res.json();
    setTransactions(d.data || []);
    setSelectedUser(userId);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="w-8 h-8 text-violet-600" /> Pages de Paiement
        </h1>
        <Button variant="outline" onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>Rafraîchir</Button>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold">{stats.totalFreePages}</p>
            <p className="text-xs text-slate-500">Pages gratuites</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold">{stats.totalPremiumPages}</p>
            <p className="text-xs text-slate-500">Pages premium</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-green-600">${stats.totalRevenue}</p>
            <p className="text-xs text-slate-500">Revenus</p>
          </CardContent></Card>
        </div>
      )}

      {/* LISTE */}
      <Card>
        <CardHeader><CardTitle>Pages de paiement</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pages.map(page => (
              <div key={page.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold">{page.name}</p>
                  <p className="text-xs text-slate-400">{page.email}</p>
                  <div className="flex gap-2 mt-1">
                    {page.payment_subdomain && (
                      <Badge className="text-[10px] bg-blue-100 text-blue-700">
                        {page.payment_subdomain}.paymaestro.me
                      </Badge>
                    )}
                    {page.custom_domain && (
                      <Badge className="text-[10px] bg-green-100 text-green-700">
                        {page.custom_domain} (Premium)
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {page.payment_subdomain && (
                    <button onClick={() => window.open(`https://${page.payment_subdomain}.paymaestro.me`, '_blank')}
                      className="text-xs text-blue-600 hover:underline"><ExternalLink className="w-3 h-3 inline" /></button>
                  )}
                  <button onClick={() => handleViewTransactions(page.id)}
                    className="text-xs text-violet-600 hover:underline"><Eye className="w-3 h-3 inline" /></button>
                  <button onClick={() => handleFreeze(page.id)}
                    className="text-xs text-blue-600 hover:underline"><Lock className="w-3 h-3 inline" /></button>
                  <button onClick={() => handleUnfreeze(page.id)}
                    className="text-xs text-green-600 hover:underline"><Unlock className="w-3 h-3 inline" /></button>
                  <button onClick={() => handleRevoke(page.id)}
                    className="text-xs text-red-600 hover:underline"><XCircle className="w-3 h-3 inline" /></button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTIONS */}
      {selectedUser && (
        <Card>
          <CardHeader><CardTitle>Transactions de la page</CardTitle></CardHeader>
          <CardContent>
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between p-2 text-sm">
                <span>{tx.type} — {tx.notes}</span>
                <span className="font-bold">${tx.amount_usd}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}