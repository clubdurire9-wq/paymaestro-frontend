'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Bitcoin, ArrowDown, ArrowUp, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminCryptoPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [txRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/admin/crypto/transactions`, { headers }),
      fetch(`${API_URL}/admin/crypto/stats`, { headers }),
    ]);
    if (txRes.ok) { const d = await txRes.json(); setTransactions(d.data || []); }
    if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
    setLoading(false);
  };

  const handleRefund = async (transactionId: number) => {
    const reason = prompt('Motif du remboursement :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/crypto/refund`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, reason }),
    });
    loadData();
  };

  const handleFreezeUser = async (userId: string) => {
    const reason = prompt('Motif du blocage crypto :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/crypto/freeze`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason }),
    });
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bitcoin className="w-8 h-8 text-orange-500" />
          Crypto
        </h1>
        <Button variant="outline" onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>Rafraîchir</Button>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-sm opacity-80">Volume Total</p>
              <p className="text-2xl font-extrabold">${stats.totalVolumeUSD}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-2xl font-extrabold">{stats.totalTransactions}</p>
            </CardContent>
          </Card>
          {stats.byCurrency?.map((c: any) => (
            <Card key={c.currency}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-slate-500">{c.currency}</p>
                <p className="text-xl font-extrabold">${c.volume}</p>
                <p className="text-xs text-slate-400">{c.count} tx</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TRANSACTIONS */}
      <Card>
        <CardHeader><CardTitle>Transactions Crypto</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.direction === 'IN' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.direction === 'IN' ? (
                      <ArrowDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUp className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {tx.direction === 'IN' ? 'Dépôt' : 'Retrait'} {tx.currency}
                    </p>
                    <p className="text-xs text-slate-500">{tx.user_name} ({tx.user_email})</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="text-[10px]">{tx.network || 'N/A'}</Badge>
                      <Badge className={`text-[10px] ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{tx.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${tx.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.direction === 'IN' ? '+' : '-'}{tx.amount_crypto} {tx.currency}
                    </p>
                    <p className="text-xs text-slate-500">${tx.amount_usd?.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Frais: ${tx.fee_usd?.toFixed(2)}</p>
                    {tx.wallet_address && (
                      <p className="text-xs font-mono text-slate-400 mt-1" title={tx.wallet_address}>
                        {tx.wallet_address.substring(0, 12)}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {tx.status === 'COMPLETED' && tx.direction === 'OUT' && (
                      <button onClick={() => handleRefund(tx.id)} 
                        className="text-xs text-green-600 hover:underline" title="Rembourser">
                        💰
                      </button>
                    )}
                    <button onClick={() => handleFreezeUser(tx.user_id)} 
                      className="text-xs text-red-600 hover:underline" title="Bloquer crypto">
                      🔒
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-slate-400 text-center py-8">Aucune transaction crypto</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}