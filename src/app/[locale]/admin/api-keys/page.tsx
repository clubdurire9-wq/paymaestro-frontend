'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Key, Ban, Loader2, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminAPIKeysPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    const res = await fetch(`${API_URL}/admin/api-keys`, { headers });
    const d = await res.json();
    if (d.success) setKeys(d.data);
    setLoading(false);
  };

  const handleRevoke = async (keyId: number) => {
    const reason = prompt('Motif de révocation :');
    if (!reason) return;
    await fetch(`${API_URL}/admin/api-keys/revoke`, {
      method: 'POST', headers,
      body: JSON.stringify({ keyId, reason }),
    });
    loadKeys();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="w-8 h-8 text-violet-600" /> Clés API
        </h1>
        <Button variant="outline" onClick={loadKeys} icon={<RefreshCw className="w-4 h-4" />}>Rafraîchir</Button>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {keys.length === 0 ? (
            <div className="text-center py-16">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-500">Aucune clé API</p>
              <p className="text-sm text-slate-400 mt-1">Aucune clé API n'a été créée pour le moment.</p>
            </div>
          ) : keys.map(key => (
            <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold">{key.name}</p>
                <p className="text-xs text-slate-500">{key.user_name} ({key.user_email})</p>
                <p className="text-xs font-mono">{key.key_prefix}...{key.last_four}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={key.type === 'live' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {key.type}
                </Badge>
                <Badge className={key.status === 'active' ? 'bg-blue-100' : 'bg-red-100'}>
                  {key.status}
                </Badge>
                {key.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => handleRevoke(key.id)} className="text-red-600">
                    <Ban className="w-4 h-4 mr-1" /> Révoquer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}