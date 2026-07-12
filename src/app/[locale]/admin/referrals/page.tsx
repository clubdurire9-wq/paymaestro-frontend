'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Gift, Users, DollarSign, Ban, Undo2, Loader2, RefreshCw, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReferralsPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [refRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/admin/referrals`, { headers }),
      fetch(`${API_URL}/admin/referrals/stats`, { headers }),
    ]);
    if (refRes.ok) { const d = await refRes.json(); setReferrals(d.data || []); }
    if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
    setLoading(false);
  };

  const handleRevoke = async (referralId: number) => {
    const reason = prompt('Motif de révocation :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/referrals/revoke`, {
      method: 'POST', headers,
      body: JSON.stringify({ referralId, reason }),
    });
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="w-8 h-8 text-violet-600" /> Parrainage
        </h1>
        <Button variant="outline" onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>Rafraîchir</Button>
      </div>

      {/* STATS GLOBALES */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-violet-600 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats.totalReferrals}</p>
              <p className="text-xs text-slate-500">Parrainages totaux</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{stats.totalActiveReferrals}</p>
              <p className="text-xs text-slate-500">Actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-extrabold">${stats.totalEarningsDistributed}</p>
              <p className="text-xs text-slate-500">Commissions versées</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TOP PARRAINS */}
      {stats?.topReferrers?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>🏆 Top Parrains</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topReferrers.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-violet-600">#{i + 1}</span>
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${r.totalEarnings}</p>
                    <p className="text-xs text-slate-400">{r.totalCommissions} commissions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOUS LES PARRAINAGES */}
      <Card>
        <CardHeader><CardTitle>Tous les parrainages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {referrals.map(ref => (
              <div key={ref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-violet-500" />
                    <span className="font-bold">{ref.referrer_name}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold">{ref.referee_name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {ref.referrer_email} → {ref.referee_email}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge className={`text-[10px] ${
                      ref.status === 'active' ? 'bg-green-100 text-green-700' :
                      ref.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      ref.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>{ref.status}</Badge>
                    <span className="text-[10px] text-slate-400">
                      Expire le {new Date(ref.expires_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {ref.status === 'active' && (
                    <button onClick={() => handleRevoke(ref.id)} className="text-xs text-red-600 hover:underline">
                      <Ban className="w-3 h-3 inline mr-1" />Révoquer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}