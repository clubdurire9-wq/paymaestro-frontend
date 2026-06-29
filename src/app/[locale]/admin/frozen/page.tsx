'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Shield, Lock, Unlock, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FrozenAccountsPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeData, setFreezeData] = useState({ userId: '', reason: '', freezeType: 'ALL' });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    const res = await fetch(`${API_URL}/admin/frozen-accounts`, { headers });
    const d = await res.json();
    if (d.success) setAccounts(d.data);
    setLoading(false);
  };

  const handleFreeze = async () => {
    await fetch(`${API_URL}/admin/freeze`, {
      method: 'POST', headers,
      body: JSON.stringify(freezeData),
    });
    setShowFreezeModal(false);
    setFreezeData({ userId: '', reason: '', freezeType: 'ALL' });
    loadAccounts();
  };

  const handleUnfreeze = async (userId: string) => {
    await fetch(`${API_URL}/admin/unfreeze`, {
      method: 'POST', headers,
      body: JSON.stringify({ userId }),
    });
    loadAccounts();
  };

  const freezeTypes = [
    { value: 'ALL', label: '🔒 Tout bloquer' },
    { value: 'MOBILE_MONEY', label: '📱 Mobile Money' },
    { value: 'BANK', label: '🏦 Banque' },
    { value: 'PAYPAL', label: '💳 PayPal' },
    { value: 'STRIPE', label: '🏦 Stripe/IBAN' },
    { value: 'WALLET', label: '👛 Wallet' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-red-600" />
          Comptes Bloqués
        </h1>
        <Button onClick={() => setShowFreezeModal(true)} className="bg-red-600 hover:bg-red-700">
          <Lock className="w-4 h-4 mr-2" /> Bloquer un compte
        </Button>
      </div>

      {/* Liste des comptes bloqués */}
      <Card>
        <CardHeader><CardTitle>Comptes actuellement bloqués ({accounts.length})</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Aucun compte bloqué</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc: any) => (
                <div key={acc.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div>
                    <p className="font-bold">{acc.user_name}</p>
                    <p className="text-sm text-slate-500">{acc.user_email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-red-100 text-red-700">{acc.freeze_type}</Badge>
                      <span className="text-xs text-slate-400">par {acc.frozen_by}</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">{acc.reason}</p>
                  </div>
                  <Button variant="outline" onClick={() => handleUnfreeze(acc.user_id)} className="text-green-600">
                    <Unlock className="w-4 h-4 mr-2" /> Débloquer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de blocage */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" /> Bloquer un compte
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">ID de l'utilisateur</label>
                <input type="text" value={freezeData.userId} onChange={(e) => setFreezeData({...freezeData, userId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1" placeholder="UUID" />
              </div>
              <div>
                <label className="text-sm font-semibold">Motif</label>
                <textarea value={freezeData.reason} onChange={(e) => setFreezeData({...freezeData, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1" rows={3} placeholder="Raison du blocage..." />
              </div>
              <div>
                <label className="text-sm font-semibold">Type de blocage</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {freezeTypes.map(ft => (
                    <button key={ft.value} onClick={() => setFreezeData({...freezeData, freezeType: ft.value})}
                      className={`p-2 rounded-lg border text-xs font-semibold ${freezeData.freezeType === ft.value ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                      {ft.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowFreezeModal(false)}>Annuler</Button>
              <Button fullWidth onClick={handleFreeze} className="bg-red-600">Bloquer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}