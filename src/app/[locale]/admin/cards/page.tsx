'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { CreditCard, Ban, Snowflake, Loader2, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminCardsPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    const res = await fetch(`${API_URL}/admin/cards`, { headers });
    const d = await res.json();
    if (d.success) setCards(d.data);
    setLoading(false);
  };

  const handleToggle = async (cardId: number, action: string) => {
    await fetch(`${API_URL}/admin/cards/${cardId}/toggle`, {
      method: 'POST', headers,
      body: JSON.stringify({ action }),
    });
    loadCards();
  };

  const handleCancel = async (cardId: number) => {
    const reason = prompt('Motif d\'annulation :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/cards/${cardId}/cancel`, {
      method: 'POST', headers,
      body: JSON.stringify({ reason }),
    });
    loadCards();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-violet-600" /> Virtual Cards
        </h1>
        <Button variant="outline" onClick={loadCards} icon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id} className={`rounded-2xl p-5 text-white shadow-xl ${
            card.brand === 'visa' 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-800' 
              : 'bg-gradient-to-br from-orange-500 to-red-700'
          } ${card.status !== 'active' ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <CreditCard className="w-8 h-8" />
              <Badge className={card.status === 'active' ? 'bg-green-500' : card.status === 'frozen' ? 'bg-blue-500' : 'bg-red-500'}>
                {card.status}
              </Badge>
            </div>

            <p className="font-mono text-lg mb-4">•••• •••• •••• {card.last_four}</p>
            <p className="text-xs opacity-70">Expire : {card.exp_month}/{card.exp_year}</p>
            <p className="text-xs opacity-70 mt-1">{card.brand.toUpperCase()} — {card.card_type}</p>

            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="text-xs opacity-70">{card.user_name}</p>
              <p className="text-xs opacity-50">{card.user_email}</p>
            </div>

            <div className="flex gap-2 mt-4">
              {card.status === 'active' && (
                <button onClick={() => handleToggle(card.id, 'freeze')} 
                  className="text-xs bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">
                  <Snowflake className="w-3 h-3 inline mr-1" />Geler
                </button>
              )}
              {card.status === 'frozen' && (
                <button onClick={() => handleToggle(card.id, 'unfreeze')} 
                  className="text-xs bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">
                  🔓 Dégeler
                </button>
              )}
              <button onClick={() => handleCancel(card.id)} 
                className="text-xs bg-red-500/50 px-3 py-1 rounded-lg hover:bg-red-500/70 ml-auto">
                <Ban className="w-3 h-3 inline mr-1" />Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-slate-400 text-center py-12">Aucune carte virtuelle</p>
      )}
    </div>
  );
}